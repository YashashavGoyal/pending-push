import type { Post, TutorialTrack, Confession } from './types.ts';

export const FEATURED_STORY: Post = {
  id: 'featured-1',
  slug: 'art-of-code-simplicity',
  title: 'The Art of Code Simplicity: Why Boring Architecture Wins at Scale',
  summary: "Clever code is the developer's greatest temptation and the team's greatest maintenance liability. A retrospective on migrating our distributed multi-cluster setup back to simple, deterministic patterns.",
  category: 'article',
  author: {
    name: 'Marcus Vance',
    username: 'marcusv',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
    role: 'Principal Architect',
    bio: 'Systems architect interested in distributed consistency, zero-copy buffers, and asynchronous team workflows.'
  },
  readTime: '8 min read',
  relates: 312,
  publishedAt: 'Nov 14, 2026',
  tags: ['Architecture', 'CleanCode', 'Systems']
};

export const FEED_STORIES: Post[] = [
  {
    id: 'story-1',
    slug: 'zero-copy-serialization-fastify-v5',
    title: 'Zero-Copy Serialization in Fastify v5 with Avro and Rust Buffers',
    summary: 'Profiling our high-throughput gateway indicated JSON.stringify consumed 38% of CPU cycles under heavy concurrency. Compiling Avro schemas to native static structs boosted throughput by 3.1x.',
    category: 'dev-log',
    author: {
      name: 'Alex Rivera',
      username: 'alexrivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
      role: 'Staff Engineer'
    },
    readTime: '6 min read',
    relates: 184,
    publishedAt: 'Nov 15, 2026',
    tags: ['Fastify5', 'Rust', 'Performance'],
    thumbnail: {
      kicker: 'Fastify RFC #42',
      subtext: 'latency: 1.2ms',
      badge: '+3.1x throughput'
    }
  },
  {
    id: 'story-2',
    slug: 'building-resilient-real-time-microservices',
    title: 'Building Resilient Real-Time Microservices with Fastify 5 & Redis Streams',
    summary: 'Step-by-step masterclass covering consumer group topologies, backpressure tuning, and zero-downtime cluster rolling restarts. Features live code runners and syllabus progress.',
    category: 'tutorial',
    author: {
      name: 'Elena Rostova',
      username: 'elenarostova',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80',
      role: 'Senior Engineering Manager'
    },
    readTime: 'Step 3 of 5',
    relates: 420,
    publishedAt: 'Nov 12, 2026',
    tags: ['RedisStreams', 'Fastify5', 'Microservices'],
    thumbnail: {
      kicker: 'Masterclass Track',
      subtext: '45 mins total',
      badge: '60% Completed'
    }
  },
  {
    id: 'story-3',
    slug: 'confession-dropped-audit-database',
    title: '"I dropped the production audit database during a 3 AM scheduled migration..."',
    summary: 'I ran DROP TABLE logs_archive directly on production without a transaction block because connection string aliases were nearly identical. Restored from WAL in 47 terrifying minutes.',
    category: 'confession',
    author: {
      name: 'Anonymous Dev',
      username: 'shadow_architect',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
      role: 'Verified Dev'
    },
    readTime: '42m ago',
    relates: 895,
    publishedAt: 'Today',
    tags: ['PostMortem', 'Incidents'],
    thumbnail: {
      kicker: 'Confession #cf-8402',
      subtext: '100% Anonymous',
      badge: 'Uncommitted'
    }
  },
  {
    id: 'story-4',
    slug: 'protecting-cognitive-bandwidth',
    title: 'The Subtle Art of Protecting Your Cognitive Bandwidth as an Engineer',
    summary: 'Why endless context switching ruins engineering teams, and how structured asynchronous communication unlocks effortless 4-hour deep focus blocks.',
    category: 'article',
    author: {
      name: 'Elena Rostova',
      username: 'elenarostova',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80',
      role: 'Senior Engineering Manager'
    },
    readTime: '5 min read',
    relates: 819,
    publishedAt: 'Nov 10, 2026',
    tags: ['Productivity', 'Culture', 'DeepWork'],
    thumbnail: {
      kicker: 'Essay Dispatch',
      subtext: '5 min read',
      badge: 'Leadership'
    }
  }
];

export const TUTORIAL_TRACKS: TutorialTrack[] = [
  {
    id: 'track-1',
    slug: 'fastify-redis-streams',
    title: 'Building Resilient Real-Time Microservices with Fastify 5 & Redis Streams',
    description: 'Step-by-step masterclass covering consumer group topologies, backpressure tuning, and zero-downtime cluster rolling restarts.',
    level: 'Advanced',
    duration: '45 mins',
    totalSteps: 5,
    completedSteps: 3,
    status: 'started',
    tags: ['Fastify', 'Redis', 'Microservices', 'Backend'],
    lastPracticed: '2 hours ago'
  },
  {
    id: 'track-2',
    slug: 'public-insights-heatmap',
    title: 'Building a High-Performance Public Insights Heatmap from Scratch',
    description: 'Learn how to visualize readership activity grids using pure CSS Grid, minimal DOM memory overhead, and Fastify aggregation endpoints.',
    level: 'Intermediate',
    duration: '25 mins',
    totalSteps: 4,
    completedSteps: 2,
    status: 'started',
    tags: ['CSS Grid', 'UI', 'Heatmap', 'Analytics'],
    lastPracticed: 'Yesterday'
  },
  {
    id: 'track-3',
    slug: 'tiered-architecture-nodejs',
    title: 'Architecting 4-Tier Node.js Apps with Fastify & TypeScript',
    description: 'Decouple Fastify HTTP routes from controllers, services, and repositories for clean unit test mocking and contract-driven API schemas.',
    level: 'Advanced',
    duration: '40 mins',
    totalSteps: 5,
    completedSteps: 5,
    status: 'completed',
    tags: ['Fastify', 'TypeScript', 'Architecture', 'Testing'],
    lastPracticed: '3 days ago'
  },
  {
    id: 'track-4',
    slug: 'zero-downtime-migrations',
    title: 'Zero-Downtime Database Migrations with Knex & Post-Deploy Verification',
    description: 'How to run non-destructive schema migrations (expand and contract pattern) with safe fallback rollback scripts in production environments.',
    level: 'Advanced',
    duration: '50 mins',
    totalSteps: 6,
    completedSteps: 0,
    status: 'saved',
    tags: ['Knex', 'Database', 'Postgres', 'Migration']
  }
];

export const CONFESSIONS_DATA: Confession[] = [
  {
    id: 'cf-1',
    alias: 'Anonymous Fox',
    avatarIcon: 'fox',
    category: 'imposter',
    categoryLabel: 'Imposter Syndrome',
    message: "I've been a Staff Software Engineer for 6 years leading cross-team architectural reviews. I still look up how to center a div with flexbox vs grid every single Friday afternoon. Never gets old, and honestly? Zero regrets.",
    timeAgo: '15m ago',
    relates: 382,
    commentsCount: 24
  },
  {
    id: 'cf-2',
    alias: 'Shadow Architect',
    avatarIcon: 'shield',
    category: 'incidents',
    categoryLabel: 'Incidents & Production',
    message: "We spent 9 months migrating our monolithic app into 24 microservices. Yesterday our team quietly merged 18 of them back into a single modular repo. Deploy times plummeted from 42 mins to 90 seconds. Nobody dares to tell the VP of Product.",
    timeAgo: '2h ago',
    relates: 895,
    commentsCount: 67
  },
  {
    id: 'cf-3',
    alias: 'Async Badger',
    avatarIcon: 'alert',
    category: 'incidents',
    categoryLabel: 'Production Incident',
    message: "I once pushed a hotfix on a Friday at 5:45 PM that accidentally disabled user email notifications for 72 hours. Customer support told leadership that users were 'astonishingly calm and satisfied over the weekend'. We never turned them back on at full frequency.",
    timeAgo: '5h ago',
    relates: 512,
    commentsCount: 41
  }
];
