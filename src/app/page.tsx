'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { data: session, status } = useAuth();
  const router = useRouter();
  const [memberCount, setMemberCount] = useState(12847);

  // Redirect logged-in users to compare page
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.push('/compare');
    }
  }, [status, session, router]);

  // Animate member count on load
  useEffect(() => {
    const interval = setInterval(() => {
      setMemberCount(prev => prev + Math.floor(Math.random() * 3));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Show loading while checking auth
  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>;
  }

  // Don't show homepage if authenticated (will redirect)
  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <HeroSection memberCount={memberCount} />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Features */}
      <FeaturesSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Leaderboard Preview */}
      <LeaderboardPreviewSection />

      {/* Categories */}
      <CategoriesSection />

      {/* Verification */}
      <VerificationSection />

      {/* FAQ */}
      <FAQSection />

      {/* Final CTA */}
      <FinalCTASection memberCount={memberCount} />

      {/* Footer */}
      <FooterSection />
    </div>
  );
}

// ============================================
// HEADER
// ============================================
function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-white">
            Rate<span className="text-purple-500">MyD</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================
// HERO SECTION
// ============================================
function HeroSection({ memberCount }: { memberCount: number }) {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent"
        >
          Where do you really rank?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl sm:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto"
        >
          The first ELO ranking for men. Anonymous. Competitive. Addictive.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <Link
            href="/register"
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
          >
            Find out my rank
          </Link>
          <Link
            href="/leaderboard"
            className="w-full sm:w-auto text-gray-300 hover:text-white text-lg px-8 py-4 transition-colors"
          >
            View the leaderboard →
          </Link>
        </motion.div>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>{memberCount.toLocaleString()} members ranked</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>100% anonymous</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// HOW IT WORKS
// ============================================
function HowItWorksSection() {
  const steps = [
    {
      number: '①',
      title: 'UPLOAD',
      description: 'Add your photos in 30 seconds. Flaccid, erect, or both. Your face never appears.',
      icon: '📤',
    },
    {
      number: '②',
      title: 'COMPARE',
      description: 'Vote on anonymous matchups. Every vote counts. The more you vote, the more visibility you get.',
      icon: '⚔️',
    },
    {
      number: '③',
      title: 'CLIMB',
      description: 'Your ELO score changes with every match. Rise through the rankings. Prove your worth.',
      icon: '📈',
    },
  ];

  return (
    <section className="py-20 px-4 bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 rounded-2xl p-8 text-center border border-gray-700/50 hover:border-purple-500/50 transition-colors"
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <div className="text-purple-400 text-sm font-mono mb-2">{step.number}</div>
              <h3 className="text-xl font-bold mb-4">{step.title}</h3>
              <p className="text-gray-400">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// FEATURES
// ============================================
function FeaturesSection() {
  const features = [
    {
      icon: '🎯',
      title: 'ACCURATE ELO SCORE',
      description: 'The same ranking algorithm used in chess. Objective and mathematical.',
    },
    {
      icon: '🏆',
      title: 'MULTIPLE LEADERBOARDS',
      description: 'Flaccid, erect, global, and the famous "Grower" ratio.',
    },
    {
      icon: '✓',
      title: 'VERIFIED BADGE',
      description: 'Prove your size, earn a boost and more credibility.',
    },
    {
      icon: '🔒',
      title: 'TOTAL ANONYMITY',
      description: 'No link to your identity. Burner email accepted.',
    },
    {
      icon: '📊',
      title: 'DETAILED STATS',
      description: 'Track your progress, win rate, and compare to the average.',
    },
    {
      icon: '🏅',
      title: 'ACHIEVEMENTS',
      description: 'Unlock badges and show off your progression.',
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
          What you get
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30 hover:bg-gray-800/50 transition-colors"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// TESTIMONIALS
// ============================================
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Finally a legit site with a real ranking system. Not just random ratings.",
      author: "Member for 3 months",
      badge: "Top 5%",
    },
    {
      quote: "The ELO system is addictive. I check my rank every day.",
      author: "Verified member",
      badge: "847 matches",
    },
    {
      quote: "I was curious where I stood. Now I'm hooked on the matchups.",
      author: "New member",
      badge: null,
    },
  ];

  return (
    <section className="py-20 px-4 bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
          What members say
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50"
            >
              <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">— {testimonial.author}</span>
                {testimonial.badge && (
                  <span className="text-purple-400 text-xs bg-purple-400/10 px-2 py-1 rounded">
                    {testimonial.badge}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// LEADERBOARD PREVIEW
// ============================================
function LeaderboardPreviewSection() {
  const leaders = [
    { rank: '🥇', name: 'Alp***84', elo: 1847, verified: true },
    { rank: '🥈', name: 'Big***er', elo: 1823, verified: true },
    { rank: '🥉', name: 'The***ng', elo: 1798, verified: false },
    { rank: '#4', name: 'Max***01', elo: 1756, verified: true },
    { rank: '#5', name: 'Ano***us', elo: 1742, verified: false },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
          Live Leaderboard
        </h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden"
        >
          {leaders.map((leader, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-6 py-4 border-b border-gray-700/30 last:border-0"
            >
              <div className="flex items-center gap-4">
                <span className="text-xl w-8">{leader.rank}</span>
                <span className="font-medium">{leader.name}</span>
                {leader.verified && (
                  <span className="text-blue-400 text-sm">✓</span>
                )}
              </div>
              <span className="text-purple-400 font-mono">{leader.elo} ELO</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-6 py-4 bg-purple-500/10 border-t border-purple-500/30">
            <div className="flex items-center gap-4">
              <span className="text-xl w-8 text-gray-500">#?</span>
              <span className="font-medium text-gray-400">YOU</span>
            </div>
            <span className="text-gray-500 font-mono">???? ELO</span>
          </div>
        </motion.div>
        <div className="text-center mt-8">
          <Link
            href="/register"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105"
          >
            Create my account to see my rank
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================
// CATEGORIES
// ============================================
function CategoriesSection() {
  const categories = [
    {
      icon: '🌙',
      title: 'FLACCID',
      description: 'Your natural potential. The most honest ranking.',
    },
    {
      icon: '🔥',
      title: 'ERECT',
      description: 'Show your best. The most competitive ranking.',
    },
    {
      icon: '📈',
      title: 'GLOBAL',
      description: 'Combined score for the full picture. The ultimate indicator.',
    },
    {
      icon: '🌱',
      title: 'GROWER',
      description: 'Erect-to-flaccid ratio. For those who grow the most.',
    },
  ];

  return (
    <section className="py-20 px-4 bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
          4 ways to compete
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 rounded-2xl p-6 text-center border border-gray-700/50 hover:border-purple-500/50 transition-colors"
            >
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-lg font-bold mb-2">{category.title}</h3>
              <p className="text-gray-400 text-sm">{category.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// VERIFICATION
// ============================================
function VerificationSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-3xl p-8 sm:p-12 border border-purple-500/30"
        >
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 block">✓</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Get Verified. Gain credibility.
            </h2>
            <p className="text-gray-400 text-lg">
              The ✓ badge proves your size is real.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold mb-4 text-purple-300">How it works:</h3>
              <ol className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-purple-400">1.</span>
                  Take a photo with a visible ruler
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400">2.</span>
                  Submit it for verification
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400">3.</span>
                  An admin validates within 24-48h
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400">4.</span>
                  You get the badge + ELO bonus
                </li>
              </ol>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-purple-300">Verified members earn:</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-green-400">→</span>
                  +5% on every win
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400">→</span>
                  Badge visible on the leaderboard
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400">→</span>
                  Access to "Verified only" rankings
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400">→</span>
                  More trust = more votes
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// FAQ
// ============================================
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Is it really anonymous?',
      answer: 'Yes. No personal data is linked to your profile. You can use a burner email. Your face must never appear in your photos.',
    },
    {
      question: 'How does the ELO score work?',
      answer: "It's the same system used in chess. You gain points by beating opponents, and lose points when you lose. The stronger your opponent, the more points you earn.",
    },
    {
      question: 'Who sees my photos?',
      answer: 'Only other logged-in members, during voting matchups. Photos are never public.',
    },
    {
      question: 'How do I get verified?',
      answer: "Submit a photo with a ruler visible next to it. An admin manually validates it. It's free.",
    },
    {
      question: 'Can I delete my account?',
      answer: 'Yes, anytime. All your data and photos are permanently deleted.',
    },
    {
      question: 'Is this legal?',
      answer: 'Yes. The site is for adults only (18+). All content is manually moderated.',
    },
  ];

  return (
    <section className="py-20 px-4 bg-gray-900/50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-800/30 transition-colors"
              >
                <span className="font-medium">{faq.question}</span>
                <span className="text-purple-400 text-2xl">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-400">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// FINAL CTA
// ============================================
function FinalCTASection({ memberCount }: { memberCount: number }) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Ready to find out where you rank?
        </h2>
        <p className="text-xl text-gray-400 mb-10">
          Join {memberCount.toLocaleString()} members already ranked.<br />
          Sign up in 30 seconds. 100% anonymous.
        </p>
        <Link
          href="/register"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white text-lg px-10 py-4 rounded-xl font-semibold transition-all hover:scale-105 mb-6"
        >
          Create my free account
        </Link>
        <p className="text-gray-500">
          Already a member?{' '}
          <Link href="/login" className="text-purple-400 hover:text-purple-300">
            Log in
          </Link>
        </p>
        <div className="flex items-center justify-center gap-6 mt-10 text-sm text-gray-500 flex-wrap">
          <span>🔒 Anonymity guaranteed</span>
          <span>⚡ Quick signup</span>
          <span>🗑️ Easy deletion</span>
        </div>
      </div>
    </section>
  );
}

// ============================================
// FOOTER
// ============================================
function FooterSection() {
  return (
    <footer className="py-10 px-4 border-t border-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-gray-500 text-sm">
            RateMyD © {new Date().getFullYear()}
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500 flex-wrap justify-center">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
          </div>
        </div>
        <div className="text-center mt-6 text-xs text-gray-600">
          Adults only (18+). All photos are manually moderated.
        </div>
      </div>
    </footer>
  );
}
