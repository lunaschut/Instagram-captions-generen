import React, { useState } from 'react';
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageCircle,
  Check,
  Users,
  Share2
} from 'lucide-react';
import { GenerationSettings, SocialPlatform, TargetAudienceType } from '../types';
import { SOCIAL_PLATFORMS, TARGET_AUDIENCES } from '../constants/platformData';

interface ContextAndSettingsProps {
  extraContext: string;
  onChangeExtraContext: (val: string) => void;
  settings: GenerationSettings;
  onChangeSettings: (settings: GenerationSettings) => void;
  onSubmit: () => void;
  isProcessing: boolean;
  hasImage: boolean;
}

export const ContextAndSettings: React.FC<ContextAndSettingsProps> = ({
  extraContext,
  onChangeExtraContext,
  settings,
  onChangeSettings,
  onSubmit,
  isProcessing,
  hasImage,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const contextSuggestions = [
    'Bruidspaar fotoshoot bij zonsondergang op een landgoed.',
    'Newborn reportage thuis in de babykamer met natuurlijk zacht licht.',
    'Zakelijk portret en personal branding voor een creatieve ondernemer.',
    'Spontane gezinsshoot in het bos tijdens een zonnige herfstdag.',
    'Loveshoot van een pas verloofd stelletje in de binnenstad.',
    'Hondenfotografie van een vrolijke golden retriever op het strand.',
  ];

  const handleTogglePlatform = (platId: SocialPlatform) => {
    const isSelected = settings.platforms.includes(platId);
    let newPlatforms: SocialPlatform[];

    if (isSelected) {
      // Prevent unselecting if it is the only platform
      if (settings.platforms.length <= 1) return;
      newPlatforms = settings.platforms.filter((p) => p !== platId);
    } else {
      newPlatforms = [...settings.platforms, platId];
    }

    onChangeSettings({
      ...settings,
      platforms: newPlatforms,
    });
  };

  const selectedAudienceObj = TARGET_AUDIENCES.find((a) => a.id === settings.targetAudience) || TARGET_AUDIENCES[0];

  return (
    <div className="bg-white border border-neutral-200 p-6 sm:p-7 space-y-6">
      {/* 1. Platform Multi-Selector */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold text-black uppercase tracking-[0.12em] flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            <span>Socialmediaplatformen</span>
            <span className="text-[10px] font-normal text-neutral-500 lowercase">
              ({settings.platforms.length} geselecteerd)
            </span>
          </label>
          <span className="text-[11px] text-neutral-600 hidden sm:inline">
            Selecteer 1 of meerdere platformen
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {SOCIAL_PLATFORMS.map((plat) => {
            const isChecked = settings.platforms.includes(plat.id);
            return (
              <button
                key={plat.id}
                type="button"
                onClick={() => handleTogglePlatform(plat.id)}
                className={`p-3 text-left border transition-all relative flex flex-col justify-between ${
                  isChecked
                    ? 'border-black bg-black text-white shadow-xs'
                    : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100/70 text-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {plat.name}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-none border flex items-center justify-center text-[10px] ${
                      isChecked
                        ? 'border-white bg-white text-black'
                        : 'border-neutral-400 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <span
                  className={`text-[10px] leading-tight block ${
                    isChecked ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
                >
                  {plat.tagline}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Target Audience & Photography Type Selector */}
      <div className="pt-4 border-t border-neutral-100">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="target-audience" className="text-xs font-bold text-black uppercase tracking-[0.12em] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Doelgroep &amp; Type fotografie</span>
          </label>
          <span className="text-[11px] text-neutral-600">
            Stem toon &amp; perspectief af
          </span>
        </div>

        <div className="space-y-2">
          <select
            id="target-audience"
            value={settings.targetAudience}
            onChange={(e) =>
              onChangeSettings({
                ...settings,
                targetAudience: e.target.value as TargetAudienceType,
              })
            }
            className="w-full text-xs font-medium border border-neutral-300 bg-white p-3 text-black focus:outline-none focus:border-black rounded-none cursor-pointer"
          >
            {TARGET_AUDIENCES.map((aud) => (
              <option key={aud.id} value={aud.id}>
                {aud.label}
              </option>
            ))}
          </select>

          {/* Custom audience input if 'custom' is selected */}
          {settings.targetAudience === 'custom' && (
            <div className="animate-in fade-in duration-150">
              <input
                type="text"
                value={settings.customAudience || ''}
                onChange={(e) =>
                  onChangeSettings({
                    ...settings,
                    customAudience: e.target.value,
                  })
                }
                placeholder="Bijv: Boudoir fotoshoot in zacht natuurlijk licht, of Culinaire foodreportage..."
                className="w-full border border-black p-2.5 text-xs text-black placeholder:text-neutral-400 focus:outline-none rounded-none font-sans"
              />
            </div>
          )}

          <p className="text-[11px] text-neutral-500 italic pl-0.5">
            {selectedAudienceObj.guidance}
          </p>
        </div>
      </div>

      {/* 3. Extra context textarea */}
      <div className="pt-4 border-t border-neutral-100">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="extra-context" className="text-xs font-bold text-black uppercase tracking-[0.12em]">
            Extra fotoshoot details (optioneel)
          </label>
          <span className="text-[11px] text-neutral-600">
            Locatie, achter de schermen of sfeer
          </span>
        </div>

        <div className="relative mb-2.5">
          <textarea
            id="extra-context"
            rows={2}
            value={extraContext}
            onChange={(e) => onChangeExtraContext(e.target.value)}
            placeholder="Bijvoorbeeld: fotoshoot bij zonsondergang op het strand, of bruiloft in een kasteelpark."
            className="w-full border border-neutral-300 p-3 text-xs sm:text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:border-black transition-colors resize-none rounded-none font-sans"
          />
          {extraContext.length > 0 && (
            <button
              type="button"
              onClick={() => onChangeExtraContext('')}
              className="absolute top-2 right-2 text-[10px] text-neutral-500 hover:text-black uppercase tracking-wider px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              Wissen
            </button>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 whitespace-nowrap shrink-0">
            Ideeën:
          </span>
          {contextSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChangeExtraContext(suggestion)}
              className="text-[10px] bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 hover:text-black px-2 py-0.5 whitespace-nowrap transition-colors"
            >
              {suggestion.length > 40 ? `${suggestion.slice(0, 40)}...` : suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Advanced toggle */}
      <div className="pt-3 border-t border-neutral-100">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-xs font-bold text-neutral-700 hover:text-black py-1.5 transition-colors uppercase tracking-wider"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Stijl-, Taal- &amp; Hashtaginstellingen</span>
            <span className="text-[10px] text-neutral-500 font-normal lowercase tracking-normal">
              ({settings.language} · {settings.vibePreference})
            </span>
          </span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
            {/* Vibe / Tone */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Stijl &amp; Toon
              </label>
              <select
                value={settings.vibePreference}
                onChange={(e) =>
                  onChangeSettings({ ...settings, vibePreference: e.target.value })
                }
                className="w-full text-xs border border-neutral-300 bg-white p-2.5 text-black focus:outline-none focus:border-black rounded-none"
              >
                <option value="gevarieerd">Gevarieerd (3 verschillende stijlen)</option>
                <option value="Editorial & Artistiek">Editorial &amp; Artistiek (high-fashion)</option>
                <option value="Concert & Festival Vibe">Concert &amp; Festival Energy</option>
                <option value="Kort, Krachtig & Esthetisch">Kort, Krachtig &amp; Esthetisch</option>
                <option value="Casual & Gezellig">Casual &amp; Toegankelijk</option>
                <option value="Humoristisch & Gevat">Humoristisch &amp; Gevat</option>
                <option value="Storytelling & Diepzinnig">Storytelling &amp; Poëtisch</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Doeltaal
              </label>
              <select
                value={settings.language}
                onChange={(e) =>
                  onChangeSettings({
                    ...settings,
                    language: e.target.value as 'nl' | 'en' | 'bilingual',
                  })
                }
                className="w-full text-xs border border-neutral-300 bg-white p-2.5 text-black focus:outline-none focus:border-black rounded-none"
              >
                <option value="nl">Nederlands</option>
                <option value="en">English (International)</option>
                <option value="bilingual">Tweetalig (NL + EN)</option>
              </select>
            </div>

            {/* Emojis */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Emoji gebruik
              </label>
              <select
                value={settings.emojiPreference}
                onChange={(e) =>
                  onChangeSettings({
                    ...settings,
                    emojiPreference: e.target.value as 'lots' | 'subtle' | 'none',
                  })
                }
                className="w-full text-xs border border-neutral-300 bg-white p-2.5 text-black focus:outline-none focus:border-black rounded-none"
              >
                <option value="subtle">Subtiel (2-3 smaakvolle emoji's)</option>
                <option value="none">Geen emoji's (strak &amp; redactioneel)</option>
                <option value="lots">Rijk &amp; expressief</option>
              </select>
            </div>

            {/* Hashtags */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Hashtags (max. 5)
              </label>
              <select
                value={settings.hashtagCount}
                onChange={(e) =>
                  onChangeSettings({
                    ...settings,
                    hashtagCount: e.target.value as '1-3' | '3-5' | 'none',
                  })
                }
                className="w-full text-xs border border-neutral-300 bg-white p-2.5 text-black focus:outline-none focus:border-black rounded-none font-medium"
              >
                <option value="3-5">3 - 5 hashtags (Aanbevolen · Max 5)</option>
                <option value="1-3">1 - 3 hashtags (Minimalistisch · Max 3)</option>
                <option value="none">0 hashtags (Geen hashtags)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Interaction guarantee note */}
      <div className="mt-5 p-3 bg-neutral-50 border border-neutral-200 flex items-start sm:items-center gap-2.5">
        <MessageCircle className="w-3.5 h-3.5 text-black shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-[11px] text-neutral-600 leading-snug">
          <span className="font-bold text-black uppercase tracking-wider text-[10px] mr-1.5">Interactie-garantie:</span>
          Elke optie sluit af met een unieke, stimulerende vraag om volgersreacties en comments te stimuleren.
        </p>
      </div>

      {/* Distinctive Solid Black Editorial Button */}
      <div className="mt-5">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!hasImage || isProcessing}
          className={`w-full py-4 px-6 font-bold tracking-[0.14em] uppercase text-xs flex items-center justify-center gap-3 transition-all duration-200 rounded-none cursor-pointer ${
            !hasImage
              ? 'bg-neutral-200 text-neutral-600 cursor-not-allowed'
              : isProcessing
              ? 'bg-neutral-800 text-white cursor-wait'
              : 'bg-black hover:bg-neutral-800 text-white active:scale-[0.99]'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Foto analyseren &amp; captions per platform genereren...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>
                Bedenk captions voor {settings.platforms.length === 1 ? (SOCIAL_PLATFORMS.find((p) => p.id === settings.platforms[0])?.name || 'social media') : `${settings.platforms.length} platformen`} met AI
              </span>
            </>
          )}
        </button>

        {!hasImage && (
          <p className="text-center text-[11px] text-neutral-600 mt-2.5 tracking-wide">
            Upload eerst een foto hierboven of klik op een van de voorbeelden.
          </p>
        )}
      </div>
    </div>
  );
};
