/**
 * BLOGSPHERE - MOCK DATA REPOSITORY
 * Realistic mock data simulating the Fastify backend API contracts
 */

const MockData = {
  // Current logged in user / Profile author
  currentUser: {
    id: "usr_9918",
    username: "alexrivera",
    name: "Alex Rivera",
    email: "alex@blogsphere.dev",
    role: "author",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    bio: "Staff Engineer & Technical Writer. Building modern full-stack web applications with Next.js, Fastify, and TypeScript. Open source enthusiast.",
    location: "San Francisco, CA",
    joinedDate: "March 2024",
    website: "https://alexrivera.dev",
    github: "alexrivera",
    twitter: "alexrivera_dev",
    isPublic: true,
    stats: {
      totalReads: "142.8K",
      totalViews: "318.5K",
      followers: 1240,
      following: 189,
      publishedArticles: 28,
      tutorialsCompleted: 1450,
      averageEngagement: "8.4%",
      topCategory: "Software Architecture"
    }
  },

  // Blog Posts covering Simple Blog, Devs Blog, Tutorials, and Confessions
  posts: [
    {
      id: "p_101",
      slug: "modern-fullstack-architecture-with-fastify-and-nextjs",
      type: "dev", // 'simple', 'dev', 'tutorial', 'confession'
      title: "Building High-Throughput Web Applications with Fastify and Next.js 15",
      summary: "A deep dive into combining Fastify's blazing fast schema-driven backend with Next.js Server Components for unmatched developer ergonomics.",
      coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
      readingTimeMinutes: 7,
      publishedDate: "Nov 15, 2026",
      tags: ["Fastify", "Next.js", "TypeScript", "Performance"],
      views: 18450,
      likes: 642,
      commentsCount: 38,
      author: {
        username: "alexrivera",
        name: "Alex Rivera",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
      }
    },
    {
      id: "p_102",
      slug: "the-psychology-of-deep-work-for-developers",
      type: "simple",
      title: "The Subtle Art of Protecting Your Cognitive Bandwidth as an Engineer",
      summary: "Why endless context switching ruins engineering teams, and how structured asynchronous communication unlocks effortless 4-hour deep focus blocks.",
      coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80",
      readingTimeMinutes: 5,
      publishedDate: "Nov 14, 2026",
      tags: ["Productivity", "Mindset", "Deep Work"],
      views: 9230,
      likes: 819,
      commentsCount: 54,
      author: {
        username: "elenap",
        name: "Elena Rostova",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
      }
    },
    {
      id: "p_103",
      slug: "hands-on-tutorial-building-realtime-dashboard",
      type: "tutorial",
      title: "Hands-on Masterclass: Building an Analytics Heatmap Dashboard from Scratch",
      summary: "Follow this step-by-step interactive blueprint to design, architect, and deploy a responsive public insights dashboard with live event streams.",
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      readingTimeMinutes: 14,
      difficulty: "Intermediate",
      stepsCount: 4,
      publishedDate: "Nov 12, 2026",
      tags: ["Tutorial", "Frontend", "Data Viz", "CSS Grid"],
      views: 24500,
      likes: 1320,
      commentsCount: 92,
      author: {
        username: "alexrivera",
        name: "Alex Rivera",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
      }
    },
    {
      id: "p_104",
      slug: "confessions-junior-dev-imposter-syndrome",
      type: "confession",
      title: "I broke production database migrations on my first month and no one noticed until Tuesday",
      summary: "An anonymous look into the panic, the silent sweat, and what healthy blameless engineering post-mortems actually look like in real life.",
      readingTimeMinutes: 3,
      publishedDate: "2 hours ago",
      tags: ["Confession", "Career", "DevLife"],
      relateCount: 412,
      author: {
        username: "anonymous_owl",
        name: "Anonymous Owl",
        avatar: "🦉"
      }
    },
    {
      id: "p_105",
      slug: "mastering-css-subgrid-and-container-queries",
      type: "dev",
      title: "CSS Container Queries and Subgrid: The Modern Layout Revolution",
      summary: "Ditch breakpoint-heavy media query hacks for modular component-driven responsive layouts that automatically adapt to any container width.",
      coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
      readingTimeMinutes: 6,
      publishedDate: "Nov 10, 2026",
      tags: ["CSS", "WebDev", "UI Design"],
      views: 11200,
      likes: 540,
      commentsCount: 22,
      author: {
        username: "sarahcodes",
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80"
      }
    }
  ],

  // Anonymous Confessions
  confessions: [
    {
      id: "c_1",
      alias: "Midnight Coder",
      icon: "🦊",
      timeAgo: "15 minutes ago",
      tag: "Career & Work",
      content: "I've been a Senior Software Engineer for 6 years, and I still look up how to center a div with flexbox vs grid every single Friday afternoon. Never gets old.",
      relates: 382,
      isRelateActive: false
    },
    {
      id: "c_2",
      alias: "Shadow Architect",
      icon: "🦇",
      timeAgo: "2 hours ago",
      tag: "Tech Secrets",
      content: "We spent 9 months migrating our monolithic app into 24 microservices. Yesterday our team quietly merged 18 of them back into a modular monolith. Deploy times went from 42 mins to 90 seconds. Nobody dares to tell VP of Product.",
      relates: 894,
      isRelateActive: true
    },
    {
      id: "c_3",
      alias: "Caffeine Addict",
      icon: "☕",
      timeAgo: "5 hours ago",
      tag: "Life & Hacks",
      content: "I write my best algorithms at 1:30 AM with lo-fi beats playing on repeat. In the morning standup I pretend I thought of the solution in the shower.",
      relates: 512,
      isRelateActive: false
    }
  ]
};

window.MockData = MockData;
