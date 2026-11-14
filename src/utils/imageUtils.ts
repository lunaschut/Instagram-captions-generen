/**
 * Utility functions for image processing
 */

function resizeImage(dataUrl: string, maxDimension = 1280, quality = 0.88): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Only resize if larger than maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({ base64: resizedDataUrl, mimeType: 'image/jpeg' });
          return;
        }
      }

      // If already within bounds, keep original
      resolve({ base64: dataUrl, mimeType: 'image/jpeg' });
    };
    img.onerror = () => {
      resolve({ base64: dataUrl, mimeType: 'image/jpeg' });
    };
    img.src = dataUrl;
  });
}

export async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const result = reader.result as string;
      const optimized = await resizeImage(result, 1280, 0.88);
      resolve(optimized);
    };
    reader.onerror = (error) => reject(error);
  });
}

export async function urlToBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = async () => {
      const result = reader.result as string;
      const optimized = await resizeImage(result, 1280, 0.88);
      resolve(optimized);
    };
    reader.onerror = (error) => reject(error);
  });
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => fallbackCopy(text)
    );
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text: string): boolean {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    textArea.remove();
    return successful;
  } catch (err) {
    console.error('Fallback copy failed', err);
    return false;
  }
}
