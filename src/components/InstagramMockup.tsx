import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  MapPin,
  Smartphone,
  Copy,
  Check,
  Smile,
  Camera
} from 'lucide-react';
import { CaptionOption } from '../types';
import { copyToClipboard } from '../utils/imageUtils';

interface InstagramMockupProps {
  imageSrc: string | null;
  activeCaption: CaptionOption | null;
  onSelectOptionIndex?: (index: number) => void;
  allOptions?: CaptionOption[];
  currentIndex?: number;
}

export const InstagramMockup: React.FC<InstagramMockupProps> = ({
  imageSrc,
  activeCaption,
  onSelectOptionIndex,
  allOptions = [],
  currentIndex = 0,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(624);
  const [username, setUsername] = useState('roosjploeg');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  const handleDoubleTap = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 800);
  };

  const handleLikeToggle = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const handleCopyPost = async () => {
    if (!activeCaption) return;
    const fullPost = `${activeCaption.captionBody}\n\n${activeCaption.hashtags.join(' ')}`;
    const success = await copyToClipboard(fullPost);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!imageSrc || !activeCaption) {
    return (
      <div className="bg-white border border-neutral-200 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-black" />
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-black">Feed Mockup</h3>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 border border-neutral-300 text-neutral-500 uppercase tracking-wider">
            Voorbeeld
          </span>
        </div>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-neutral-200" />
          <div className="text-xs font-bold text-black">roosjploeg</div>
        </div>
        <div className="aspect-square bg-neutral-100 border border-neutral-200 flex flex-col items-center justify-center text-neutral-400 mb-3">
          <Camera className="w-8 h-8 stroke-1 mb-2" />
          <span className="text-[11px] uppercase tracking-[0.15em] font-bold">Jouw foto</span>
        </div>
        <div className="flex items-center gap-4 mb-2 text-neutral-300">
          <Heart className="w-5 h-5" />
          <MessageCircle className="w-5 h-5" />
          <Send className="w-5 h-5" />
        </div>
        <p className="text-xs text-neutral-400 italic leading-relaxed">
          Zodra je foto is geanalyseerd, verschijnt hier je caption live in een Instagram-post.
        </p>
      </div>
    );
  }

  const captionText = activeCaption.captionBody;
  const isLong = captionText.length > 120;
  const displayText = !isExpanded && isLong ? `${captionText.slice(0, 110)}...` : captionText;

  return (
    <div className="bg-white border border-neutral-200 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <Smartphone className="w-3.5 h-3.5 text-black" />
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-black flex items-center gap-1.5">
            <span>Feed Mockup</span>
            {activeCaption?.platform && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 bg-black text-white uppercase tracking-wider">
                {activeCaption.platform}
              </span>
            )}
          </h3>
        </div>

        {allOptions.length > 1 && onSelectOptionIndex && (
          <div className="flex items-center gap-1 bg-neutral-100 p-0.5">
            {allOptions.map((opt, idx) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectOptionIndex(idx)}
                className={`px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase transition-all ${
                  currentIndex === idx
                    ? 'bg-black text-white'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                0{idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Realistic Instagram Feed Frame */}
      <div className="max-w-[390px] mx-auto bg-white border border-neutral-200 overflow-hidden font-sans">
        {/* Post Header */}
        <div className="px-3.5 py-3 flex items-center justify-between border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full border border-black p-0.5 bg-white">
              <div className="w-full h-full rounded-full overflow-hidden bg-neutral-200">
                <img
                  src={imageSrc}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="leading-tight">
              {isEditingUsername ? (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  onBlur={() => setIsEditingUsername(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingUsername(false)}
                  autoFocus
                  className="text-xs font-bold text-black border-b border-black focus:outline-none"
                />
              ) : (
                <div
                  onClick={() => setIsEditingUsername(true)}
                  className="text-xs font-bold text-black hover:underline cursor-pointer flex items-center gap-1"
                  title="Klik om te bewerken"
                >
                  <span>{username}</span>
                  <span className="text-[10px] text-neutral-400 font-normal">✎</span>
                </div>
              )}

              {activeCaption.suggestedLocation && (
                <div className="text-[10px] text-neutral-600 flex items-center gap-0.5 uppercase tracking-wide">
                  <MapPin className="w-2.5 h-2.5 text-black" />
                  <span className="truncate max-w-[190px]">{activeCaption.suggestedLocation}</span>
                </div>
              )}
            </div>
          </div>

          <button type="button" className="text-black hover:opacity-70 p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Media Frame */}
        <div
          onDoubleClick={handleDoubleTap}
          className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden select-none cursor-pointer"
        >
          <img
            src={imageSrc}
            alt="Instagram Post"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />

          {heartAnim && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in-50 fade-in duration-300">
              <Heart className="w-20 h-20 text-white fill-white drop-shadow-md" />
            </div>
          )}
        </div>

        {/* Action icons bar */}
        <div className="px-3.5 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleLikeToggle}
              className="hover:opacity-60 transition-opacity"
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  isLiked ? 'text-red-600 fill-red-600' : 'text-black'
                }`}
              />
            </button>
            <button type="button" className="hover:opacity-60 transition-opacity text-black">
              <MessageCircle className="w-6 h-6" />
            </button>
            <button type="button" className="hover:opacity-60 transition-opacity text-black">
              <Send className="w-6 h-6" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            className="hover:opacity-60 transition-opacity text-black"
          >
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-black' : ''}`} />
          </button>
        </div>

        {/* Likes Count */}
        <div className="px-3.5 pb-1">
          <span className="text-xs font-bold text-black">
            {likesCount.toLocaleString()} vind-ik-leuks
          </span>
        </div>

        {/* Caption & Hashtags */}
        <div className="px-3.5 pb-2.5 text-xs text-black leading-snug">
          <span className="font-bold mr-1.5">{username}</span>
          <span className="whitespace-pre-line text-neutral-900">{displayText}</span>

          {isLong && !isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-neutral-500 ml-1 hover:text-black font-semibold inline"
            >
              meer
            </button>
          )}

          {isExpanded && activeCaption.hashtags.length > 0 && (
            <div className="mt-2 text-neutral-600 font-medium leading-relaxed">
              {activeCaption.hashtags.map((tag, i) => (
                <span key={i} className="mr-1 hover:text-black hover:underline cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-neutral-400 block mt-1 hover:text-black font-normal"
            >
              Minder weergeven
            </button>
          )}
        </div>

        {/* Timestamp */}
        <div className="px-3.5 pb-2.5 text-[10px] text-neutral-400 tracking-widest uppercase font-medium">
          2 UUR GELEDEN
        </div>

        {/* Comment Bar */}
        <div className="px-3.5 py-2.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Smile className="w-4 h-4 text-neutral-400" />
            <span>Een opmerking toevoegen...</span>
          </div>
          <button type="button" className="text-xs font-bold text-black uppercase tracking-wider">
            Plaatsen
          </button>
        </div>
      </div>

      {/* Copy Post Button */}
      <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between">
        <span className="text-[11px] text-neutral-600 uppercase tracking-wider">
          Stijl: <strong className="text-black">{activeCaption.styleName}</strong>
        </span>

        <button
          type="button"
          onClick={handleCopyPost}
          className="editorial-btn px-3.5 py-2 flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Gekopieerd!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Kopieer hele post</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
