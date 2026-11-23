'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchRandomPost } from '@/lib/api';
import { Post } from '@/lib/types';
import StoryInteractions from '@/Components/StoryInteractions';

export default function RandomPage() {
  const [currentStory, setCurrentStory] = useState<Post | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRandomPost().then(res => {
      setCurrentStory(res);
      setInitialLoading(false);
    });
  }, []);

  const handleShuffle = async () => {
    setLoading(true);
    try {
      const next = await fetchRandomPost();
      if (next) setCurrentStory(next);
    } finally {
      setLoading(false);
    }
  };

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
            disabled={loading || !currentStory}
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
            <span>{loading ? 'Discovering...' : 'Shuffle Another Push'}</span>
          </button>
        </section>

        {initialLoading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12) 0', color: 'var(--text-muted)' }}>
            <p>Fetching a random story from the database...</p>
          </div>
        ) : !currentStory ? (
          <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>🎲</div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>No Stories Available Yet</h2>
            <p className="text-secondary" style={{ maxWidth: '440px', margin: '0 auto var(--space-4)', fontSize: '0.925rem' }}>
              The serendipity engine needs at least one published story in the database to randomize.
            </p>
            <Link href="/studio" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
              Publish First Story &rarr;
            </Link>
          </div>
        ) : (
          /* Article Reader */
          <article>
            <header style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                <span className="badge badge-dev">{currentStory.category}</span>
                {currentStory.tags.map(t => (
                  <span key={t} className="badge badge-neutral">{t}</span>
                ))}
              </div>

              <h1 className="title-page">
                {currentStory.title}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-3)', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  style={{ width: '1.75rem', height: '1.75rem', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
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

            <div className="prose" style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
              {currentStory.content ? (
                currentStory.content.split('\n\n').map((paragraph, idx) => {
                  const trimmed = paragraph.trim();
                  if (trimmed.startsWith('## ')) {
                    return <h2 key={idx}>{trimmed.replace('## ', '')}</h2>;
                  }
                  if (trimmed.startsWith('> ')) {
                    return <blockquote key={idx}>{trimmed.replace('> ', '')}</blockquote>;
                  }
                  if (trimmed.startsWith('```')) {
                    return (
                      <pre key={idx} className="code-pre" style={{ margin: 'var(--space-4) 0' }}>
                        <code>{trimmed.replace(/```[a-z]*\n?/g, '')}</code>
                      </pre>
                    );
                  }
                  return <p key={idx}>{trimmed}</p>;
                })
              ) : (
                <p>{currentStory.summary}</p>
              )}
            </div>

            {/* Social Interactions Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-5) 0',
                marginTop: 'var(--space-8)',
                borderTop: '1px solid var(--border-subtle)',
                borderBottom: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: 'var(--space-3)'
              }}
            >
              <StoryInteractions
                postId={currentStory.id}
                slug={currentStory.slug}
                title={currentStory.title}
                initialRelates={currentStory.relates}
                showShare={true}
                layout="bar"
              />
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  onClick={handleShuffle}
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  Shuffle Another &rarr;
                </button>
              </div>
            </div>

          </article>
        )}

      </div>
    </main>
  );
}
