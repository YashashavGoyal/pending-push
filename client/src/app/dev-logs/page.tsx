import Link from 'next/link';
import { fetchSpaceFeed } from '@/lib/api';

export const metadata = {
  title: 'Dev Logs — Pending Push',
  description: 'Technical deep-dives, RFC proposals, latency benchmarks, and low-level Node.js, Fastify, Rust, and Next.js logs.'
};

export default async function DevLogsPage() {
  const devLogs = await fetchSpaceFeed('dev-logs');
  const spotlight = devLogs.length > 0 ? devLogs[0] : null;
  const listLogs = devLogs.length > 1 ? devLogs.slice(1) : devLogs;

  return (
    <main className="page-wrapper">
      <div className="container">

        {/* Space Header */}
        <section className="space-header" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="space-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-dev">02 / Technical Notes &amp; RFCs</span>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Markdown, diffs &amp; benchmark telemetry</span>
            </div>
            <h1>Dev Logs</h1>
            <p>
              Technical deep-dives, RFC proposals, latency benchmarks, and low-level Node.js, Fastify, Rust, and Next.js logs.
            </p>
          </div>

          <div className="space-actions">
            <Link
              href="/studio"
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <span className="icon icon-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
              <span>Write Dev Log</span>
            </Link>
          </div>
        </section>

        {devLogs.length === 0 ? (
          <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', margin: 'var(--space-6) 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>⚡</div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>No Dev Logs Published Yet</h2>
            <p className="text-secondary" style={{ maxWidth: '440px', margin: '0 auto var(--space-4)', fontSize: '0.925rem' }}>
              The Dev Logs space is waiting for its first technical RFC, benchmark analysis, or git migration diff.
            </p>
            <Link href="/studio" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
              Open Studio &rarr;
            </Link>
          </div>
        ) : (
          <>
            {/* SPOTLIGHT TECHNICAL RFC BANNER */}
            {spotlight && (
              <article
                className="featured-story-card"
                style={{
                  padding: 'var(--space-5) var(--space-6)',
                  marginBottom: 'var(--space-6)',
                  borderLeft: '4px solid var(--brand-terracotta)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.35rem',
                    flexWrap: 'wrap',
                    gap: 'var(--space-2)'
                  }}
                >
                  <div className="featured-kicker" style={{ marginBottom: 0 }}>
                    <span>✦ Spotlight Technical RFC</span>
                    <span>•</span>
                    <span>{spotlight.tags.slice(0, 2).join(' & ') || 'Technical Notes'}</span>
                  </div>
                  <span className="badge badge-dev" style={{ fontSize: '0.725rem' }}>
                    {spotlight.readTime}
                  </span>
                </div>

                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    lineHeight: 1.35,
                    marginBottom: '0.4rem',
                    color: 'var(--text-main)'
                  }}
                >
                  <Link
                    href={`/dev-logs/${spotlight.slug}`}
                    style={{ color: 'inherit' }}
                  >
                    {spotlight.title}
                  </Link>
                </h2>

                <p
                  style={{
                    fontSize: '0.885rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55,
                    marginBottom: 'var(--space-4)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {spotlight.summary}
                </p>

                <div className="story-meta-row" style={{ fontSize: '0.8rem' }}>
                  <Link href={`/profile/${spotlight.author.username}`} className="story-author-chip">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="story-author-avatar"
                      src={spotlight.author.avatar}
                      alt={spotlight.author.name}
                    />
                    <span>{spotlight.author.name} ({spotlight.author.role})</span>
                  </Link>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <span>{spotlight.readTime}</span>
                    <span>•</span>
                    <span style={{ color: 'var(--brand-terracotta)', fontWeight: 600 }}>
                      {spotlight.relates} relates
                    </span>
                    <span>•</span>
                    <Link
                      href={`/dev-logs/${spotlight.slug}`}
                      className="btn btn-secondary btn-sm"
                      style={{
                        borderRadius: 'var(--radius-full)',
                        padding: '0.25rem 0.65rem',
                        fontSize: '0.775rem'
                      }}
                    >
                      <span>Read RFC &amp; Diff &rarr;</span>
                    </Link>
                  </div>
                </div>
              </article>
            )}

            {/* 2-COLUMN TECHNICAL PUBLICATION LAYOUT */}
            <div className="blog-layout">

              {/* LEFT COLUMN: DEV LOGS STREAM */}
              <div>

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
                  <button
                    className="topic-chip"
                    style={{
                      backgroundColor: 'var(--brand-terracotta-subtle)',
                      color: 'var(--brand-terracotta)',
                      borderColor: 'var(--brand-terracotta)',
                      fontWeight: 700
                    }}
                  >
                    All Logs ({devLogs.length})
                  </button>
                  <button className="topic-chip">Fastify 5.x</button>
                  <button className="topic-chip">Next.js 15</button>
                  <button className="topic-chip">Rust &amp; WASM</button>
                  <button className="topic-chip">TypeScript</button>
                  <button className="topic-chip">Benchmarks</button>
                </div>

                <div className="feed-stream">
                  {listLogs.map((log) => (
                    <article key={log.id} className="story-card">
                      <div>
                        <div className="story-kicker" style={{ color: 'var(--brand-terracotta)' }}>
                          {log.tags.length > 0 ? log.tags.join(' • ') : log.category}
                        </div>
                        <h3 className="story-title">
                          <Link href={`/dev-logs/${log.slug}`}>
                            {log.title}
                          </Link>
                        </h3>
                        <p className="story-excerpt">
                          {log.summary}
                        </p>
                        <div className="story-meta-row">
                          <Link href={`/profile/${log.author.username}`} className="story-author-chip">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              className="story-author-avatar"
                              src={log.author.avatar}
                              alt={log.author.name}
                            />
                            <span>{log.author.name}</span>
                          </Link>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <span>{log.readTime}</span>
                            <span>•</span>
                            <span style={{ color: 'var(--accent-sage)', fontWeight: 600 }}>
                              {log.relates} relates
                            </span>
                          </div>
                        </div>
                      </div>
                      {log.thumbnail && (
                        <div className="story-thumbnail">
                          <span style={{ fontWeight: 700, color: 'var(--brand-terracotta)' }}>{log.thumbnail.kicker}</span>
                          <span style={{ fontSize: '0.7rem', margin: '4px 0' }}>{log.thumbnail.subtext}</span>
                          <span>{log.thumbnail.badge}</span>
                        </div>
                      )}
                    </article>
                  ))}
                </div>

              </div>

              {/* RIGHT COLUMN: SIDEBAR */}
              <aside className="blog-sidebar">
                
                {/* 1. ACTIVE TECH STACK & SPECS */}
                <div className="sidebar-widget">
                  <div className="sidebar-title">
                    <span>Engine Stack</span>
                    <span className="badge badge-dev" style={{ fontSize: '0.65rem' }}>2026 Ready</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span className="text-muted">Transport</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Fastify 5.1</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span className="text-muted">Client</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Next.js 15 App Router</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span className="text-muted">Database</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>PostgreSQL + Drizzle</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                      <span className="text-muted">Types</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>TypeScript 5.7</span>
                    </div>
                  </div>
                </div>

                {/* 2. RECENT LOGS */}
                <div className="sidebar-widget">
                  <div className="sidebar-title">
                    <span>Recent Logs</span>
                  </div>
                  <div className="trending-list">
                    {devLogs.slice(0, 3).map((l, idx) => (
                      <div key={l.id} className="trending-item">
                        <span className="trending-number">0{idx + 1}</span>
                        <div className="trending-content">
                          <Link href={`/dev-logs/${l.slug}`} className="trending-headline">{l.title}</Link>
                          <span className="trending-byline">{l.author.name} • {l.readTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </aside>

            </div>
          </>
        )}

      </div>
    </main>
  );
}
