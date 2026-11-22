'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/Components/ThemeProvider';
import { useAuth } from '@/lib/auth-context';
import {
  createPost,
  updatePost,
  publishPost,
  fetchAuthorDrafts,
  fetchTags,
  TagItem
} from '@/lib/api';
import { Post } from '@/lib/types';

export default function StudioPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, token } = useAuth();

  const [title, setTitle] = useState('Zero-Copy Serialization in Fastify v5 with Avro');
  const [selectedSpace, setSelectedSpace] = useState('dev-logs');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [tags, setTags] = useState<string[]>(['Fastify', 'Architecture']);
  const [tagInput, setTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState<TagItem[]>([]);
  const [draftsList, setDraftsList] = useState<Post[]>([]);
  const [draftsModalOpen, setDraftsModalOpen] = useState(false);
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
By switching from native JSON to schema-compiled serialization, we observed a 3.1x throughput increase in Autocannon testing:

\`\`\`diff
- const payload = JSON.stringify(data); // 32,400 req/sec (GC bottleneck)
+ const payload = fastStringify(data);  // 102,150 req/sec (Zero heap allocation)
\`\`\`

> High-throughput microservices require deterministic serialization latency. Allocating intermediate strings on the V8 heap is the #1 silent latency killer.

## 3. Implementation Blueprint
To integrate Avro binary serialization with Fastify, register a custom serializer compiler:

\`\`\`typescript
fastify.setSerializerCompiler(({ schema, method, url, httpStatus }) => {
  return data => avroType.toBuffer(data);
});
\`\`\`

---
End of Technical RFC • Ready for staging.
`);

  const [isPushed, setIsPushed] = useState(false);
  const [syncScroll, setSyncScroll] = useState(true);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Scroll references
  const editorScrollRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const activeScrollSource = useRef<'editor' | 'preview' | null>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const words = useMemo(() => {
    return source.trim().split(/\s+/).filter(Boolean).length;
  }, [source]);

  const readTimeMins = Math.max(1, Math.ceil(words / 200));

  // 1. Fetch available tags and author drafts
  useEffect(() => {
    fetchTags().then(setAvailableTags);
    if (token) {
      fetchAuthorDrafts(token).then(setDraftsList);
    }
  }, [token]);

  // 2. Clean up scrollTimeout on unmount (P3 fix)
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  // 3. Debounced Auto-Save Draft to Backend
  useEffect(() => {
    if (!title.trim() && !source.trim()) return;
    setSaveStatus('saving');

    const timer = setTimeout(async () => {
      const formatMap: Record<string, string> = {
        'dev-logs': 'dev_log',
        'articles': 'article',
        'tutorials': 'tutorial',
        'confessions': 'confession',
      };

      if (draftId) {
        await updatePost(draftId, {
          title: title.trim(),
          content: source.trim(),
          summary: source.replace(/[#*`>]/g, '').slice(0, 160).trim(),
          format: formatMap[selectedSpace] || 'dev_log',
          tags,
          status: 'draft',
          published: false
        }, token);
      } else {
        const res = await createPost({
          title: title.trim(),
          content: source.trim(),
          summary: source.replace(/[#*`>]/g, '').slice(0, 160).trim(),
          format: formatMap[selectedSpace] || 'dev_log',
          tags,
          status: 'draft',
          published: false
        }, token);
        if (res.post?.id) {
          setDraftId(res.post.id);
        }
      }
      setSaveStatus('saved');
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, source, tags, selectedSpace, draftId, token]);

  // Extract headings from source for piecewise sync & jump list
  const headings = useMemo(() => {
    const lines = source.split('\n');
    const list: Array<{ text: string; lineIndex: number; level: number; id: string }> = [];
    lines.forEach((line, idx) => {
      const match = line.match(/^(#{1,4})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = `heading-${list.length}`;
        list.push({ text, lineIndex: idx, level, id });
      }
    });
    return list;
  }, [source]);

  // Synchronized scrolling calculation
  const getCheckpoints = () => {
    const editor = editorScrollRef.current;
    const preview = previewScrollRef.current;
    if (!editor || !preview) return null;

    const totalLines = Math.max(1, source.split('\n').length);
    const editorScrollable = editor.scrollHeight - editor.clientHeight;
    const previewScrollable = preview.scrollHeight - preview.clientHeight;

    if (editorScrollable <= 0 || previewScrollable <= 0) return null;

    // Build checkpoints: [{ e, p }]
    const points: Array<{ e: number; p: number }> = [{ e: 0, p: 0 }];

    headings.forEach(h => {
      const ePos = (h.lineIndex / totalLines) * editorScrollable;
      const el = document.getElementById(h.id);
      if (el) {
        const pPos = Math.min(previewScrollable, Math.max(0, el.offsetTop - 16));
        points.push({ e: ePos, p: pPos });
      }
    });

    points.push({ e: editorScrollable, p: previewScrollable });
    points.sort((a, b) => a.e - b.e);

    return { points, editorScrollable, previewScrollable };
  };

  const handleEditorScroll = () => {
    if (!syncScroll || activeScrollSource.current === 'preview') return;
    activeScrollSource.current = 'editor';

    const cp = getCheckpoints();
    if (cp && previewScrollRef.current && editorScrollRef.current) {
      const e = editorScrollRef.current.scrollTop;
      const { points, previewScrollable } = cp;

      let p = 0;
      for (let i = 0; i < points.length - 1; i++) {
        if (e >= points[i].e && e <= points[i + 1].e) {
          const segSpan = points[i + 1].e - points[i].e;
          const t = segSpan > 0 ? (e - points[i].e) / segSpan : 0;
          p = points[i].p + t * (points[i + 1].p - points[i].p);
          break;
        }
      }
      if (e >= points[points.length - 1].e) {
        p = previewScrollable;
      }
      previewScrollRef.current.scrollTop = p;
    }

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      activeScrollSource.current = null;
    }, 70);
  };

  const handlePreviewScroll = () => {
    if (!syncScroll || activeScrollSource.current === 'editor') return;
    activeScrollSource.current = 'preview';

    const cp = getCheckpoints();
    if (cp && previewScrollRef.current && editorScrollRef.current) {
      const p = previewScrollRef.current.scrollTop;
      const { points, editorScrollable } = cp;

      let e = 0;
      for (let i = 0; i < points.length - 1; i++) {
        if (p >= points[i].p && p <= points[i + 1].p) {
          const segSpan = points[i + 1].p - points[i].p;
          const t = segSpan > 0 ? (p - points[i].p) / segSpan : 0;
          e = points[i].e + t * (points[i + 1].e - points[i].e);
          break;
        }
      }
      if (p >= points[points.length - 1].p) {
        e = editorScrollable;
      }
      editorScrollRef.current.scrollTop = e;
    }

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      activeScrollSource.current = null;
    }, 70);
  };

  // Jump directly to heading anchor
  const handleJumpToHeading = (id: string, lineIndex: number) => {
    const el = document.getElementById(id);
    const preview = previewScrollRef.current;
    const editor = editorScrollRef.current;

    if (preview && el) {
      preview.scrollTo({ top: Math.max(0, el.offsetTop - 16), behavior: 'smooth' });
    }
    if (editor) {
      const totalLines = Math.max(1, source.split('\n').length);
      const editorScrollable = editor.scrollHeight - editor.clientHeight;
      const targetScroll = (lineIndex / totalLines) * editorScrollable;
      editor.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  };

  const insertSnippet = (prefix: string, suffix: string = '') => {
    const textarea = editorScrollRef.current;
    if (!textarea) {
      setSource(prev => prev + '\n' + prefix + suffix);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = source.substring(start, end);
    const replacement = prefix + (selectedText || '') + suffix;
    const newSource = source.substring(0, start) + replacement + source.substring(end);
    setSource(newSource);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 0));
    }, 0);
  };

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishNotification, setPublishNotification] = useState<string | null>(null);

  const handleLoadDraft = (d: Post) => {
    setDraftId(d.id);
    setTitle(d.title);
    if (d.content) setSource(d.content);
    if (d.tags) setTags(d.tags);
    if (d.category) {
      setSelectedSpace(
        d.category === 'dev-log' ? 'dev-logs' :
        d.category === 'tutorial' ? 'tutorials' :
        d.category === 'confession' ? 'confessions' : 'articles'
      );
    }
    setDraftsModalOpen(false);
  };

  const handlePush = async () => {
    if (!title.trim() || !source.trim()) return;

    setIsPublishing(true);
    const formatMap: Record<string, string> = {
      'dev-logs': 'dev_log',
      'articles': 'article',
      'tutorials': 'tutorial',
      'confessions': 'confession',
    };

    let targetSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (draftId) {
      await updatePost(draftId, {
        title: title.trim(),
        content: source.trim(),
        summary: source.replace(/[#*`>]/g, '').slice(0, 160).trim(),
        format: formatMap[selectedSpace] || 'dev_log',
        tags,
        status: 'published',
        published: true
      }, token);
      await publishPost(draftId, token);
    } else {
      const res = await createPost({
        title: title.trim(),
        content: source.trim(),
        summary: source.replace(/[#*`>]/g, '').slice(0, 160).trim(),
        format: formatMap[selectedSpace] || 'dev_log',
        tags,
        status: 'published',
        published: true
      }, token);
      if (res.post?.slug) targetSlug = res.post.slug;
    }

    setIsPublishing(false);
    setIsPushed(true);

    setPublishNotification(`✓ Push committed to ${selectedSpace.toUpperCase()}! Redirecting...`);

    setTimeout(() => {
      const spacePath = selectedSpace === 'dev-logs' ? '/dev-logs' : selectedSpace === 'articles' ? '/articles' : selectedSpace === 'tutorials' ? '/tutorials' : '/confessions';
      router.push(`${spacePath}/${targetSlug}`);
    }, 1200);
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  // Inline markdown formatter helper
  const renderInline = (text: string) => {
    const parts: React.ReactNode[] = [];
    const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(<strong key={match.index}>{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code
            key={match.index}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85em',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--brand-terracotta)',
              padding: '0.15rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(<em key={match.index}>{token.slice(1, -1)}</em>);
      } else if (token.startsWith('[') && token.includes('](')) {
        const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          parts.push(
            <a
              key={match.index}
              href={linkMatch[2]}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--brand-terracotta)', textDecoration: 'underline' }}
            >
              {linkMatch[1]}
            </a>
          );
        }
      }
      lastIndex = tokenRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  // Structured markdown block parser
  const parsedBlocks = useMemo(() => {
    const blocks: React.ReactNode[] = [];
    const rawBlocks = source.split(/(```[\s\S]*?```)/g);

    let headingCounter = 0;

    rawBlocks.forEach((chunk, chunkIdx) => {
      if (chunk.startsWith('```') && chunk.endsWith('```')) {
        // Code Block
        const firstLineEnd = chunk.indexOf('\n');
        const lang = chunk.substring(3, firstLineEnd).trim() || 'plaintext';
        const codeContent = chunk.substring(firstLineEnd + 1, chunk.length - 3);
        const codeBlockId = `code-block-${chunkIdx}`;

        const isDiff = lang === 'diff';
        const lines = codeContent.split('\n');

        blocks.push(
          <div key={chunkIdx} className="code-container" style={{ margin: 'var(--space-4) 0', position: 'relative' }}>
            <div className="code-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="code-filename">{lang}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(codeContent, codeBlockId)}
                className="code-copy-action"
                style={{ cursor: 'pointer' }}
              >
                {copyStatus === codeBlockId ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{ margin: 0, padding: 'var(--space-4)', overflowX: 'auto', fontSize: '0.875rem', lineHeight: 1.6 }}>
              <code>
                {isDiff ? (
                  lines.map((l, lIdx) => {
                    let color = 'inherit';
                    let bg = 'transparent';
                    if (l.startsWith('+')) {
                      color = 'var(--status-emerald)';
                      bg = 'rgba(16, 185, 129, 0.08)';
                    } else if (l.startsWith('-')) {
                      color = 'var(--accent-rose)';
                      bg = 'rgba(239, 68, 68, 0.08)';
                    }
                    return (
                      <div key={lIdx} style={{ color, backgroundColor: bg, padding: '0.05rem 0.3rem', borderRadius: '2px' }}>
                        {l}
                      </div>
                    );
                  })
                ) : (
                  codeContent
                )}
              </code>
            </pre>
          </div>
        );
      } else {
        // Text / Paragraphs / Headings / Quotes
        const paragraphs = chunk.split(/\n\n+/);
        paragraphs.forEach((pText, pIdx) => {
          const trimmed = pText.trim();
          if (!trimmed) return;

          // Headings
          const hMatch = trimmed.match(/^(#{1,4})\s+(.+)$/m);
          if (hMatch && trimmed.startsWith('#')) {
            const level = hMatch[1].length;
            const hContent = hMatch[2].trim();
            const headingId = `heading-${headingCounter++}`;

            if (level === 1) {
              blocks.push(
                <h1 key={`${chunkIdx}-${pIdx}`} id={headingId} style={{ marginTop: '1.8rem', marginBottom: '0.75rem', color: 'var(--text-main)', scrollMarginTop: '20px' }}>
                  {renderInline(hContent)}
                </h1>
              );
            } else if (level === 2) {
              blocks.push(
                <h2
                  key={`${chunkIdx}-${pIdx}`}
                  id={headingId}
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '0.35rem',
                    marginTop: '2rem',
                    marginBottom: '0.85rem',
                    scrollMarginTop: '20px'
                  }}
                >
                  {renderInline(hContent)}
                </h2>
              );
            } else {
              blocks.push(
                <h3
                  key={`${chunkIdx}-${pIdx}`}
                  id={headingId}
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    marginTop: '1.5rem',
                    marginBottom: '0.6rem',
                    scrollMarginTop: '20px'
                  }}
                >
                  {renderInline(hContent)}
                </h3>
              );
            }
            return;
          }

          // Blockquote
          if (trimmed.startsWith('>')) {
            const quoteContent = trimmed.replace(/^>\s*/gm, '');
            blocks.push(
              <blockquote
                key={`${chunkIdx}-${pIdx}`}
                style={{
                  borderLeft: '3px solid var(--brand-terracotta)',
                  padding: '0.75rem 1.25rem',
                  backgroundColor: 'var(--brand-terracotta-subtle)',
                  borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                  margin: '1.25rem 0',
                  fontStyle: 'italic',
                  color: 'var(--text-secondary)'
                }}
              >
                {renderInline(quoteContent)}
              </blockquote>
            );
            return;
          }

          // Horizontal rule
          if (trimmed === '---' || trimmed === '***') {
            blocks.push(
              <hr key={`${chunkIdx}-${pIdx}`} style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '2rem 0' }} />
            );
            return;
          }

          // Standard paragraph
          blocks.push(
            <p key={`${chunkIdx}-${pIdx}`} style={{ marginBottom: '1.2rem', lineHeight: 1.75, color: 'var(--text-main)' }}>
              {renderInline(trimmed)}
            </p>
          );
        });
      }
    });

    return blocks;
  }, [source, copyStatus]);

  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      
      {/* 1. SINGLE, UNIFIED STUDIO TOPBAR (No duplicate bar, no duplicate logos) */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          height: '54px',
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
          gap: '1rem',
          zIndex: 100
        }}
      >
        {/* Left: Back Link + Studio Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            href="/"
            className="btn btn-secondary btn-sm"
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-main)',
              boxShadow: 'var(--shadow-sm)'
            }}
            title="Exit Studio & Return to Feed"
          >
            <span className="icon icon-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </span>
            <span>Exit Studio</span>
          </Link>

          <span style={{ width: '1px', height: '1.25rem', backgroundColor: 'var(--border-subtle)' }} />

          {/* Unified Brand Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span
              style={{
                width: '1.85rem',
                height: '1.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--brand-terracotta)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '1.1rem', height: '1.1rem' }}>
                <line x1="6" y1="3" x2="6" y2="15" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
              </svg>
            </span>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>Pending Push</span>
            <span className="badge badge-dev" style={{ fontSize: '0.675rem', padding: '0.15rem 0.45rem' }}>Studio</span>
          </div>
        </div>

        {/* Center: Publishing Space & Save State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Publishing to</span>
            <select
              value={selectedSpace}
              onChange={(e) => setSelectedSpace(e.target.value)}
              className="form-input"
              style={{
                width: 'auto',
                padding: '0.25rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-subtle)'
              }}
            >
              <option value="dev-logs">02 / Dev Logs Space</option>
              <option value="articles">01 / Articles Space</option>
              <option value="tutorials">03 / Tutorials Space</option>
              <option value="confessions">04 / Confessions Space</option>
            </select>
          </div>

          <span style={{ width: '1px', height: '1rem', backgroundColor: 'var(--border-subtle)' }} />

          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.775rem', color: saveStatus === 'saving' ? 'var(--brand-terracotta)' : 'var(--status-emerald)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: saveStatus === 'saving' ? 'var(--brand-terracotta)' : 'var(--status-emerald)', display: 'inline-block' }} />
            {saveStatus === 'saving' ? 'Saving draft...' : 'Saved to draft'}
          </span>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            • {words} words • ~{readTimeMins}m read
          </span>
        </div>

        {/* Right: Sync Scroll Toggle, Theme Toggle, & Commit Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          
          {/* My Drafts Button */}
          <button
            type="button"
            onClick={() => setDraftsModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '0.3rem 0.75rem',
              fontSize: '0.775rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
            title="Browse your saved drafts"
          >
            <span>My Drafts</span>
            <span className="badge badge-neutral" style={{ padding: '0.1rem 0.35rem', fontSize: '0.675rem' }}>
              {draftsList.length}
            </span>
          </button>

          {/* SYNC SCROLL BUTTON (User Toggle) */}
          <button
            type="button"
            onClick={() => setSyncScroll(prev => !prev)}
            className={`btn btn-sm ${syncScroll ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '0.3rem 0.8rem',
              fontSize: '0.775rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: syncScroll ? 'var(--brand-terracotta)' : undefined,
              borderColor: syncScroll ? 'var(--brand-terracotta)' : undefined,
              color: syncScroll ? '#ffffff' : 'var(--text-main)',
              boxShadow: syncScroll ? '0 1px 3px rgba(249, 115, 22, 0.3)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
            title={syncScroll ? 'Sync Scroll is active: Writer & preview scroll synchronously by section' : 'Sync Scroll is OFF: Panes scroll independently'}
          >
            <span className="icon icon-sm">
              {syncScroll ? (
                // Linked chains icon
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              ) : (
                // Unlinked chains icon
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="m18.84 12.25 1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="m5.16 11.75-1.72 1.71a5 5 0 0 0 7.07 7.07l1.72-1.71" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              )}
            </span>
            <span>{syncScroll ? 'Sync Scroll: ON' : 'Sync Scroll: OFF'}</span>
          </button>

          {/* Theme Toggler */}
          <button
            className="nav-icon-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{ width: '2rem', height: '2rem' }}
          >
            <span className="icon icon-sm">
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </span>
          </button>

          {/* User Avatar */}
          {user && (
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
              alt={user.name}
              title={`Logged in as ${user.name}`}
              style={{ width: '1.9rem', height: '1.9rem', borderRadius: 'var(--radius-full)', border: '2px solid var(--brand-terracotta)' }}
            />
          )}

          {/* Primary Action Button */}
          <button
            onClick={handlePush}
            disabled={isPublishing}
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', padding: '0.35rem 1rem', fontWeight: 700, opacity: isPublishing ? 0.7 : 1 }}
          >
            <span className="icon icon-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span>{isPublishing ? 'Publishing...' : isPushed ? 'Staged & Pushed! ✓' : 'Commit & Push'}</span>
          </button>

        </div>
      </header>

      {/* Publish Toast Notification */}
      {publishNotification && (
        <div
          style={{
            backgroundColor: 'var(--brand-terracotta)',
            color: '#ffffff',
            padding: '0.45rem 1.25rem',
            fontSize: '0.825rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
            zIndex: 110
          }}
        >
          <span>{publishNotification}</span>
          <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>Fastify 5 REST API</span>
        </div>
      )}

      {/* 2. MARKDOWN FORMATTING & SECTION NAVIGATION TOOLBAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          padding: '0.4rem 1.25rem',
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
          flexWrap: 'wrap'
        }}
      >
        {/* Quick Format Snippet Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
          <button onClick={() => insertSnippet('**', '**')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.775rem' }} title="Bold">B</button>
          <button onClick={() => insertSnippet('*', '*')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.775rem' }} title="Italic"><em>I</em></button>
          <button onClick={() => insertSnippet('## ')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.775rem' }} title="Section Heading (H2)">H2</button>
          <button onClick={() => insertSnippet('### ')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.775rem' }} title="Sub-section (H3)">H3</button>
          <span style={{ width: '1px', height: '1.1rem', background: 'var(--border-subtle)', margin: '0 0.2rem' }} />
          <button onClick={() => insertSnippet('`', '`')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.775rem' }} title="Inline Code">`code`</button>
          <button onClick={() => insertSnippet('```typescript\n// Code snippet\n', '\n```')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.775rem' }} title="Code Block">&lt;/&gt;</button>
          <button onClick={() => insertSnippet('```diff\n- old logic\n+ new logic\n', '\n```')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.775rem', color: 'var(--accent-sage)' }} title="Diff Block">+diff-</button>
          <button onClick={() => insertSnippet('> ')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.775rem' }} title="Blockquote">❝</button>
          <button onClick={() => insertSnippet('- ')} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.775rem' }} title="Bullet List">• List</button>
        </div>

        {/* Section Heading Anchor Jumper (Jumps both sides together) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {headings.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Jump to:</span>
              <select
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const targetH = headings.find(h => h.id === selectedId);
                  if (targetH) {
                    handleJumpToHeading(targetH.id, targetH.lineIndex);
                  }
                }}
                className="form-input"
                style={{
                  width: 'auto',
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-subtle)'
                }}
              >
                <option value="">Jump to Section...</option>
                {headings.map(h => (
                  <option key={h.id} value={h.id}>
                    {'— '.repeat(h.level - 1)}{h.text}
                  </option>
                ))}
              </select>
            </div>
          )}

          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
            Split View (1:1)
          </span>
        </div>
      </div>

      {/* 3. SPLIT SCREEN STUDIO (Writer Side vs Displayer Side) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT PANE: WRITER (EDITOR) */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-app)', height: '100%', overflow: 'hidden' }}>
          
          {/* Article Title & Frontmatter */}
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)', flexShrink: 0 }}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              placeholder="Article or Dev Log Title..."
              style={{ fontSize: '1.2rem', fontWeight: 800, border: 'none', padding: '0.2rem 0', background: 'transparent', color: 'var(--text-main)' }}
            />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              <span>slug: /{selectedSpace}/{title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</span>
              <span>•</span>
              <span>branch: feat/rfc-telemetry</span>
            </div>

            {/* Tags Taxonomy Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.45rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Tags:</span>
              {tags.map(t => (
                <span
                  key={t}
                  className="badge badge-dev"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.12rem 0.45rem', fontSize: '0.725rem' }}
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter(x => x !== t))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', fontSize: '0.75rem', lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </span>
              ))}
              {tags.length < 5 && (
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      e.preventDefault();
                      const val = tagInput.trim();
                      if (!tags.includes(val)) setTags([...tags, val]);
                      setTagInput('');
                    }
                  }}
                  placeholder="+ Add tag (Enter)..."
                  style={{
                    fontSize: '0.725rem',
                    background: 'transparent',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.12rem 0.4rem',
                    color: 'var(--text-main)',
                    width: '120px'
                  }}
                />
              )}
              {availableTags.length > 0 && tags.length < 5 && (
                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Popular:</span>
                  {availableTags.slice(0, 4).filter(at => !tags.includes(at.name)).map(at => (
                    <button
                      key={at.id}
                      type="button"
                      onClick={() => setTags([...tags, at.name])}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--brand-terracotta)',
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                        padding: '0.1rem 0.2rem',
                        textDecoration: 'underline'
                      }}
                    >
                      +{at.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Synchronized Scrollable Source Textarea */}
          <textarea
            ref={editorScrollRef}
            onScroll={handleEditorScroll}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            spellCheck={false}
            placeholder="Write your markdown story here..."
            style={{
              flex: 1,
              width: '100%',
              padding: '1.25rem',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              overflowY: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.925rem',
              lineHeight: 1.7,
              color: 'var(--text-main)',
              scrollbarGutter: 'stable'
            }}
          />

          {/* Editor Status Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.35rem 1.25rem',
              backgroundColor: 'var(--bg-card)',
              borderTop: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.725rem',
              color: 'var(--text-muted)',
              flexShrink: 0
            }}
          >
            <div>{source.split('\n').length} lines • {words} words • {source.length} chars</div>
            <div>UTF-8 • Markdown Flavored</div>
          </div>
        </div>

        {/* RIGHT PANE: DISPLAYER (LIVE PREVIEW) */}
        <div
          ref={previewScrollRef}
          onScroll={handlePreviewScroll}
          style={{
            backgroundColor: 'var(--bg-card)',
            padding: '2rem 2.5rem',
            overflowY: 'auto',
            height: '100%',
            scrollbarGutter: 'stable'
          }}
        >
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <span className="badge badge-dev" style={{ marginBottom: '0.5rem' }}>
              {selectedSpace.toUpperCase()}
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.15rem',
                fontWeight: 800,
                margin: '0.5rem 0 1.5rem',
                color: 'var(--text-main)',
                lineHeight: 1.25
              }}
            >
              {title}
            </h1>

            {/* Formatted Markdown Prose */}
            <div className="prose">
              {parsedBlocks}
            </div>
          </div>
        </div>

      </div>

      {/* 4. SAVED DRAFTS DRAWER / MODAL */}
      {draftsModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setDraftsModalOpen(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: '560px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>My Saved Drafts</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Resume writing or push previous work in progress.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDraftsModalOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '1rem', padding: '0.2rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            {draftsList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No saved drafts found. When you write in Studio, your work automatically auto-saves here.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {draftsList.map(d => (
                  <div
                    key={d.id}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-main)' }}>{d.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {d.category} • {d.publishedAt}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLoadDraft(d)}
                      className="btn btn-primary btn-sm"
                      style={{ borderRadius: 'var(--radius-full)', padding: '0.25rem 0.75rem', fontSize: '0.775rem' }}
                    >
                      Load Draft
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
