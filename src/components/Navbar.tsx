import React from 'react';
import { Bookmark, Plus, Camera, LogIn, LogOut } from 'lucide-react';

interface NavbarProps {
  savedCount: number;
  onOpenSaved: () => void;
  onReset: () => void;
  hasActiveImage: boolean;
  onSelectCategory?: (category: string) => void;
  userEmail: string | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  savedCount,
  onOpenSaved,
  onReset,
  hasActiveImage,
  onSelectCategory,
  userEmail,
  onLogin,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Zone 1: Distinctive all-caps logo wordmark from roosjploeg.com */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="text-left group cursor-pointer"
          >
            <h1 className="text-xl sm:text-2xl font-bold tracking-[0.2em] text-black group-hover:opacity-75 transition-opacity editorial-logo">
              ROOSJPLOEG
            </h1>
            <div className="text-[10px] tracking-[0.25em] text-neutral-600 uppercase font-medium">
              Photography &amp; Caption Studio
            </div>
          </button>
        </div>

        {/* Zone 2: Editorial Navigation Menu directly modeled after roosjploeg.com */}
        <nav className="hidden lg:flex items-center gap-7">
          <a
            href="#upload-section"
            className="editorial-nav-link active"
          >
            Studio
          </a>
          <button
            type="button"
            onClick={() => onSelectCategory?.('sample-concert')}
            className="editorial-nav-link cursor-pointer"
          >
            Concerts &amp; Festivals
          </button>
          <button
            type="button"
            onClick={() => onSelectCategory?.('sample-nightlife')}
            className="editorial-nav-link cursor-pointer"
          >
            Nightlife &amp; Party
          </button>
          <button
            type="button"
            onClick={() => onSelectCategory?.('sample-portrait')}
            className="editorial-nav-link cursor-pointer"
          >
            Portraits
          </button>
          <a
            href="#hoe-het-werkt"
            className="editorial-nav-link"
          >
            Method
          </a>
          <a
            href="#faq"
            className="editorial-nav-link"
          >
            FAQ
          </a>
        </nav>

        {/* Zone 3: Clean monochrome actions */}
        <div className="flex items-center gap-3">
          {userEmail ? (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-600 hover:text-black transition-colors tracking-wider uppercase"
              title={`Ingelogd als ${userEmail}. Klik om uit te loggen.`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Uitloggen</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onLogin}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-600 hover:text-black transition-colors tracking-wider uppercase"
              title="Inloggen"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Inloggen</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenSaved}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-black bg-neutral-100 hover:bg-neutral-200 rounded-none transition-colors tracking-wider uppercase"
            title="Opgeslagen captions"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Saved</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-black text-white text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>

          {hasActiveImage && (
            <button
              type="button"
              onClick={onReset}
              className="editorial-btn px-4 py-2 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nieuwe foto</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
