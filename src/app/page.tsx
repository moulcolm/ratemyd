'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowRight, Trophy, BarChart3, Shield, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">{t('hero.title1')}</span> {t('hero.and')}{' '}
              <span className="gradient-text">{t('hero.title2')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
              {t('hero.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                {t('hero.cta')}
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="outline" size="lg">
                {t('hero.viewLeaderboard')}
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-sm text-gray-500 dark:text-gray-500"
          >
            {t('hero.ageRestriction')}
          </motion.p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('features.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              {t('features.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: t('features.vote.title'),
                description: t('features.vote.description'),
              },
              {
                icon: Trophy,
                title: t('features.elo.title'),
                description: t('features.elo.description'),
              },
              {
                icon: Shield,
                title: t('features.moderation.title'),
                description: t('features.moderation.description'),
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 card-hover shadow-sm"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('categories.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              {t('categories.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-purple-500/10 rounded-2xl p-8 border border-blue-200 dark:border-blue-500/30 shadow-sm"
            >
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('categories.flaccid.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('categories.flaccid.description')}
              </p>
              <ul className="space-y-3">
                {[t('categories.features.dedicated'), t('categories.features.separateElo'), t('categories.features.fairComparisons')].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-500/10 dark:to-purple-500/10 rounded-2xl p-8 border border-pink-200 dark:border-pink-500/30 shadow-sm"
            >
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('categories.erect.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('categories.erect.description')}
              </p>
              <ul className="space-y-3">
                {[t('categories.features.dedicated'), t('categories.features.separateElo'), t('categories.features.fairComparisons')].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-purple-500/10 dark:to-pink-500/10 rounded-2xl p-8 border border-amber-200 dark:border-purple-500/30 text-center shadow-sm"
          >
            <Sparkles className="w-10 h-10 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('categories.grower.title')}</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('categories.grower.description')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('pricing.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: t('pricing.free.name'),
                price: '0€',
                features: [t('pricing.free.feature1'), t('pricing.free.feature2'), t('pricing.free.feature3')],
                cta: t('pricing.free.cta'),
                popular: false,
              },
              {
                name: t('pricing.premium.name'),
                price: '4.99€',
                period: t('pricing.perMonth'),
                features: [
                  t('pricing.premium.feature1'),
                  t('pricing.premium.feature2'),
                  t('pricing.premium.feature3'),
                  t('pricing.premium.feature4'),
                  t('pricing.premium.feature5'),
                ],
                cta: t('pricing.premium.cta'),
                popular: true,
              },
              {
                name: t('pricing.vip.name'),
                price: '9.99€',
                period: t('pricing.perMonth'),
                features: [
                  t('pricing.vip.feature1'),
                  t('pricing.vip.feature2'),
                  t('pricing.vip.feature3'),
                  t('pricing.vip.feature4'),
                  t('pricing.vip.feature5'),
                ],
                cta: t('pricing.vip.cta'),
                popular: false,
              },
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl p-8 border ${
                  plan.popular
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-300 dark:border-blue-500 shadow-lg'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm'
                } relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full shadow-sm">
                    {t('pricing.popular')}
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              {t('cta.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <Link href="/register">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                {t('cta.button')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
