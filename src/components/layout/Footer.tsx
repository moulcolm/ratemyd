'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              RateMyD
            </span>
            <p className="mt-3 text-gray-400 text-sm max-w-md">
              Plateforme de classement anonyme et sécurisée. Toutes les photos sont modérées
              manuellement pour garantir la sécurité de la communauté.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/compare" className="text-gray-400 hover:text-white transition-colors">
                  Voter
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-gray-400 hover:text-white transition-colors">
                  Classement
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="text-gray-400 hover:text-white transition-colors">
                  Abonnements
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Légal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/terms" className="text-gray-400 hover:text-white transition-colors">
                  CGU
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-gray-400 hover:text-white transition-colors">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} RateMyD. Tous droits réservés. 18+ uniquement.
          </p>
          <p className="text-gray-500 text-sm">
            En utilisant ce site, vous confirmez avoir au moins 18 ans.
          </p>
        </div>
      </div>
    </footer>
  );
}
