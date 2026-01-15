'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Mail, Lock, ArrowLeft, LogIn } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const tErrors = useTranslations('auth.errors');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const callbackUrl = searchParams.get('callbackUrl') || '/compare';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Try simple-login first
      const response = await fetch('/api/auth/simple-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        addToast({
          type: 'error',
          title: t('loginError'),
          message: data.error || tErrors('invalidCredentials'),
        });
      } else {
        addToast({
          type: 'success',
          title: t('loginSuccess'),
          message: t('welcome'),
        });
        // Refresh the page to update the session
        window.location.href = callbackUrl;
      }
    } catch (error) {
      console.error('Login error:', error);
      addToast({
        type: 'error',
        title: tCommon('error'),
        message: t('errorOccurred'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToHome')}
        </Link>

        <Card variant="bordered" padding="lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">{t('title')}</h1>
            <p className="text-gray-400">
              {t('subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={t('email')}
              type="email"
              placeholder={t('emailPlaceholder')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              leftIcon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              label={t('password')}
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              leftIcon={<Lock className="w-5 h-5" />}
              required
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              leftIcon={<LogIn className="w-5 h-5" />}
            >
              {t('submit')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {t('noAccount')}{' '}
              <Link href="/register" className="text-purple-400 hover:text-purple-300">
                {t('signUp')}
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
