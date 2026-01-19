'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
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
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-gray-400">Last updated: January 19, 2026</p>
            </div>

            <div className="space-y-6 text-gray-300">
              <section>
                <h2 className="text-2xl font-bold text-white mb-3">1. Information We Collect</h2>
                <p className="mb-2">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Account information (email, username, password)</li>
                  <li>Photos and content you upload</li>
                  <li>Information about your usage of the service</li>
                  <li>Communications with us</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">2. How We Use Your Information</h2>
                <p className="mb-2">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your transactions and manage your account</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                  <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">3. Information Sharing</h2>
                <p className="mb-2">
                  We may share your information in the following situations:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>With your consent or at your direction</li>
                  <li>With service providers who perform services on our behalf</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect the rights, property, and safety of RateMyD, our users, and the public</li>
                  <li>In connection with a merger, sale, or acquisition</li>
                </ul>
                <p className="mt-3">
                  We do not sell your personal information to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">4. Data Storage and Security</h2>
                <p>
                  We store your data securely using industry-standard encryption and security measures.
                  Photos are stored on secure cloud storage services (Vercel Blob). While we strive to protect
                  your personal information, no method of transmission over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">5. Anonymous Content</h2>
                <p>
                  RateMyD is designed to be an anonymous platform. We do not publicly display your personal
                  information alongside your uploaded content. However, please be aware that:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Administrators can view the association between accounts and uploaded content</li>
                  <li>Content may contain identifying information if you include it</li>
                  <li>We may be required to disclose information to law enforcement</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">6. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar tracking technologies to track activity on our service and hold
                  certain information. Cookies are files with a small amount of data which may include an
                  anonymous unique identifier. You can instruct your browser to refuse all cookies or to
                  indicate when a cookie is being sent.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">7. Your Rights</h2>
                <p className="mb-2">
                  Depending on your location, you may have certain rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Access: Request access to your personal information</li>
                  <li>Correction: Request correction of inaccurate information</li>
                  <li>Deletion: Request deletion of your personal information</li>
                  <li>Objection: Object to our processing of your information</li>
                  <li>Portability: Request transfer of your information to another service</li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, please contact us through our{' '}
                  <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline">
                    contact page
                  </Link>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">8. Data Retention</h2>
                <p>
                  We retain your personal information for as long as necessary to provide our services and
                  fulfill the purposes outlined in this Privacy Policy. When you delete your account, we will
                  delete your personal information and uploaded content, except where we are required to retain
                  it for legal purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">9. Children's Privacy</h2>
                <p>
                  RateMyD is not intended for use by individuals under 18 years of age. We do not knowingly
                  collect personal information from children under 18. If you become aware that a child has
                  provided us with personal information, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">10. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by
                  posting the new Privacy Policy on this page and updating the "Last updated" date. You are
                  advised to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">11. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please{' '}
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
