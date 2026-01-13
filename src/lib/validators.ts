import { z } from 'zod';

// Auth validators
export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  username: z
    .string()
    .min(3, 'Le pseudo doit contenir au moins 3 caractères')
    .max(20, 'Le pseudo ne doit pas dépasser 20 caractères')
    .regex(/^[a-zA-Z0-9_]+$/, 'Le pseudo ne peut contenir que des lettres, chiffres et underscores'),
  dateOfBirth: z.string().refine(
    (date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      return actualAge >= 18;
    },
    { message: 'Vous devez avoir au moins 18 ans' }
  ),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

// Photo validators
export const photoUploadSchema = z.object({
  category: z.enum(['REPOS', 'ERECTION']),
  declaredLength: z.number().min(1).max(50).optional(),
  declaredGirth: z.number().min(1).max(30).optional(),
});

export const verificationRequestSchema = z.object({
  photoId: z.string(),
});

// Vote validator
export const voteSchema = z.object({
  leftPhotoId: z.string(),
  rightPhotoId: z.string(),
  result: z.enum(['LEFT_WINS', 'RIGHT_WINS', 'DRAW']),
});

// Report validator
export const reportSchema = z.object({
  photoId: z.string().optional(),
  reportedUserId: z.string().optional(),
  reason: z.enum([
    'FAKE_PHOTO',
    'UNDERAGE_SUSPECTED',
    'FACE_VISIBLE',
    'INAPPROPRIATE_CONTENT',
    'HARASSMENT',
    'SPAM',
    'OTHER',
  ]),
  description: z.string().max(500).optional(),
});

// Admin validators
export const moderationSchema = z.object({
  photoId: z.string(),
  action: z.enum(['APPROVE', 'REJECT']),
  note: z.string().max(500).optional(),
  rejectionReason: z.string().max(500).optional(),
});

export const verificationSchema = z.object({
  photoId: z.string(),
  action: z.enum(['APPROVE', 'REJECT']),
  note: z.string().max(500).optional(),
});

export const banUserSchema = z.object({
  userId: z.string(),
  action: z.enum(['BAN', 'UNBAN']),
  reason: z.string().max(500).optional(),
});

// Profile validators
export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Le pseudo doit contenir au moins 3 caractères')
    .max(20, 'Le pseudo ne doit pas dépasser 20 caractères')
    .regex(/^[a-zA-Z0-9_]+$/, 'Le pseudo ne peut contenir que des lettres, chiffres et underscores')
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
});

// Types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PhotoUploadInput = z.infer<typeof photoUploadSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type ModerationInput = z.infer<typeof moderationSchema>;
export type VerificationInput = z.infer<typeof verificationSchema>;
export type BanUserInput = z.infer<typeof banUserSchema>;
