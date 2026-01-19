'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'How does RateMyD work?',
        answer: 'RateMyD uses an ELO rating system similar to chess rankings. You compare pairs of photos and vote on which you prefer. Winners gain ELO points, losers lose points, creating a dynamic ranking system that reflects community preferences.',
      },
      {
        question: 'Is RateMyD really anonymous?',
        answer: 'Yes! Your uploads are completely anonymous to other users. Only administrators can see the connection between accounts and photos, and this information is kept strictly confidential. Your votes are also anonymous.',
      },
      {
        question: 'How do I get started?',
        answer: 'Simply create a free account, upload your first photo for approval, and start voting on comparisons. The more you participate, the more accurate your ranking becomes!',
      },
      {
        question: 'What is the ELO rating system?',
        answer: 'ELO is a rating system that calculates relative skill levels. When you win a comparison, you gain points (more if you beat a higher-ranked photo). When you lose, you lose points. This creates a fair, competitive ranking that adjusts based on who you compete against.',
      },
    ],
  },
  {
    category: 'Photos & Content',
    questions: [
      {
        question: 'What kind of photos can I upload?',
        answer: 'You can upload photos in different categories: flaccid, erect, or verification photos (with a ruler). All photos must meet our content guidelines and only feature yourself with your consent.',
      },
      {
        question: 'How long does photo approval take?',
        answer: 'Most photos are reviewed and approved within 24 hours. You\'ll receive a notification once your photo is approved or if it requires changes.',
      },
      {
        question: 'Why was my photo rejected?',
        answer: 'Photos may be rejected for several reasons: poor quality, not meeting category requirements, violating content guidelines, or featuring someone other than yourself. You can reupload a compliant photo at any time.',
      },
      {
        question: 'Can I delete my photos?',
        answer: 'Yes! You can delete any of your photos at any time from your profile. Note that deleting a photo will also remove its ranking history.',
      },
    ],
  },
  {
    category: 'Rankings & Verification',
    questions: [
      {
        question: 'What is the Verified Badge?',
        answer: 'The Verified Badge is awarded to photos that include a measurement tool (ruler, measuring tape) in the image. This provides additional credibility to your declared size and boosts trust in the community.',
      },
      {
        question: 'How do I get verified?',
        answer: 'Upload a photo with a clear ruler or measuring tape visible alongside your member. Make sure the measurement is legible and the ruler starts at 0. Our team will review and verify the measurement.',
      },
      {
        question: 'Why are some users at the top consistently?',
        answer: 'Users at the top have won many comparisons and maintained high win rates. The ELO system rewards consistency and quality. Keep participating and improving your photos to climb the rankings!',
      },
      {
        question: 'Can I boost my photo\'s visibility?',
        answer: 'Currently in V1, boosting features are not available. All photos compete on equal footing based purely on votes and ELO ratings.',
      },
    ],
  },
  {
    category: 'Privacy & Safety',
    questions: [
      {
        question: 'Is my personal information safe?',
        answer: 'Absolutely. We use industry-standard encryption and security measures. Your personal information is never shared publicly, and photos are stored securely on encrypted cloud storage.',
      },
      {
        question: 'Can other users find out who I am?',
        answer: 'No. Your username and photos are not linked publicly. Other users can only see the photos and their rankings, not who uploaded them.',
      },
      {
        question: 'What if someone uploads a photo of me without consent?',
        answer: 'This is strictly against our terms of service. If you find a photo of yourself uploaded without your consent, please contact us immediately through our report system, and we will remove it and take appropriate action.',
      },
      {
        question: 'How do you prevent fake or stolen photos?',
        answer: 'We use a combination of manual review, verification systems, and community reporting. Verified photos (with measurement tools) carry a badge for additional authenticity.',
      },
    ],
  },
  {
    category: 'Account & Technical',
    questions: [
      {
        question: 'I forgot my password. What should I do?',
        answer: 'Click the "Forgot Password" link on the login page. Enter your email address, and we\'ll send you a password reset link.',
      },
      {
        question: 'Can I change my username?',
        answer: 'Yes! You can change your username in your account settings at any time. Your rankings and photo history will remain intact.',
      },
      {
        question: 'How do I delete my account?',
        answer: 'You can permanently delete your account from Settings > Danger Zone. This will remove all your photos, votes, and personal information. This action cannot be undone.',
      },
      {
        question: 'The site is not working properly. What should I do?',
        answer: 'Try clearing your browser cache and cookies first. If issues persist, please contact our support team with details about the problem, including your browser and device information.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800/50 backdrop-blur-xl bg-gray-950/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            RateMyD
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-gray-400 text-lg">
                Find answers to common questions about RateMyD
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-800/50 border border-gray-700/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
              />
            </div>

            {/* FAQ Categories */}
            <div className="space-y-8">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No questions found matching your search.</p>
                </div>
              ) : (
                filteredFaqs.map((category, categoryIndex) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: categoryIndex * 0.1 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-purple-400">
                      {category.category}
                    </h2>

                    <div className="space-y-2">
                      {category.questions.map((faq, index) => {
                        const questionId = `${category.category}-${index}`;
                        const isOpen = openIndex === questionId;

                        return (
                          <div
                            key={questionId}
                            className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden"
                          >
                            <button
                              onClick={() => setOpenIndex(isOpen ? null : questionId)}
                              className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-800/30 transition-colors"
                            >
                              <span className="font-medium pr-8">{faq.question}</span>
                              <ChevronDown
                                className={`w-5 h-5 text-purple-400 flex-shrink-0 transition-transform ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </button>

                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-t border-gray-700/50"
                              >
                                <div className="p-6 text-gray-300">
                                  {faq.answer}
                                </div>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Still have questions */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-purple-500/20 text-center">
              <h3 className="text-2xl font-bold mb-3">Still have questions?</h3>
              <p className="text-gray-400 mb-6">
                Can't find what you're looking for? Get in touch with our support team.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-semibold transition-all"
              >
                Contact Support
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p>&copy; 2026 RateMyD. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
