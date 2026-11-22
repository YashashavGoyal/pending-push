import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import * as schema from './schema/index.js';
import {
  users,
  posts,
  tags,
  postTags,
  claps,
  comments,
  follows,
  bookmarks,
} from './schema/index.js';

const runSeed = async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Error: DATABASE_URL environment variable is not defined.');
    process.exit(1);
  }

  console.log('🔄 Connecting to PostgreSQL database for seeding...');
  const client = postgres(dbUrl, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    console.log('🌱 Starting database seed...\n');

    // ==========================================
    // 1. SEED USERS
    // ==========================================
    console.log('👤 Seeding Users & Roles...');
    const defaultPasswordHash = await bcrypt.hash('Password123!', 10);
    const adminPasswordHash = await bcrypt.hash('Admin123!', 10);

    const seedUsersData = [
      {
        username: 'admin',
        email: 'admin@pendingpush.dev',
        name: 'Platform Administrator',
        passwordHash: adminPasswordHash,
        role: 'admin' as const,
        bio: 'Core Platform Maintainer and Administrator for Pending Push.',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        config: {
          privacy: { isPrivate: false, showActivityHeatmap: true, showFollowersList: true, showReadingList: true },
          appearance: { theme: 'dark', fontFamily: 'mono', codeLigatures: true },
          notifications: { emailDigest: true, newFollower: true, newComment: true },
        },
      },
      {
        username: 'alex_dev',
        email: 'alex@pendingpush.dev',
        name: 'Alex Chen',
        passwordHash: defaultPasswordHash,
        role: 'user' as const,
        bio: 'Staff Distributed Systems Engineer. Writing about Node.js concurrency, Rust, and Postgres performance.',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        config: {
          privacy: { isPrivate: false, showActivityHeatmap: true, showFollowersList: true, showReadingList: true },
          appearance: { theme: 'system', fontFamily: 'sans', codeLigatures: true },
          notifications: { emailDigest: true, newFollower: true, newComment: true },
        },
      },
      {
        username: 'sarah_ui',
        email: 'sarah@pendingpush.dev',
        name: 'Sarah Connor',
        passwordHash: defaultPasswordHash,
        role: 'user' as const,
        bio: 'Design engineer building modern Next.js 15 apps, design systems, and delightful developer experiences.',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        config: {
          privacy: { isPrivate: false, showActivityHeatmap: true, showFollowersList: true, showReadingList: true },
          appearance: { theme: 'dark', fontFamily: 'sans', codeLigatures: true },
          notifications: { emailDigest: false, newFollower: true, newComment: true },
        },
      },
      {
        username: 'marcus_sec',
        email: 'marcus@pendingpush.dev',
        name: 'Marcus Brody',
        passwordHash: defaultPasswordHash,
        role: 'user' as const,
        bio: 'SRE & Cloud Security specialist. Kubernetes, eBPF, and zero-trust architectures.',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        config: {
          privacy: { isPrivate: false, showActivityHeatmap: true, showFollowersList: true, showReadingList: false },
          appearance: { theme: 'system', fontFamily: 'serif', codeLigatures: false },
          notifications: { emailDigest: true, newFollower: false, newComment: true },
        },
      },
    ];

    const userMap = new Map<string, string>(); // username -> userId

    for (const u of seedUsersData) {
      const [existing] = await db.select().from(users).where(eq(users.username, u.username)).limit(1);
      if (existing) {
        userMap.set(u.username, existing.id);
        console.log(`  ↪ User '${u.username}' already exists (${existing.id})`);
      } else {
        const [inserted] = await db.insert(users).values(u).returning();
        userMap.set(u.username, inserted.id);
        console.log(`  ✓ Inserted user '${u.username}' (${inserted.id})`);
      }
    }

    // ==========================================
    // 2. SEED TAGS & TAXONOMY
    // ==========================================
    console.log('\n🏷️  Seeding Tags & Taxonomy...');
    const seedTags = [
      { name: 'Architecture', slug: 'architecture' },
      { name: 'TypeScript', slug: 'typescript' },
      { name: 'Node.js', slug: 'nodejs' },
      { name: 'Next.js', slug: 'nextjs' },
      { name: 'React', slug: 'react' },
      { name: 'PostgreSQL', slug: 'postgresql' },
      { name: 'Performance', slug: 'performance' },
      { name: 'DevOps', slug: 'devops' },
      { name: 'Career', slug: 'career' },
      { name: 'Confessions', slug: 'confessions' },
      { name: 'Security', slug: 'security' },
      { name: 'Socket.IO', slug: 'socketio' },
    ];

    const tagMap = new Map<string, string>(); // slug -> tagId

    for (const t of seedTags) {
      const [existing] = await db.select().from(tags).where(eq(tags.slug, t.slug)).limit(1);
      if (existing) {
        tagMap.set(t.slug, existing.id);
      } else {
        const [inserted] = await db.insert(tags).values(t).returning();
        tagMap.set(t.slug, inserted.id);
      }
    }
    console.log(`  ✓ Synced ${tagMap.size} taxonomy tags`);

    // ==========================================
    // 3. SEED POSTS ACROSS ALL 4 SPACES + DRAFTS
    // ==========================================
    console.log('\n📝 Seeding Posts across Spaces (Articles, Dev-logs, Tutorials, Confessions, Drafts)...');

    const alexId = userMap.get('alex_dev')!;
    const sarahId = userMap.get('sarah_ui')!;
    const marcusId = userMap.get('marcus_sec')!;

    const seedPostsData = [
      // --- ARTICLES SPACE ---
      {
        authorId: alexId,
        title: 'Architecting Real-Time Microservices with Socket.IO and Node.js',
        slug: 'architecting-real-time-microservices-with-socketio-and-nodejs',
        summary: 'How we engineered a secure, dual-mode real-time gateway using ephemeral client tokens and scoped room broadcasting.',
        content: {
          body: `## Why Dual-Mode Authentication Matters in Real-Time WebSockets\n\nTraditional WebSocket implementations often force a compromise: either embed sensitive master API keys into client-side code, or pass unauthenticated socket connections that bypass application guards.\n\n### The Ephemeral Token Architecture\n\nUnder our OmniSocket architecture, untrusted client browsers never touch master credentials. Instead:\n\n1. The client requests a short-lived signed JWT from the backend via \`GET /api/v1/realtime/token\`.\n2. The backend mints the token with specific room grants and a 1-hour TTL.\n3. The browser connects via Socket.IO passing \`{ auth: { type: 'client', token } }\`.\n\n\`\`\`typescript\nconst client = new OmniSocketClient({\n  type: 'client',\n  tokenProvider: async () => fetchToken(),\n});\nawait client.connect();\n\`\`\`\n\nThis keeps master keys safe on the server and provides zero-trust security at the edge.`,
        },
        contentText: 'Why Dual-Mode Authentication Matters in Real-Time WebSockets. Traditional WebSocket implementations often force a compromise...',
        coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        format: 'article' as const,
        isAnonymous: false,
        status: 'published' as const,
        readingTimeMinutes: 6,
        viewsCount: 1420,
        clapsCount: 185,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        tags: ['architecture', 'socketio', 'nodejs', 'performance'],
      },
      {
        authorId: sarahId,
        title: 'Inside Next.js 15 App Router: Server Actions & Partial Prerendering',
        slug: 'inside-nextjs-15-app-router-server-actions-and-partial-prerendering',
        summary: 'A deep dive into React 19 compiler primitives, PPR fallbacks, and building frictionless developer experiences.',
        content: {
          body: `## The Next Era of Fullstack React\n\nNext.js 15 brings significant refinements to the App Router paradigm. With React 19's \`useActionState\` and Partial Prerendering (PPR), we can now deliver instant shell loads alongside dynamic data streaming without layout shift.\n\n### Practical Patterns\n\n- Zero-JS static page chrome\n- Streaming deferred promise boundaries with Suspense\n- Optimistic mutations in client components\n\nBy unifying data fetching with clean REST API abstractions, frontend development feels effortless again.`,
        },
        contentText: 'The Next Era of Fullstack React. Next.js 15 brings significant refinements to the App Router paradigm...',
        coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        format: 'article' as const,
        isAnonymous: false,
        status: 'published' as const,
        readingTimeMinutes: 5,
        viewsCount: 980,
        clapsCount: 112,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        tags: ['nextjs', 'react', 'typescript'],
      },

      // --- DEV-LOGS SPACE ---
      {
        authorId: alexId,
        title: 'DevLog #42: Debugging a 2GB Memory Leak in V8 Garbage Collection',
        slug: 'devlog-42-debugging-a-2gb-memory-leak-in-v8-garbage-collection',
        summary: 'A forensic investigation into Node.js heap snapshots, unclosed EventEmitter listeners, and the elusive detached DOM buffers.',
        content: {
          body: `## The Incident\n\nAt 04:00 UTC, our background telemetry workers spiked from 250MB RSS to over 2.1GB, triggering OOM container reboots.\n\n### The Root Cause\n\nA persistent event listener attached inside a loop was keeping references to large buffer payloads in the closure scope. When clients disconnected abruptly, the listener was never garbage collected.\n\n### The Fix\n\nWe refactored listener registration to use an \`AbortController\` signal:\n\n\`\`\`typescript\neventEmitter.on('chunk', handler, { signal: abortController.signal });\n\`\`\`\n\nMemory RSS stabilized back down to 180MB.`,
        },
        contentText: 'The Incident. At 04:00 UTC, our background telemetry workers spiked from 250MB RSS to over 2.1GB...',
        coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
        format: 'dev_log' as const,
        isAnonymous: false,
        status: 'published' as const,
        readingTimeMinutes: 4,
        viewsCount: 1100,
        clapsCount: 145,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        tags: ['nodejs', 'performance', 'devops'],
      },
      {
        authorId: marcusId,
        title: 'DevLog #19: Zero-Downtime Migration from MongoDB to Neon PostgreSQL',
        slug: 'devlog-19-zero-downtime-migration-from-mongodb-to-neon-postgresql',
        summary: 'Dual-write adapters, backfill orchestration, and moving 100,000 documents into relational tables without dropping a single write.',
        content: {
          body: `## Why We Migrated to Relational\n\nDocument stores served us well during prototyping, but complex queries across users, claps, bookmarks, and threaded comments required ACID consistency and strict foreign keys.\n\n### Migration Steps\n\n1. **Phase 1: Dual Writing** — New writes wrote to both Mongo and Postgres.\n2. **Phase 2: Historical Backfill** — A batch worker safely backfilled older records.\n3. **Phase 3: Verification & Cutover** — Read traffic switched to Postgres.\n\nNeon's serverless Postgres branching made schema testing effortless.`,
        },
        contentText: 'Why We Migrated to Relational. Document stores served us well during prototyping...',
        coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
        format: 'dev_log' as const,
        isAnonymous: false,
        status: 'published' as const,
        readingTimeMinutes: 5,
        viewsCount: 820,
        clapsCount: 94,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
        tags: ['postgresql', 'devops', 'architecture'],
      },

      // --- TUTORIALS SPACE ---
      {
        authorId: sarahId,
        title: 'Step-by-Step: Type-Safe Fullstack API with Drizzle ORM & Fastify',
        slug: 'step-by-step-type-safe-fullstack-api-with-drizzle-orm-and-fastify',
        summary: 'Learn how to construct a robust 4-tier layered architecture with TypeScript, Zod validation, and Drizzle ORM.',
        content: {
          body: `## Building Modern Backend APIs\n\nIn this tutorial, we will build a production-grade Fastify API connected to Neon PostgreSQL using Drizzle ORM.\n\n### Step 1: Define Schemas with Drizzle\n\`\`\`typescript\nexport const posts = pgTable('posts', {\n  id: uuid('id').defaultRandom().primaryKey(),\n  title: varchar('title', { length: 255 }).notNull(),\n  status: varchar('status', { length: 20 }).default('draft').notNull(),\n});\n\`\`\`\n\n### Step 2: Implement the Repository Layer\nDecouple SQL from business logic with explicit interfaces.\n\n### Step 3: Fastify Controller & Zod Middleware\nValidate inputs early to keep controllers lean and type-safe.`,
        },
        contentText: 'Building Modern Backend APIs. In this tutorial, we will build a production-grade Fastify API...',
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        format: 'tutorial' as const,
        isAnonymous: false,
        status: 'published' as const,
        readingTimeMinutes: 7,
        viewsCount: 1650,
        clapsCount: 210,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
        tags: ['typescript', 'nodejs', 'postgresql'],
      },

      // --- CONFESSIONS SPACE (ANONYMOUS) ---
      {
        authorId: marcusId,
        title: 'I accidentally dropped production database replicas at 2 AM on a Friday',
        slug: 'i-accidentally-dropped-production-database-replicas-at-2-am-on-a-friday',
        summary: 'A junior engineer, a misleading shell prompt, and an unintended DROP DATABASE command in production.',
        content: {
          body: `## It Started With a Typo\n\nI was supposed to run the cleanup script on staging-replica-2. I had three terminal tabs open. All with black backgrounds. All with standard green text.\n\nI hit Enter. The terminal paused for three terrifying seconds.\n\nThen the alerts fired: PagerDuty, Slack, OpsGenie all screamed simultaneously.\n\n### How We Survived\n\nPoint-in-time recovery and WAL replay saved our bacon within 45 minutes. Lesson learned: always use colored hostname prompts and require confirmation tokens for destructive DDL commands.`,
        },
        contentText: 'It Started With a Typo. I was supposed to run the cleanup script on staging-replica-2...',
        coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
        format: 'confession' as const,
        isAnonymous: true,
        status: 'published' as const,
        readingTimeMinutes: 3,
        viewsCount: 3400,
        clapsCount: 395,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), // 6 days ago
        tags: ['confessions', 'career', 'devops'],
      },
      {
        authorId: alexId,
        title: "I've been using AI copilot for 80% of my regex and nobody has noticed",
        slug: 'ive-been-using-ai-copilot-for-80-percent-of-my-regex-and-nobody-has-noticed',
        summary: 'Confessing that life is too short to write complex lookahead and lookbehind regex from memory.',
        content: {
          body: `## The Truth Comes Out\n\nWhenever someone asks me during code review: "Alex, how did you come up with this regex for validating RFC 5322 compliant email headers?", I just nod knowingly and say:\n\n"Ah, just standard deterministic finite automaton theory."\n\nThe truth? I asked the AI: "write regex for RFC 5322 with unit tests" and copy-pasted it. Life is too short to debug lookarounds at 10 PM.`,
        },
        contentText: 'The Truth Comes Out. Whenever someone asks me during code review...',
        coverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800',
        format: 'confession' as const,
        isAnonymous: true,
        status: 'published' as const,
        readingTimeMinutes: 2,
        viewsCount: 2900,
        clapsCount: 310,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        tags: ['confessions', 'career'],
      },

      // --- AUTHOR STUDIO DRAFTS ---
      {
        authorId: alexId,
        title: 'Draft: Benchmarking Bun vs Node 22 on High-Throughput HTTP Workloads',
        slug: 'draft-benchmarking-bun-vs-node-22-on-high-throughput-http-workloads',
        summary: 'Preliminary findings comparing request per second, latency percentiles, and memory footprint.',
        content: {
          body: `## Benchmarking Setup\n\nTesting HTTP request handling under 10,000 concurrent connections across Node 22 (Fastify) and Bun native HTTP server...\n\n[DRAFT IN PROGRESS - AUTO-SAVED IN STUDIO]`,
        },
        contentText: 'Benchmarking Setup. Testing HTTP request handling under 10,000 concurrent connections...',
        coverImage: null,
        format: 'article' as const,
        isAnonymous: false,
        status: 'draft' as const,
        readingTimeMinutes: 2,
        viewsCount: 0,
        clapsCount: 0,
        publishedAt: null,
        tags: ['nodejs', 'performance'],
      },
    ];

    const postMap = new Map<string, string>(); // slug -> postId

    for (const p of seedPostsData) {
      const [existing] = await db.select().from(posts).where(eq(posts.slug, p.slug)).limit(1);
      let postId: string;

      if (existing) {
        postId = existing.id;
        postMap.set(p.slug, postId);
        console.log(`  ↪ Post '${p.title}' already exists (${postId})`);
      } else {
        const { tags: postTagSlugs, ...postFields } = p;
        const [inserted] = await db.insert(posts).values(postFields).returning();
        postId = inserted.id;
        postMap.set(p.slug, postId);
        console.log(`  ✓ Inserted [${p.format.toUpperCase()}] '${p.title}' (${postId})`);

        // Link post tags
        for (const tagSlug of postTagSlugs) {
          const tagId = tagMap.get(tagSlug);
          if (tagId) {
            await db
              .insert(postTags)
              .values({ postId, tagId })
              .onConflictDoNothing();
          }
        }
      }
    }

    // ==========================================
    // 4. SEED INTERACTIONS (CLAPS, COMMENTS, FOLLOWS, BOOKMARKS)
    // ==========================================
    console.log('\n👏 Seeding Social Interactions (Claps, Comments, Follows, Bookmarks)...');

    const socketArticleId = postMap.get('architecting-real-time-microservices-with-socketio-and-nodejs');
    const nextjsArticleId = postMap.get('inside-nextjs-15-app-router-server-actions-and-partial-prerendering');
    const drizzleTutorialId = postMap.get('step-by-step-type-safe-fullstack-api-with-drizzle-orm-and-fastify');
    const adminId = userMap.get('admin')!;

    // Claps
    if (socketArticleId) {
      await db.insert(claps).values({ postId: socketArticleId, userId: sarahId, count: 25 }).onConflictDoNothing();
      await db.insert(claps).values({ postId: socketArticleId, userId: marcusId, count: 15 }).onConflictDoNothing();
    }
    if (nextjsArticleId) {
      await db.insert(claps).values({ postId: nextjsArticleId, userId: alexId, count: 30 }).onConflictDoNothing();
      await db.insert(claps).values({ postId: nextjsArticleId, userId: adminId, count: 10 }).onConflictDoNothing();
    }

    // Threaded Nested Comments
    if (socketArticleId) {
      const [rootComment] = await db
        .insert(comments)
        .values({
          postId: socketArticleId,
          authorId: sarahId,
          content: 'The dual-mode authentication flow using ephemeral tokens solves the API key leak issue completely. Great writeup, Alex!',
        })
        .onConflictDoNothing()
        .returning();

      if (rootComment) {
        await db
          .insert(comments)
          .values({
            postId: socketArticleId,
            authorId: alexId,
            parentId: rootComment.id,
            content: 'Thanks Sarah! The 1-hour TTL combined with room grant scoping makes it rock solid in production.',
          })
          .onConflictDoNothing();
      }
    }

    if (drizzleTutorialId) {
      await db
        .insert(comments)
        .values({
          postId: drizzleTutorialId,
          authorId: marcusId,
          content: 'Drizzle ORM with Neon serverless has cut our cold-start latency down to sub-15ms. Excellent guide!',
        })
        .onConflictDoNothing();
    }

    // Follows Graph
    await db.insert(follows).values({ followerId: alexId, followingId: sarahId }).onConflictDoNothing();
    await db.insert(follows).values({ followerId: sarahId, followingId: alexId }).onConflictDoNothing();
    await db.insert(follows).values({ followerId: marcusId, followingId: alexId }).onConflictDoNothing();
    await db.insert(follows).values({ followerId: adminId, followingId: alexId }).onConflictDoNothing();
    await db.insert(follows).values({ followerId: adminId, followingId: sarahId }).onConflictDoNothing();

    // Bookmarks (Reading Lists)
    if (drizzleTutorialId) {
      await db.insert(bookmarks).values({ userId: alexId, postId: drizzleTutorialId }).onConflictDoNothing();
    }
    if (socketArticleId) {
      await db.insert(bookmarks).values({ userId: sarahId, postId: socketArticleId }).onConflictDoNothing();
    }
    if (nextjsArticleId) {
      await db.insert(bookmarks).values({ userId: adminId, postId: nextjsArticleId }).onConflictDoNothing();
    }

    console.log('  ✓ Social interactions seeded (claps, nested comments, follows, bookmarks)');
    console.log('\n✨ Database successfully seeded! Platform is ready for runtime.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
};

runSeed();
