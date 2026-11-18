'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Post } from '@/lib/types';
import { fetchFollowingFeed } from '@/lib/api';
import FollowButton from './FollowButton';

interface HomeFeedTabsProps {
  initialStories: Post[];
}

export default function HomeFeedTabs({ initialStories }: HomeFeedTabsProps) {
  const [activeTab, setActiveTab] = useState<'latest' | 'following'>('latest');
  const [followingStories, setFollowingStories] = useState<Post[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  const handleSelectFollowing = async () => {
    setActiveTab('following');
    if (followingStories.length === 0) {
      setLoadingFollowing(true);
      const data = await fetchFollowingFeed();
      setFollowingStories(data);
      setLoadingFollowing(false);
    }
  };

  const currentStories = activeTab === 'latest' ? initialStories : followingStories;

  return (
    <div>
      {/* Feed Tabs Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          flexWrap: 'wrap',
          gap: 'var(--space-3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('latest')}
            className={`topic-chip ${activeTab === 'latest' ? 'active' : ''}`}
            style={{
              fontWeight: 700,
              backgroundColor: activeTab === 'latest' ? 'var(--brand-terracotta)' : undefined,
              borderColor: activeTab === 'latest' ? 'var(--brand-terracotta)' : undefined,
              color: activeTab === 'latest' ? '#ffffff' : undefined,
              cursor: 'pointer'
            }}
          >
            ✦ Latest Pushes
          </button>

          <button
            type="button"
            onClick={handleSelectFollowing}
            className={`topic-chip ${activeTab === 'following' ? 'active' : ''}`}
            style={{
              fontWeight: 700,
              backgroundColor: activeTab === 'following' ? 'var(--brand-terracotta)' : undefined,
              borderColor: activeTab === 'following' ? 'var(--brand-terracotta)' : undefined,
              color: activeTab === 'following' ? '#ffffff' : undefined,
              cursor: 'pointer'
            }}
          >
            ★ Following Feed
          </button>

          <span style={{ width: '1px', height: '1rem', backgroundColor: 'var(--border-subtle)', margin: '0 0.2rem' }} />

          <Link href="/articles" className="topic-chip" style={{ fontWeight: 600 }}>Articles</Link>
          <Link href="/dev-logs" className="topic-chip" style={{ fontWeight: 600 }}>Dev Logs</Link>
          <Link href="/tutorials" className="topic-chip" style={{ fontWeight: 600 }}>Tutorials</Link>
          <Link href="/confessions" className="topic-chip" style={{ fontWeight: 600 }}>Confessions</Link>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {activeTab === 'latest' ? 'Global Platform Stream' : 'Curated Following Stream'}
        </div>
      </div>

      {/* Following Feed Empty State / Author Recommendations */}
      {activeTab === 'following' && currentStories.length === 0 && !loadingFollowing && (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
            Your Following Feed is Quiet
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto var(--space-6)' }}>
            Follow system architects, staff engineers, and tutorial writers to see their latest pushes here in real time.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Alex Rivera</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Fastify &amp; Systems</div>
              <FollowButton authorId="alexrivera" />
            </div>

            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Elena Rostova</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Distributed Systems</div>
              <FollowButton authorId="elenarostova" />
            </div>

            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Marcus Vance</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Next.js &amp; Architecture</div>
              <FollowButton authorId="marcusv" />
            </div>
          </div>
        </div>
      )}

      {/* Stories Feed */}
      {loadingFollowing ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>
          Loading your personalized following feed...
        </div>
      ) : (
        <div className="feed-stream">
          {currentStories.map((story) => (
            <article key={story.id} className="story-card">
              <div>
                <div className="story-kicker">
                  {story.category.toUpperCase()} • {story.tags.join(' & ')}
                </div>
                <h2 className="story-title">
                  <Link href={
                    story.category === 'dev-log' ? `/dev-logs/${story.slug}` :
                    story.category === 'tutorial' ? `/tutorials/${story.slug}` :
                    story.category === 'confession' ? `/confessions` :
                    `/articles/${story.slug}`
                  }>
                    {story.title}
                  </Link>
                </h2>
                <p className="story-excerpt">
                  {story.summary}
                </p>
                <div className="story-meta-row">
                  <Link href={`/profile/${story.author.username}`} className="story-author-chip">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="story-author-avatar" src={story.author.avatar} alt={story.author.name} />
                    <span>{story.author.name}</span>
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span>{story.readTime}</span>
                    <span>•</span>
                    <span style={{ color: 'var(--brand-terracotta)', fontWeight: 600 }}>{story.relates} relates</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
