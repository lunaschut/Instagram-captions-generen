import React, { useState } from 'react';
import { Eye, MapPin, Activity, Smile, Palette, Sun, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { PhotoAnalysis } from '../types';

interface AnalysisCardProps {
  analysis: PhotoAnalysis;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white border border-neutral-200 mb-8 overflow-hidden">
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-6 py-4 bg-neutral-50/70 border-b border-neutral-200 flex items-center justify-between cursor-pointer hover:bg-neutral-100/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border border-black flex items-center justify-center text-black">
            <Eye className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-[0.14em] uppercase text-black flex items-center gap-2">
              <span>Visuele Foto-Analyse</span>
              <span className="text-neutral-400 font-normal">/</span>
              <span className="text-neutral-600 font-medium tracking-normal">
                {analysis.category}
              </span>
            </h3>
          </div>
        </div>

        <button
          type="button"
          className="text-xs text-neutral-600 hover:text-black flex items-center gap-1 font-medium uppercase tracking-wider"
        >
          <span>{isExpanded ? 'Inklappen' : 'Details'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Summary highlight */}
      <div className="p-6">
        <p className="text-sm text-neutral-800 leading-relaxed font-normal mb-5 pb-4 border-b border-neutral-100 italic">
          "{analysis.summary}"
        </p>

        {isExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
            {/* Locatie */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-black" />
                <span>Locatie / Omgeving</span>
              </div>
              <p className="text-xs text-black font-medium">
                {analysis.locationGuess || 'Geen specifieke geotag'}
              </p>
            </div>

            {/* Activiteit */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-black" />
                <span>Actie / Moment</span>
              </div>
              <p className="text-xs text-black font-medium">
                {analysis.activity || 'Statisch portret'}
              </p>
            </div>

            {/* Sfeer */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                <Smile className="w-3 h-3 text-black" />
                <span>Sfeer &amp; Emotie</span>
              </div>
              <p className="text-xs text-black font-medium">
                {analysis.mood}
              </p>
            </div>

            {/* Moment / Lichtval */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                <Sun className="w-3 h-3 text-black" />
                <span>Licht &amp; Tijdstip</span>
              </div>
              <p className="text-xs text-black font-medium">
                {analysis.timeOfDayOrSeason}
              </p>
            </div>

            {/* Kleuren */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                <Palette className="w-3 h-3 text-black" />
                <span>Kleurentinten</span>
              </div>
              <div className="text-xs text-black font-medium">
                {analysis.colors.join(' · ')}
              </div>
            </div>

            {/* Herkende Doelgroep */}
            {analysis.detectedAudience && (
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-black" />
                  <span>Herkend Fotografiegenre</span>
                </div>
                <div className="text-xs text-black font-semibold">
                  {analysis.detectedAudience}
                </div>
              </div>
            )}

            {/* Elementen */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-black" />
                <span>Herkenbare Details</span>
              </div>
              <div className="text-xs text-black font-medium">
                {analysis.detectedElements.join(' · ')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
