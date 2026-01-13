'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  Crown,
  Star,
  Check,
  Zap,
  Camera,
  Vote,
  Eye,
  Ban,
  Gift,
  Loader2,
} from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface UserSubscription {
  tier: string;
  isActive: boolean;
}

export default function SubscriptionPage() {
  const t = useTranslations('subscription');
  const tCommon = useTranslations('common');
  const { addToast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'FREE',
      name: t('plans.free.name'),
      price: 0,
      description: t('plans.free.description'),
      features: [
        { text: t('plans.free.features.votes'), icon: Vote },
        { text: t('plans.free.features.photos'), icon: Camera },
        { text: t('plans.free.features.leaderboard'), icon: Eye },
        { text: t('plans.free.features.ads'), icon: Ban, negative: true },
      ],
      popular: false,
    },
    {
      id: 'PREMIUM',
      name: t('plans.premium.name'),
      price: 4.99,
      description: t('plans.premium.description'),
      features: [
        { text: t('plans.premium.features.votes'), icon: Vote },
        { text: t('plans.premium.features.photos'), icon: Camera },
        { text: t('plans.premium.features.eloBonus'), icon: Zap },
        { text: t('plans.premium.features.noAds'), icon: Ban },
        { text: t('plans.premium.features.badge'), icon: Star },
      ],
      popular: true,
    },
    {
      id: 'VIP',
      name: t('plans.vip.name'),
      price: 9.99,
      description: t('plans.vip.description'),
      features: [
        { text: t('plans.vip.features.votes'), icon: Vote },
        { text: t('plans.vip.features.photos'), icon: Camera },
        { text: t('plans.vip.features.eloBonus'), icon: Zap },
        { text: t('plans.vip.features.noAds'), icon: Ban },
        { text: t('plans.vip.features.badge'), icon: Crown },
        { text: t('plans.vip.features.support'), icon: Gift },
      ],
      popular: false,
    },
  ];

  const { data: subscriptionData, isLoading } = useQuery<{ data: UserSubscription }>({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await fetch('/api/user/subscription');
      return res.json();
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (tier: 'PREMIUM' | 'VIP') => {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription',
          tier,
          returnUrl: window.location.origin + '/subscription/success',
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: tCommon('error'), message: error.message });
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/payments/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnUrl: window.location.origin + '/subscription',
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: tCommon('error'), message: error.message });
    },
  });

  const currentTier = subscriptionData?.data?.tier || 'FREE';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Current plan badge */}
        {currentTier !== 'FREE' && (
          <div className="flex justify-center mb-8">
            <Card variant="bordered" className="inline-flex items-center gap-3 px-6 py-3">
              <Crown className={cn(
                'w-5 h-5',
                currentTier === 'VIP' ? 'text-yellow-400' : 'text-purple-400'
              )} />
              <span>
                {t('currentPlan')} <strong>{currentTier}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => portalMutation.mutate()}
                isLoading={portalMutation.isPending}
              >
                {t('managePlan')}
              </Button>
            </Card>
          </div>
        )}

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              variant="bordered"
              className={cn(
                'relative p-6 transition-all',
                plan.popular && 'border-purple-500 ring-2 ring-purple-500/20',
                currentTier === plan.id && 'border-green-500'
              )}
            >
              {plan.popular && (
                <Badge
                  variant="premium"
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                >
                  {t('mostPopular')}
                </Badge>
              )}

              {currentTier === plan.id && (
                <Badge
                  variant="success"
                  className="absolute -top-3 right-4"
                >
                  {t('cta.current')}
                </Badge>
              )}

              <div className="text-center mb-6">
                <div className={cn(
                  'w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center',
                  plan.id === 'VIP' ? 'bg-yellow-500/20' :
                  plan.id === 'PREMIUM' ? 'bg-purple-500/20' :
                  'bg-gray-500/20'
                )}>
                  {plan.id === 'VIP' ? (
                    <Crown className="w-8 h-8 text-yellow-400" />
                  ) : plan.id === 'PREMIUM' ? (
                    <Star className="w-8 h-8 text-purple-400" />
                  ) : (
                    <Eye className="w-8 h-8 text-gray-400" />
                  )}
                </div>

                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{plan.description}</p>

                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? t('free') : `${plan.price}€`}
                  </span>
                  {plan.price > 0 && <span className="text-gray-400">{t('perMonth')}</span>}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className={cn(
                      'flex items-center gap-3',
                      feature.negative ? 'text-gray-500' : 'text-gray-300'
                    )}
                  >
                    <feature.icon className={cn(
                      'w-5 h-5 flex-shrink-0',
                      feature.negative ? 'text-gray-600' : 'text-green-400'
                    )} />
                    <span className="text-sm">{feature.text}</span>
                  </li>
                ))}
              </ul>

              {plan.id === 'FREE' ? (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={currentTier === 'FREE'}
                >
                  {currentTier === 'FREE' ? t('cta.current') : t('cta.downgrade')}
                </Button>
              ) : (
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    checkoutMutation.mutate(plan.id as 'PREMIUM' | 'VIP');
                  }}
                  isLoading={checkoutMutation.isPending && selectedPlan === plan.id}
                  disabled={currentTier === plan.id || (currentTier === 'VIP' && plan.id === 'PREMIUM')}
                >
                  {currentTier === plan.id
                    ? t('cta.current')
                    : currentTier === 'VIP' && plan.id === 'PREMIUM'
                    ? t('cta.downgrade')
                    : currentTier !== 'FREE' && plan.id === 'VIP'
                    ? t('cta.upgrade')
                    : t('cta.choose', { plan: plan.name })}
                </Button>
              )}
            </Card>
          ))}
        </div>

        {/* Additional purchases */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">{t('purchases.title')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="bordered" className="p-4 text-center">
              <Vote className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h4 className="font-bold mb-1">{t('purchases.votes50')}</h4>
              <p className="text-2xl font-bold text-purple-400 mb-3">1.99€</p>
              <Button variant="outline" size="sm" className="w-full">
                {t('purchases.buy')}
              </Button>
            </Card>

            <Card variant="bordered" className="p-4 text-center">
              <Vote className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h4 className="font-bold mb-1">{t('purchases.votes150')}</h4>
              <p className="text-2xl font-bold text-purple-400 mb-3">4.99€</p>
              <Button variant="outline" size="sm" className="w-full">
                {t('purchases.buy')}
              </Button>
            </Card>

            <Card variant="bordered" className="p-4 text-center">
              <Camera className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h4 className="font-bold mb-1">{t('purchases.photoSlot')}</h4>
              <p className="text-2xl font-bold text-green-400 mb-3">2.99€</p>
              <Button variant="outline" size="sm" className="w-full">
                {t('purchases.buy')}
              </Button>
            </Card>

            <Card variant="bordered" className="p-4 text-center">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h4 className="font-bold mb-1">{t('purchases.boost')}</h4>
              <p className="text-2xl font-bold text-yellow-400 mb-3">2.99€</p>
              <Button variant="outline" size="sm" className="w-full">
                {t('purchases.buy')}
              </Button>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <Card variant="bordered" className="p-6">
          <h2 className="text-xl font-bold mb-4">{t('faq.title')}</h2>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">{t('faq.cancel.question')}</h4>
              <p className="text-sm text-gray-400">
                {t('faq.cancel.answer')}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">{t('faq.eloBonus.question')}</h4>
              <p className="text-sm text-gray-400">
                {t('faq.eloBonus.answer')}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">{t('faq.cancelEffect.question')}</h4>
              <p className="text-sm text-gray-400">
                {t('faq.cancelEffect.answer')}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
