'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermsPage() {
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
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">Terms of Service</h1>
              <p className="text-gray-400">Last updated: January 19, 2026</p>
            </div>

            <div className="space-y-6 text-gray-300">
              <section>
                <h2 className="text-2xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using RateMyD, you accept and agree to be bound by the terms and provision of this agreement.
                  If you do not agree to these terms, please do not use our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">2. User Eligibility</h2>
                <p className="mb-2">
                  You must be at least 18 years old to use this service. By using RateMyD, you represent and warrant that:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You are at least 18 years of age</li>
                  <li>You have the legal capacity to enter into these terms</li>
                  <li>You will comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">3. User Content</h2>
                <p className="mb-2">
                  When you upload content to RateMyD, you agree that:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You own or have the right to upload the content</li>
                  <li>The content does not violate any laws or third-party rights</li>
                  <li>The content meets our community guidelines</li>
                  <li>You grant us a license to use, display, and distribute the content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">4. Prohibited Conduct</h2>
                <p className="mb-2">
                  You agree not to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Upload content featuring individuals without their consent</li>
                  <li>Upload content featuring minors</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Attempt to circumvent our ranking system</li>
                  <li>Use automated tools to interact with the service</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">5. Privacy and Data</h2>
                <p>
                  Your privacy is important to us. Please review our{' '}
                  <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">
                    Privacy Policy
                  </Link>{' '}
                  to understand how we collect, use, and protect your personal information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">6. Account Termination</h2>
                <p>
                  We reserve the right to suspend or terminate your account at any time, with or without notice,
                  for conduct that we believe violates these terms or is harmful to other users, us, or third parties,
                  or for any other reason.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">7. Disclaimer of Warranties</h2>
                <p>
                  RateMyD is provided "as is" and "as available" without warranties of any kind, either express or implied.
                  We do not guarantee that the service will be uninterrupted, secure, or error-free.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">8. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, RateMyD shall not be liable for any indirect, incidental, special,
                  consequential, or punitive damages resulting from your use or inability to use the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">9. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. We will notify users of any material changes
                  by posting the new terms on this page. Your continued use of the service after such modifications
                  constitutes your acceptance of the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">10. Contact Us</h2>
                <p>
                  If you have any questions about these Terms of Service, please{' '}
                  <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline">
                    contact us
                  </Link>.
                </p>
              </section>
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
