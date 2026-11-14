import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Upload, ArrowUpRight } from 'lucide-react';
import { SAMPLE_PHOTOS } from '../data/samplePhotos';
import { SamplePhoto } from '../types';

interface UploadSectionProps {
  imagePreview: string | null;
  fileName: string | null;
  fileSize: number | null;
  onImageSelected: (base64: string, mimeType: string, name: string, size?: number) => void;
  onClearImage: () => void;
  onSelectSample: (sample: SamplePhoto) => void;
  isProcessing: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  imagePreview,
  fileName,
  fileSize,
  onImageSelected,
  onClearImage,
  onSelectSample,
  isProcessing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const handleFileProcess = (file: File) => {
    setErrorMsg(null);
    if (!supportedTypes.includes(file.type)) {
      setErrorMsg('Ondersteunde formaten: JPG, JPEG, PNG of WEBP.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Bestand is groter dan 20 MB. Kies een kleinere foto.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onImageSelected(base64, file.type, file.name, file.size);
    };
    reader.onerror = () => {
      setErrorMsg('Er is een fout opgetreden bij het inladen.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          handleFileProcess(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div id="upload-section" className="w-full">
      {/* Upload Box / Preview Frame */}
      {!imagePreview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-neutral-300 p-8 sm:p-14 text-center cursor-pointer transition-all duration-200 group bg-white ${
            isDragging
              ? 'border-black bg-neutral-50 shadow-sm'
              : 'hover:border-black hover:bg-neutral-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileInputChange}
          />

          <div className="flex flex-col items-center max-w-lg mx-auto">
            {/* Minimalist icon frame */}
            <div className="w-14 h-14 rounded-full border border-neutral-200 flex items-center justify-center text-black mb-5 group-hover:scale-105 transition-transform duration-200">
              <Camera className="w-6 h-6 stroke-[1.5]" />
            </div>

            {/* Main title from prompt */}
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black mb-2 uppercase tracking-[0.06em]">
              Upload je Instagram-foto
            </h2>

            {/* Subtitle from prompt */}
            <p className="text-sm text-neutral-600 mb-6 font-normal">
              Upload een foto en laat AI passende Instagram-captions bedenken.
            </p>

            {/* Clean editorial button */}
            <button
              type="button"
              className="editorial-btn py-3 px-7 cursor-pointer"
            >
              Selecteer foto vanaf computer
            </button>

            {/* Formats info */}
            <div className="text-[11px] text-neutral-600 mt-5 flex items-center justify-center gap-2 flex-wrap uppercase tracking-wider font-medium">
              <span>Sleep hierheen of plak (Ctrl+V)</span>
              <span aria-hidden="true">·</span>
              <span className="text-black font-semibold">JPG, JPEG, PNG, WEBP</span>
              <span aria-hidden="true">·</span>
              <span>Tot 20MB</span>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-neutral-100 text-black text-xs border border-neutral-300">
                {errorMsg}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Editorial Preview Frame */
        <div className="bg-white border border-neutral-200 p-6 transition-all">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-black">
                Geselecteerde Foto
              </span>
              {fileName && (
                <span className="text-xs text-neutral-600 truncate max-w-[200px] sm:max-w-xs">
                  {fileName} {fileSize ? `· ${formatFileSize(fileSize)}` : ''}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="text-xs font-medium text-black hover:bg-neutral-100 px-3 py-1.5 border border-neutral-200 transition-colors flex items-center gap-1.5 uppercase tracking-wider"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Wisselen</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileInputChange}
              />
              <button
                type="button"
                onClick={onClearImage}
                disabled={isProcessing}
                className="text-xs font-medium text-neutral-500 hover:text-black hover:bg-neutral-100 px-2 py-1.5 transition-colors"
                title="Wissen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Clean high-contrast photo container */}
          <div className="relative bg-neutral-950 flex items-center justify-center max-h-[460px] aspect-auto sm:aspect-square sm:max-h-[420px] mx-auto overflow-hidden">
            <img
              src={imagePreview}
              alt="Geselecteerde Instagram foto"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* Photography Portfolio Gallery Presets (Inspired by roosjploeg.com categories) */}
      {!imagePreview && (
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold text-black uppercase tracking-[0.15em]">
              Of selecteer uit het portfolio om direct te testen:
            </span>
            <span className="text-[11px] text-neutral-600 hidden sm:inline">
              Klik om in te laden
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {SAMPLE_PHOTOS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSelectSample(sample)}
                className="group text-left border border-neutral-200 hover:border-black p-2 transition-all bg-white flex flex-col justify-between"
              >
                <div className="aspect-square w-full overflow-hidden bg-neutral-100 mb-2">
                  <img
                    src={sample.imagePath}
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <div className="text-[11px] font-bold tracking-tight text-black group-hover:underline truncate uppercase">
                    {sample.title}
                  </div>
                  <div className="text-[10px] text-neutral-600 line-clamp-1 mt-0.5">
                    {sample.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
