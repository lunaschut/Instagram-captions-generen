import { SocialPlatform, TargetAudienceType } from '../types';

export interface PlatformConfig {
  id: SocialPlatform;
  name: string;
  badge: string;
  tagline: string;
  focusHint: string;
  color: string;
}

export const SOCIAL_PLATFORMS: PlatformConfig[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    badge: 'IG',
    tagline: 'Visueel, persoonlijk & interactief',
    focusHint: 'Storytelling, scroll-stopping hook, reactievraag & gerichte hashtags',
    color: 'border-neutral-900',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    badge: 'FB',
    tagline: 'Gemeenschap & fotoshoot-verhaal',
    focusHint: 'Toegankelijke storytelling achter de shoot, tags, familie & vrienden',
    color: 'border-neutral-900',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    badge: 'IN',
    tagline: 'Zakelijk vakmanschap & branding',
    focusHint: 'Professionele insteek, achter de schermen, visuele identiteit & vakkennis',
    color: 'border-neutral-900',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    badge: 'TT',
    tagline: 'Snappy hooks & viral vibe',
    focusHint: 'Korte krachtige one-liner, spontane POV & trending interactie',
    color: 'border-neutral-900',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    badge: 'PIN',
    tagline: 'Inspirerend & SEO-zoekwoorden',
    focusHint: 'Beschrijving van stijl, kleurenpalet & ideeën voor moodboards',
    color: 'border-neutral-900',
  },
];

export interface AudienceConfig {
  id: TargetAudienceType;
  label: string;
  category: string;
  promptDescription: string;
  guidance: string;
}

export const TARGET_AUDIENCES: AudienceConfig[] = [
  {
    id: 'auto',
    label: 'Automatisch herkennen door AI (Aanbevolen)',
    category: 'Slimme AI',
    promptDescription: 'De AI analyseert de visuele context van de foto (personen, setting, interactie, sfeer) en kiest zelfstandig het meest passende fotografiegenre en de doelgroep zonder exacte leeftijden te gokken.',
    guidance: 'De AI detecteert zelf of het bijv. om een bruiloft, gezin, ondernemer of newborn gaat.',
  },
  {
    id: 'newborn',
    label: "Newborn en baby's (0-12 mnd)",
    category: 'Babyfotografie',
    promptDescription: "Newborn- en babyfotografie. Focus op tederheid, kwetsbaarheid, verwondering, de allereerste weken, slapende details, zachtheid, puur geluk en tijdloze herinneringen voor de kersverse ouders.",
    guidance: 'Zachte, tedere teksten over de eerste magische weken en verwondering.',
  },
  {
    id: 'family',
    label: 'Kinderen en gezinnen',
    category: 'Gezinsfotografie',
    promptDescription: 'Gezinsfotografie en spelende kinderen. Focus op spontaniteit, ongedwongen plezier, échte emoties, warme familiebanden, gekke momenten, tederheid en het vastleggen van de tijd die zo snel gaat.',
    guidance: 'Spontaan, speels en herkenbaar voor ouders en families.',
  },
  {
    id: 'teens',
    label: 'Tieners en jongeren',
    category: 'Jongeren',
    promptDescription: 'Tieners, adolescenten en jongvolwassenen. Focus op zelfvertrouwen, eigentijdse vibe, expressie, vriendschap, authenticiteit, identiteit en dynamiek.',
    guidance: 'Eigentijds, expressief, fris en zelfverzekerd.',
  },
  {
    id: 'adults',
    label: 'Volwassenen (Portret & Lifestyle)',
    category: 'Portretfotografie',
    promptDescription: 'Portretten van volwassenen en lifestylefotografie. Focus op stijl, authenticiteit, natuurlijke schoonheid, zelfvertrouwen en karakter.',
    guidance: 'Stijlvol, natuurlijk en karaktervol.',
  },
  {
    id: 'seniors',
    label: 'Senioren en ouderen',
    category: 'Generaties',
    promptDescription: 'Senioren, grootouders en generatiesamenstellingen. Focus op warmte, levensverhalen, waardevolle herinneringen, respect, wijsheid en dierbare banden.',
    guidance: 'Respectvol, warm en met oog voor dierbare herinneringen.',
  },
  {
    id: 'couples',
    label: 'Stellen en koppels (Liefdesshoot)',
    category: 'Koppels',
    promptDescription: 'Koppels, verliefde stellen en loveshoots. Focus op romantiek, intimiteit, spontane blikken, oprechte connectie, warmte, speelse liefde en samen genieten.',
    guidance: 'Romantisch, intiem en gericht op oprechte verbinding.',
  },
  {
    id: 'wedding',
    label: 'Bruiloften en trouwfotografie',
    category: 'Trouwfotografie',
    promptDescription: 'Bruiloften en trouwreportages. Focus op het vieren van de liefde, emoties, feestelijkheid, trouwbeloftes, oog voor styling en details, de unieke trouwdag en een tijdloos huwelijksverhaal.',
    guidance: 'Feestelijk, tijdloos, stijlvol en vol emotie.',
  },
  {
    id: 'maternity',
    label: 'Zwangerschapsfotografie',
    category: 'Maternity',
    promptDescription: 'Zwangerschapsfotografie en bolle buiken. Focus op het wonder van nieuw leven, trots, verwachting, de zwangerschapsgloed, vrouwelijke kracht en tederheid.',
    guidance: 'Magisch, trots en in blijde verwachting van nieuw leven.',
  },
  {
    id: 'business',
    label: 'Zakelijke fotografie & ondernemers',
    category: 'Zakelijk & Branding',
    promptDescription: 'Zakelijke portretten, personal branding en ondernemers. Focus op professionaliteit, visuele identiteit, betrouwbaarheid, deskundigheid, gedrevenheid, het gezicht achter het bedrijf en hoogwaardig beeldmateriaal.',
    guidance: 'Professioneel, krachtig, betrouwbaar en gericht op personal branding.',
  },
  {
    id: 'pets',
    label: 'Dierenfotografie (Huisdieren & Wildlife)',
    category: 'Dieren',
    promptDescription: 'Dierenfotografie (honden, katten, paarden of andere dieren). Focus op karakter, speelsheid, trouwe viervoeters, de band tussen mens en dier en onvoorwaardelijke liefde.',
    guidance: 'Karaktervol, liefdevol en herkenbaar voor dierenliefhebbers.',
  },
  {
    id: 'custom',
    label: 'Anders / eigen invoer...',
    category: 'Eigen opgave',
    promptDescription: 'Specifiek door de fotograaf opgegeven context en doelgroep.',
    guidance: 'Geef zelf de specifieke niche of shootbeschrijving in het tekstveld op.',
  },
];
