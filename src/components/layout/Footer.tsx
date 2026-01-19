'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-10 px-4 border-t border-gray-800 bg-gray-950 mt-auto">
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
