import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CLI args support (e.g. npm run dev --port 3000 --host 0.0.0.0)
const portArgIndex = process.argv.indexOf('--port');
const cliPort = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? Number(process.argv[portArgIndex + 1]) : null;
const hostArgIndex = process.argv.indexOf('--host');
const host = hostArgIndex !== -1 && process.argv[hostArgIndex + 1] ? process.argv[hostArgIndex + 1] : '0.0.0.0';

// In development, AI Studio dev server must run on port 3000
const port = cliPort || (process.env.NODE_ENV === 'production' && process.env.PORT ? Number(process.env.PORT) : 3000);

// Generous body limit for uploaded image data
app.use(express.json({ limit: '35mb' }));

// Initialize Google Gemini API on server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface GenerateRequest {
  imageBase64: string;
  mimeType: string;
  extraContext?: string;
  platforms?: ('instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'pinterest')[];
  targetAudience?: string;
  customAudience?: string;
  language?: 'nl' | 'en' | 'bilingual';
  vibePreference?: string;
  emojiPreference?: 'lots' | 'subtle' | 'none';
  hashtagCount?: '1-3' | '3-5' | 'none';
}

interface RefineRequest {
  currentCaption: string;
  instruction: string;
  language?: string;
  context?: string;
  platform?: string;
  targetAudience?: string;
}

// Helper to format clean user-friendly error messages
function formatErrorMessage(err: any): string {
  const raw = String(err?.message || err || '');
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed?.error?.message) {
        if (parsed.error.code === 503 || parsed.error.status === 'UNAVAILABLE' || String(parsed.error.message).includes('high demand')) {
          return 'Het AI-model ondervindt momenteel een tijdelijke piek in belasting. Probeer het over enkele ogenblikken opnieuw.';
        }
        return parsed.error.message;
      }
    }
  } catch {
    // ignore json parse error
  }

  if (raw.includes('503') || raw.includes('UNAVAILABLE') || raw.includes('high demand')) {
    return 'Het AI-model ondervindt momenteel een tijdelijke piek in belasting. Probeer het over enkele ogenblikken opnieuw.';
  }
  return raw || 'Er is een onverwachte fout opgetreden bij het analyseren van de foto.';
}

// Resilient Gemini generator with retry and fallback across supported flash models
async function generateWithRetry(params: {
  contents: any;
  config?: any;
}) {
  const candidateModels = [
    'gemini-3-flash-preview',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = String(err?.message || err);
      console.warn(`[Gemini API] Model ${model} tijdelijk niet beschikbaar: ${errMsg}`);
      // Automatically proceed to next candidate model
    }
  }

  // If initial pass through all models failed, small 1s backoff and final attempt with gemini-3-flash-preview
  try {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const finalTry = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: params.contents,
      config: params.config,
    });
    if (finalTry && finalTry.text) {
      return finalTry;
    }
  } catch (retryErr) {
    throw lastError || retryErr;
  }

  throw lastError;
}

// Endpoint 1: Analyze photo & generate captions tailored per platform and audience
app.post('/api/generate-captions', async (req, res) => {
  try {
    const body = req.body || {};
    const settingsObj = body.settings || {};
    const imageBase64 = body.imageBase64;
    const mimeType = body.mimeType || 'image/jpeg';
    const extraContext = body.extraContext || '';
    const platforms = body.platforms || settingsObj.platforms || ['instagram'];
    const targetAudience = body.targetAudience || settingsObj.targetAudience || 'auto';
    const customAudience = body.customAudience || settingsObj.customAudience || '';
    const language = body.language || settingsObj.language || 'nl';
    const vibePreference = body.vibePreference || settingsObj.vibePreference || 'gevarieerd';
    const emojiPreference = body.emojiPreference || settingsObj.emojiPreference || 'subtle';
    const hashtagCount = body.hashtagCount || settingsObj.hashtagCount || '3-5';

    if (!imageBase64) {
      return res.status(400).json({ error: 'Geen afbeelding ontvangen. Upload een geldige foto.' });
    }

    // Ensure valid array of requested platforms
    const validPlatformsList = ['instagram', 'facebook', 'linkedin', 'tiktok', 'pinterest'] as const;
    const requestedPlatforms = Array.isArray(platforms) && platforms.length > 0
      ? platforms.filter((p): p is typeof validPlatformsList[number] => validPlatformsList.includes(p as any))
      : ['instagram'];
    if (requestedPlatforms.length === 0) {
      requestedPlatforms.push('instagram');
    }

    // Clean base64 string if it contains data prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9+]+;base64,/, '');

    const languageInstruction =
      language === 'en'
        ? 'Genereer alle captions in het ENGELS (ready for international social media).'
        : language === 'bilingual'
        ? 'Genereer captions die tweetalig aantrekkelijk zijn (bijv. Nederlandse hoofdtekst met een sterke Engelse hook/zoekwoorden).'
        : 'Genereer alle captions in het NEDERLANDS (natuurlijk klinkend, hoogwaardig en passend bij de Nederlandse/Vlaamse doelgroep).';

    const emojiInstruction =
      emojiPreference === 'lots'
        ? 'Gebruik rijke, expressieve emoji\'s passend bij het gekozen platform.'
        : emojiPreference === 'none'
        ? 'Gebruik GEEN enkele emoji in de teksten.'
        : 'Gebruik subtiel en smaakvol 1-3 passende emoji\'s per caption.';

    // Audience guidance
    const audienceGuidelines: Record<string, string> = {
      auto: 'DOELGROEP-RICHTLIJN (AUTOMATISCH HERKENNEN): Analyseer de zichtbare context, personen en setting van de foto. Bepaal zelfstandig het meest passende fotografiegenre en de doelgroep (bijv. newborn, gezin, bruiloft, zakelijk portret, koppels, dieren, etc.) ZONDER exacte leeftijden of persoonlijke eigenschappen van individuen te gokken. Noem in de visuele analyse bij "detectedAudience" de herkende doelgroep.',
      newborn: 'DOELGROEP-RICHTLIJN: Newborn- en babyfotografie (0-12 maanden). Focus op tederheid, kwetsbaarheid, de allereerste weken, verwondering, zachtheid, puur geluk en tijdloze herinneringen voor jonge ouders.',
      family: 'DOELGROEP-RICHTLIJN: Kinderen en gezinnen. Focus op spontaniteit, ongedwongen plezier, échte emoties, warme familiebanden, het vastleggen van de snelle groei en herkenbare gezinsmomenten.',
      teens: 'DOELGROEP-RICHTLIJN: Tieners en jongeren. Focus op eigentijdse energie, zelfvertrouwen, authenticiteit, expressie, vriendschap en dynamiek.',
      adults: 'DOELGROEP-RICHTLIJN: Volwassenen (portret & lifestyle). Focus op stijl, authenticiteit, natuurlijke schoonheid, zelfvertrouwen en karaktervolle portretten.',
      seniors: 'DOELGROEP-RICHTLIJN: Senioren en ouderen / generaties. Focus op warmte, levensverhalen, waardevolle herinneringen, respect, wijsheid en dierbare familiebanden.',
      couples: 'DOELGROEP-RICHTLIJN: Stellen en koppels (loveshoot). Focus op romantiek, intimiteit, spontane blikken, oprechte connectie, warmte en liefdesverhalen.',
      wedding: 'DOELGROEP-RICHTLIJN: Bruiloften en trouwreportages. Focus op het vieren van de liefde, emoties, feestelijkheid, trouwbeloftes, oog voor styling en details, de unieke trouwdag en een tijdloos huwelijksverhaal.',
      maternity: 'DOELGROEP-RICHTLIJN: Zwangerschapsfotografie. Focus op het wonder van nieuw leven, trots, verwachting, de zwangerschapsgloed, vrouwelijke kracht en tederheid.',
      business: 'DOELGROEP-RICHTLIJN: Zakelijke fotografie, personal branding en ondernemers. Focus op professionaliteit, visuele identiteit, betrouwbaarheid, deskundigheid, gedrevenheid en hoogwaardig beeldmateriaal.',
      pets: 'DOELGROEP-RICHTLIJN: Dierenfotografie. Focus op karakter, speelsheid, trouwe viervoeters, de band tussen mens en dier en onvoorwaardelijke dierenliefde.',
      custom: `DOELGROEP-RICHTLIJN (SPECIFIEK OPGEGEVEN DOOR FOTOGRAAF): "${customAudience || 'Op maat gemaakte fotoshoot'}"`,
    };

    const targetAudienceText = audienceGuidelines[targetAudience] || audienceGuidelines['auto'];

    // Platform-specific instructions
    const platformSpecificGuides: Record<string, string> = {
      instagram: `
1. INSTAGRAM (3 unieke varianten):
   - Stijl: Creatief, persoonlijk, aansprekend en visueel esthetisch.
   - Doel: Volgersbetrokkenheid, saveable & shareable content.
   - Structuur: Scroll-stopping hook in de eerste zin, witregels, en ALTIJD eindigen met een stimulerende interactieve vraag die reacties in de comments uitlokt.
   - Hashtags: 3 tot 5 gerichte niche/fotografie tags (inclusief #).`,

      facebook: `
2. FACEBOOK (3 unieke varianten):
   - Stijl: Toegankelijk, warm, informeel en persoonlijk (community-gericht).
   - Doel: Ruimte voor storytelling over het verhaal achter de foto (de ontmoeting, de sfeer van de dag, het spontane moment).
   - Structuur: Persoonlijke anekdote of achtergrond van de shoot. Eindig met een warme, natuurlijke vraag voor reacties van vrienden, familie en volgers.
   - Hashtags: Facebook gebruikt nauwelijks hashtags; geef maximaal 0 tot 1 algemene tag of een lege lijst [].`,

      linkedin: `
3. LINKEDIN (3 unieke varianten):
   - Stijl: Professioneel, zakelijk, inhoudelijk en deskundig.
   - Doel: Aandacht voor het vakmanschap van de fotograaf, de waarde van professioneel beeldmateriaal voor personal branding, of de samenwerking met de klant/ondernemer.
   - Structuur: Professionele opening over beelddynamiek of branding, reflectie op de samenwerking/het vak, en een professionele vraag of inzicht over visuele identiteit.
   - Emoji's: Zeer spaarzaam en zakelijk (max 0 tot 2, zoals 📸 of 💼).
   - Hashtags: 2 tot 4 zakelijke/industrie hashtags (bijv. #personalbranding #zakelijkefotografie #bedrijfsfotografie #portretfotografie).
   - BELANGRIJK: Geen overdreven commerciële verkooppraatjes of populaire jongerentaal!`,

      tiktok: `
4. TIKTOK (3 unieke varianten):
   - Stijl: Kort, snappy, levendig, spontaan en energiek.
   - Doel: Snelle kijkaandacht vasthouden en viraal engagement.
   - Structuur: Creatieve hook in de allereerste regel (bijv. 'POV: ...' of een herkenbaar behind-the-scenes fotomoment), beknopte body, en een snelle interactieve dilemma- of meningsvraag.
   - Hashtags: 3 tot 5 relevante categorie/community tags (zoals #fotograaf #behindthescenes #fyp #photography).`,

      pinterest: `
5. PINTEREST (3 unieke varianten):
   - Stijl: Beschrijvend, inspirerend, esthetisch en zoekwoorden-rijk (Pinterest SEO).
   - Doel: Vindbaarheid in zoekopdrachten, inspiratie voor moodboards, fotoshoot-ideeën en styling.
   - Structuur: Duidelijke beschrijving van de compositie, styling, kleurenpalet en fotoshoot-invalshoek. Sluit af met een tip of oproep om de pin te bewaren op een moodboard.
   - Hashtags/Zoekwoorden: 2 tot 4 zoekwoordtermen als tags (bijv. #fotoshootinspiratie #bruiloftstyling #fotograaf).`,
    };

    const requestedPlatformInstructions = requestedPlatforms
      .map((p) => platformSpecificGuides[p])
      .filter(Boolean)
      .join('\n\n');

    const promptText = `
Je bent een professionele copywriter, content strategist en social media expert voor professionele fotografen en visual artists.
Analyseer de bijgevoegde foto grondig en genereer voor ELK van de volgende opgevraagde socialmediaplatformen precies 3 unieke, op maat gemaakte caption-opties:
Opgevraagde platformen: ${requestedPlatforms.join(', ')}.

Grondige visuele analyse van de foto:
1. Wat er precies te zien is (personen, dieren, objecten, omgeving, details)
2. Visuele locatie of omgevingstype (strand, stad, café, podium/concert, studio, natuur, etc.)
3. Activiteit die wordt uitgevoerd of het vastgelegde moment
4. Kleuren, lichtval en visuele esthetiek
5. Sfeer, gevoel en emotie (bijv. teder, vreugdevol, krachtig, feestelijk, rustgevend)
6. Seizoen of moment van de dag (bijv. gouden uur, ochtendlicht, herfst)
7. Fotografie-categorie (bijv. Newborn, Bruiloft, Gezinsfotografie, Zakelijk Portret, Koppels, Lifestyle, etc.)
8. Herkende doelgroep: identificeer op basis van het beeld de meest passende doelgroep.

Doelgroep- en stijlrichtlijnen:
- ${targetAudienceText}
- ${languageInstruction}
- ${emojiInstruction}
- Voorkeursstijl: ${vibePreference}
- Extra gebruikerscontext van de fotograaf:
  "${extraContext ? extraContext.trim() : 'Geen extra context opgegeven door de fotograaf.'}"
  (Verwerk de context van de fotograaf naadloos in de verhaallijn!)

PLATFORM-SPECIFIEKE RICHTLIJNEN (BELANGRIJK: Kopieer NOOIT dezelfde tekst naar verschillende platformen; elk platform moet een eigen stem, lengte en doel hebben):
${requestedPlatformInstructions}

CRUCIALE VEREISTE: ELKE CAPTION MOET EINDIGEN MET EEN STIMULERENDE INTERACTIEVE VRAAG
- Passend bij het onderwerp en de sfeer van de foto.
- Uitnodigend tot reacties en interactie van volgers.
- Natuurlijk vloeiend als afsluiter (geen luie clichés zoals "Wat vinden jullie?" of "Laat het weten in de comments!").
- Iedere variant binnen een platform MOET een eigen, unieke vraag krijgen.
- In 'captionBody' staat deze vraag als natuurlijke slotzin, én de vraag staat in 'callToAction'.

Lever het resultaat strikt in JSON-formaat volgens het onderstaande schema.
`;

    const response = await generateWithRetry({
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.OBJECT,
              properties: {
                summary: {
                  type: Type.STRING,
                  description: 'Korte beschrijving van wat er op de foto te zien is in 1-2 zinnen.',
                },
                detectedElements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Lijst met gedetecteerde personen, objecten of omgevingselementen.',
                },
                locationGuess: {
                  type: Type.STRING,
                  description: 'Visueel herkenbare locatie of type omgeving.',
                },
                activity: {
                  type: Type.STRING,
                  description: 'Wat er op de foto gebeurt.',
                },
                mood: {
                  type: Type.STRING,
                  description: 'Sfeer en emotie van de foto.',
                },
                colors: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Dominante kleuren of kleurenpalet.',
                },
                timeOfDayOrSeason: {
                  type: Type.STRING,
                  description: 'Moment van de dag of seizoen.',
                },
                category: {
                  type: Type.STRING,
                  description: 'Post categorie (bijv. Bruiloft, Portret, Gezin, etc.).',
                },
                detectedAudience: {
                  type: Type.STRING,
                  description: 'De herkende doelgroep of fotografiegenre (bijv. "Gezinnen en kinderen", "Trouwreportage & Koppels", "Zakelijke Portretten").',
                },
              },
              required: [
                'summary',
                'detectedElements',
                'locationGuess',
                'activity',
                'mood',
                'colors',
                'timeOfDayOrSeason',
                'category',
                'detectedAudience',
              ],
            },
            platformGroups: {
              type: Type.ARRAY,
              description: 'Lijst met gegroepeerde caption-sets, precies 1 set per opgevraagd socialmediaplatform.',
              items: {
                type: Type.OBJECT,
                properties: {
                  platform: {
                    type: Type.STRING,
                    description: 'Platform id: instagram, facebook, linkedin, tiktok, of pinterest',
                  },
                  platformName: {
                    type: Type.STRING,
                    description: 'Naam van het platform (bijv. Instagram, Facebook, LinkedIn, TikTok, Pinterest)',
                  },
                  description: {
                    type: Type.STRING,
                    description: 'Korte toelichting van de stijl die voor dit platform is gebruikt.',
                  },
                  captions: {
                    type: Type.ARRAY,
                    description: 'Precies 3 unieke captions voor dit specifieke platform.',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        platform: { type: Type.STRING },
                        styleName: {
                          type: Type.STRING,
                          description: 'Naam van de stijl/invalshoek (bijv. "Vakmanschap & Branding", "Storytelling", "Short & Snappy").',
                        },
                        hook: {
                          type: Type.STRING,
                          description: 'De openingszin die meteen aandacht trekt.',
                        },
                        captionBody: {
                          type: Type.STRING,
                          description: 'De volledige caption tekst afgestemd op het platform en EINDIGEND met de unieke stimulerende vraag.',
                        },
                        callToAction: {
                          type: Type.STRING,
                          description: 'De specifieke, unieke en stimulerende afsluitende vraag die volgers uitnodigt te reageren in de comments.',
                        },
                        suggestedLocation: {
                          type: Type.STRING,
                          description: 'Aanbevolen locatie / geotag of n.v.t.',
                        },
                        hashtags: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: 'Platform-specifieke hashtags of zoekwoorden.',
                        },
                      },
                      required: [
                        'id',
                        'styleName',
                        'hook',
                        'captionBody',
                        'callToAction',
                        'suggestedLocation',
                        'hashtags',
                      ],
                    },
                  },
                },
                required: ['platform', 'platformName', 'captions'],
              },
            },
          },
          required: ['analysis', 'platformGroups'],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('Geen tekst gegenereerd door het AI-model.');
    }

    const parsedData = JSON.parse(textOutput);

    // Process each platform group to guarantee formatting, hashtag limits and closing questions
    const allFlattenedCaptions: any[] = [];

    if (parsedData?.platformGroups && Array.isArray(parsedData.platformGroups)) {
      parsedData.platformGroups.forEach((group: any) => {
        const plat = String(group.platform || '').toLowerCase();
        group.platform = plat;

        if (Array.isArray(group.captions)) {
          group.captions.forEach((cap: any, idx: number) => {
            cap.platform = plat;
            if (!cap.id) {
              cap.id = `${plat}-${idx + 1}-${Date.now()}`;
            }

            // Platform-specific hashtag processing
            if (!Array.isArray(cap.hashtags)) {
              cap.hashtags = [];
            }

            if (plat === 'facebook') {
              // Facebook uses minimal or no hashtags
              cap.hashtags = cap.hashtags.slice(0, 1);
            } else if (plat === 'linkedin') {
              // LinkedIn uses 2-3 professional industry tags
              cap.hashtags = cap.hashtags.slice(0, 3);
            } else if (plat === 'pinterest') {
              // Pinterest uses 2-4 keywords
              cap.hashtags = cap.hashtags.slice(0, 4);
            } else if (hashtagCount === 'none') {
              cap.hashtags = [];
            } else if (hashtagCount === '1-3') {
              cap.hashtags = cap.hashtags.slice(0, 3);
            } else {
              // Instagram & TikTok max 5
              cap.hashtags = cap.hashtags.slice(0, 5);
            }

            // Guarantee that the caption concludes with the stimulating interactive question
            if (cap.callToAction && typeof cap.callToAction === 'string') {
              const trimmedCta = cap.callToAction.trim();
              let trimmedBody = (cap.captionBody || '').trim();
              if (trimmedCta && !trimmedBody.includes(trimmedCta)) {
                trimmedBody = `${trimmedBody}\n\n${trimmedCta}`;
              }
              cap.captionBody = trimmedBody;
            }

            allFlattenedCaptions.push(cap);
          });
        }
      });
    }

    // Ensure fallback `captions` property for backwards compatibility with any existing components
    parsedData.captions = parsedData.platformGroups?.[0]?.captions || allFlattenedCaptions;

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Fout bij /api/generate-captions:', error);
    const friendlyError = formatErrorMessage(error);
    return res.status(500).json({
      error: friendlyError,
    });
  }
});

// Endpoint 2: Refine / tweak a single caption
app.post('/api/refine-caption', async (req, res) => {
  try {
    const { currentCaption, instruction, language = 'nl', context = '', platform = 'social media', targetAudience = '' }: RefineRequest = req.body;

    if (!currentCaption) {
      return res.status(400).json({ error: 'Geen caption opgegeven om te verfijnen.' });
    }

    const promptText = `
Je bent een social media & copywriting expert voor professionele fotografen.
Pas de volgende caption aan op basis van de instructie van de gebruiker.

Platform: ${platform.toUpperCase()}
${targetAudience ? `Doelgroep/Fotografiegenre: ${targetAudience}` : ''}

Huidige caption:
"""
${currentCaption}
"""

Extra context:
"${context}"

Instructie voor aanpassing:
"${instruction}"

Taal: ${language === 'en' ? 'Engels' : 'Nederlands'}

BELANGRIJKE VEREISTE VOOR AFSLUITING:
Zorg ervoor dat de verfijnde caption perfect aansluit bij de toon van ${platform} en ALTIJD eindigt met een stimulerende, originele vraag die volgers aanzet tot interactie en reacties in de comments (geen standaardclichés zoals "Wat vinden jullie?", maar een specifieke vraag passend bij het onderwerp).

Geef als JSON antwoord:
{
  "refinedCaption": "De verbeterde volledige caption, eindigend met de stimulerende afsluitvraag",
  "explanation": "Wat er is aangepast"
}
`;

    const response = await generateWithRetry({
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refinedCaption: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ['refinedCaption', 'explanation'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Fout bij /api/refine-caption:', error);
    const friendlyError = formatErrorMessage(error);
    return res.status(500).json({
      error: friendlyError,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'InstaCaptions AI' });
});

// Mount Vite in development or serve static in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`);
});
