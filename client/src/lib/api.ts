import type { Post, TutorialTrack, Confession } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getAuthHeader(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const resolvedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  if (resolvedToken) {
    headers['Authorization'] = `Bearer ${resolvedToken}`;
  }
  return headers;
}

// ----------------- DATA NORMALIZERS (DB -> CLIENT) -----------------

export function normalizePost(p: any): Post {
  if (!p) {
    throw new Error('Cannot normalize null or undefined post');
  }

  const categoryMap: Record<string, 'article' | 'dev-log' | 'tutorial' | 'confession'> = {
    article: 'article',
    dev_log: 'dev-log',
    'dev-log': 'dev-log',
    tutorial: 'tutorial',
    confession: 'confession'
  };

  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80';
  const authorData = p.author || {};

  let contentText = '';
  if (typeof p.content === 'string') {
    contentText = p.content;
  } else if (typeof p.content === 'object' && p.content !== null && 'body' in p.content) {
    contentText = String(p.content.body);
  } else {
    contentText = p.contentText || '';
  }

  return {
    id: p.id || '',
    title: p.title || 'Untitled Post',
    slug: p.slug || '',
    summary: p.summary || contentText.slice(0, 160),
    content: contentText,
    category: categoryMap[p.format || p.category] || 'article',
    author: {
      id: authorData.id || p.authorId,
      name: authorData.name || (p.isAnonymous ? 'Anonymous Developer' : 'Author'),
      username: authorData.username || (p.isAnonymous ? 'anonymous' : 'author'),
      avatar: authorData.avatar || authorData.avatarUrl || defaultAvatar,
      role: authorData.role || (p.isAnonymous ? 'Verified Dev' : 'Contributor'),
      bio: authorData.bio || ''
    },
    readTime: p.readTime || `${p.readingTimeMinutes || 1} min read`,
    relates: p.relates ?? p.clapsCount ?? 0,
    publishedAt: p.publishedAt
      ? new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Recently',
    tags: Array.isArray(p.tags) ? p.tags : [],
    thumbnail: p.thumbnail || (p.metadata?.thumbnail ? p.metadata.thumbnail : undefined)
  };
}

export function normalizeConfession(p: any): Confession {
  const categoryLabels: Record<string, string> = {
    incidents: 'Incidents & Production',
    imposter: 'Imposter Syndrome',
    career: 'Career & Team',
    latenight: 'Late Night Regrets'
  };

  const cat = (p.metadata?.confessionCategory || p.category || 'incidents') as Confession['category'];
  const validCat: Confession['category'] = ['incidents', 'imposter', 'career', 'latenight'].includes(cat) ? cat : 'incidents';

  return {
    id: p.id,
    alias: p.author?.name || p.alias || 'Anonymous Developer',
    avatarIcon: p.metadata?.avatarIcon || p.avatarIcon || 'fox',
    category: validCat,
    categoryLabel: categoryLabels[validCat] || 'Production Confession',
    message: typeof p.content === 'string' ? p.content : (p.summary || p.message || ''),
    timeAgo: p.publishedAt
      ? new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Recently',
    relates: p.relates ?? p.clapsCount ?? 0,
    commentsCount: p.commentsCount ?? 0
  };
}

export function normalizeTutorial(p: any): TutorialTrack {
  const meta = p.metadata || {};
  return {
    id: p.id,
    slug: p.slug || '',
    title: p.title || 'Untitled Tutorial',
    description: p.summary || '',
    level: meta.level || 'Intermediate',
    duration: meta.duration || `${p.readingTimeMinutes || 15} mins`,
    totalSteps: meta.totalSteps || 5,
    completedSteps: meta.completedSteps || 0,
    status: meta.status || 'started',
    tags: Array.isArray(p.tags) ? p.tags : ['Engineering'],
    lastPracticed: meta.lastPracticed || (p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : undefined)
  };
}

// ----------------- FEEDS & POSTS (DIRECT FROM DB) -----------------

export async function fetchFeed(format?: string): Promise<{ featured: Post | null; stories: Post[] }> {
  try {
    const url = format ? `${API_BASE}/api/post/feed?format=${format}` : `${API_BASE}/api/post/feed`;
    const res = await fetch(url, {
      next: { revalidate: 30 }
    });
    if (!res.ok) throw new Error('Backend feed unavailable');
    const data = await res.json();
    const rawPosts: any[] = Array.isArray(data) ? data : data.posts || [];
    const stories = rawPosts.map(normalizePost);
    return {
      featured: stories.length > 0 ? stories[0] : null,
      stories: stories.length > 1 ? stories.slice(1) : (stories.length === 1 ? stories : [])
    };
  } catch {
    return {
      featured: null,
      stories: []
    };
  }
}

export async function fetchSpaceFeed(space: string): Promise<Post[]> {
  try {
    const res = await fetch(`${API_BASE}/api/post/spaces/${space}`, {
      next: { revalidate: 30 }
    });
    if (!res.ok) throw new Error(`Space feed for ${space} unavailable`);
    const data = await res.json();
    const rawPosts: any[] = data.posts || [];
    return rawPosts.map(normalizePost);
  } catch {
    return [];
  }
}

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_BASE}/api/post/slug/${slug}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.post ? normalizePost(data.post) : null;
  } catch {
    return null;
  }
}

export async function fetchRandomPost(): Promise<Post | null> {
  try {
    const res = await fetch(`${API_BASE}/api/post/random`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.post ? normalizePost(data.post) : null;
  } catch {
    return null;
  }
}

export async function fetchTutorials(): Promise<TutorialTrack[]> {
  try {
    const res = await fetch(`${API_BASE}/api/post/spaces/tutorials`, {
      next: { revalidate: 30 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const rawPosts: any[] = data.posts || [];
    return rawPosts.map(normalizeTutorial);
  } catch {
    return [];
  }
}

export async function fetchConfessions(): Promise<Confession[]> {
  try {
    const res = await fetch(`${API_BASE}/api/post/spaces/confessions`, {
      next: { revalidate: 30 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const rawPosts: any[] = data.posts || [];
    return rawPosts.map(normalizeConfession);
  } catch {
    return [];
  }
}

// ----------------- AUTHOR STUDIO & DRAFTS LIFECYCLE -----------------

export interface CreatePostPayload {
  title: string;
  content: string;
  summary?: string;
  format?: string;
  coverImage?: string;
  isAnonymous?: boolean;
  published?: boolean;
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];
}

export async function createPost(
  input: CreatePostPayload,
  token?: string | null
): Promise<{ success: boolean; post?: Post; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/post/new`, {
      method: 'POST',
      headers: getAuthHeader(token),
      body: JSON.stringify(input)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || 'Failed to create post' };
    }
    return {
      success: true,
      post: data.post ? normalizePost(data.post) : undefined,
      message: data.message
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network error creating post'
    };
  }
}

export async function updatePost(
  id: string,
  input: Partial<CreatePostPayload>,
  token?: string | null
): Promise<{ success: boolean; post?: Post; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/post/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(token),
      body: JSON.stringify(input)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || 'Failed to update post' };
    }
    return {
      success: true,
      post: data.post ? normalizePost(data.post) : undefined,
      message: data.message
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network error updating post'
    };
  }
}

export async function fetchAuthorDrafts(token?: string | null): Promise<Post[]> {
  try {
    const res = await fetch(`${API_BASE}/api/post/drafts`, {
      headers: getAuthHeader(token)
    });
    if (!res.ok) return [];
    const data = await res.json();
    const rawDrafts: any[] = data.drafts || [];
    return rawDrafts.map(normalizePost);
  } catch {
    return [];
  }
}

export async function fetchPostForEdit(id: string, token?: string | null): Promise<Post | null> {
  try {
    const res = await fetch(`${API_BASE}/api/post/${id}/edit`, {
      headers: getAuthHeader(token)
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.post ? normalizePost(data.post) : null;
  } catch {
    return null;
  }
}

export async function publishPost(id: string, token?: string | null): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/post/${id}/publish`, {
      method: 'POST',
      headers: getAuthHeader(token)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function unpublishPost(id: string, token?: string | null): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/post/${id}/unpublish`, {
      method: 'POST',
      headers: getAuthHeader(token)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deletePost(id: string, token?: string | null): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/post/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(token)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export interface TagItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postsCount: number;
}

export async function fetchTags(): Promise<TagItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/tags`, {
      next: { revalidate: 120 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.tags || [];
  } catch {
    return [];
  }
}

// ----------------- AUTHENTICATION -----------------

export async function loginUser(
  body: { email?: string; username?: string; password?: string; role?: string }
): Promise<{ success: boolean; token?: string; user?: any; message?: string }> {
  try {
    const endpoint = body.role === 'admin' ? `${API_BASE}/api/auth/admin-login` : `${API_BASE}/api/auth/login`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      const user = data.user || {
        name: body.role === 'admin' ? 'Security Admin' : (body.email?.split('@')[0] || 'User'),
        username: body.role === 'admin' ? 'admin' : (body.email?.split('@')[0] || 'user'),
        email: body.email || '',
        role: body.role || 'author',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'
      };
      return { success: true, token: data.accessToken || data.token, user, message: data.message };
    }
    return { success: false, message: data.message || 'Login failed' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error during login' };
  }
}

export async function registerUser(
  body: { name: string; username: string; email: string; password?: string; privacyPolicyAccepted?: boolean }
): Promise<{ success: boolean; token?: string; user?: any; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      const user = data.user || {
        name: body.name,
        username: body.username,
        email: body.email,
        role: 'author',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'
      };
      return { success: true, token: data.accessToken || data.token, user, message: data.message };
    }
    return { success: false, message: data.message || 'Registration failed' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error during registration' };
  }
}

// ----------------- INTERACTIONS: CLAPS & BOOKMARKS -----------------

export async function clapPost(
  postId: string,
  claps: number = 1,
  token?: string | null
): Promise<{ success: boolean; totalClaps?: number; userClaps?: number; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}/clap`, {
      method: 'POST',
      headers: getAuthHeader(token),
      body: JSON.stringify({ claps })
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message };
    return { success: true, totalClaps: data.totalClaps, userClaps: data.userClaps };
  } catch (err: any) {
    return { success: false, message: err?.message };
  }
}

export async function toggleBookmark(
  postId: string,
  token?: string | null
): Promise<{ success: boolean; bookmarked: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}/bookmark`, {
      method: 'POST',
      headers: getAuthHeader(token)
    });
    const data = await res.json();
    if (!res.ok) return { success: false, bookmarked: false, message: data.message };
    return { success: true, bookmarked: data.bookmarked };
  } catch (err: any) {
    return { success: false, bookmarked: false, message: err?.message };
  }
}

export async function fetchBookmarks(token?: string | null): Promise<Post[]> {
  try {
    const res = await fetch(`${API_BASE}/api/bookmarks`, {
      headers: getAuthHeader(token)
    });
    if (!res.ok) return [];
    const data = await res.json();
    const rawBookmarks: any[] = data.bookmarks || [];
    return rawBookmarks.map(normalizePost);
  } catch {
    return [];
  }
}

// ----------------- COMMENTS & DISCUSSIONS -----------------

export interface CommentItem {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  content: string;
  parentId?: string | null;
  createdAt: string;
  replies?: CommentItem[];
}

export async function fetchComments(postId: string): Promise<CommentItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.comments || [];
  } catch {
    return [];
  }
}

export async function addComment(
  postId: string,
  content: string,
  parentId?: string | null,
  token?: string | null
): Promise<{ success: boolean; comment?: CommentItem; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: getAuthHeader(token),
      body: JSON.stringify({ content, parentId })
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message || 'Failed to post comment' };
    return { success: true, comment: data.comment, message: data.message };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error posting comment' };
  }
}

export async function deleteComment(commentId: string, token?: string | null): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeader(token)
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ----------------- AUTHOR FOLLOWS & SESSIONS -----------------

export async function toggleFollow(
  userId: string,
  token?: string | null
): Promise<{ success: boolean; following: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/users/${userId}/follow`, {
      method: 'POST',
      headers: getAuthHeader(token)
    });
    const data = await res.json();
    return { success: true, following: data.following };
  } catch {
    return { success: false, following: false };
  }
}

export async function fetchFollowingFeed(token?: string | null): Promise<Post[]> {
  try {
    const res = await fetch(`${API_BASE}/api/posts/feed/following`, {
      headers: getAuthHeader(token)
    });
    if (!res.ok) return [];
    const data = await res.json();
    const rawPosts: any[] = data.posts || [];
    return rawPosts.map(normalizePost);
  } catch {
    return [];
  }
}

export interface DeviceSession {
  id: string;
  ipAddress: string;
  userAgent: string;
  deviceType: string;
  browser: string;
  os: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export async function fetchActiveSessions(token?: string | null): Promise<DeviceSession[]> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/sessions`, {
      headers: getAuthHeader(token)
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.sessions || [];
  } catch {
    return [];
  }
}

export async function revokeSession(sessionId: string, token?: string | null): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: getAuthHeader(token)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function revokeOtherSessions(token?: string | null): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/sessions/other`, {
      method: 'DELETE',
      headers: getAuthHeader(token)
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ----------------- ANALYTICS & ACTIVITY HEATMAP -----------------

export interface ActivityDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ActivityHeatmapData {
  days: ActivityDay[];
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
}

export async function fetchUserActivity(
  username: string,
  token?: string | null
): Promise<ActivityHeatmapData> {
  try {
    const res = await fetch(`${API_BASE}/api/users/${username}/activity`, {
      headers: getAuthHeader(token),
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error('User activity not found');
    const data = await res.json();
    if (data.activity) return data.activity;
  } catch {}

  return {
    days: [],
    totalContributions: 0,
    currentStreak: 0,
    longestStreak: 0
  };
}

// ----------------- AUTHOR TELEMETRY & ADMIN METRICS -----------------

export interface StoryMetric {
  id: string;
  title: string;
  slug: string;
  format: string;
  status: string;
  viewsCount: number;
  clapsCount: number;
  publishedAt?: string | null;
  createdAt?: string;
}

export interface AuthorTelemetry {
  totalViews: number;
  totalClaps: number;
  totalFollowers: number;
  publishedPushesCount: number;
  draftsCount: number;
  avgRetentionRate: number;
  recentStories: StoryMetric[];
}

export async function fetchAuthorTelemetry(token?: string | null): Promise<AuthorTelemetry> {
  try {
    const res = await fetch(`${API_BASE}/api/analytics/author`, {
      headers: getAuthHeader(token)
    });
    if (!res.ok) throw new Error('Author telemetry failed');
    const data = await res.json();
    if (data.telemetry) return data.telemetry;
  } catch {}

  return {
    totalViews: 0,
    totalClaps: 0,
    totalFollowers: 0,
    publishedPushesCount: 0,
    draftsCount: 0,
    avgRetentionRate: 0,
    recentStories: []
  };
}

export interface PlatformStats {
  totalUsers: number;
  totalPosts: number;
  totalPublishedPosts: number;
  totalDrafts: number;
  totalConfessions: number;
  totalComments: number;
  totalClaps: number;
}

export async function fetchPlatformStats(token?: string | null): Promise<PlatformStats> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/stats`, {
      headers: getAuthHeader(token)
    });
    if (!res.ok) throw new Error('Platform stats failed');
    const data = await res.json();
    if (data.stats) return data.stats;
  } catch {}

  return {
    totalUsers: 0,
    totalPosts: 0,
    totalPublishedPosts: 0,
    totalDrafts: 0,
    totalConfessions: 0,
    totalComments: 0,
    totalClaps: 0
  };
}

export async function updateUserRole(
  userId: string,
  role: 'admin' | 'user',
  token?: string | null
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: getAuthHeader(token),
      body: JSON.stringify({ role })
    });
    return res.ok;
  } catch {
    return false;
  }
}
