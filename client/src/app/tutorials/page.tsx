'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TUTORIAL_TRACKS } from '@/lib/mock-data';

export default function TutorialsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'started' | 'completed' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTracks = TUTORIAL_TRACKS.filter(track => {
    // Filter by tab
    if (activeTab === 'started' && track.status !== 'started') return false;
    if (activeTab === 'completed' && track.status !== 'completed') return false;
    if (activeTab === 'saved' && track.status !== 'saved') return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = track.title.toLowerCase().includes(q);
      const matchDesc = track.description.toLowerCase().includes(q);
      const matchTags = track.tags.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTags;
    }
    return true;
  });

  const startedCount = TUTORIAL_TRACKS.filter(t => t.status === 'started').length;
  const completedCount = TUTORIAL_TRACKS.filter(t => t.status === 'completed').length;
  const savedCount = TUTORIAL_TRACKS.filter(t => t.status === 'saved').length;

  return (
    <main className="page-wrapper">
      <div className="container">

        {/* Space Header */}
        <section className="space-header" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="space-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-tutorial">03 / Interactive Learning Tracks</span>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Step-by-step masterclasses</span>
            </div>
            <h1>Tutorials Hub</h1>
            <p>
              Friendly, structured engineering masterclasses with interactive checklists, code sandboxes, and tracked progress.
            </p>
          </div>

          <div className="space-actions">
            <Link
              href="/tutorials/fastify-redis-streams"
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <span>Resume Current (Step 3) &rarr;</span>
            </Link>
          </div>
        </section>

        {/* 1. SEARCH BAR BELOW TUTORIALS HUB */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ position: 'relative', maxWidth: '680px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              placeholder="Search tutorials by framework, concept or topic (e.g. Fastify, Redis, TypeScript, CSS Grid)..."
              style={{
                padding: '0.75rem 1rem 0.75rem 2.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.95rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            />
            <span
              className="icon"
              style={{
                position: 'absolute',
                left: '1.05rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </div>
        </div>

        {/* 2. TABS BAR: ALL, ENROLLED / IN PROGRESS, COMPLETED, BOOKMARKS */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: 'var(--space-4)',
            marginBottom: 'var(--space-8)',
            flexWrap: 'wrap',
            gap: 'var(--space-3)'
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('all')}
              className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              All Masterclasses ({TUTORIAL_TRACKS.length})
            </button>
            <button
              onClick={() => setActiveTab('started')}
              className={`btn btn-sm ${activeTab === 'started' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <span
                className="badge badge-tutorial"
                style={{ padding: '0.1rem 0.45rem', fontSize: '0.7rem', marginRight: '0.35rem' }}
              >
                {startedCount} Active
              </span>
              <span>In Progress / Started</span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`btn btn-sm ${activeTab === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <span
                className="badge badge-neutral"
                style={{ padding: '0.1rem 0.45rem', fontSize: '0.7rem', marginRight: '0.35rem' }}
              >
                {completedCount} Done
              </span>
              <span>Completed</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`btn btn-sm ${activeTab === 'saved' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <span>Saved Tracks ({savedCount})</span>
            </button>
          </div>

          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span>Your Total Progress: <strong style={{ color: 'var(--brand-terracotta)' }}>65% Avg</strong></span>
            <span>•</span>
            <span>Time Spent: <strong>2h 15m</strong></span>
          </div>
        </div>

        {/* Tutorials Grid */}
        <div className="tutorial-grid">
          {filteredTracks.map(track => {
            const percent = Math.round((track.completedSteps / track.totalSteps) * 100);
            return (
              <article key={track.id} className="tutorial-card">
                <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                  <span className="badge badge-tutorial">{track.totalSteps} Steps • {track.duration}</span>
                  {track.status === 'started' && (
                    <span className="badge badge-dev" style={{ backgroundColor: 'rgba(249, 115, 22, 0.12)', color: 'var(--brand-terracotta)' }}>
                      In Progress ({percent}%)
                    </span>
                  )}
                  {track.status === 'completed' && (
                    <span className="badge badge-neutral" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--status-emerald)' }}>
                      Completed
                    </span>
                  )}
                  {track.status === 'saved' && (
                    <span className="badge badge-neutral">Saved</span>
                  )}
                </div>

                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-2)', lineHeight: 1.35 }}>
                  <Link href={`/tutorials/${track.slug}`}>{track.title}</Link>
                </h2>

                <p className="text-secondary" style={{ fontSize: '0.925rem', lineHeight: 1.6, flex: 1 }}>
                  {track.description}
                </p>

                {track.status === 'started' && (
                  <div style={{ margin: 'var(--space-5) 0 var(--space-2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      <span>Step {track.completedSteps} of {track.totalSteps} completed</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-sage)' }}>{percent}%</span>
                    </div>
                    <div className="tutorial-progress-mini">
                      <div
                        className="tutorial-progress-mini-bar"
                        style={{
                          width: `${percent}%`,
                          background: 'linear-gradient(90deg, var(--brand-terracotta), var(--accent-sage))'
                        }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  <span>{track.lastPracticed ? `Last practiced ${track.lastPracticed}` : `${track.level} Level`}</span>
                  <Link
                    href={`/tutorials/${track.slug}`}
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: 'var(--radius-full)' }}
                  >
                    <span>{track.status === 'started' ? 'Resume Track \u2192' : 'Start Track \u2192'}</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {filteredTracks.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-12) 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: 'var(--space-2)' }}>No tutorials found matching your filters.</p>
            <button
              onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
