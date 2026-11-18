'use client';

import React, { useState, useEffect } from 'react';
import { clapPost, toggleBookmark } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface StoryInteractionsProps {
  postId: string;
  initialRelates: number;
  slug?: string;
  title?: string;
  showShare?: boolean;
  layout?: 'row' | 'bar';
}

export default function StoryInteractions({
  postId,
  initialRelates,
  slug,
  title,
  showShare = true,
  layout = 'bar',
}: StoryInteractionsProps) {
  const { token, isAuthenticated } = useAuth();

  const [relates, setRelates] = useState(initialRelates);
  const [userClaps, setUserClaps] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [burstCount, setBurstCount] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load initial local bookmark & clap states
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedClaps = parseInt(localStorage.getItem(`claps_${postId}`) || '0', 10);
      setUserClaps(storedClaps);

      const bookmarks: string[] = JSON.parse(localStorage.getItem('my_bookmarks') || '[]');
      if (bookmarks.includes(postId) || (slug && bookmarks.includes(slug))) {
        setIsBookmarked(true);
      }
    }
  }, [postId, slug]);

  // Handle clapping
  const handleClap = async () => {
    if (userClaps >= 50) return; // Medium-style max 50 claps cap

    // Optimistic UI updates
    const nextUserClaps = userClaps + 1;
    setUserClaps(nextUserClaps);
    setRelates(prev => prev + 1);

    // Burst visual animation indicator
    setBurstCount(nextUserClaps);
    setTimeout(() => setBurstCount(null), 1200);

    await clapPost(postId, 1, token);
  };

  // Handle bookmarking
  const handleBookmark = async () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    await toggleBookmark(postId, token);
  };

  // Handle share / copy link
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    }
  };

  const isBar = layout === 'bar';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isBar ? 'space-between' : 'flex-start',
        gap: 'var(--space-3)',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', position: 'relative' }}>
        
        {/* RELATE / CLAP BUTTON */}
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <button
            type="button"
            onClick={handleClap}
            className={`btn btn-sm ${userClaps > 0 ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '0.45rem 1.05rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 700,
              cursor: userClaps >= 50 ? 'default' : 'pointer',
              backgroundColor: userClaps > 0 ? 'var(--brand-terracotta)' : undefined,
              borderColor: userClaps > 0 ? 'var(--brand-terracotta)' : undefined,
              color: userClaps > 0 ? '#ffffff' : 'var(--text-main)',
              transition: 'transform 0.1s ease',
              boxShadow: userClaps > 0 ? '0 2px 6px rgba(249, 115, 22, 0.35)' : 'none'
            }}
            title={userClaps >= 50 ? 'You reached the maximum 50 claps!' : 'Click to clap / relate (up to 50 times)'}
          >
            <span className="icon icon-sm">
              <svg viewBox="0 0 24 24" fill={userClaps > 0 ? 'currentColor' : 'none'} stroke="currentColor">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </span>
            <span>Relate ({relates})</span>
            {userClaps > 0 && (
              <span
                style={{
                  fontSize: '0.725rem',
                  padding: '0.05rem 0.35rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  fontWeight: 800
                }}
              >
                +{userClaps}
              </span>
            )}
          </button>

          {/* Floating Clap Burst Animation */}
          {burstCount !== null && (
            <span
              style={{
                position: 'absolute',
                top: '-2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--brand-terracotta)',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                pointerEvents: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                animation: 'fadeUp 0.8s ease forwards'
              }}
            >
              +{burstCount}
            </span>
          )}
        </div>

        {/* BOOKMARK BUTTON */}
        <button
          type="button"
          onClick={handleBookmark}
          className={`btn btn-sm ${isBookmarked ? 'btn-primary' : 'btn-secondary'}`}
          style={{
            borderRadius: 'var(--radius-full)',
            padding: '0.45rem 0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: isBookmarked ? 'var(--brand-terracotta)' : undefined,
            borderColor: isBookmarked ? 'var(--brand-terracotta)' : undefined,
            color: isBookmarked ? '#ffffff' : 'var(--text-main)',
            boxShadow: isBookmarked ? '0 2px 6px rgba(249, 115, 22, 0.35)' : 'none'
          }}
          title={isBookmarked ? 'Saved in your Reading List (Click to remove)' : 'Save to your Reading List'}
        >
          <span className="icon icon-sm">
            <svg viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </span>
          <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
        </button>

        {/* SHARE / COPY LINK */}
        {showShare && (
          <button
            type="button"
            onClick={handleShare}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 0.95rem' }}
            title="Copy story URL to share"
          >
            <span className="icon icon-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </span>
            <span>{copiedLink ? 'Link Copied! ✓' : 'Share'}</span>
          </button>
        )}

      </div>
    </div>
  );
}
