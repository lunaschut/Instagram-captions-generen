/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  Share2,
  SlidersHorizontal,
  ArrowDown,
  Camera
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { UploadSection } from './components/UploadSection';
import { ContextAndSettings } from './components/ContextAndSettings';
import { AnalysisCard } from './components/AnalysisCard';
import { CaptionCard } from './components/CaptionCard';
import { InstagramMockup } from './components/InstagramMockup';
import { RefineModal } from './components/RefineModal';
import { SavedCaptionsModal } from './components/SavedCaptionsModal';
import { HowItWorksSection, FaqSection, Footer } from './components/InfoSections';
import {
  PhotoAnalysis,
  CaptionOption,
  GenerationSettings,
  SavedCaption,
  SamplePhoto,
  PlatformCaptionsGroup
} from './types';
import { urlToBase64 } from './utils/imageUtils';
import { SAMPLE_PHOTOS } from './data/samplePhotos';

export default function App() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);

  const [extraContext, setExtraContext] = useState<string>('');
  const [settings, setSettings] = useState<GenerationSettings>({
    platforms: ['instagram'],
    targetAudience: 'auto',
    language: 'nl',
    vibePreference: 'gevarieerd',
    emojiPreference: 'subtle',
    hashtagCount: '3-5',
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null);
  const [captions, setCaptions] = useState<CaptionOption[]>([]);
  const [platformGroups, setPlatformGroups] = useState<PlatformCaptionsGroup[]>([]);
  const [activePlatformFilter, setActivePlatformFilter] = useState<string>('all');
  const [selectedMockupIndex, setSelectedMockupIndex] = useState<number>(0);

  // Saved captions from localStorage
  const [savedCaptions, setSavedCaptions] = useState<SavedCaption[]>(() => {
    try {
      const stored = localStorage.getItem('instacaptions_saved');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);
  const [refiningCaption, setRefiningCaption] = useState<CaptionOption | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('instacaptions_saved', JSON.stringify(savedCaptions));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [savedCaptions]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleImageSelected = (
    base64: string,
    type: string,
    name: string,
    size?: number
  ) => {
    setImagePreview(base64);
    setImageBase64(base64);
    setMimeType(type || 'image/jpeg');
    setFileName(name);
    setFileSize(size || null);
    setErrorMsg(null);
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setFileName(null);
    setFileSize(null);
    setAnalysis(null);
    setCaptions([]);
    setPlatformGroups([]);
    setErrorMsg(null);
  };

  const handleSelectSample = async (sample: SamplePhoto) => {
    setErrorMsg(null);
    try {
      const { base64, mimeType: detectedType } = await urlToBase64(sample.imagePath);
      setImagePreview(base64);
      setImageBase64(base64);
      setMimeType(detectedType);
      setFileName(`${sample.title}.jpg`);
      setFileSize(null);
      setExtraContext(sample.contextHint);
      if (sample.suggestedAudience) {
        setSettings((prev) => ({ ...prev, targetAudience: sample.suggestedAudience || 'auto' }));
      }
      setAnalysis(null);
      setCaptions([]);
      setPlatformGroups([]);
      showToast(`Geselecteerd uit portfolio: "${sample.title}"`);
    } catch (err) {
      console.error('Failed to load sample image', err);
      setErrorMsg('Kon de foto niet inladen.');
    }
  };

  const handleSelectCategory = (sampleId: string) => {
    const found = SAMPLE_PHOTOS.find((s) => s.id === sampleId);
    if (found) {
      handleSelectSample(found);
      const el = document.getElementById('upload-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleGenerateCaptions = async () => {
    if (!imageBase64) {
      setErrorMsg('Upload eerst een foto om te analyseren.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/generate-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          extraContext,
          platforms: settings.platforms,
          targetAudience: settings.targetAudience,
          customAudience: settings.customAudience,
          language: settings.language,
          vibePreference: settings.vibePreference,
          emojiPreference: settings.emojiPreference,
          hashtagCount: settings.hashtagCount,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        let message = errData.error || 'Er is een fout opgetreden bij het genereren.';
        if (typeof message === 'string' && (message.includes('503') || message.includes('UNAVAILABLE') || message.includes('high demand'))) {
          message = 'Het AI-model ondervindt momenteel een tijdelijke piek in belasting. Probeer het over enkele seconden nogmaals.';
        }
        throw new Error(message);
      }

      const data = await res.json();
      setAnalysis(data.analysis);

      const groups: PlatformCaptionsGroup[] = data.platformGroups || [];
      setPlatformGroups(groups);

      // Collect all captions
      let allCaps: CaptionOption[] = [];
      if (groups.length > 0) {
        groups.forEach((g) => {
          allCaps.push(...g.captions);
        });
      } else {
        allCaps = data.captions || [];
      }
      setCaptions(allCaps);
      setSelectedMockupIndex(0);
      setActivePlatformFilter('all');

      const count = allCaps.length;
      const platCount = groups.length || settings.platforms.length;
      showToast(`${count} captions succesvol gegenereerd voor ${platCount} platform(en)!`);

      setTimeout(() => {
        const el = document.getElementById('results-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Kon geen captions genereren. Controleer je invoer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateCaptionText = (id: string, newText: string) => {
    setCaptions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, captionBody: newText } : c))
    );
    setPlatformGroups((prev) =>
      prev.map((group) => ({
        ...group,
        captions: group.captions.map((c) => (c.id === id ? { ...c, captionBody: newText } : c)),
      }))
    );
    showToast('Caption bijgewerkt!');
  };

  const handleSaveCaption = (caption: CaptionOption) => {
    const isAlreadySaved = savedCaptions.some((s) => s.id === caption.id);
    if (isAlreadySaved) {
      setSavedCaptions((prev) => prev.filter((s) => s.id !== caption.id));
      showToast('Caption verwijderd uit favorieten.');
    } else {
      const newSaved: SavedCaption = {
        id: caption.id,
        imageUrl: imagePreview || '',
        caption: caption.captionBody,
        hashtags: caption.hashtags,
        location: caption.suggestedLocation,
        styleName: caption.styleName,
        timestamp: Date.now(),
      };
      setSavedCaptions((prev) => [newSaved, ...prev]);
      showToast('Caption bewaard in favorieten!');
    }
  };

  const handleDeleteSaved = (id: string) => {
    setSavedCaptions((prev) => prev.filter((s) => s.id !== id));
    showToast('Item verwijderd.');
  };

  const handleApplyRefined = (newCaptionText: string) => {
    if (!refiningCaption) return;
    handleUpdateCaptionText(refiningCaption.id, newCaptionText);
    setRefiningCaption(null);
    showToast('Aangepaste caption toegepast!');
  };

  const activeCaption = captions[selectedMockupIndex] || null;

  return (
    <div className="min-h-screen bg-white flex flex-col text-black font-sans selection:bg-black selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white text-xs font-semibold px-4 py-3 shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200 uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar in roosjploeg.com styling */}
      <Navbar
        savedCount={savedCaptions.length}
        onOpenSaved={() => setIsSavedModalOpen(true)}
        onReset={handleClearImage}
        hasActiveImage={!!imagePreview}
        onSelectCategory={handleSelectCategory}
      />

      {/* Editorial Hero Header */}
      <section className="pt-12 pb-8 px-4 sm:px-8 max-w-7xl mx-auto text-left w-full border-b border-neutral-100">
        <div className="max-w-4xl">
          <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.25em] mb-3">
            ROOSJPLOEG STUDIO // AI VISUAL CAPTIONS
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-black mb-4 uppercase tracking-[0.04em] leading-[1.1]">
            Automatische Instagram Captions &amp; Visual Storytelling
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed font-normal">
            Upload een foto en laat multimodale AI de compositie, belichting, sfeer en context ontleden.
            Ontvang direct 3 redactionele caption-opties en gerichte hashtags.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full space-y-10">
        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 bg-neutral-100 border border-black text-black text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-black" />
              <div className="flex-1">
                <strong className="font-bold uppercase tracking-wider">Melding: </strong>
                <span>{errorMsg}</span>
              </div>
            </div>
            {imageBase64 && (
              <button
                type="button"
                onClick={handleGenerateCaptions}
                disabled={isProcessing}
                className="editorial-btn px-3 py-1.5 text-[11px] shrink-0 uppercase tracking-wider"
              >
                Opnieuw proberen
              </button>
            )}
          </div>
        )}

        {/* Workflow Grid: Upload & Context on Left, Live Mockup on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (Upload & Context) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Upload Section */}
            <UploadSection
              imagePreview={imagePreview}
              fileName={fileName}
              fileSize={fileSize}
              onImageSelected={handleImageSelected}
              onClearImage={handleClearImage}
              onSelectSample={handleSelectSample}
              isProcessing={isProcessing}
            />

            {/* 2. Extra Context & Preferences */}
            <ContextAndSettings
              extraContext={extraContext}
              onChangeExtraContext={setExtraContext}
              settings={settings}
              onChangeSettings={setSettings}
              onSubmit={handleGenerateCaptions}
              isProcessing={isProcessing}
              hasImage={!!imageBase64}
            />
          </div>

          {/* Right Column (Live Instagram Feed Mockup) */}
          <div className="lg:col-span-5 sticky top-24">
            <InstagramMockup
              imageSrc={imagePreview}
              activeCaption={activeCaption}
              onSelectOptionIndex={(idx) => setSelectedMockupIndex(idx)}
              allOptions={captions}
              currentIndex={selectedMockupIndex}
            />
          </div>
        </div>

        {/* Results Section (Appears after AI analysis) */}
        {captions.length > 0 && (
          <section id="results-section" className="pt-12 border-t border-neutral-200 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.2em] block mb-1">
                  AI Resultaten &amp; Opties
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-black uppercase tracking-[0.06em]">
                  Gecureerde Captions per Platform
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  {captions.length} captions afgestemd op {platformGroups.length > 0 ? platformGroups.length : settings.platforms.length} platform(en) en de gekozen doelgroep.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateCaptions}
                disabled={isProcessing}
                className="editorial-btn px-4 py-2.5 flex items-center gap-2 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Nieuwe varianten</span>
              </button>
            </div>

            {/* Visual Analysis Breakdown Card */}
            {analysis && <AnalysisCard analysis={analysis} />}

            {/* Platform Tabs Filter (If multiple platforms generated) */}
            {platformGroups.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 border-b border-neutral-200 custom-scrollbar">
                <button
                  type="button"
                  onClick={() => setActivePlatformFilter('all')}
                  className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border ${
                    activePlatformFilter === 'all'
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-white text-neutral-600 border-neutral-300 hover:border-black hover:text-black'
                  }`}
                >
                  Alle platformen ({captions.length})
                </button>
                {platformGroups.map((group) => {
                  const isActive = activePlatformFilter === group.platform;
                  return (
                    <button
                      key={group.platform}
                      type="button"
                      onClick={() => setActivePlatformFilter(group.platform)}
                      className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-black text-white border-black shadow-xs'
                          : 'bg-white text-neutral-600 border-neutral-300 hover:border-black hover:text-black'
                      }`}
                    >
                      <span>{group.platformName}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 ${isActive ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-700'}`}>
                        {group.captions.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Grouped Captions Display */}
            {platformGroups.length > 0 ? (
              <div className="space-y-12">
                {platformGroups
                  .filter((group) => activePlatformFilter === 'all' || activePlatformFilter === group.platform)
                  .map((group) => (
                    <div key={group.platform} className="space-y-4">
                      {/* Platform Subheader */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-200">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 bg-black text-white font-mono">
                            {group.platform.toUpperCase()}
                          </span>
                          <h3 className="text-base font-bold text-black uppercase tracking-wider">
                            {group.platformName} Captions
                          </h3>
                        </div>
                        {group.description && (
                          <span className="text-[11px] text-neutral-500 italic mt-1 sm:mt-0">
                            {group.description}
                          </span>
                        )}
                      </div>

                      {/* 3 Captions Grid for this platform */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {group.captions.map((caption, index) => {
                          const globalIdx = captions.findIndex((c) => c.id === caption.id);
                          const isSelected = selectedMockupIndex === (globalIdx !== -1 ? globalIdx : index);
                          return (
                            <CaptionCard
                              key={caption.id}
                              caption={caption}
                              index={index}
                              isSelectedForMockup={isSelected}
                              onSelectForMockup={() => setSelectedMockupIndex(globalIdx !== -1 ? globalIdx : index)}
                              onRefine={(cap) => setRefiningCaption(cap)}
                              onSave={handleSaveCaption}
                              isSaved={savedCaptions.some((s) => s.id === caption.id)}
                              onUpdateCaptionText={handleUpdateCaptionText}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              /* Fallback single grid if platformGroups not returned */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {captions.map((caption, index) => (
                  <CaptionCard
                    key={caption.id}
                    caption={caption}
                    index={index}
                    isSelectedForMockup={selectedMockupIndex === index}
                    onSelectForMockup={() => setSelectedMockupIndex(index)}
                    onRefine={(cap) => setRefiningCaption(cap)}
                    onSave={handleSaveCaption}
                    isSaved={savedCaptions.some((s) => s.id === caption.id)}
                    onUpdateCaptionText={handleUpdateCaptionText}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* How It Works & FAQ sections in editorial style */}
        <HowItWorksSection />
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Refine Caption Modal */}
      <RefineModal
        isOpen={!!refiningCaption}
        onClose={() => setRefiningCaption(null)}
        caption={refiningCaption}
        onApplyRefined={handleApplyRefined}
        extraContext={extraContext}
        language={settings.language}
      />

      {/* Saved Captions Modal */}
      <SavedCaptionsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedCaptions={savedCaptions}
        onDelete={handleDeleteSaved}
        onSelectToView={() => {
          setIsSavedModalOpen(false);
        }}
      />
    </div>
  );
}
