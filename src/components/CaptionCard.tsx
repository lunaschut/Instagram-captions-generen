import React, { useState } from 'react';
import {
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Edit3,
  Wand2,
  MapPin,
  Eye,
  Share2,
  MessageCircle
} from 'lucide-react';
import { CaptionOption } from '../types';
import { copyToClipboard } from '../utils/imageUtils';

interface CaptionCardProps {
  caption: CaptionOption;
  index: number;
  isSelectedForMockup: boolean;
  onSelectForMockup: () => void;
  onRefine: (caption: CaptionOption) => void;
  onSave: (caption: CaptionOption) => void;
  isSaved: boolean;
  onUpdateCaptionText: (id: string, newText: string) => void;
}

export const CaptionCard: React.FC<CaptionCardProps> = ({
  caption,
  index,
  isSelectedForMockup,
  onSelectForMockup,
  onRefine,
  onSave,
  isSaved,
  onUpdateCaptionText,
}) => {
  const [copiedType, setCopiedType] = useState<'caption' | 'hashtags' | 'all' | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(caption.captionBody);

  const handleCopy = async (type: 'caption' | 'hashtags' | 'all') => {
    let textToCopy = '';
    const hashtagStr = caption.hashtags.join(' ');

    if (type === 'caption') {
      textToCopy = caption.captionBody;
    } else if (type === 'hashtags') {
      textToCopy = hashtagStr;
    } else {
      textToCopy = `${caption.captionBody}\n\n${hashtagStr}`;
    }

    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  const handleSaveEdit = () => {
    onUpdateCaptionText(caption.id, editText);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(caption.captionBody);
    setIsEditing(false);
  };

  const copySingleTag = async (tag: string) => {
    await copyToClipboard(tag);
    setCopiedType('hashtags');
    setTimeout(() => setCopiedType(null), 1200);
  };

  return (
    <div
      className={`bg-white border transition-all duration-200 flex flex-col justify-between ${
        isSelectedForMockup
          ? 'border-black ring-1 ring-black shadow-sm'
          : 'border-neutral-200 hover:border-neutral-400'
      }`}
    >
      <div>
        {/* Card Header */}
        <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-black text-white text-[10px] font-bold flex items-center justify-center font-mono">
              0{index + 1}
            </span>
            {caption.platform && (
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 border border-black bg-neutral-900 text-white font-mono">
                {caption.platform}
              </span>
            )}
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-black truncate max-w-[170px] sm:max-w-none">
              {caption.styleName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSave(caption)}
              className={`p-1.5 transition-colors ${
                isSaved ? 'text-black' : 'text-neutral-400 hover:text-black'
              }`}
              title={isSaved ? 'Opgeslagen' : 'Opslaan'}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 fill-black" /> : <Bookmark className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 text-neutral-400 hover:text-black transition-colors"
              title="Bewerken"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          {/* Location tag */}
          {caption.suggestedLocation && (
            <div className="mb-3 flex items-center gap-1.5 text-[11px] text-neutral-700 font-medium uppercase tracking-wider">
              <MapPin className="w-3 h-3 text-black" />
              <span>{caption.suggestedLocation}</span>
            </div>
          )}

          {/* Hook Callout */}
          <div className="mb-4 p-3 bg-neutral-50 border-l-2 border-black">
            <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 block mb-0.5">
              Opening Hook:
            </span>
            <p className="text-xs font-semibold text-black italic">
              "{caption.hook}"
            </p>
          </div>

          {/* Main Caption Content */}
          {isEditing ? (
            <div className="space-y-2 mb-4">
              <textarea
                rows={6}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full text-xs text-black p-3 border border-black focus:outline-none leading-relaxed font-sans"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-100 uppercase tracking-wider"
                >
                  Annuleren
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="editorial-btn px-3 py-1 text-xs"
                >
                  Opslaan
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs sm:text-[13px] text-neutral-900 whitespace-pre-line leading-relaxed mb-4 font-sans select-text">
              {caption.captionBody}
            </div>
          )}

          {/* Stimulerende vraag voor volgersinteractie */}
          {caption.callToAction && !isEditing && (
            <div className="mb-4 p-3 bg-neutral-50/90 border border-neutral-200 flex items-start gap-2.5">
              <MessageCircle className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-bold text-black text-[10px] uppercase tracking-wider">
                    Afsluitende interactievraag:
                  </span>
                  <span className="text-[9px] font-semibold text-neutral-600 bg-neutral-200/70 px-1.5 py-0.5 uppercase tracking-wider">
                    Reactie-booster
                  </span>
                </div>
                <p className="text-neutral-800 italic font-medium leading-relaxed">
                  "{caption.callToAction}"
                </p>
              </div>
            </div>
          )}

          {/* Hashtags */}
          {caption.hashtags.length > 0 && (
            <div className="pt-3 border-t border-neutral-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Hashtags ({caption.hashtags.length})
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy('hashtags')}
                  className="text-[11px] text-neutral-700 hover:text-black font-semibold uppercase tracking-wider"
                >
                  {copiedType === 'hashtags' ? 'Gekopieerd!' : 'Kopieer tags'}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto custom-scrollbar pr-1">
                {caption.hashtags.map((tag, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => copySingleTag(tag)}
                    title="Klik om te kopiëren"
                    className="text-[11px] text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 border border-neutral-200 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer / Primary Actions */}
      <div className="px-5 py-4 bg-neutral-50/80 border-t border-neutral-100 space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          {/* Copy Caption */}
          <button
            type="button"
            onClick={() => handleCopy('caption')}
            className={`py-2.5 px-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              copiedType === 'caption'
                ? 'bg-neutral-800 text-white'
                : 'bg-black hover:bg-neutral-800 text-white'
            }`}
          >
            {copiedType === 'caption' ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Gekopieerd!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Kopieer caption</span>
              </>
            )}
          </button>

          {/* Copy All */}
          <button
            type="button"
            onClick={() => handleCopy('all')}
            className={`py-2.5 px-3 text-xs font-semibold uppercase tracking-wider border flex items-center justify-center gap-1.5 transition-all ${
              copiedType === 'all'
                ? 'bg-neutral-100 border-black text-black'
                : 'bg-white hover:bg-neutral-100 border-neutral-300 text-black'
            }`}
            title="Kopieer tekst en hashtags samen"
          >
            {copiedType === 'all' ? (
              <>
                <Check className="w-3.5 h-3.5 text-black" />
                <span>Gekopieerd!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Tekst + tags</span>
              </>
            )}
          </button>
        </div>

        {/* Secondary: Preview & Refine */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <button
            type="button"
            onClick={onSelectForMockup}
            className={`flex items-center gap-1.5 text-[11px] uppercase tracking-wider transition-colors ${
              isSelectedForMockup
                ? 'text-black font-bold'
                : 'text-neutral-500 hover:text-black font-medium'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>{isSelectedForMockup ? 'Actief in preview' : 'Bekijk in mockup'}</span>
          </button>

          <button
            type="button"
            onClick={() => onRefine(caption)}
            className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-black font-semibold uppercase tracking-wider transition-colors"
          >
            <Wand2 className="w-3 h-3 text-black" />
            <span>Verfijn met AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
