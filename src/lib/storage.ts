import sharp from 'sharp';
import crypto from 'crypto';
import { put, del } from '@vercel/blob';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Magic bytes signatures for image file types
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [
    [0xff, 0xd8, 0xff], // JPEG/JFIF
  ],
  'image/png': [
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF header (WebP starts with RIFF)
  ],
};

/**
 * Verify that file content matches the declared MIME type by checking magic bytes
 * This prevents attackers from uploading malicious files with fake extensions
 */
function verifyFileMagicBytes(buffer: Buffer, declaredMimeType: string): boolean {
  const signatures = FILE_SIGNATURES[declaredMimeType];
  if (!signatures) {
    return false;
  }

  for (const signature of signatures) {
    if (buffer.length < signature.length) {
      continue;
    }

    let matches = true;
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      // Additional check for WebP: verify 'WEBP' at offset 8
      if (declaredMimeType === 'image/webp') {
        if (buffer.length >= 12) {
          const webpMarker = buffer.slice(8, 12).toString('ascii');
          return webpMarker === 'WEBP';
        }
        return false;
      }
      return true;
    }
  }

  return false;
}

/**
 * Detect actual file type from magic bytes
 */
function detectFileType(buffer: Buffer): string | null {
  for (const [mimeType, signatures] of Object.entries(FILE_SIGNATURES)) {
    for (const signature of signatures) {
      if (buffer.length < signature.length) {
        continue;
      }

      let matches = true;
      for (let i = 0; i < signature.length; i++) {
        if (buffer[i] !== signature[i]) {
          matches = false;
          break;
        }
      }

      if (matches) {
        // Additional check for WebP
        if (mimeType === 'image/webp' && buffer.length >= 12) {
          const webpMarker = buffer.slice(8, 12).toString('ascii');
          if (webpMarker !== 'WEBP') {
            continue;
          }
        }
        return mimeType;
      }
    }
  }

  return null;
}

export async function uploadImage(
  file: Buffer,
  mimeType: string,
  userId: string,
  category: 'photo' | 'verification'
): Promise<{
  imageUrl: string;
  imageKey: string;
  thumbnailUrl: string;
  thumbnailKey: string;
}> {
  // Check declared MIME type
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error('Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.');
  }

  // Check file size
  if (file.length > MAX_FILE_SIZE) {
    throw new Error('Fichier trop volumineux (max 10MB)');
  }

  // SECURITY: Verify file content matches declared MIME type using magic bytes
  const detectedType = detectFileType(file);
  if (!detectedType) {
    throw new Error('Format de fichier non reconnu. Le fichier semble corrompu.');
  }

  if (!verifyFileMagicBytes(file, mimeType)) {
    console.error(
      `[Storage] File type mismatch: declared ${mimeType}, detected ${detectedType}`
    );
    throw new Error(
      'Le contenu du fichier ne correspond pas au type déclaré. Veuillez utiliser un fichier image valide.'
    );
  }

  const uniqueId = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  const baseKey = `${category}/${userId}/${timestamp}-${uniqueId}`;

  console.log('[Storage] Processing images...');

  // Process main image
  const processedImage = await sharp(file)
    .resize(1200, 1600, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  // Create thumbnail
  const thumbnail = await sharp(file)
    .resize(300, 400, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 70 })
    .toBuffer();

  const imageKey = `${baseKey}.jpg`;
  const thumbnailKey = `${baseKey}-thumb.jpg`;

  console.log('[Storage] Uploading to Vercel Blob...');

  // Upload to Vercel Blob
  const imageBlob = await put(imageKey, processedImage, {
    access: 'public',
    contentType: 'image/jpeg',
  });

  const thumbnailBlob = await put(thumbnailKey, thumbnail, {
    access: 'public',
    contentType: 'image/jpeg',
  });

  console.log('[Storage] Upload successful');

  return {
    imageUrl: imageBlob.url,
    imageKey,
    thumbnailUrl: thumbnailBlob.url,
    thumbnailKey,
  };
}

export async function deleteImage(imageKey: string, thumbnailKey?: string): Promise<void> {
  try {
    await del(imageKey);
    if (thumbnailKey) {
      await del(thumbnailKey);
    }
  } catch (error) {
    console.error('Error deleting from Vercel Blob:', error);
  }
}
