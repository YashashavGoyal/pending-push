'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { fetchActiveSessions, revokeSession, revokeOtherSessions, DeviceSession } from '@/lib/api';

export default function SettingsPage() {
  const { user, token, login } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'sessions'>('profile');

  // Profile Form state
  const [name, setName] = useState(user?.name || 'Alex Rivera');
  const [handle, setHandle] = useState(user?.username || 'alexrivera');
  const [email, setEmail] = useState(user?.email || 'alex@pendingpush.dev');
  const [bio, setBio] = useState(
    'Staff Engineer & Technical Writer. Building modern full-stack systems with Fastify and Next.js 15. Open source contributor and architecture advocate. Sharing notes over coffee.'
  );
  const [isSaved, setIsSaved] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessionsMsg, setSessionsMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setHandle(user.username);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'sessions') {
      setLoadingSessions(true);
      fetchActiveSessions(token).then(data => {
        setSessions(data);
        setLoadingSessions(false);
      });
    }
  }, [activeTab, token]);

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && token) {
      login(token, {
        ...user,
        name: name.trim(),
        username: handle.trim(),
        email: email.trim()
      });
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleRevokeSingle = async (sessionId: string) => {
    await revokeSession(sessionId, token);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    setSessionsMsg('Device session revoked successfully.');
    setTimeout(() => setSessionsMsg(null), 3000);
  };

  const handleRevokeOthers = async () => {
    await revokeOtherSessions(token);
    setSessions(prev => prev.filter(s => s.isCurrent));
    setSessionsMsg('Logged out from all other remote device sessions.');
    setTimeout(() => setSessionsMsg(null), 3000);
  };

  return (
    <main className="page-wrapper">
      <div className="container">

        <div className="settings-layout">
          
          {/* Settings Navigation Sidebar */}
          <aside className="settings-sidebar">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`settings-tab-link ${activeTab === 'profile' ? 'active' : ''}`}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Profile &amp; Credentials
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sessions')}
              className={`settings-tab-link ${activeTab === 'sessions' ? 'active' : ''}`}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Active Devices &amp; Security
            </button>
            <Link href="/preferences" className="settings-tab-link">Display Preferences</Link>
            <Link href={`/profile/${user?.username || 'alexrivera'}`} className="settings-tab-link">View Public Profile</Link>
          </aside>

          {/* TAB 1: PROFILE & CREDENTIALS */}
          {activeTab === 'profile' && (
            <section className="card" style={{ padding: 'var(--space-8)' }}>
              <h1 className="title-page" style={{ fontSize: '1.45rem', marginBottom: 'var(--space-6)' }}>
                Profile &amp; Visibility Settings
              </h1>

              {/* Avatar Upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-5)', borderBottom: '1px solid var(--border-subtle)' }}>
                <img
                  style={{ width: '4.5rem', height: '4.5rem', borderRadius: '999px', objectFit: 'cover', border: '2px solid var(--border-subtle)' }}
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={user?.name || 'Alex Rivera'}
                />
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <button type="button" className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>Upload Photo</button>
                  <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-rose)' }}>Remove</button>
                </div>
              </div>

              <form onSubmit={handleSubmitProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Handle</label>
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                  <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Bio (Friendly introduction)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="form-input"
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', alignItems: 'center' }}>
                  {isSaved && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--status-emerald)', fontWeight: 600, fontSize: '0.85rem' }}>
                      ✓ Settings updated successfully
                    </span>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: 'var(--radius-full)' }}
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* TAB 2: ACTIVE DEVICES & SESSIONS */}
          {activeTab === 'sessions' && (
            <section className="card" style={{ padding: 'var(--space-8)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                  <h1 className="title-page" style={{ fontSize: '1.45rem', margin: 0 }}>
                    Active Devices &amp; Security Sessions
                  </h1>
                  <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Monitor authorized devices and revoke stale refresh token sessions.
                  </p>
                </div>
                {sessions.filter(s => !s.isCurrent).length > 0 && (
                  <button
                    type="button"
                    onClick={handleRevokeOthers}
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: 'var(--radius-full)', color: 'var(--accent-rose)' }}
                  >
                    Log Out All Other Devices
                  </button>
                )}
              </div>

              {sessionsMsg && (
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-emerald)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: 'var(--space-4)' }}>
                  ✓ {sessionsMsg}
                </div>
              )}

              {loadingSessions ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                  Inspecting active device sessions...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--space-4)',
                        backgroundColor: session.isCurrent ? 'var(--bg-subtle)' : 'var(--bg-card)',
                        border: `1px solid ${session.isCurrent ? 'var(--brand-terracotta)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-lg)',
                        flexWrap: 'wrap',
                        gap: 'var(--space-3)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <span
                          style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-subtle)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: session.isCurrent ? 'var(--brand-terracotta)' : 'var(--text-muted)'
                          }}
                        >
                          {session.deviceType === 'Mobile' ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                              <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                              <path d="M12 18h.01" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                              <rect width="20" height="14" x="2" y="3" rx="2" />
                              <line x1="8" y1="21" x2="16" y2="21" />
                              <line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                          )}
                        </span>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-main)' }}>
                              {session.browser} on {session.os}
                            </span>
                            {session.isCurrent && (
                              <span className="badge badge-dev" style={{ fontSize: '0.675rem' }}>
                                This Device (Current)
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                            IP: {session.ipAddress} • {session.lastActiveAt}
                          </div>
                        </div>
                      </div>

                      {!session.isCurrent && (
                        <button
                          type="button"
                          onClick={() => handleRevokeSingle(session.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', color: 'var(--accent-rose)' }}
                        >
                          Revoke Session
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

        </div>

      </div>
    </main>
  );
}
