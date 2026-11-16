import React, { useState } from 'react';
import { X, Bookmark, Trash2, Copy, Check } from 'lucide-react';
import { SavedCaption } from '../types';
import { copyToClipboard } from '../utils/imageUtils';

interface SavedCaptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedCaptions: SavedCaption[];
  onDelete: (id: string) => void;
  onSelectToView: (item: SavedCaption) => void;
}

export const SavedCaptionsModal: React.FC<SavedCaptionsModalProps> = ({
  isOpen,
  onClose,
  savedCaptions,
  onDelete,
  onSelectToView,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (item: SavedCaption) => {
    const fullText = `${item.caption}\n\n${item.hashtags.join(' ')}`;
    const ok = await copyToClipboard(fullText);
    if (ok) {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-neutral-300 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-black">
              Opgeslagen Captions
            </h3>
            <p className="text-[11px] text-neutral-500">
              {savedCaptions.length} {savedCaptions.length === 1 ? 'item' : 'items'} in je account
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar my-4 space-y-3 pr-1">
          {savedCaptions.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs">
              Nog geen opgeslagen captions. Klik op het bladwijzer-icoontje bij een gegenereerde caption om deze te bewaren.
            </div>
          ) : (
            savedCaptions.map((item) => (
              <div
                key={item.id}
                className="p-4 border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors flex flex-col sm:flex-row gap-4 justify-between"
              >
                {item.imageUrl && (
                  <div className="w-16 h-16 bg-neutral-200 shrink-0 border border-neutral-200 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-black">
                      {item.styleName || 'Caption'}
                    </span>
                    {item.location && (
                      <span className="text-[11px] text-neutral-600 font-medium">
                        📍 {item.location}
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-400 ml-auto font-mono">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-800 whitespace-pre-line line-clamp-3 mb-2 font-sans leading-relaxed">
                    {item.caption}
                  </p>

                  {item.hashtags.length > 0 && (
                    <div className="text-[11px] text-neutral-500 truncate font-mono">
                      {item.hashtags.join(' ')}
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200">
                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    className="p-2 text-xs font-medium border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center gap-1 uppercase tracking-wider"
                    title="Kopieer caption"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-black" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="sm:hidden">{copiedId === item.id ? 'Gekopieerd' : 'Kopieer'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-xs text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
                    title="Verwijderen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
