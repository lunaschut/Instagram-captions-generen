import React, { useState } from 'react';
import { X, Wand2, Check } from 'lucide-react';
import { CaptionOption } from '../types';

interface RefineModalProps {
  isOpen: boolean;
  onClose: () => void;
  caption: CaptionOption | null;
  onApplyRefined: (refinedCaption: string) => void;
  extraContext?: string;
  language?: string;
}

export const RefineModal: React.FC<RefineModalProps> = ({
  isOpen,
  onClose,
  caption,
  onApplyRefined,
  extraContext = '',
  language = 'nl',
}) => {
  const [instruction, setInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refinedResult, setRefinedResult] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !caption) return null;

  const quickPrompts = [
    'Maak het korter en krachtiger',
    'Meer concert/festival energie',
    'Editorial en poëtische tone of voice',
    'Voeg meer humor en gevatheid toe',
    'Nog sterkere/prikkelende afsluitende interactievraag',
  ];

  const handleRefine = async (customText?: string) => {
    const textToUse = customText || instruction;
    if (!textToUse.trim()) return;

    setIsRefining(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/refine-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCaption: caption.captionBody,
          instruction: textToUse,
          language,
          context: extraContext,
          platform: caption.platform || 'instagram',
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Er is een fout opgetreden.');
      }

      const data = await response.json();
      setRefinedResult(data.refinedCaption);
      setExplanation(data.explanation);
    } catch (err: any) {
      setErrorMsg(err.message || 'Kon de caption niet verfijnen.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleApply = () => {
    if (refinedResult) {
      onApplyRefined(refinedResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-neutral-300 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-black">
              Caption Verfijnen met AI
            </h3>
            <p className="text-[11px] text-neutral-500">Pas stijl, lengte of focus aan</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current caption */}
        <div className="my-4">
          <label className="text-[10px] font-bold text-neutral-500 block mb-1 uppercase tracking-widest">
            Huidige tekst:
          </label>
          <div className="text-xs text-neutral-800 bg-neutral-50 p-3.5 border border-neutral-200 whitespace-pre-line max-h-32 overflow-y-auto font-sans leading-relaxed">
            {caption.captionBody}
          </div>
        </div>

        {/* Quick choices */}
        <div className="mb-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1.5">
            Veelvoorkomende aanpassingen:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInstruction(q);
                  handleRefine(q);
                }}
                disabled={isRefining}
                className="text-[11px] bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-black px-2.5 py-1 transition-colors text-left font-medium"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Custom instruction */}
        <div className="mb-4">
          <label htmlFor="refine-inst" className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1.5">
            Of geef een eigen instructie:
          </label>
          <div className="flex gap-2">
            <input
              id="refine-inst"
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Bijv. Maak het meer concert-sfeer en benoem Amsterdam..."
              className="flex-1 text-xs border border-neutral-300 p-2.5 text-black focus:outline-none focus:border-black rounded-none"
              onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
            />
            <button
              type="button"
              onClick={() => handleRefine()}
              disabled={isRefining || !instruction.trim()}
              className="editorial-btn px-4 py-2.5 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isRefining ? 'Bezig...' : 'Verfijn'}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 text-xs text-black bg-neutral-100 border border-neutral-300">
            {errorMsg}
          </div>
        )}

        {/* Refined preview */}
        {refinedResult && (
          <div className="mt-2 p-4 bg-neutral-50 border border-black">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-black">
                Nieuwe versie
              </span>
              {explanation && (
                <span className="text-[10px] text-neutral-500 italic">{explanation}</span>
              )}
            </div>
            <div className="text-xs text-neutral-900 whitespace-pre-line leading-relaxed mb-3">
              {refinedResult}
            </div>
            <button
              type="button"
              onClick={handleApply}
              className="editorial-btn w-full py-2.5 text-xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Toepassen op kaart</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
