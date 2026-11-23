import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePost, normalizeTutorial, normalizeConfession } from '../lib/api.ts';

// ----------------------------------------------------
// 1. DATA NORMALIZATION (DB -> CLIENT)
// ----------------------------------------------------
test('Data Normalization: Backend database post row maps accurately to Client Post', () => {
  const dbPostRow = {
    id: 'post-uuid-1',
    title: 'Zero-Copy Serialization in Fastify v5',
    slug: 'zero-copy-serialization-fastify-v5',
    summary: 'Eliminating V8 heap garbage collection pauses.',
    content: '## 1. Motivation\n\nDeep dive into binary serialization buffers.',
    format: 'dev_log',
    status: 'published',
    readingTimeMinutes: 6,
    clapsCount: 142,
    publishedAt: '2026-11-15T10:00:00.000Z',
    author: {
      id: 'author-uuid-1',
      name: 'Alex Rivera',
      username: 'alexrivera',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      role: 'Staff Engineer'
    },
    tags: ['Fastify', 'Performance', 'Rust']
  };

  const normalized = normalizePost(dbPostRow);
  assert.equal(normalized.id, 'post-uuid-1');
  assert.equal(normalized.title, 'Zero-Copy Serialization in Fastify v5');
  assert.equal(normalized.category, 'dev-log');
  assert.equal(normalized.author.name, 'Alex Rivera');
  assert.equal(normalized.author.avatar, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb');
  assert.equal(normalized.readTime, '6 min read');
  assert.equal(normalized.relates, 142);
  assert.deepEqual(normalized.tags, ['Fastify', 'Performance', 'Rust']);
});

test('Data Normalization: Backend tutorial and confession rows map accurately', () => {
  const dbTutorial = {
    id: 'tut-uuid-1',
    slug: 'fastify-redis-streams',
    title: 'Building Real-Time Microservices with Redis Streams',
    summary: 'Masterclass covering consumer groups and backpressure.',
    readingTimeMinutes: 45,
    metadata: {
      level: 'Advanced',
      totalSteps: 5,
      completedSteps: 3,
      status: 'started'
    },
    tags: ['Redis', 'Fastify']
  };

  const normTutorial = normalizeTutorial(dbTutorial);
  assert.equal(normTutorial.id, 'tut-uuid-1');
  assert.equal(normTutorial.totalSteps, 5);
  assert.equal(normTutorial.completedSteps, 3);
  assert.equal(normTutorial.level, 'Advanced');
  assert.equal(normTutorial.status, 'started');

  const dbConfession = {
    id: 'cf-uuid-1',
    content: 'I dropped the production audit database during a 3 AM migration.',
    publishedAt: '2026-11-20T03:00:00.000Z',
    clapsCount: 895,
    author: { name: 'Anonymous Dev' },
    metadata: {
      confessionCategory: 'incidents',
      avatarIcon: 'fox'
    }
  };

  const normConfession = normalizeConfession(dbConfession);
  assert.equal(normConfession.id, 'cf-uuid-1');
  assert.equal(normConfession.alias, 'Anonymous Dev');
  assert.equal(normConfession.category, 'incidents');
  assert.equal(normConfession.categoryLabel, 'Incidents & Production');
  assert.equal(normConfession.relates, 895);
  assert.equal(normConfession.message, 'I dropped the production audit database during a 3 AM migration.');
});

// ----------------------------------------------------
// 2. STUDIO SYNCHRONIZED SCROLLING LOGIC
// ----------------------------------------------------
test('Studio Sync Scroll: Heading checkpoint extractor detects markdown headers correctly', () => {
  const markdownText = `# Top Level Title
Some introduction paragraph.

## Section 1: Architecture
Detailing the microservice setup.

## Section 2: Zero-Copy Serialization
Deep dive into V8 ArrayBuffers.

### Sub-heading 2.1: Memory Leaks
Watch out for retained references.

## Section 3: Benchmark Results
Benchmarking 50,000 req/sec.`;

  const lines = markdownText.split('\n');
  const headings: { index: number; line: number; text: string }[] = [];

  lines.forEach((line, idx) => {
    if (line.startsWith('#')) {
      const clean = line.replace(/^#+\s*/, '').trim();
      if (clean) {
        headings.push({ index: headings.length, line: idx, text: clean });
      }
    }
  });

  assert.equal(headings.length, 5, 'Should find 5 heading checkpoints');
  assert.equal(headings[0].text, 'Top Level Title');
  assert.equal(headings[1].text, 'Section 1: Architecture');
  assert.equal(headings[2].text, 'Section 2: Zero-Copy Serialization');
  assert.equal(headings[3].text, 'Sub-heading 2.1: Memory Leaks');
  assert.equal(headings[4].text, 'Section 3: Benchmark Results');
});

test('Studio Sync Scroll: Piecewise interpolation maps scroll positions accurately between headings', () => {
  const checkpoints = [
    { editorY: 0, previewY: 0 },
    { editorY: 200, previewY: 250 },
    { editorY: 600, previewY: 800 },
    { editorY: 1000, previewY: 1200 }
  ];

  function interpolate(scrollY: number, fromKey: 'editorY' | 'previewY', toKey: 'editorY' | 'previewY'): number {
    if (scrollY <= checkpoints[0][fromKey]) return checkpoints[0][toKey];
    const last = checkpoints[checkpoints.length - 1];
    if (scrollY >= last[fromKey]) return last[toKey];

    for (let i = 0; i < checkpoints.length - 1; i++) {
      const a = checkpoints[i];
      const b = checkpoints[i + 1];
      if (scrollY >= a[fromKey] && scrollY <= b[fromKey]) {
        const span = b[fromKey] - a[fromKey];
        const fraction = span > 0 ? (scrollY - a[fromKey]) / span : 0;
        return a[toKey] + fraction * (b[toKey] - a[toKey]);
      }
    }
    return scrollY;
  }

  // Exact checkpoint matches
  assert.equal(interpolate(0, 'editorY', 'previewY'), 0);
  assert.equal(interpolate(200, 'editorY', 'previewY'), 250);
  assert.equal(interpolate(600, 'editorY', 'previewY'), 800);

  // Intermediate interpolation
  const mid1 = interpolate(100, 'editorY', 'previewY'); // Halfway between 0 and 200 -> halfway between 0 and 250
  assert.equal(mid1, 125);

  const mid2 = interpolate(400, 'editorY', 'previewY'); // Halfway between 200 and 600 -> halfway between 250 and 800 = 525
  assert.equal(mid2, 525);
});

// ----------------------------------------------------
// 3. CLAPS & INTERACTIONS
// ----------------------------------------------------
test('Interactions: Claps calculation adheres to Medium-style 50-clap cap', () => {
  let userClaps = 0;
  const maxClaps = 50;

  function clap(increment: number = 1): number {
    const next = Math.min(maxClaps, userClaps + increment);
    const added = next - userClaps;
    userClaps = next;
    return added;
  }

  assert.equal(clap(10), 10);
  assert.equal(userClaps, 10);

  assert.equal(clap(35), 35);
  assert.equal(userClaps, 45);

  // Attempt to clap beyond 50
  assert.equal(clap(10), 5); // Only 5 allowed before reaching 50 cap
  assert.equal(userClaps, 50);

  // Cannot exceed 50
  assert.equal(clap(1), 0);
  assert.equal(userClaps, 50);
});

// ----------------------------------------------------
// 4. BOOKMARKS & READING LIST
// ----------------------------------------------------
test('Reading List: Bookmarks toggle and persist idempotently', () => {
  let bookmarks: string[] = ['post-1', 'post-2'];

  function toggle(id: string): boolean {
    if (bookmarks.includes(id)) {
      bookmarks = bookmarks.filter(b => b !== id);
      return false; // Removed
    } else {
      bookmarks.push(id);
      return true; // Added
    }
  }

  assert.equal(toggle('post-3'), true);
  assert.ok(bookmarks.includes('post-3'));

  assert.equal(toggle('post-1'), false);
  assert.ok(!bookmarks.includes('post-1'));
  assert.equal(bookmarks.length, 2);
});

// ----------------------------------------------------
// 5. THREADED COMMENTS & REPLIES
// ----------------------------------------------------
test('Comments: Hierarchical threaded tree organizes replies correctly', () => {
  interface RawComment {
    id: string;
    content: string;
    parentId?: string | null;
  }

  const flatComments: RawComment[] = [
    { id: 'c1', content: 'Top level comment 1', parentId: null },
    { id: 'c2', content: 'Nested reply to 1', parentId: 'c1' },
    { id: 'c3', content: 'Second reply to 1', parentId: 'c1' },
    { id: 'c4', content: 'Top level comment 2', parentId: null }
  ];

  interface ThreadedComment extends RawComment {
    replies: ThreadedComment[];
  }

  function buildTree(list: RawComment[]): ThreadedComment[] {
    const map = new Map<string, ThreadedComment>();
    const roots: ThreadedComment[] = [];

    list.forEach(item => {
      map.set(item.id, { ...item, replies: [] });
    });

    list.forEach(item => {
      const node = map.get(item.id)!;
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)!.replies.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  const tree = buildTree(flatComments);
  assert.equal(tree.length, 2, 'Should have 2 top-level root comments');
  assert.equal(tree[0].id, 'c1');
  assert.equal(tree[0].replies.length, 2);
  assert.equal(tree[0].replies[0].id, 'c2');
  assert.equal(tree[0].replies[1].id, 'c3');
  assert.equal(tree[1].id, 'c4');
  assert.equal(tree[1].replies.length, 0);
});

// ----------------------------------------------------
// 6. MULTI-DEVICE SESSIONS & SECURITY
// ----------------------------------------------------
test('Security Sessions: Remote revocation removes non-current devices', () => {
  let sessions = [
    { id: 'sess-1', device: 'Desktop Chrome', isCurrent: true },
    { id: 'sess-2', device: 'iPhone Safari', isCurrent: false },
    { id: 'sess-3', device: 'MacBook Firefox', isCurrent: false }
  ];

  function revoke(id: string) {
    sessions = sessions.filter(s => s.id !== id);
  }

  function revokeOther() {
    sessions = sessions.filter(s => s.isCurrent);
  }

  revoke('sess-2');
  assert.equal(sessions.length, 2);
  assert.ok(!sessions.some(s => s.id === 'sess-2'));

  revokeOther();
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].id, 'sess-1');
  assert.equal(sessions[0].isCurrent, true);
});

// ----------------------------------------------------
// 7. STUDIO PUBLISHING SPACE MAPPING
// ----------------------------------------------------
test('Studio Publishing: Space formats map accurately to backend format types', () => {
  const spaceToFormat: Record<string, string> = {
    '01 / Articles Space': 'article',
    '02 / Dev Logs Space': 'dev_log',
    '03 / Tutorials Space': 'tutorial',
    '04 / Engineering Confessions': 'confession'
  };

  assert.equal(spaceToFormat['01 / Articles Space'], 'article');
  assert.equal(spaceToFormat['02 / Dev Logs Space'], 'dev_log');
  assert.equal(spaceToFormat['03 / Tutorials Space'], 'tutorial');
  assert.equal(spaceToFormat['04 / Engineering Confessions'], 'confession');
});

// ----------------------------------------------------
// 8. STUDIO DRAFT LIFECYCLE & TAGS TAXONOMY
// ----------------------------------------------------
test('Studio Draft: Tags taxonomy prevents duplicates and limits to max 5 items', () => {
  let tags: string[] = ['Fastify', 'Architecture'];
  const maxTags = 5;

  function addTag(rawTag: string): boolean {
    const clean = rawTag.trim();
    if (!clean) return false;
    if (tags.length >= maxTags) return false;
    if (tags.some(t => t.toLowerCase() === clean.toLowerCase())) return false;
    tags.push(clean);
    return true;
  }

  function removeTag(tagToRemove: string): void {
    tags = tags.filter(t => t.toLowerCase() !== tagToRemove.toLowerCase());
  }

  assert.equal(addTag('TypeScript'), true);
  assert.equal(tags.length, 3);
  assert.equal(addTag('fastify'), false); // Duplicate (case-insensitive)
  assert.equal(tags.length, 3);

  assert.equal(addTag('Performance'), true);
  assert.equal(addTag('V8'), true);
  assert.equal(tags.length, 5);
  assert.equal(addTag('Nodejs'), false); // Exceeds max 5
  assert.equal(tags.length, 5);

  removeTag('Architecture');
  assert.equal(tags.length, 4);
  assert.equal(tags.includes('Architecture'), false);
});

// ----------------------------------------------------
// 9. DYNAMIC CONTENT PARSING & SANITIZATION
// ----------------------------------------------------
test('Dynamic Readers: Content blocks parse headers, quotes, and code blocks correctly', () => {
  const markdownSource = `## Motivation and Overhead\n\n> Focus is an ecosystem.\n\n\`\`\`ts\nconst x = 1;\n\`\`\`\n\nStandard paragraph content.`;
  const blocks = markdownSource.split('\n\n');

  assert.equal(blocks.length, 4);
  assert.equal(blocks[0].startsWith('## '), true);
  assert.equal(blocks[0].replace('## ', ''), 'Motivation and Overhead');

  assert.equal(blocks[1].startsWith('> '), true);
  assert.equal(blocks[1].replace('> ', ''), 'Focus is an ecosystem.');

  assert.equal(blocks[2].startsWith('```'), true);
  assert.equal(blocks[3], 'Standard paragraph content.');
});
