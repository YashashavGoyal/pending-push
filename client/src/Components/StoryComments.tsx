'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { fetchComments, addComment, deleteComment, CommentItem } from '@/lib/api';

interface StoryCommentsProps {
  postId: string;
}

export default function StoryComments({ postId }: StoryCommentsProps) {
  const { user, token, isAuthenticated } = useAuth();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchComments(postId).then(data => {
      setComments(data);
      setLoading(false);
    });
  }, [postId]);

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  const handlePostTopComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setSubmitting(true);
    const res = await addComment(postId, newContent.trim(), null, token);
    if (res.success && res.comment) {
      setComments([res.comment, ...comments]);
      setNewContent('');
    }
    setSubmitting(false);
  };

  const handlePostReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    const res = await addComment(postId, replyContent.trim(), parentId, token);
    if (res.success && res.comment) {
      setComments(prev =>
        prev.map(c => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), res.comment!]
            };
          }
          return c;
        })
      );
      setReplyContent('');
      setReplyingToId(null);
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string, parentId?: string | null) => {
    await deleteComment(commentId, token);
    if (parentId) {
      setComments(prev =>
        prev.map(c => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: (c.replies || []).filter(r => r.id !== commentId)
            };
          }
          return c;
        })
      );
    } else {
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
  };

  return (
    <section style={{ marginTop: 'var(--space-10)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--border-subtle)' }}>
      
      {/* Discussion Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Discussion &amp; Notes
          </h2>
          <span className="badge badge-dev" style={{ fontSize: '0.8rem' }}>
            {totalCount} {totalCount === 1 ? 'thought' : 'thoughts'}
          </span>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Constructive, empathetic technical dialog
        </span>
      </div>

      {/* Top Comment Box */}
      <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
        <form onSubmit={handlePostTopComment}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
              alt={user?.name || 'You'}
              style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-full)', border: '2px solid var(--brand-terracotta)', flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="What are your thoughts on this RFC or benchmark? Leave an engineering note..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Supports markdown formatting
                </span>
                <button
                  type="submit"
                  disabled={submitting || !newContent.trim()}
                  className="btn btn-primary btn-sm"
                  style={{
                    borderRadius: 'var(--radius-full)',
                    padding: '0.35rem 1rem',
                    fontWeight: 700,
                    opacity: !newContent.trim() ? 0.5 : 1
                  }}
                >
                  {submitting ? 'Posting...' : 'Post Thought'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Comments List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>
          Loading conversation...
        </div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No comments yet. Be the first to share an architectural insight or question!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="card"
              style={{
                padding: 'var(--space-5)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-card)'
              }}
            >
              {/* Comment Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <img
                    src={comment.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                    alt={comment.authorName}
                    style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-full)' }}
                  />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginRight: '0.4rem' }}>
                      {comment.authorName}
                    </span>
                    <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      @{comment.authorUsername} • {comment.createdAt}
                    </span>
                  </div>
                </div>

                {/* Delete button (if current author) */}
                {(user?.username === comment.authorUsername || user?.role === 'admin') && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--accent-rose)', fontSize: '0.75rem', padding: '0.1rem 0.4rem' }}
                    title="Delete Comment"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Comment Body */}
              <div style={{ fontSize: '0.925rem', lineHeight: 1.65, color: 'var(--text-main)', paddingLeft: '2.6rem' }}>
                {comment.content}
              </div>

              {/* Action row (Reply trigger) */}
              <div style={{ paddingLeft: '2.6rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-terracotta)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {replyingToId === comment.id ? 'Cancel Reply' : '↩ Reply'}
                </button>
              </div>

              {/* Inline Reply Input Box */}
              {replyingToId === comment.id && (
                <div style={{ marginLeft: '2.6rem', marginTop: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Reply to ${comment.authorName}...`}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setReplyingToId(null)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={submitting || !replyContent.trim()}
                      onClick={() => handlePostReply(comment.id)}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.75rem', fontWeight: 700 }}
                    >
                      {submitting ? 'Replying...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              )}

              {/* Threaded Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div style={{ marginLeft: '2.6rem', marginTop: 'var(--space-4)', paddingLeft: 'var(--space-4)', borderLeft: '2px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {comment.replies.map(reply => (
                    <div key={reply.id} style={{ backgroundColor: 'var(--bg-subtle)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <img
                            src={reply.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                            alt={reply.authorName}
                            style={{ width: '1.5rem', height: '1.5rem', borderRadius: 'var(--radius-full)' }}
                          />
                          <span style={{ fontWeight: 700, fontSize: '0.825rem', color: 'var(--text-main)' }}>
                            {reply.authorName}
                          </span>
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                            @{reply.authorUsername} • {reply.createdAt}
                          </span>
                        </div>

                        {(user?.username === reply.authorUsername || user?.role === 'admin') && (
                          <button
                            type="button"
                            onClick={() => handleDelete(reply.id, comment.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--accent-rose)', fontSize: '0.7rem', padding: 0 }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                        {reply.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </section>
  );
}
