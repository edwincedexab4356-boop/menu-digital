import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase.js';

/**
 * Optimizes and compresses an image in the browser using HTML5 Canvas.
 * Produces a lightweight, crisp web JPEG (< 250KB) that renders instantly
 * on mobile and desktop devices without bogging down the network or Firestore.
 */
export async function compressImageClientSide(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'));
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) {
        reject(new Error('Archivo de imagen vacío o dañado.'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('El archivo seleccionado no es un formato de imagen legible.'));
      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          // Downscale proportionally if larger than constraints
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to original read if canvas 2D context fails
            resolve(src);
            return;
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Get optimized base64 string
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          console.warn('Canvas compression error, using raw image:', err);
          resolve(src);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads or processes a product photo:
 * 1. Immediately compresses the image locally in milliseconds so preview is instant.
 * 2. If Firebase Storage is available and responds within 4 seconds, uploads and returns public storage URL.
 * 3. If Firebase Storage rules block write or the bucket isn't enabled in the Firebase project console,
 *    it gracefully uses the optimized Base64 image so the user is NEVER blocked from saving their dish!
 */
export async function uploadProductImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; source: 'storage' | 'base64' }> {
  // 1. Immediately compress client-side
  if (onProgress) onProgress(30);
  const compressedBase64 = await compressImageClientSide(file);
  if (onProgress) onProgress(60);

  // 2. Try Firebase Storage with a strict 4-second timeout to avoid getting stuck
  if (storage) {
    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase();
      const storagePath = `productos/${timestamp}_${safeName}`;
      const storageRef = ref(storage, storagePath);

      const uploadPromise = new Promise<{ url: string; source: 'storage' }>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
          'state_changed',
          (snap) => {
            if (onProgress && snap.totalBytes > 0) {
              const p = 60 + Math.round((snap.bytesTransferred / snap.totalBytes) * 35);
              onProgress(Math.min(p, 95));
            }
          },
          (err) => {
            console.warn('Firebase Storage upload declined (rules/bucket permissions), using compressed base64:', err);
            reject(err);
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              if (onProgress) onProgress(100);
              resolve({ url: downloadUrl, source: 'storage' });
            } catch (err) {
              reject(err);
            }
          }
        );
      });

      // 4-second timeout: If Storage hangs or rules reject, don't leave user hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Storage timeout')), 4000);
      });

      const result = await Promise.race([uploadPromise, timeoutPromise]);
      return result;
    } catch (err) {
      console.info('Storage fallback activated: saving dish photo with optimized compressed image.');
    }
  }

  // 3. Guaranteed immediate fallback
  if (onProgress) onProgress(100);
  return { url: compressedBase64, source: 'base64' };
}
