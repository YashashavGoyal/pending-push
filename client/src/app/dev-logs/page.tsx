import Link from 'next/link';
import { FEED_STORIES } from '@/lib/mock-data';

export const metadata = {
  title: 'Dev Logs — Pending Push',
  description: 'Technical deep-dives, RFC proposals, latency benchmarks, and low-level Node.js, Fastify, Rust, and Next.js logs.'
};

export default function DevLogsPage() {
  const devLogs = FEED_STORIES.filter(s => s.category === 'dev-log' || s.tags.some(t => ['Fastify5', 'Performance', 'Rust', 'Architecture'].includes(t)));

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
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search dev logs..."
                style={{ paddingLeft: '2.3rem', borderRadius: 'var(--radius-full)' }}
              />
              <span
                className="icon icon-sm"
                style={{
                  position: 'absolute',
                  left: '0.85rem',
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

        {/* COMPACT SPOTLIGHT TECHNICAL RFC BANNER */}
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
              <span>✦ Spotlight Technical RFC #42</span>
              <span>•</span>
              <span>Fastify 5.x &amp; Next.js 15</span>
            </div>
            <span className="badge badge-dev" style={{ fontSize: '0.725rem' }}>
              +3.8x Throughput Benchmark
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
              href="/dev-logs/fastify-5-nextjs-15-high-throughput"
              style={{ color: 'inherit' }}
            >
              Building High-Throughput Web Applications with Fastify 5 &amp; Next.js 15 Server Components
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
            A deep dive into schema compilation via TypeBox/Zod, eliminating JSON serialization bottlenecks, and pairing Next.js Server Components with Fastify for a 3.8x throughput increase with zero infrastructure cost.
          </p>

          <div className="story-meta-row" style={{ fontSize: '0.8rem' }}>
            <Link href="/profile/alexrivera" className="story-author-chip">
              <img
                className="story-author-avatar"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&q=80"
                alt="Alex"
              />
              <span>Alex Rivera (Staff Engineer)</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <span>7 min read</span>
              <span>•</span>
              <span style={{ color: 'var(--brand-terracotta)', fontWeight: 600 }}>
                642 upvotes
              </span>
              <span>•</span>
              <Link
                href="/dev-logs/fastify-5-nextjs-15-high-throughput"
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
                All Logs ({devLogs.length + 2})
              </button>
              <button className="topic-chip">Fastify 5.x</button>
              <button className="topic-chip">Next.js 15</button>
              <button className="topic-chip">Rust &amp; WASM</button>
              <button className="topic-chip">TypeScript 5.6</button>
              <button className="topic-chip">Autocannon Benchmarks</button>
            </div>

            <div className="feed-stream">

              {/* Dev Log 1 */}
              <article className="story-card">
                <div>
                  <div className="story-kicker" style={{ color: 'var(--brand-terracotta)' }}>
                    Fastify v5 &amp; Rust Buffers
                  </div>
                  <h3 className="story-title">
                    <Link href="/dev-logs/zero-copy-serialization-fastify-v5">
                      Zero-Copy Serialization in Fastify v5 with Avro and Native Structs
                    </Link>
                  </h3>
                  <p className="story-excerpt">
                    Profiling our high-throughput gateway indicated JSON.stringify consumed 38% of CPU cycles under heavy concurrency. Compiling schemas directly into static buffers boosted throughput by 3.1x.
                  </p>
                  <div className="story-meta-row">
                    <Link href="/profile/alexrivera" className="story-author-chip">
                      <img
                        className="story-author-avatar"
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&q=80"
                        alt="Alex"
                      />
                      <span>Alex Rivera</span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span>6 min read</span>
                      <span>•</span>
                      <span style={{ color: 'var(--accent-sage)', fontWeight: 600 }}>
                        +3.1x Speed
                      </span>
                      <span>•</span>
                      <span>184 upvotes</span>
                    </div>
                  </div>
                </div>
                <div className="story-thumbnail">
                  <span style={{ fontWeight: 700, color: 'var(--brand-terracotta)' }}>Latency: 1.2ms</span>
                  <span style={{ fontSize: '0.7rem', margin: '4px 0' }}>P99 Under Load</span>
                  <span>Zero-Copy Stream</span>
                </div>
              </article>

              {/* Dev Log 2 */}
              <article className="story-card">
                <div>
                  <div className="story-kicker" style={{ color: 'var(--accent-sage)' }}>
                    Clean Architecture / Node.js
                  </div>
                  <h3 className="story-title">
                    <Link href="/dev-logs/decoupling-business-logic">
                      Decoupling Business Logic with Repository Interfaces and In-Memory Fakes
                    </Link>
                  </h3>
                  <p className="story-excerpt">
                    Why unit testing against real databases slows down CI pipelines to a crawl, and how enforcing contract repository interfaces unlocked sub-second test suites.
                  </p>
                  <div className="story-meta-row">
                    <Link href="/profile/marcusv" className="story-author-chip">
                      <img
                        className="story-author-avatar"
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&q=80"
                        alt="Marcus"
                      />
                      <span>Marcus Vance</span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span>9 min read</span>
                      <span>•</span>
                      <span>312 upvotes</span>
                    </div>
                  </div>
                </div>
                <div className="story-thumbnail">
                  <span style={{ fontWeight: 700, color: 'var(--accent-sage)' }}>CI: 4.2s Total</span>
                  <span style={{ fontSize: '0.7rem', margin: '4px 0' }}>100% Mock Safe</span>
                  <span>Isolated Tests</span>
                </div>
              </article>

              {/* Dev Log 3 */}
              <article className="story-card">
                <div>
                  <div className="story-kicker" style={{ color: 'var(--accent-blue)' }}>
                    CSS Grid &amp; Next.js 15
                  </div>
                  <h3 className="story-title">
                    <Link href="/dev-logs/52-week-activity-heatmap-css-subgrid">
                      Building a 52-Week GitHub Style Heatmap in Pure CSS Subgrid
                    </Link>
                  </h3>
                  <p className="story-excerpt">
                    A breakdown of rendering 365 DOM day cells with zero heavy chart libraries, leveraging CSS Subgrid for responsive year-long activity matrix calculation.
                  </p>
                  <div className="story-meta-row">
                    <Link href="/profile/sarahc" className="story-author-chip">
                      <img
                        className="story-author-avatar"
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&q=80"
                        alt="Sarah"
                      />
                      <span>Sarah Chen</span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <span>5 min read</span>
                      <span>•</span>
                      <span>298 upvotes</span>
                    </div>
                  </div>
                </div>
                <div className="story-thumbnail">
                  <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>0 kB JS</span>
                  <span style={{ fontSize: '0.7rem', margin: '4px 0' }}>CSS Subgrid</span>
                  <span>Native Matrix</span>
                </div>
              </article>

            </div>

          </div>

          {/* RIGHT COLUMN: SIDEBAR */}
          <aside className="blog-sidebar">
            
            {/* 1. ACTIVE TECH STACK & SPECS */}
            <div className="sidebar-widget">
              <div className="sidebar-title">
                <span>Active Stack Specs</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '0.85rem' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Fastify Backend</span>
                  <span className="badge badge-dev">v5.1.0</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Next.js App Router</span>
                  <span className="badge badge-neutral">v15.1.0</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>TypeScript Engine</span>
                  <span className="badge badge-neutral">v5.7</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Redis Streams</span>
                  <span className="badge badge-tutorial">v7.2</span>
                </li>
              </ul>
            </div>

            {/* 2. BENCHMARK TELEMETRY LEADERBOARD */}
            <div className="sidebar-widget">
              <div className="sidebar-title">
                <span>Community Benchmarks</span>
              </div>
              <div className="trending-list">
                <div className="trending-item">
                  <span className="trending-number">01</span>
                  <div className="trending-content">
                    <Link href="/dev-logs/fastify-5-nextjs-15-high-throughput" className="trending-headline">
                      Fastify 5 + TypeBox Schema Compile
                    </Link>
                    <span className="trending-byline">52,400 req/sec • 1.1ms P99</span>
                  </div>
                </div>
                <div className="trending-item">
                  <span className="trending-number">02</span>
                  <div className="trending-content">
                    <Link href="/dev-logs/fastify-5-nextjs-15-high-throughput" className="trending-headline">
                      Express 4.x Legacy Baseline
                    </Link>
                    <span className="trending-byline">14,200 req/sec • 4.8ms P99</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. TOPICS CLOUD */}
            <div className="sidebar-widget">
              <div className="sidebar-title">
                <span>Technical Topics</span>
              </div>
              <div className="topic-cloud">
                <span className="topic-chip">#Fastify5</span>
                <span className="topic-chip">#Nextjs15</span>
                <span className="topic-chip">#RustBuffers</span>
                <span className="topic-chip">#Autocannon</span>
                <span className="topic-chip">#TypeScript</span>
                <span className="topic-chip">#ZeroCopy</span>
              </div>
            </div>

          </aside>

        </div>

      </div>
    </main>
  );
}
