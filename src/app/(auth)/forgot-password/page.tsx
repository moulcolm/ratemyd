'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

export default function ForgotPasswordPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        addToast({
          type: 'error',
          title: 'Erreur',
          message: data.error || 'Une erreur est survenue',
        });
      } else {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue',
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
          href="/login"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <Card variant="bordered" padding="lg" className="bg-gray-800/50 border-gray-700/50">
          {isSubmitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">Email envoyé</h2>
              <p className="text-gray-400 mb-6">
                Si un compte existe avec l'adresse <span className="text-white">{email}</span>,
                vous recevrez un lien de réinitialisation.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Le lien expire dans 1 heure.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                  Mot de passe oublié
                </h1>
                <p className="text-gray-400">
                  Entrez votre email pour recevoir un lien de réinitialisation
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-5 h-5" />}
                  required
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                  leftIcon={<Send className="w-5 h-5" />}
                >
                  Envoyer le lien
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Vous vous souvenez de votre mot de passe ?{' '}
                  <Link href="/login" className="text-purple-400 hover:text-purple-300">
                    Se connecter
                  </Link>
                </p>
              </div>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
