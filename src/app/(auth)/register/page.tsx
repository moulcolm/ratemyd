'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Calendar, ArrowLeft, UserPlus } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { useQueryClient } from '@tanstack/react-query';

export default function RegisterPage() {
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
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password is too weak';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password needs at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password needs at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password needs at least one number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username is too short';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username contains invalid characters';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

      if (actualAge < 18) {
        newErrors.dateOfBirth = 'You must be 18 or older';
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
          title: 'Error',
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
          title: 'Registration Successful',
          message: 'Welcome to the platform!',
        });
        router.push('/compare');
        router.refresh();
      } else {
        // Registration succeeded but login failed - redirect to login
        addToast({
          type: 'success',
          title: 'Registration Successful',
          message: 'Please log in to continue',
        });
        router.push('/login');
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'An error occurred',
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
          Back to Home
        </Link>

        <Card variant="bordered" padding="lg" className="bg-gray-800/50 border-gray-700/50">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              Sign Up
            </h1>
            <p className="text-gray-300">
              {step === 1
                ? 'Create your account'
                : 'Complete your profile'}
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
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                leftIcon={<Mail className="w-5 h-5" />}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                leftIcon={<Lock className="w-5 h-5" />}
                helperText="At least 8 characters with uppercase, lowercase, and number"
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                error={errors.confirmPassword}
                leftIcon={<Lock className="w-5 h-5" />}
                required
              />

              <Button type="submit" className="w-full" size="lg">
                Next
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                error={errors.username}
                leftIcon={<User className="w-5 h-5" />}
                helperText="At least 3 characters, letters, numbers, and underscores only"
                required
              />

              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                error={errors.dateOfBirth}
                leftIcon={<Calendar className="w-5 h-5" />}
                helperText="You must be 18 or older to register"
                required
              />

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm text-yellow-300">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  size="lg"
                  isLoading={isLoading}
                  leftIcon={<UserPlus className="w-5 h-5" />}
                >
                  Sign Up
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300">
                Login
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
