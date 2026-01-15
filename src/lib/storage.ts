import sharp from 'sharp';
import crypto from 'crypto';
import { put, del } from '@vercel/blob';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error('Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.');
  }

  if (file.length > MAX_FILE_SIZE) {
    throw new Error('Fichier trop volumineux (max 10MB)');
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
