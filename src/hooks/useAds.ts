'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseAdsOptions {
  votesBeforeInterstitial?: number;
  showInterstitialOnce?: boolean;
}

export function useAds(options: UseAdsOptions = {}) {
  const { votesBeforeInterstitial = 10, showInterstitialOnce = true } = options;

  const [voteCount, setVoteCount] = useState(0);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [hasShownInterstitial, setHasShownInterstitial] = useState(false);

  // Load from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem('adState');
    if (stored) {
      const state = JSON.parse(stored);
      setVoteCount(state.voteCount || 0);
      setHasShownInterstitial(state.hasShownInterstitial || false);
    }
  }, []);

  // Save to session storage
  useEffect(() => {
    sessionStorage.setItem(
      'adState',
      JSON.stringify({
        voteCount,
        hasShownInterstitial,
      })
    );
  }, [voteCount, hasShownInterstitial]);

  const trackVote = useCallback(() => {
    setVoteCount((prev) => {
      const newCount = prev + 1;

      // Check if should show interstitial
      if (newCount >= votesBeforeInterstitial) {
        if (!showInterstitialOnce || !hasShownInterstitial) {
          setShowInterstitial(true);
          setHasShownInterstitial(true);
          return 0; // Reset counter
        }
      }

      return newCount;
    });
  }, [votesBeforeInterstitial, showInterstitialOnce, hasShownInterstitial]);

  const closeInterstitial = useCallback(() => {
    setShowInterstitial(false);
  }, []);

  return {
    voteCount,
    showInterstitial,
    trackVote,
    closeInterstitial,
    votesUntilInterstitial: votesBeforeInterstitial - voteCount,
  };
}
