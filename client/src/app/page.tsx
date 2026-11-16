import Link from 'next/link';
import { fetchFeed } from '@/lib/api';

export default async function HomePage() {
  const { featured, stories } = await fetchFeed();

  return (
    <main className="page-wrapper">
      <div className="container">
        
        {/* 2-COLUMN EDITORIAL BLOG GRID (Main Feed + Sidebar) */}
        <div className="blog-layout">

          {/* LEFT COLUMN: FEATURED STORY & STORIES STREAM */}
          <div>

            {/* 1. FEATURED STORY OF THE WEEK */}
            <article className="featured-story-card">
              <div className="featured-kicker">
                <span>✦ Featured Publication</span>
                <span>•</span>
                <span>Architecture & Craft</span>
              </div>
              
              <h1 className="featured-title">
                <Link href={`/articles/${featured.slug}`}>
                  {featured.title}
                </Link>
              </h1>

              <p className="featured-summary">
                {featured.summary}
              </p>

              <div className="story-meta-row">
                <Link href={`/profile/${featured.author.username}`} className="story-author-chip">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="story-author-avatar" src={featured.author.avatar} alt={featured.author.name} />
                  <span>{featured.author.name} (@{featured.author.username})</span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <span>{featured.readTime}</span>
                  <span>•</span>
                  <span style={{ color: 'var(--brand-terracotta)', fontWeight: 600 }}>{featured.relates} relates</span>
                  <span>•</span>
                  <span className="icon icon-sm" style={{ color: 'var(--text-muted)', cursor: 'pointer' }} title="Bookmark Story">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                    </svg>
                  </span>
                </div>
              </div>
            </article>

            {/* 2. PUBLICATION CHANNEL TABS & STREAM HEADER */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
              flexWrap: 'wrap',
              gap: 'var(--space-3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)', marginRight: 'var(--space-2)' }}>Latest Pushes</span>
                <Link href="/articles" className="topic-chip" style={{ fontWeight: 600 }}>Articles</Link>
                <Link href="/dev-logs" className="topic-chip" style={{ fontWeight: 600 }}>Dev Logs</Link>
                <Link href="/tutorials" className="topic-chip" style={{ fontWeight: 600 }}>Tutorials</Link>
                <Link href="/confessions" className="topic-chip" style={{ fontWeight: 600 }}>Confessions</Link>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                4 Dedicated Spaces
              </div>
            </div>

            {/* 3. STORIES FEED */}
            <div className="feed-stream">
              {stories.map((story) => (
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
                        <span>•</span>
                        <span className="icon icon-sm" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>

                  {story.thumbnail && (
                    <div className="story-thumbnail">
                      <span style={{ fontWeight: 700, color: 'var(--brand-terracotta)' }}>{story.thumbnail.kicker}</span>
                      <span style={{ fontSize: '0.7rem', margin: '4px 0' }}>{story.thumbnail.subtext}</span>
                      <span>{story.thumbnail.badge}</span>
                    </div>
                  )}
                </article>
              ))}
            </div>

          </div>

          {/* RIGHT COLUMN: PUBLICATION SIDEBAR */}
          <aside className="blog-sidebar">
            
            {/* 1. TRENDING PUSHES */}
            <div className="sidebar-widget">
              <div className="sidebar-title">
                <span>Trending Pushes</span>
                <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>This Week</span>
              </div>
              <div className="trending-list">
                <div className="trending-item">
                  <span className="trending-number">01</span>
                  <div className="trending-content">
                    <Link href="/dev-logs/zero-copy-serialization-fastify-v5" className="trending-headline">
                      Zero-Copy Serialization in Fastify v5 with Avro & Rust
                    </Link>
                    <span className="trending-byline">Alex Rivera • 6 min read</span>
                  </div>
                </div>

                <div className="trending-item">
                  <span className="trending-number">02</span>
                  <div className="trending-content">
                    <Link href="/confessions" className="trending-headline">
                      We quietly merged 18 microservices back into a modular repo
                    </Link>
                    <span className="trending-byline">Anonymous Dev • 895 relates</span>
                  </div>
                </div>

                <div className="trending-item">
                  <span className="trending-number">03</span>
                  <div className="trending-content">
                    <Link href="/articles/art-of-code-simplicity" className="trending-headline">
                      The Architecture Decision Records (ADRs) That Saved Our Team
                    </Link>
                    <span className="trending-byline">Marcus Vance • 8 min read</span>
                  </div>
                </div>

                <div className="trending-item">
                  <span className="trending-number">04</span>
                  <div className="trending-content">
                    <Link href="/tutorials" className="trending-headline">
                      Building High-Performance Public Insights Heatmap in CSS Subgrid
                    </Link>
                    <span className="trending-byline">Sarah Chen • 4-step track</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. CURATED TOPICS */}
            <div className="sidebar-widget">
              <div className="sidebar-title">
                <span>Curated Topics</span>
              </div>
              <div className="topic-cloud">
                <Link href="/dev-logs" className="topic-chip">#Architecture</Link>
                <Link href="/dev-logs" className="topic-chip">#Fastify5</Link>
                <Link href="/dev-logs" className="topic-chip">#Rust</Link>
                <Link href="/dev-logs" className="topic-chip">#Nextjs15</Link>
                <Link href="/articles" className="topic-chip">#Leadership</Link>
                <Link href="/confessions" className="topic-chip">#PostMortem</Link>
                <Link href="/tutorials" className="topic-chip">#RedisStreams</Link>
                <Link href="/articles" className="topic-chip">#CleanCode</Link>
              </div>
            </div>

            {/* 3. SPOTLIGHT MASTERCLASS */}
            <div className="sidebar-widget" style={{ borderLeft: '4px solid var(--accent-sage)' }}>
              <div className="sidebar-title" style={{ color: 'var(--accent-sage)' }}>
                <span>Staff Pick Masterclass</span>
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem', lineHeight: 1.35 }}>
                <Link href="/tutorials/fastify-redis-streams">
                  Building Resilient Real-Time Microservices with Fastify 5 & Redis Streams
                </Link>
              </h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
                Includes interactive checklist syllabus, backpressure tuning, and live code runners.
              </p>
              <Link href="/tutorials/fastify-redis-streams" className="btn btn-secondary btn-sm" style={{ width: '100%', borderRadius: 'var(--radius-full)' }}>
                <span>Resume Track (Step 3 of 5) →</span>
              </Link>
            </div>

            {/* 4. DISPATCH NEWSLETTER */}
            <div className="sidebar-widget">
              <div className="sidebar-title">
                <span>The Engineering Dispatch</span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 'var(--space-4)' }}>
                Join 14,000 developers reading our weekly curated retrospective of architecture breakthroughs and dev post-mortems.
              </p>
              <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="developer@company.com"
                  required
                  style={{ fontSize: '0.825rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)' }}
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
                  Subscribe Free
                </button>
              </form>
            </div>

          </aside>

        </div>

      </div>
    </main>
  );
}
