import sharp from 'sharp';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Check if we're in development mode without S3 configured
const useLocalStorage = !process.env.S3_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID === '';

// S3 imports (only used if configured)
let s3Client: any = null;
let PutObjectCommand: any = null;
let DeleteObjectCommand: any = null;
let GetObjectCommand: any = null;
let getSignedUrl: any = null;

if (!useLocalStorage) {
  const { S3Client, PutObjectCommand: POC, DeleteObjectCommand: DOC, GetObjectCommand: GOC } = require('@aws-sdk/client-s3');
  const { getSignedUrl: gsu } = require('@aws-sdk/s3-request-presigner');

  PutObjectCommand = POC;
  DeleteObjectCommand = DOC;
  GetObjectCommand = GOC;
  getSignedUrl = gsu;

  s3Client = new S3Client({
    region: process.env.S3_REGION || 'auto',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    endpoint: process.env.S3_ENDPOINT,
  });
}

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'local';

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

  if (useLocalStorage) {
    // Local storage for development
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', category, userId);
    await fs.mkdir(uploadDir, { recursive: true });

    const imagePath = path.join(uploadDir, `${timestamp}-${uniqueId}.jpg`);
    const thumbPath = path.join(uploadDir, `${timestamp}-${uniqueId}-thumb.jpg`);

    await fs.writeFile(imagePath, processedImage);
    await fs.writeFile(thumbPath, thumbnail);

    const imageUrl = `/uploads/${category}/${userId}/${timestamp}-${uniqueId}.jpg`;
    const thumbnailUrl = `/uploads/${category}/${userId}/${timestamp}-${uniqueId}-thumb.jpg`;

    return { imageUrl, imageKey: imagePath, thumbnailUrl, thumbnailKey: thumbPath };
  } else {
    // S3 storage for production
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: imageKey,
        Body: processedImage,
        ContentType: 'image/jpeg',
      })
    );

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: thumbnailKey,
        Body: thumbnail,
        ContentType: 'image/jpeg',
      })
    );

    const cdnUrl = process.env.CDN_URL || `https://${BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com`;
    const imageUrl = `${cdnUrl}/${imageKey}`;
    const thumbnailUrl = `${cdnUrl}/${thumbnailKey}`;

    return { imageUrl, imageKey, thumbnailUrl, thumbnailKey };
  }
}

export async function deleteImage(imageKey: string, thumbnailKey?: string): Promise<void> {
  if (useLocalStorage) {
    // Local storage
    try {
      await fs.unlink(imageKey);
      if (thumbnailKey) {
        await fs.unlink(thumbnailKey);
      }
    } catch (error) {
      console.error('Error deleting local file:', error);
    }
  } else {
    // S3 storage
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: imageKey,
      })
    );

    if (thumbnailKey) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: thumbnailKey,
        })
      );
    }
  }
}

export async function getSignedUploadUrl(
  userId: string,
  category: 'photo' | 'verification',
  contentType: string
): Promise<{ uploadUrl: string; key: string }> {
  if (useLocalStorage) {
    throw new Error('Signed URLs not supported in local mode');
  }

  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new Error('Type de fichier non autorisé');
  }

  const uniqueId = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  const extension = contentType.split('/')[1];
  const key = `${category}/${userId}/${timestamp}-${uniqueId}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return { uploadUrl, key };
}

export async function getSignedDownloadUrl(key: string): Promise<string> {
  if (useLocalStorage) {
    // Return local path
    return key;
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
