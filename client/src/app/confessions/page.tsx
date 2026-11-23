'use client';

import { useState, useEffect } from 'react';
import { Confession } from '@/lib/types';
import { createPost, fetchConfessions } from '@/lib/api';

export default function ConfessionsPage() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'incidents' | 'imposter' | 'career' | 'latenight'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [newAlias, setNewAlias] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newCategory, setNewCategory] = useState<'incidents' | 'imposter' | 'career' | 'latenight'>('incidents');
  const [relatedIds, setRelatedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchConfessions().then(data => {
      setConfessions(data);
      setLoading(false);
    });
  }, []);

  const handleRelate = (id: string) => {
    setConfessions(prev =>
      prev.map(c => {
        if (c.id === id) {
          const isRelated = relatedIds[id];
          return {
            ...c,
            relates: isRelated ? c.relates - 1 : c.relates + 1
          };
        }
        return c;
      })
    );
    setRelatedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmitConfession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const categoryLabels: Record<string, string> = {
      incidents: 'Incidents & Production',
      imposter: 'Imposter Syndrome',
      career: 'Career & Team',
      latenight: 'Late Night Regrets'
    };

    const aliasName = newAlias.trim() || 'Anonymous Developer';

    const res = await createPost({
      title: `Confession: ${newMessage.trim().slice(0, 40)}...`,
      content: newMessage.trim(),
      format: 'confession',
      isAnonymous: true,
      summary: newMessage.trim().slice(0, 140)
    });

    const newConfession: Confession = {
      id: res.post?.id || `cf-${Date.now()}`,
      alias: aliasName,
      avatarIcon: 'fox',
      category: newCategory,
      categoryLabel: categoryLabels[newCategory],
      message: newMessage.trim(),
      timeAgo: 'Just now',
      relates: 1,
      commentsCount: 0
    };

    setConfessions(prev => [newConfession, ...prev]);
    setNewAlias('');
    setNewMessage('');
    setModalOpen(false);
  };

  const filteredConfessions = confessions.filter(c => {
    if (activeFilter === 'all') return true;
    return c.category === activeFilter;
  });

  return (
    <main className="page-wrapper">
      <div className="container">

        {/* Friendly Space Header */}
        <section className="space-header" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="space-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-confession">04 / The Uncommitted Corner</span>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>100% Anonymous &amp; Empathetic</span>
            </div>
            <h1>Confessions</h1>
            <p>
              A warm, judgment-free space to share production incidents, imposter syndrome, silent refactors, and honest engineering moments.
            </p>
          </div>

          <div className="space-actions">
            <button
              onClick={() => setModalOpen(true)}
              className="btn btn-primary btn-sm"
              style={{
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--accent-rose)',
                borderColor: 'var(--accent-rose)'
              }}
            >
              <span className="icon icon-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </span>
              <span>Write Confession</span>
            </button>
          </div>
        </section>

        {/* 2-COLUMN COMMUNITY LAYOUT */}
        <div className="blog-layout">

          {/* LEFT COLUMN: CONFESSIONS FEED */}
          <div>

            {/* Interactive Fast-Compose Prompt Box */}
            <div
              style={{
                backgroundColor: 'rgba(249, 115, 22, 0.03)',
                border: '1px dashed var(--brand-terracotta)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-6)',
                marginBottom: 'var(--space-6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-4)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--brand-terracotta-subtle)',
                    color: 'var(--brand-terracotta)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}
                >
                  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    Have an untold incident or quiet regret?
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    No usernames attached. 100% anonymous &amp; unindexed.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: 'var(--radius-full)', flexShrink: 0 }}
              >
                Share Anonymously &rarr;
              </button>
            </div>

            {/* Filter Pills */}
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-6)',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}
            >
              {[
                { key: 'all', label: `All Confessions (${confessions.length})` },
                { key: 'incidents', label: 'Incidents & Production' },
                { key: 'imposter', label: 'Imposter Syndrome' },
                { key: 'career', label: 'Career & Team' },
                { key: 'latenight', label: 'Late Night Regrets' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key as any)}
                  className="topic-chip"
                  style={{
                    backgroundColor: activeFilter === tab.key ? 'var(--accent-rose)' : undefined,
                    color: activeFilter === tab.key ? '#ffffff' : undefined,
                    borderColor: activeFilter === tab.key ? 'var(--accent-rose)' : undefined,
                    fontWeight: activeFilter === tab.key ? 700 : undefined
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Confessions Stream */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {loading ? (
                <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading uncommitted confessions...
                </div>
              ) : filteredConfessions.length === 0 ? (
                <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>🦊</div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>No Confessions Found</h3>
                  <p className="text-secondary" style={{ maxWidth: '420px', margin: '0 auto var(--space-4)', fontSize: '0.9rem' }}>
                    There are no uncommitted confessions in this filter yet. Be the first to anonymously share your story.
                  </p>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: 'var(--radius-full)' }}
                  >
                    Share First Confession &rarr;
                  </button>
                </div>
              ) : (
                filteredConfessions.map(confession => {
                const isRel = relatedIds[confession.id];
                return (
                  <article
                    key={confession.id}
                    className="card"
                    style={{
                      borderRadius: 'var(--radius-xl)',
                      padding: 'var(--space-6)',
                      border: '1px solid var(--border-card)',
                      transition: 'all var(--transition-normal)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: '2rem',
                            height: '2rem',
                            borderRadius: 'var(--radius-full)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'var(--accent-rose-subtle)',
                            color: 'var(--accent-rose)',
                            fontSize: '0.8rem',
                            fontWeight: 700
                          }}
                        >
                          🦊
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                          {confession.alias}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>• {confession.timeAgo}</span>
                      </div>
                      <span className="badge badge-confession">{confession.categoryLabel}</span>
                    </div>

                    <p style={{ fontSize: '0.975rem', lineHeight: 1.65, color: 'var(--text-main)', marginBottom: 'var(--space-4)', fontStyle: 'italic' }}>
                      &ldquo;{confession.message}&rdquo;
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)', fontSize: '0.825rem' }}>
                      <button
                        onClick={() => handleRelate(confession.id)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          borderRadius: 'var(--radius-full)',
                          color: isRel ? 'var(--accent-rose)' : undefined,
                          borderColor: isRel ? 'var(--accent-rose)' : undefined
                        }}
                      >
                        <span className="icon icon-sm">
                          <svg viewBox="0 0 24 24" fill={isRel ? 'currentColor' : 'none'} stroke="currentColor">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                          </svg>
                        </span>
                        <span>I Relate ({confession.relates})</span>
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
                        <span className="icon icon-sm">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                        </span>
                        <span>{confession.commentsCount} replies</span>
                      </div>
                    </div>
                  </article>
                );
              }))}
            </div>

          </div>

          {/* RIGHT COLUMN: SIDEBAR */}
          <aside className="blog-sidebar">
            
            {/* Safe Harbor Community Pledge */}
            <div className="sidebar-widget" style={{ borderLeft: '4px solid var(--accent-rose)' }}>
              <div className="sidebar-title">
                <span>Safe Harbor Pledge</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>
                This space operates on radical developer empathy. Every senior engineer has broken production, dropped tables, or felt out of place.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                <li>✓ 100% Anonymous &amp; Unindexed</li>
                <li>✓ No finger-pointing or harassment</li>
                <li>✓ Real stories, real recovery lessons</li>
              </ul>
            </div>

            {/* Trending Confessions */}
            <div className="sidebar-widget">
              <div className="sidebar-title">
                <span>Most Resonant Stories</span>
              </div>
              <div className="trending-list">
                <div className="trending-item">
                  <span className="trending-number" style={{ color: 'var(--accent-rose)' }}>01</span>
                  <div className="trending-content">
                    <span className="trending-headline">Merged 18 microservices back into a modular monolith...</span>
                    <span className="trending-byline">895 relates • 67 replies</span>
                  </div>
                </div>
                <div className="trending-item">
                  <span className="trending-number" style={{ color: 'var(--accent-rose)' }}>02</span>
                  <div className="trending-content">
                    <span className="trending-headline">Still googling flexbox vs grid as a Staff Engineer...</span>
                    <span className="trending-byline">382 relates • 24 replies</span>
                  </div>
                </div>
              </div>
            </div>

          </aside>

        </div>

      </div>

      {/* CONFESSION SUBMISSION MODAL */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(18, 21, 28, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: 'var(--space-4)'
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '520px',
              width: '100%',
              padding: 'var(--space-8)',
              boxShadow: 'var(--shadow-popup)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Post Anonymous Confession
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="btn-icon"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitConfession} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                  Anonymous Pseudonym (Optional)
                </label>
                <input
                  type="text"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Quiet Architect, Midnight Deployer"
                  style={{ borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="form-input"
                  style={{ borderRadius: 'var(--radius-md)' }}
                >
                  <option value="incidents">Incidents &amp; Production</option>
                  <option value="imposter">Imposter Syndrome</option>
                  <option value="career">Career &amp; Team</option>
                  <option value="latenight">Late Night Regrets</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                  Your Confession
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="form-input"
                  rows={4}
                  placeholder="What happened? What did you learn? No judgments here..."
                  required
                  style={{ borderRadius: 'var(--radius-md)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--accent-rose)',
                    borderColor: 'var(--accent-rose)'
                  }}
                >
                  Post Anonymously
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
