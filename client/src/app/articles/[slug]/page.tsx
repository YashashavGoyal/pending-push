import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPostBySlug } from '@/lib/api';
import StoryInteractions from '@/Components/StoryInteractions';
import StoryComments from '@/Components/StoryComments';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticleReaderPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="page-wrapper">
      <div className="container-narrow">
        
        <article>
          {/* Header */}
          <header style={{ marginBottom: 'var(--space-8)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span className="badge badge-neutral">editorial</span>
              <span>Productivity • {post.readTime} • {post.publishedAt}</span>
            </div>

            <h1 className="title-page" style={{ fontSize: 'clamp(2rem, 3.2vw, 2.75rem)', lineHeight: 1.25, marginBottom: 'var(--space-4)' }}>
              {post.title}
            </h1>

            <p className="text-secondary" style={{ fontSize: '1.15rem', lineHeight: 1.65, marginBottom: 'var(--space-6)' }}>
              {post.summary}
            </p>

            {/* Author Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-4) 0',
              borderTop: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: 'var(--space-3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-full)', objectFit: 'cover' }} src={post.author.avatar} alt={post.author.name} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{post.author.name}</div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{post.author.role || 'Staff Engineer'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <StoryInteractions
                  postId={post.id}
                  slug={post.slug}
                  title={post.title}
                  initialRelates={post.relates}
                  showShare={false}
                  layout="row"
                />
              </div>
            </div>
          </header>

          {/* Prose Reading Content */}
          <div className="prose" style={{ fontSize: '1.125rem', lineHeight: 1.85, color: 'var(--text-main)' }}>
            <p>
              It is 2:15 PM on a Wednesday. You just opened your code editor, reproduced a subtle race condition in your staging environment, and began formulating an elegant fix in your head. 
            </p>

            <p>
              Then, an instant ping rings: <em>&quot;Hey, do you have a quick 2 minutes?&quot;</em>
            </p>

            <p>
              That &quot;quick 2 minutes&quot; is never two minutes. Even if the answer is trivial, the neurobiological cost of severing that train of thought is immense. Research shows it takes an average of 23 minutes and 15 seconds to return to the original mental state after an interruption.
            </p>

            <blockquote>
              &quot;Focus is not something you sit down and turn on like a tap. Focus is an ecosystem you fiercely defend against well-meaning distractions.&quot;
            </blockquote>

            <h2>The Myth of the 10x Multitasker</h2>
            <p>
              In high-growth startups, there is often an unspoken badge of honor awarded to the person who responds to every chat message within 30 seconds. But rapid response times and deep engineering throughput are in direct conflict.
            </p>

            <p>
              When engineers are subjected to constant micro-pings, they naturally adapt by avoiding complex tasks. Subconsciously, knowing you will be interrupted within 15 minutes prevents you from tackling intricate refactors, difficult concurrency bugs, or high-leverage architectural designs.
            </p>
          </div>

          {/* Claps & Share Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-5) 0',
            marginTop: 'var(--space-8)',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: 'var(--space-3)'
          }}>
            <StoryInteractions
              postId={post.id}
              slug={post.slug}
              title={post.title}
              initialRelates={post.relates}
              showShare={true}
              layout="bar"
            />
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Link href="/articles" className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>← Back to Articles</Link>
            </div>
          </div>

          {/* Threaded Discussion Section */}
          <StoryComments postId={post.id} />

        </article>

      </div>
    </main>
  );
}
