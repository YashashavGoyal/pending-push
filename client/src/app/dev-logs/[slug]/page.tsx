import Link from 'next/link';
import StoryInteractions from '@/Components/StoryInteractions';
import StoryComments from '@/Components/StoryComments';
import { fetchPostBySlug } from '@/lib/api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);
  return {
    title: `${post?.title || slug} — Pending Push Dev Log`,
    description: post?.summary || 'Technical notes, architectural RFCs, latency benchmarks, and code diffs.'
  };
}

export default async function DevLogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);
  const postId = post?.id || `devlog-${slug}`;
  const postTitle = post?.title || 'Building High-Throughput Web Applications with Fastify 5 and Next.js 15';
  const authorName = post?.author?.name || 'Alex Rivera';
  const authorAvatar = post?.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80';
  const relatesCount = post?.relates || 642;
  const readTime = post?.readTime || '7 min read';
  const publishedAt = post?.publishedAt || 'Nov 15, 2026';

  return (
    <main className="page-wrapper">
      <div className="container">

        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-4)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Link href="/dev-logs">Dev Logs</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-main)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {postTitle}
          </span>
        </div>

        <div className="dev-view-grid">
          
          {/* Left: Technical Article */}
          <article>
            
            <header style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
                <span className="badge badge-dev">{post?.category || 'benchmarks'}</span>
                {post?.tags && post.tags.length > 0 ? (
                  post.tags.map((t) => (
                    <span key={t} className="badge badge-neutral">{t}</span>
                  ))
                ) : (
                  <>
                    <span className="badge badge-neutral">Fastify 5.x</span>
                    <span className="badge badge-neutral">Next.js 15</span>
                    <span className="badge badge-neutral">TypeScript</span>
                  </>
                )}
              </div>

              <h1 className="title-page" style={{ fontSize: 'clamp(1.85rem, 3vw, 2.45rem)', marginBottom: 'var(--space-3)' }}>
                {postTitle}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', fontSize: '0.825rem', color: 'var(--text-muted)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    style={{ width: '1.75rem', height: '1.75rem', borderRadius: '999px', objectFit: 'cover' }}
                    src={authorAvatar}
                    alt={authorName}
                  />
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{authorName}</span>
                  <span>•</span>
                  <span>{readTime}</span>
                  <span>•</span>
                  <span>{publishedAt}</span>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <StoryInteractions
                    postId={postId}
                    slug={slug}
                    title={postTitle}
                    initialRelates={relatesCount}
                    showShare={false}
                    layout="row"
                  />
                </div>
              </div>
            </header>

            {/* Technical Content */}
            <div className="prose">
              {post?.content ? (
                post.content.split('\n\n').map((block, idx) => {
                  const trimmed = block.trim();
                  if (trimmed.startsWith('## ')) {
                    return <h2 key={idx}>{trimmed.replace('## ', '')}</h2>;
                  }
                  if (trimmed.startsWith('> ')) {
                    return <blockquote key={idx}>{trimmed.replace('> ', '')}</blockquote>;
                  }
                  if (trimmed.startsWith('```')) {
                    return (
                      <div key={idx} className="code-container" style={{ margin: 'var(--space-4) 0' }}>
                        <pre className="code-pre">
                          <code>{trimmed.replace(/```[a-z]*\n?/g, '')}</code>
                        </pre>
                      </div>
                    );
                  }
                  return <p key={idx}>{trimmed}</p>;
                })
              ) : (
                <>
                  <p>
                    Node.js backends frequently bottleneck on JSON serialization overhead and bloated middleware chains. By pairing <strong>Fastify 5.x</strong> with schema compilation via TypeBox/Zod and <strong>Next.js 15 Server Components</strong>, we achieved a <strong>3.8x throughput increase</strong> with zero extra cloud infrastructure.
                  </p>

                  <h2 id="architecture">1. Layered Architecture Contract</h2>
                  <p>
                    To maintain absolute decoupling between HTTP transport and business logic, we enforce a strict 4-tier structure:
                  </p>

                  <div className="code-container">
                    <div className="code-toolbar">
                      <span>typescript • src/routes/post.routes.ts</span>
                      <button className="code-copy-action">
                        <span className="icon icon-sm">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                        </span>
                        <span>Copy</span>
                      </button>
                    </div>
                    <pre className="code-pre">
                      <code>{`import { FastifyInstance } from 'fastify';
import { PostController } from '../controllers/post.controller';
import { authPreHandler } from '../middleware/auth.middleware';

export const registerPostRoutes = (fastify: FastifyInstance, controller: PostController): void => {
  fastify.post('/new', { preHandler: [authPreHandler] }, controller.create);
  fastify.get('/feed', controller.getFeed);
};`}</code>
                    </pre>
                  </div>

                  <h2 id="diff-comparison">2. Git Migration Diff</h2>
                  <p>
                    Notice how clean Fastify&apos;s plugin registration is compared to legacy router mounting:
                  </p>

                  <div className="code-container">
                    <div className="code-toolbar">
                      <span>diff • server.ts Migration</span>
                      <button className="code-copy-action">
                        <span className="icon icon-sm">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                        </span>
                        <span>Copy</span>
                      </button>
                    </div>
                    <pre className="code-pre" style={{ padding: '0.5rem 0' }}>
                      <div className="diff-line diff-del">- app.use(express.json());</div>
                      <div className="diff-line diff-del">- app.use(&apos;/api/posts&apos;, postRoutes);</div>
                      <div className="diff-line diff-add">+ await fastify.register(fastifySwagger);</div>
                      <div className="diff-line diff-add">+ await fastify.register(registerPostRoutes, {'{'} prefix: &apos;/api/posts&apos; {'}'});</div>
                    </pre>
                  </div>

                  <h2 id="benchmarks">3. Autocannon Benchmark Results</h2>
                  <div className="card" style={{ margin: 'var(--space-4) 0', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '0.5rem' }}>METRIC</th>
                          <th style={{ padding: '0.5rem' }}>LEGACY CLIENT</th>
                          <th style={{ padding: '0.5rem', color: 'var(--status-emerald)' }}>FASTIFY + NEXT.JS 15</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.5rem' }}>Req/Sec (100 Concurrency)</td>
                          <td style={{ padding: '0.5rem' }}>14,200</td>
                          <td style={{ padding: '0.5rem', color: 'var(--status-emerald)', fontWeight: 700 }}>52,400 (+269%)</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.5rem' }}>Latency (P99)</td>
                          <td style={{ padding: '0.5rem' }}>4.8 ms</td>
                          <td style={{ padding: '0.5rem', color: 'var(--status-emerald)', fontWeight: 700 }}>1.1 ms (-77%)</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '0.5rem' }}>Memory Footprint (RSS)</td>
                          <td style={{ padding: '0.5rem' }}>180 MB</td>
                          <td style={{ padding: '0.5rem', color: 'var(--status-emerald)', fontWeight: 700 }}>68 MB (-62%)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h2 id="takeaways">4. Key Architectural Takeaways</h2>
                  <p>
                    Server-rendered RSCs handle data retrieval directly on the server without client watermarking, making initial page transitions lightning fast. Combined with Fastify’s low-overhead JSON serialization, the entire application feels instant.
                  </p>
                </>
              )}
            </div>

            {/* Bottom Interactions Bar */}
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
                postId={postId}
                slug={slug}
                title={postTitle}
                initialRelates={relatesCount}
                showShare={true}
                layout="bar"
              />
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Link href="/dev-logs" className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>← Back to Dev Logs</Link>
              </div>
            </div>

            {/* Threaded Discussion Section */}
            <StoryComments postId={postId} />
          </article>

          {/* Right: Sticky Table of Contents & Metadata */}
          <aside>
            <div style={{ position: 'sticky', top: '5.5rem', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              
              <div className="sidebar-widget">
                <div className="sidebar-title">
                  <span>On This Page</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: '0.85rem' }}>
                  <li><a href="#architecture" style={{ color: 'var(--text-secondary)' }}>1. Layered Architecture Contract</a></li>
                  <li><a href="#diff-comparison" style={{ color: 'var(--text-secondary)' }}>2. Git Migration Diff</a></li>
                  <li><a href="#benchmarks" style={{ color: 'var(--text-secondary)' }}>3. Autocannon Benchmark Results</a></li>
                  <li><a href="#takeaways" style={{ color: 'var(--text-secondary)' }}>4. Key Architectural Takeaways</a></li>
                </ul>
              </div>

              <div className="sidebar-widget">
                <div className="sidebar-title">
                  <span>Tech Specs</span>
                </div>
                <div style={{ fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                  <div>Node Engine: <code>v22.16.0</code></div>
                  <div>Fastify: <code>5.1.0</code></div>
                  <div>Next.js: <code>15.1.0</code></div>
                  <div>Benchmark Tool: <code>autocannon 7.15</code></div>
                </div>
              </div>

            </div>
          </aside>

        </div>

      </div>
    </main>
  );
}
