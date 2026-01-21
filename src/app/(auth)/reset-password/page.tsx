'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const token = searchParams.get('token');

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await response.json();
        setIsValidToken(data.valid);
      } catch (error) {
        console.error('Token validation error:', error);
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};

    if (password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins une majuscule';
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins une minuscule';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins un chiffre';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        addToast({
          type: 'error',
          title: 'Erreur',
          message: data.error || 'Une erreur est survenue',
        });
      } else {
        setIsSuccess(true);
        addToast({
          type: 'success',
          title: 'Succès',
          message: 'Mot de passe réinitialisé avec succès',
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <LoadingSpinner size="lg" text="Vérification du lien..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>

        <Card variant="bordered" padding="lg" className="bg-gray-800/50 border-gray-700/50">
          {!token || !isValidToken ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">Lien invalide</h2>
              <p className="text-gray-400 mb-6">
                Ce lien de réinitialisation est invalide ou a expiré.
              </p>
              <Link href="/forgot-password">
                <Button variant="primary" className="w-full">
                  Demander un nouveau lien
                </Button>
              </Link>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">Mot de passe réinitialisé</h2>
              <p className="text-gray-400 mb-6">
                Votre mot de passe a été réinitialisé avec succès.
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <Link href="/login">
                <Button variant="primary" className="w-full">
                  Se connecter
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                  Nouveau mot de passe
                </h1>
                <p className="text-gray-400">
                  Choisissez un nouveau mot de passe sécurisé
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  placeholder="Entrez votre nouveau mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  leftIcon={<Lock className="w-5 h-5" />}
                  required
                />

                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  placeholder="Confirmez votre nouveau mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  leftIcon={<Lock className="w-5 h-5" />}
                  required
                />

                <div className="text-sm text-gray-500 space-y-1">
                  <p>Le mot de passe doit contenir :</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li className={password.length >= 8 ? 'text-green-400' : ''}>
                      Au moins 8 caractères
                    </li>
                    <li className={/[A-Z]/.test(password) ? 'text-green-400' : ''}>
                      Une majuscule
                    </li>
                    <li className={/[a-z]/.test(password) ? 'text-green-400' : ''}>
                      Une minuscule
                    </li>
                    <li className={/[0-9]/.test(password) ? 'text-green-400' : ''}>
                      Un chiffre
                    </li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                  leftIcon={<KeyRound className="w-5 h-5" />}
                >
                  Réinitialiser le mot de passe
                </Button>
              </form>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
          <LoadingSpinner size="lg" text="Chargement..." />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
