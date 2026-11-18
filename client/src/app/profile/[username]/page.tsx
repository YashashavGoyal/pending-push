import Link from 'next/link';
import FollowButton from '@/Components/FollowButton';

interface ProfileProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfileProps) {
  const { username } = await params;
  return {
    title: `${username} — Pending Push Developer Profile`,
    description: `Public developer profile and readership insights for ${username}.`
  };
}

export default async function ProfilePage({ params }: ProfileProps) {
  const { username } = await params;

  return (
    <main className="page-wrapper">
      <div className="container">

        {/* Friendly Profile Bio Card */}
        <section className="card" style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-6)' }}>
            
            <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center', flexWrap: 'wrap' }}>
              <img
                style={{ width: '5.5rem', height: '5.5rem', borderRadius: '999px', objectFit: 'cover', border: '3px solid var(--brand-terracotta)' }}
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                alt="Alex Rivera"
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'var(--font-display)', margin: 0 }}>Alex Rivera</h1>
                  <span className="badge badge-dev">Staff Engineer</span>
                  <span className="badge badge-neutral">✓ Verified Dev</span>
                </div>
                <div style={{ fontSize: '0.885rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                  @{username || 'alexrivera'} • San Francisco, CA
                </div>
                
                <p style={{ color: 'var(--text-secondary)', maxWidth: '620px', fontSize: '0.95rem', marginTop: '0.6rem', lineHeight: 1.6 }}>
                  Staff Engineer &amp; Technical Writer. Building modern full-stack systems with Fastify and Next.js 15. Open source contributor and architecture advocate. Sharing notes over coffee.
                </p>

                <div style={{ display: 'flex', gap: 'var(--space-5)', marginTop: 'var(--space-4)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span><strong style={{ color: 'var(--text-main)' }}>1,240</strong> Followers</span>
                  <span><strong style={{ color: 'var(--text-main)' }}>189</strong> Following</span>
                  <span><a href="#" style={{ color: 'var(--brand-terracotta)', fontWeight: 600 }}>alexrivera.dev</a></span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <FollowButton authorId={username || 'alexrivera'} initialFollowers={1240} />
              <Link href="/settings" className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>Edit Profile</Link>
            </div>

          </div>
        </section>

        {/* PUBLIC INSIGHTS SECTION */}
        <section className="heatmap-container" style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-tutorial">Public Insights Active</span>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Transparent community engagement</span>
              </div>
              <h2 className="title-section" style={{ marginTop: '0.35rem', marginBottom: 0 }}>Community Impact &amp; Readership</h2>
            </div>
            <span className="text-muted" style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>trailing 52 weeks</span>
          </div>

          {/* Metric KPI Tiles */}
          <div className="insights-overview-grid" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="metric-tile">
              <div className="metric-tile-title">Total Article Reads</div>
              <div className="metric-tile-number" style={{ color: 'var(--brand-terracotta)' }}>142.8K</div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>12.4K hours spent reading</div>
            </div>

            <div className="metric-tile">
              <div className="metric-tile-title">Reader Upvotes</div>
              <div className="metric-tile-number" style={{ color: 'var(--accent-rose)' }}>6,890</div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>98.4% positive sentiment</div>
            </div>

            <div className="metric-tile">
              <div className="metric-tile-title">Tutorial Completions</div>
              <div className="metric-tile-number" style={{ color: 'var(--accent-sage)' }}>1,450</div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>Across 4 learning tracks</div>
            </div>

            <div className="metric-tile">
              <div className="metric-tile-title">Audience Retention</div>
              <div className="metric-tile-number" style={{ color: 'var(--brand-terracotta)' }}>78.2%</div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>Read past 80% mark</div>
            </div>
          </div>

          {/* 52-Week Activity Heatmap */}
          <div>
            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <span>Publishing &amp; Contribution Frequency</span>
              <span className="text-muted" style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>Less ■ ■ ■ ■ More</span>
            </div>

            <div className="activity-grid-52">
              <div className="activity-cell lvl-1" /><div className="activity-cell lvl-2" /><div className="activity-cell lvl-4" /><div className="activity-cell lvl-3" /><div className="activity-cell lvl-1" /><div className="activity-cell" /><div className="activity-cell lvl-2" /><div className="activity-cell lvl-4" /><div className="activity-cell lvl-2" /><div className="activity-cell lvl-1" /><div className="activity-cell lvl-3" /><div className="activity-cell lvl-4" /><div className="activity-cell lvl-2" /><div className="activity-cell lvl-3" /><div className="activity-cell lvl-4" /><div className="activity-cell lvl-1" /><div className="activity-cell lvl-3" /><div className="activity-cell lvl-4" /><div className="activity-cell lvl-2" /><div className="activity-cell lvl-1" /><div className="activity-cell" /><div className="activity-cell lvl-3" /><div className="activity-cell lvl-4" /><div className="activity-cell lvl-4" /><div className="activity-cell lvl-3" /><div className="activity-cell lvl-2" />
              <div className="activity-cell lvl-2" /><div className="activity-cell lvl-3" /><div className="activity-cell lvl-1" /><div className="activity-cell lvl-4" /><div className="activity-cell lvl-2" /><div className="activity-cell lvl-3" /><div className="activity-cell lvl-4" /><div className="activity-cell lvl-1" /><div className="activity-cell" /><div className="activity-cell lvl-3" /><div className="activity-cell lvl-2" /><div className="activity-cell lvl-4" /><div className="activity-cell lvl-1" /><div className="activity-cell lvl-3" /><div className="activity-cell lvl-4" /><div className="activity-cell lvl-2" /><div className="activity-cell lvl-4" /><div className="activity-cell lvl-3" /><div className="activity-cell lvl-2" /><div className="activity-cell lvl-1" /><div className="activity-cell lvl-4" /><div className="activity-cell lvl-2" /><div className="activity-cell lvl-3" /><div className="activity-cell lvl-1" /><div className="activity-cell lvl-4" /><div className="activity-cell lvl-3" />
            </div>
          </div>
        </section>

        {/* Published Work Stream */}
        <section>
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-5)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-2)' }}>
            <span style={{ fontWeight: 700, color: 'var(--brand-terracotta)', fontSize: '1rem', borderBottom: '2px solid var(--brand-terracotta)', paddingBottom: '0.5rem', cursor: 'pointer' }}>Published Pushes (28)</span>
            <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '1rem', cursor: 'pointer' }}>Tutorials (4)</span>
            <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '1rem', cursor: 'pointer' }}>About Alex</span>
          </div>

          <div className="feed-stream">
            <article className="story-card">
              <div>
                <div className="story-kicker" style={{ color: 'var(--brand-terracotta)' }}>dev-logs • Fastify / Next.js 15</div>
                <h3 className="story-title">
                  <Link href="/dev-logs/fastify-5-nextjs-15-high-throughput">
                    Building High-Throughput Web Applications with Fastify and Next.js 15
                  </Link>
                </h3>
                <p className="story-excerpt">
                  A deep dive into schema compilation via TypeBox/Zod, eliminating JSON serialization bottlenecks, and pairing Next.js Server Components with Fastify for a 3.8x throughput increase.
                </p>
                <div className="story-meta-row">
                  <span>Nov 15, 2026</span>
                  <span>•</span>
                  <span>7 min read</span>
                  <span>•</span>
                  <span style={{ color: 'var(--brand-terracotta)', fontWeight: 600 }}>642 upvotes</span>
                </div>
              </div>
            </article>

            <article className="story-card">
              <div>
                <div className="story-kicker" style={{ color: 'var(--accent-sage)' }}>tutorials • CSS Grid / UI</div>
                <h3 className="story-title">
                  <Link href="/tutorials/fastify-redis-streams">
                    Building a High-Performance Public Insights Heatmap from Scratch
                  </Link>
                </h3>
                <p className="story-excerpt">
                  Learn how to visualize readership activity grids using pure CSS Grid, minimal DOM memory overhead, and Fastify aggregation endpoints.
                </p>
                <div className="story-meta-row">
                  <span>Nov 08, 2026</span>
                  <span>•</span>
                  <span>4 Steps • 25 mins</span>
                  <span>•</span>
                  <span style={{ color: 'var(--accent-sage)', fontWeight: 600 }}>1,450 completions</span>
                </div>
              </div>
            </article>
          </div>
        </section>

      </div>
    </main>
  );
}
