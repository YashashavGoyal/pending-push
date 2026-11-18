'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FEED_STORIES } from '@/lib/mock-data';

export default function RandomPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleShuffle = () => {
    let nextIndex = Math.floor(Math.random() * FEED_STORIES.length);
    if (nextIndex === currentIndex && FEED_STORIES.length > 1) {
      nextIndex = (currentIndex + 1) % FEED_STORIES.length;
    }
    setCurrentIndex(nextIndex);
  };

  const currentStory = FEED_STORIES[currentIndex] || FEED_STORIES[0];

  return (
    <main className="page-wrapper">
      <div className="container-narrow">

        {/* Serendipity Bar */}
        <section className="card" style={{ marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', padding: 'var(--space-6)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-dev">random push discovery</span>
              <span className="text-muted" style={{ fontSize: '0.775rem', fontFamily: 'var(--font-mono)' }}>serendipity mode</span>
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.25rem', marginBottom: 0 }}>Reading a randomized community submission</h2>
          </div>

          <button
            onClick={handleShuffle}
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <span className="icon icon-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </span>
            <span>Shuffle Another Push</span>
          </button>
        </section>

        {/* Article Reader */}
        <article>
          <header style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <span className="badge badge-dev">{currentStory.category}</span>
              {currentStory.tags.map(t => (
                <span key={t} className="badge badge-neutral">{t}</span>
              ))}
            </div>

            <h1 className="title-page">
              {currentStory.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-3)', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              <img
                style={{ width: '1.75rem', height: '1.75rem', borderRadius: '999px' }}
                src={currentStory.author.avatar}
                alt={currentStory.author.name}
              />
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{currentStory.author.name}</span>
              <span>•</span>
              <span>{currentStory.readTime}</span>
              <span>•</span>
              <span>{currentStory.publishedAt}</span>
            </div>
          </header>

          <div style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-main)' }}>
            <p style={{ marginBottom: '1.25rem' }}>
              {currentStory.summary}
            </p>

            <p style={{ marginBottom: '1.25rem' }}>
              In high-concurrency systems, reducing memory allocations and eliminating unnecessary abstraction layers delivers monumental improvements in end-to-end responsiveness and cloud expenditure efficiency.
            </p>
          </div>

          <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link
              href={currentStory.category === 'dev-log' ? `/dev-logs/${currentStory.slug}` : `/articles/${currentStory.slug}`}
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              Read Full Post &rarr;
            </Link>
            <button
              onClick={handleShuffle}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              Roll Next Random Push &rarr;
            </button>
          </div>
        </article>

      </div>
    </main>
  );
}
