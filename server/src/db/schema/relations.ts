import { relations } from 'drizzle-orm';
import { users } from './users.js';
import { userSessions } from './sessions.js';
import { posts } from './posts.js';
import { tags, postTags } from './tags.js';
import { claps } from './claps.js';
import { bookmarks } from './bookmarks.js';
import { follows } from './follows.js';
import { comments } from './comments.js';

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  sessions: many(userSessions),
  claps: many(claps),
  bookmarks: many(bookmarks),
  comments: many(comments),
  followers: many(follows, { relationName: 'followers' }),
  following: many(follows, { relationName: 'following' }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  tags: many(postTags),
  claps: many(claps),
  bookmarks: many(bookmarks),
  comments: many(comments),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export const clapsRelations = relations(claps, ({ one }) => ({
  post: one(posts, {
    fields: [claps.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [claps.userId],
    references: [users.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [bookmarks.postId],
    references: [posts.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'commentReplies',
  }),
  replies: many(comments, { relationName: 'commentReplies' }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: 'following',
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: 'followers',
  }),
}));
