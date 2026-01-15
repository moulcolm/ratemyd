'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Mail, Lock, User, Calendar, ArrowLeft, UserPlus } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { useQueryClient } from '@tanstack/react-query';

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const tErrors = useTranslations('auth.errors');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    dateOfBirth: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = t('emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = tErrors('weakPassword');
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = t('passwordNeedsUppercase');
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = t('passwordNeedsLowercase');
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = t('passwordNeedsNumber');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = tErrors('passwordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username) {
      newErrors.username = t('usernameRequired');
    } else if (formData.username.length < 3) {
      newErrors.username = t('usernameTooShort');
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = t('usernameInvalidChars');
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = t('dateOfBirthRequired');
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

      if (actualAge < 18) {
        newErrors.dateOfBirth = t('mustBe18');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          dateOfBirth: formData.dateOfBirth,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        addToast({
          type: 'error',
          title: tCommon('error'),
          message: data.error,
        });
        return;
      }

      // Auto-login after registration using JWT
      const loginResponse = await fetch('/api/auth/simple-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok && loginData.success) {
        // Update session cache
        queryClient.setQueryData(['session'], { user: loginData.user });

        addToast({
          type: 'success',
          title: t('registerSuccess'),
          message: t('welcomeMessage'),
        });
        router.push('/compare');
        router.refresh();
      } else {
        // Registration succeeded but login failed - redirect to login
        addToast({
          type: 'success',
          title: t('registerSuccess'),
          message: 'Please log in to continue',
        });
        router.push('/login');
      }
    } catch {
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
              {step === 1
                ? t('subtitleStep1')
                : t('subtitleStep2')}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div
              className={`h-1 flex-1 rounded-full ${
                step >= 1 ? 'bg-purple-500' : 'bg-gray-700'
              }`}
            />
            <div
              className={`h-1 flex-1 rounded-full ${
                step >= 2 ? 'bg-purple-500' : 'bg-gray-700'
              }`}
            />
          </div>

          {step === 1 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleNext();
              }}
              className="space-y-6"
            >
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
                helperText={t('passwordHelper')}
                required
              />

              <Input
                label={t('confirmPassword')}
                type="password"
                placeholder={t('confirmPasswordPlaceholder')}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                error={errors.confirmPassword}
                leftIcon={<Lock className="w-5 h-5" />}
                required
              />

              <Button type="submit" className="w-full" size="lg">
                {tCommon('next')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label={t('username')}
                type="text"
                placeholder={t('usernamePlaceholder')}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                error={errors.username}
                leftIcon={<User className="w-5 h-5" />}
                helperText={t('usernameHelper')}
                required
              />

              <Input
                label={t('dateOfBirth')}
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                error={errors.dateOfBirth}
                leftIcon={<Calendar className="w-5 h-5" />}
                helperText={t('dateOfBirthHelper')}
                required
              />

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm text-yellow-300">
                {t('termsAgreement')}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  {tCommon('back')}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  size="lg"
                  isLoading={isLoading}
                  leftIcon={<UserPlus className="w-5 h-5" />}
                >
                  {t('submit')}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {t('hasAccount')}{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300">
                {t('signIn')}
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
