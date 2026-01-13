'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import {
  Upload,
  X,
  Camera,
  CheckCircle,
  AlertTriangle,
  Info,
  Ruler,
} from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface PhotoSlots {
  used: number;
  total: number;
  available: number;
}

export default function UploadPage() {
  const t = useTranslations('upload');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { addToast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState<'REPOS' | 'ERECTION'>('REPOS');
  const [declaredLength, setDeclaredLength] = useState('');
  const [acceptedRules, setAcceptedRules] = useState(false);

  // Fetch photo slots
  const { data: slotsData, isLoading: slotsLoading } = useQuery<{ data: PhotoSlots }>({
    queryKey: ['photoSlots'],
    queryFn: async () => {
      const res = await fetch('/api/user/photo-slots');
      return res.json();
    },
  });

  const slots = slotsData?.data;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        addToast({ type: 'error', title: t('fileTooLarge'), message: t('maxSize') });
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  }, [addToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error(t('noFileSelected'));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      if (declaredLength) {
        formData.append('declaredLength', declaredLength);
      }

      const res = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      return res.json();
    },
    onSuccess: () => {
      addToast({
        type: 'success',
        title: t('success'),
        message: t('pendingModeration'),
      });
      router.push('/profile/photos');
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: tCommon('error'), message: error.message });
    },
  });

  const handleSubmit = () => {
    if (!file) {
      addToast({ type: 'error', title: tCommon('error'), message: t('selectPhoto') });
      return;
    }
    if (!acceptedRules) {
      addToast({ type: 'error', title: tCommon('error'), message: t('mustAcceptRules') });
      return;
    }
    uploadMutation.mutate();
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  if (slotsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Slots info */}
        {slots && (
          <Card variant="bordered" className="p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-purple-400" />
                <span>{t('photoSlots')}</span>
              </div>
              <div className="text-right">
                <span className="font-bold">{slots.used}</span>
                <span className="text-gray-400">/{slots.total} {t('used')}</span>
                {slots.available === 0 && (
                  <Badge variant="danger" className="ml-2">{t('full')}</Badge>
                )}
              </div>
            </div>
            {slots.available === 0 && (
              <p className="text-sm text-red-400 mt-2">
                {t('limitReachedInfo')}
              </p>
            )}
          </Card>
        )}

        {slots && slots.available > 0 ? (
          <>
            {/* Upload zone */}
            <Card variant="bordered" className="mb-6 overflow-hidden">
              {!preview ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    'p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                    isDragActive
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-600 hover:border-gray-500'
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">
                      {isDragActive ? t('dropHere') : t('dropzone')}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t('requirements')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={preview}
                      alt={t('preview')}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={clearFile}
                    className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </Card>

            {/* Category selection */}
            <Card variant="bordered" className="p-6 mb-6">
              <h3 className="font-bold mb-4">{t('category')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setCategory('REPOS')}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all',
                    category === 'REPOS'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  )}
                >
                  <div className="text-lg font-bold mb-1">{t('flaccid')}</div>
                  <div className="text-sm text-gray-400">{t('flaccidDesc')}</div>
                </button>
                <button
                  onClick={() => setCategory('ERECTION')}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all',
                    category === 'ERECTION'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  )}
                >
                  <div className="text-lg font-bold mb-1">{t('erect')}</div>
                  <div className="text-sm text-gray-400">{t('erectDesc')}</div>
                </button>
              </div>
            </Card>

            {/* Declared length */}
            <Card variant="bordered" className="p-6 mb-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                {t('declaredLength')} ({t('optional')})
              </h3>
              <Input
                type="number"
                value={declaredLength}
                onChange={(e) => setDeclaredLength(e.target.value)}
                placeholder={t('lengthPlaceholder')}
                rightElement={<span className="text-gray-400">cm</span>}
                helperText={t('verificationLater')}
              />
            </Card>

            {/* Rules */}
            <Card variant="bordered" className="p-6 mb-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                {t('rulesToFollow')}
              </h3>
              <ul className="space-y-2 text-sm text-gray-400 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {t('rule1')}
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {t('rule2')}
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {t('rule3')}
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {t('rule4')}
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  {t('ruleWarning')}
                </li>
              </ul>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedRules}
                  onChange={(e) => setAcceptedRules(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm">
                  {t('acceptRulesLabel')}
                </span>
              </label>
            </Card>

            {/* Submit */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              isLoading={uploadMutation.isPending}
              disabled={!file || !acceptedRules}
              leftIcon={<Upload className="w-5 h-5" />}
            >
              {t('submit')}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              {t('moderationInfo')}
            </p>
          </>
        ) : (
          <Card variant="bordered" className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{t('limitReached')}</h3>
            <p className="text-gray-400 mb-6">
              {t('limitReachedDesc')}
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.push('/profile/photos')}>
                {t('managePhotos')}
              </Button>
              <Button onClick={() => router.push('/subscription')}>
                {t('upgradePremium')}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
