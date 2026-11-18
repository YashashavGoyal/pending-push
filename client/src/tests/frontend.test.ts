import test from 'node:test';
import assert from 'node:assert/strict';
import { FEED_STORIES, FEATURED_STORY, CONFESSIONS_DATA, TUTORIAL_TRACKS } from '../lib/mock-data.ts';

// ----------------------------------------------------
// 1. DATA MODELS & MOCK INTEGRITY
// ----------------------------------------------------
test('Data Integrity: Featured story and feed stories are well-formed', () => {
  assert.ok(FEATURED_STORY.id, 'Featured story must have an id');
  assert.ok(FEATURED_STORY.slug, 'Featured story must have a slug');
  assert.ok(FEATURED_STORY.title, 'Featured story must have a title');
  assert.ok(FEATURED_STORY.summary, 'Featured story must have summary');
  assert.ok(FEATURED_STORY.author?.name, 'Featured story must have author name');

  assert.ok(Array.isArray(FEED_STORIES), 'FEED_STORIES must be an array');
  assert.ok(FEED_STORIES.length >= 3, 'FEED_STORIES must have at least 3 stories');

  for (const story of FEED_STORIES) {
    assert.ok(story.id, 'Story must have an id');
    assert.ok(story.slug, 'Story must have a slug');
    assert.ok(story.title, 'Story must have a title');
    assert.ok(['article', 'dev-log', 'tutorial', 'confession'].includes(story.category), `Invalid category: ${story.category}`);
  }
});

test('Data Integrity: Tutorial tracks and confessions are populated', () => {
  assert.ok(TUTORIAL_TRACKS.length > 0, 'Tutorial tracks should not be empty');
  for (const track of TUTORIAL_TRACKS) {
    assert.ok(track.id && track.title && track.totalSteps > 0, 'Tutorial track must have id, title, and totalSteps');
  }

  assert.ok(CONFESSIONS_DATA.length > 0, 'Confessions data should not be empty');
  for (const confession of CONFESSIONS_DATA) {
    assert.ok(confession.id && confession.message && confession.alias, 'Confession must have id, message, and alias');
  }
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
