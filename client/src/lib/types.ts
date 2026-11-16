export interface Author {
  id?: string;
  name: string;
  username: string;
  avatar: string;
  role?: string;
  bio?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  category: 'article' | 'dev-log' | 'tutorial' | 'confession';
  author: Author;
  readTime: string;
  relates: number;
  publishedAt: string;
  tags: string[];
  thumbnail?: {
    kicker?: string;
    subtext?: string;
    badge?: string;
  };
}

export interface TutorialTrack {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  totalSteps: number;
  completedSteps: number;
  status: 'started' | 'completed' | 'saved';
  tags: string[];
  lastPracticed?: string;
}

export interface Confession {
  id: string;
  alias: string;
  avatarIcon: string;
  category: 'incidents' | 'imposter' | 'career' | 'latenight';
  categoryLabel: string;
  message: string;
  timeAgo: string;
  relates: number;
  commentsCount: number;
}
