'use client';

import React, { useState, useEffect } from 'react';
import { toggleFollow } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface FollowButtonProps {
  authorId: string;
  initialFollowers?: number;
  onFollowersChange?: (count: number) => void;
}

export default function FollowButton({
  authorId,
  initialFollowers,
  onFollowersChange,
}: FollowButtonProps) {
  const { token, user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`following_${authorId}`) === 'true';
      setIsFollowing(stored);
    }
  }, [authorId]);

  const handleToggle = async () => {
    const nextState = !isFollowing;
    setIsFollowing(nextState);

    if (initialFollowers !== undefined && onFollowersChange) {
      onFollowersChange(nextState ? initialFollowers + 1 : Math.max(0, initialFollowers - 1));
    }

    await toggleFollow(authorId, token);
  };

  // Don't show follow button for own profile
  if (user && user.username === authorId) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`btn btn-sm ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
      style={{
        borderRadius: 'var(--radius-full)',
        padding: '0.4rem 1.1rem',
        fontWeight: 700,
        fontSize: '0.825rem',
        color: isFollowing && isHovering ? 'var(--accent-rose)' : undefined,
        borderColor: isFollowing && isHovering ? 'var(--accent-rose)' : undefined,
        transition: 'all var(--transition-fast)'
      }}
    >
      {isFollowing ? (isHovering ? 'Unfollow' : 'Following ✓') : '+ Follow'}
    </button>
  );
}
