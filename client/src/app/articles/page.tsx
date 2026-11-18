import Link from 'next/link';
import { fetchFeed } from '@/lib/api';

export default async function ArticlesPage() {
  const { featured, stories } = await fetchFeed();
  const articles = stories.filter(s => s.category === 'article' || s.category === 'tutorial');

  return (
    <main className="page-wrapper">
      <div className="container">
        
        {/* Space Header */}
        <section className="space-header" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="space-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-neutral">01 / Long-form Essays</span>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Thoughtful reading space</span>
            </div>
            <h1>Articles</h1>
            <p>
              Warm, long-form essays on software systems design, cognitive stamina, asynchronous workflows, and technical leadership.
            </p>
          </div>

          <div className="space-actions">
            <Link href="/studio" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
              <span className="icon icon-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
              <span>Write Essay</span>
            </Link>
          </div>
        </section>

        {/* Featured Read Hero */}
        <article className="featured-story-card">
          <div className="featured-kicker">
            <span>✦ Featured Read of the Month</span>
            <span>•</span>
            <span>Productivity & Deep Work</span>
          </div>
          
          <h2 className="featured-title">
            <Link href={`/articles/${featured.slug}`}>
              {featured.title}
            </Link>
          </h2>

          <p className="featured-summary">
            {featured.summary}
          </p>

          <div className="story-meta-row">
            <Link href={`/profile/${featured.author.username}`} className="story-author-chip">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="story-author-avatar" src={featured.author.avatar} alt={featured.author.name} />
              <span>{featured.author.name} ({featured.author.role})</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <span>{featured.readTime}</span>
              <span>•</span>
              <span style={{ color: 'var(--brand-terracotta)', fontWeight: 600 }}>{featured.relates} relates</span>
            </div>
          </div>
        </article>

        {/* 2-COLUMN EDITORIAL LAYOUT */}
        <div className="blog-layout">

          {/* LEFT: ESSAYS STREAM */}
          <div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="topic-chip" style={{ backgroundColor: 'var(--brand-terracotta-subtle)', color: 'var(--brand-terracotta)', borderColor: 'var(--brand-terracotta)', fontWeight: 700 }}>All Essays</button>
              <button className="topic-chip">Productivity & Focus</button>
              <button className="topic-chip">Systems & Architecture</button>
              <button className="topic-chip">Culture & Leadership</button>
            </div>

            <div className="feed-stream">
              {articles.map((article) => (
                <article key={article.id} className="story-card">
                  <div>
                    <div className="story-kicker">{article.tags.join(' • ')}</div>
                    <h3 className="story-title">
                      <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <p className="story-excerpt">{article.summary}</p>
                    <div className="story-meta-row">
                      <Link href={`/profile/${article.author.username}`} className="story-author-chip">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="story-author-avatar" src={article.author.avatar} alt={article.author.name} />
                        <span>{article.author.name}</span>
                      </Link>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span>{article.readTime}</span>
                        <span>•</span>
                        <span>{article.relates} relates</span>
                      </div>
                    </div>
                  </div>
                  {article.thumbnail && (
                    <div className="story-thumbnail">
                      <span style={{ fontWeight: 700, color: 'var(--brand-terracotta)' }}>{article.thumbnail.kicker}</span>
                      <span style={{ fontSize: '0.7rem', margin: '4px 0' }}>{article.thumbnail.subtext}</span>
                      <span>{article.thumbnail.badge}</span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>

          {/* RIGHT: CURATED SIDEBAR */}
          <aside className="blog-sidebar">
            <div className="sidebar-widget">
              <div className="sidebar-title">
                <span>Curated Reading Tracks</span>
              </div>
              <div className="trending-list">
                <div className="trending-item">
                  <span className="trending-number">01</span>
                  <div className="trending-content">
                    <Link href={`/articles/${featured.slug}`} className="trending-headline">The Senior Architect&apos;s Syllabus</Link>
                    <span className="trending-byline">4 essays • Curated by Marcus</span>
                  </div>
                </div>
                <div className="trending-item">
                  <span className="trending-number">02</span>
                  <div className="trending-content">
                    <Link href={`/articles/${featured.slug}`} className="trending-headline">Deep Work & Focus Systems</Link>
                    <span className="trending-byline">3 essays • Curated by Elena</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sidebar-widget">
              <div className="sidebar-title">
                <span>Article Topics</span>
              </div>
              <div className="topic-cloud">
                <span className="topic-chip">#Productivity</span>
                <span className="topic-chip">#Architecture</span>
                <span className="topic-chip">#Leadership</span>
                <span className="topic-chip">#RemoteWork</span>
                <span className="topic-chip">#CleanCode</span>
              </div>
            </div>
          </aside>

        </div>

      </div>
    </main>
  );
}
