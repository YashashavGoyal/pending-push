import { Post, TutorialTrack, Confession } from './types';
import { FEATURED_STORY, FEED_STORIES, TUTORIAL_TRACKS, CONFESSIONS_DATA } from './mock-data';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchFeed(): Promise<{ featured: Post; stories: Post[] }> {
  try {
    const res = await fetch(`${API_BASE}/api/post/feed`, {
      next: { revalidate: 30 }
    });
    if (!res.ok) throw new Error('Backend feed unavailable');
    const data = await res.json();
    return {
      featured: data.featured || FEATURED_STORY,
      stories: Array.isArray(data) ? data : data.posts || FEED_STORIES
    };
  } catch (err) {
    // Graceful fallback to rich mock data
    return {
      featured: FEATURED_STORY,
      stories: FEED_STORIES
    };
  }
}

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_BASE}/api/post/slug/${slug}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error('Post not found on backend');
    return await res.json();
  } catch (err) {
    if (slug === FEATURED_STORY.slug) return FEATURED_STORY;
    const found = FEED_STORIES.find(s => s.slug === slug);
    return found || FEATURED_STORY;
  }
}

export async function fetchTutorials(): Promise<TutorialTrack[]> {
  return TUTORIAL_TRACKS;
}

export async function fetchConfessions(): Promise<Confession[]> {
  return CONFESSIONS_DATA;
}
