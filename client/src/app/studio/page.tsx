'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function StudioPage() {
  const [title, setTitle] = useState('Zero-Copy Serialization in Fastify v5 with Avro');
  const [selectedSpace, setSelectedSpace] = useState('dev-logs');
  const [source, setSource] = useState(`## 1. Motivation & GC Pressure

When scaling our event telemetry ingestion pipeline to handle 100k requests/sec, heap snapshots exposed a critical bottleneck: standard \`JSON.stringify()\` was triggering frequent V8 minor GC pauses, accumulating over 420ms of stop-the-world latency every 30 seconds.

### The Problem With Native JSON Serialization
In high-throughput microservices, serializing large payloads repeatedly produces thousands of micro-allocations.

\`\`\`typescript
// Fastify schema-compiled serialization
import fastJson from 'fast-json-stringify';

const stringify = fastJson({
  title: 'TelemetryPayload',
  type: 'object',
  properties: {
    eventId: { type: 'string' },
    timestamp: { type: 'integer' }
  }
});
\`\`\`

## 2. Benchmark Comparisons
By switching from native JSON to schema-compiled serialization, we observed a 3.1x throughput increase in Autocannon testing.
`);
  const [isPushed, setIsPushed] = useState(false);

  const words = source.trim().split(/\s+/).filter(Boolean).length;
  const readTimeMins = Math.max(1, Math.ceil(words / 200));

  const insertSnippet = (prefix: string, suffix: string = '') => {
    setSource(prev => prev + '\n' + prefix + suffix);
  };

  const handlePush = () => {
    setIsPushed(true);
    setTimeout(() => setIsPushed(false), 3000);
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* Studio Header */}
      <header className="site-header" style={{ position: 'static' }}>
        <div className="container navbar">
          <Link href="/" className="brand-link">
            <span className="brand-icon">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="6" y1="3" x2="6" y2="15" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
              </svg>
            </span>
            <span>Pending Push</span>
          </Link>

          {/* Space Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge badge-neutral">Publishing to</span>
            <select
              value={selectedSpace}
              onChange={(e) => setSelectedSpace(e.target.value)}
              className="form-input"
              style={{ width: 'auto', padding: '0.3rem 0.65rem', fontSize: '0.8rem', fontWeight: 600, borderRadius: 'var(--radius-sm)' }}
            >
              <option value="dev-logs">02 / Dev Logs Space</option>
              <option value="articles">01 / Articles Space</option>
              <option value="tutorials">03 / Tutorials Space</option>
              <option value="confessions">04 / Confessions Space</option>
            </select>
          </div>

          {/* Actions */}
          <div className="nav-actions">
            <span className="text-muted" style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
              ● Saved to draft
            </span>
            <button
              onClick={handlePush}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <span className="icon icon-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span>{isPushed ? 'Staged & Pushed! ✓' : 'Commit & Push'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Markdown Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.5rem var(--space-6)',
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <button onClick={() => insertSnippet('**Bold Text**')} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontFamily: 'var(--font-mono)' }}>B</button>
        <button onClick={() => insertSnippet('*Italic Text*')} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontFamily: 'var(--font-mono)' }}><em>I</em></button>
        <button onClick={() => insertSnippet('## Section Heading')} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontFamily: 'var(--font-mono)' }}>H2</button>
        <span style={{ width: '1px', height: '1.2rem', background: 'var(--border-subtle)', margin: '0 0.35rem' }} />
        <button onClick={() => insertSnippet('`inlineCode`')} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontFamily: 'var(--font-mono)' }}>`code`</button>
        <button onClick={() => insertSnippet('```typescript\n// Code snippet\n```')} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontFamily: 'var(--font-mono)' }}>&lt;/&gt;</button>
        <button onClick={() => insertSnippet('```diff\n- old logic\n+ new high-throughput logic\n```')} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-sage)' }}>+diff-</button>
        <button onClick={() => insertSnippet('> Blockquote insight')} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontFamily: 'var(--font-mono)' }}>❝</button>
      </div>

      {/* Split Screen Studio */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, overflow: 'hidden' }}>
        
        {/* Left: Source Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-app)', overflowY: 'auto' }}>
          {/* Frontmatter */}
          <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              style={{ fontSize: '1.25rem', fontWeight: 700, border: 'none', padding: '0.25rem 0', background: 'transparent' }}
            />
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              <span>slug: /dev-logs/{title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</span>
              <span>branch: feat/rfc-telemetry</span>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              width: '100%',
              minHeight: '400px',
              padding: 'var(--space-6)',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.925rem',
              lineHeight: 1.7,
              color: 'var(--text-main)'
            }}
          />

          {/* Status strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem var(--space-6)', backgroundColor: 'var(--bg-subtle)', borderTop: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            <div>{words} words • ~{readTimeMins} min read</div>
            <div>UTF-8 • Markdown Flavored</div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: 'var(--space-8)', overflowY: 'auto' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <span className="badge badge-dev" style={{ marginBottom: 'var(--space-2)' }}>
              {selectedSpace.toUpperCase()}
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, margin: 'var(--space-3) 0 var(--space-6)', color: 'var(--text-main)', lineHeight: 1.3 }}>
              {title}
            </h1>
            <div className="prose" style={{ whiteSpace: 'pre-line' }}>
              {source}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
