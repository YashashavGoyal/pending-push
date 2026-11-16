'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState<'author' | 'admin'>('author');

  useEffect(() => {
    if (user?.role) {
      setActiveRole(user.role);
    }
  }, [user]);

  const [usersList, setUsersList] = useState([
    { id: 'u-1', name: 'Alex Rivera', username: 'alexrivera', email: 'alex@pendingpush.dev', role: 'admin', status: 'Active', postsCount: 28 },
    { id: 'u-2', name: 'Marcus Vance', username: 'marcusv', email: 'marcus@systems.io', role: 'user', status: 'Active', postsCount: 14 },
    { id: 'u-3', name: 'Elena Rostova', username: 'elenarostova', email: 'elena@arch.org', role: 'user', status: 'Active', postsCount: 9 },
    { id: 'u-4', name: 'Sarah Chen', username: 'sarahc', email: 'sarah@ui-systems.dev', role: 'user', status: 'Active', postsCount: 6 },
    { id: 'u-5', name: 'David Kim', username: 'dkim', email: 'david@rustnet.io', role: 'user', status: 'Suspended', postsCount: 2 },
  ]);

  const [flaggedQueue, setFlaggedQueue] = useState([
    { id: 'rep-1', type: 'Confession', title: '"Dropped production audit database..."', reason: 'Contains internal AWS account alias', reportedBy: 'Automated Redactor', status: 'Pending Review' },
    { id: 'rep-2', type: 'Dev Log', title: 'Zero-Copy Serialization RFC', reason: 'Suggested benchmark methodology clarification', reportedBy: 'Peer Reviewer', status: 'Under Review' },
  ]);

  const toggleUserRole = (id: string) => {
    setUsersList(prev =>
      prev.map(u => {
        if (u.id === id) {
          const newRole = u.role === 'admin' ? 'user' : 'admin';
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  const handleDismissReport = (id: string) => {
    setFlaggedQueue(prev => prev.filter(r => r.id !== id));
  };

  return (
    <main className="page-wrapper">
      <div className="container">

        {/* TOP ROLE SWITCHER & IDENTITY BAR */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-4) var(--space-6)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 'var(--space-6)',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"}
              alt={user?.name || "Author"}
              style={{ width: '2.75rem', height: '2.75rem', borderRadius: 'var(--radius-full)', border: '2px solid var(--brand-terracotta)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>{user?.name || 'Alex Rivera'}</span>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>@{user?.username || 'alexrivera'}</span>
                {activeRole === 'author' ? (
                  <span className="badge badge-dev" style={{ fontSize: '0.75rem' }}>
                    Specified Role: Author / Contributor
                  </span>
                ) : (
                  <span className="badge badge-tutorial" style={{ fontSize: '0.75rem', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-indigo)' }}>
                    Specified Role: Platform Administrator
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                {activeRole === 'author'
                  ? 'Author permissions: Create, edit, and push dev logs, articles, and masterclasses.'
                  : 'Admin permissions: Moderate content, manage users and roles, audit system telemetry.'}
              </div>
            </div>
          </div>

          {/* Segmented Role Workspace Toggle */}
          <div
            style={{
              display: 'flex',
              gap: '0.25rem',
              backgroundColor: 'var(--bg-subtle)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <button
              onClick={() => setActiveRole('author')}
              style={{
                border: 'none',
                background: activeRole === 'author' ? 'var(--brand-terracotta)' : 'transparent',
                color: activeRole === 'author' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeRole === 'author' ? 700 : 500,
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.825rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              Author Workspace
            </button>
            <button
              onClick={() => setActiveRole('admin')}
              style={{
                border: 'none',
                background: activeRole === 'admin' ? 'var(--accent-indigo)' : 'transparent',
                color: activeRole === 'admin' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeRole === 'admin' ? 700 : 500,
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.825rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              Platform Admin Workspace
            </button>
          </div>
        </div>

        {/* ----------------- 1. AUTHOR WORKSPACE VIEW ----------------- */}
        {activeRole === 'author' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <h1 className="title-page" style={{ fontSize: '1.75rem', margin: 0 }}>Author Studio &amp; Telemetry</h1>
                <p className="text-secondary" style={{ fontSize: '0.925rem', marginTop: '0.25rem' }}>
                  Monitoring personal reads, audience retention, and active draft pushes.
                </p>
              </div>
              <Link href="/studio" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
                <span className="icon icon-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
                <span>Write a Push</span>
              </Link>
            </div>

            {/* Author KPI Cards */}
            <div className="insights-overview-grid" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="metric-tile">
                <div className="metric-tile-title">Total Article Reads</div>
                <div className="metric-tile-number" style={{ color: 'var(--brand-terracotta)' }}>142.8K</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-sage)', fontWeight: 600 }}>+18.4% this month</div>
              </div>

              <div className="metric-tile">
                <div className="metric-tile-title">Total Views</div>
                <div className="metric-tile-number">318.5K</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-sage)', fontWeight: 600 }}>+24.1% this month</div>
              </div>

              <div className="metric-tile">
                <div className="metric-tile-title">Followers</div>
                <div className="metric-tile-number">1,240</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-sage)', fontWeight: 600 }}>+84 new readers</div>
              </div>

              <div className="metric-tile">
                <div className="metric-tile-title">Avg. Reader Retention</div>
                <div className="metric-tile-number" style={{ color: 'var(--brand-terracotta)' }}>8.4%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>top 5% of creators</div>
              </div>
            </div>

            {/* Author Pushes Table */}
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h2 className="title-section" style={{ fontSize: '1.15rem', margin: 0 }}>My Published &amp; Pending Pushes</h2>
                <span className="badge badge-neutral">3 entries</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                      <th style={{ padding: '0.75rem 0.5rem' }}>TITLE</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>SPACE</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>STATUS</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>READS</th>
                      <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>
                        <Link href="/dev-logs/fastify-5-nextjs-15-high-throughput" style={{ color: 'var(--text-main)' }}>
                          Building High-Throughput Web Applications with Fastify and Next.js 15
                        </Link>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}><span className="badge badge-dev">dev-logs</span></td>
                      <td style={{ padding: '0.85rem 0.5rem' }}><span className="badge badge-tutorial">published</span></td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>18,450</td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                        <Link href="/studio" className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.6rem' }}>Edit</Link>
                      </td>
                    </tr>

                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>
                        <Link href="/tutorials/fastify-redis-streams" style={{ color: 'var(--text-main)' }}>
                          Building a High-Performance Public Insights Heatmap from Scratch
                        </Link>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}><span className="badge badge-tutorial">tutorials</span></td>
                      <td style={{ padding: '0.85rem 0.5rem' }}><span className="badge badge-tutorial">published</span></td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>9,820</td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                        <Link href="/studio" className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.6rem' }}>Edit</Link>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Zero-Copy Serialization in Fastify v5 with Avro and Native Structs
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}><span className="badge badge-dev">dev-logs</span></td>
                      <td style={{ padding: '0.85rem 0.5rem' }}><span className="badge badge-neutral">draft</span></td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>—</td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                        <Link href="/studio" className="btn btn-primary btn-sm" style={{ padding: '0.2rem 0.6rem' }}>Resume</Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- 2. ADMINISTRATOR WORKSPACE VIEW ----------------- */}
        {activeRole === 'admin' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <h1 className="title-page" style={{ fontSize: '1.75rem', margin: 0 }}>Platform Administration</h1>
                <p className="text-secondary" style={{ fontSize: '0.925rem', marginTop: '0.25rem' }}>
                  Managing user roles, system health, audit events, and content moderation queues.
                </p>
              </div>
              <span className="badge badge-tutorial" style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-indigo)', fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                System Status: All Nodes Healthy
              </span>
            </div>

            {/* Admin Platform KPI Cards */}
            <div className="insights-overview-grid" style={{ marginBottom: 'var(--space-6)' }}>
              <div className="metric-tile">
                <div className="metric-tile-title">Total Registered Users</div>
                <div className="metric-tile-number" style={{ color: 'var(--accent-indigo)' }}>14,820</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-sage)', fontWeight: 600 }}>+420 this week</div>
              </div>

              <div className="metric-tile">
                <div className="metric-tile-title">Total Published Pushes</div>
                <div className="metric-tile-number">3,450</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-sage)', fontWeight: 600 }}>Across 4 spaces</div>
              </div>

              <div className="metric-tile">
                <div className="metric-tile-title">Fastify 5 Cluster Uptime</div>
                <div className="metric-tile-number" style={{ color: 'var(--status-emerald)' }}>99.98%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>P99: 1.1ms latency</div>
              </div>

              <div className="metric-tile">
                <div className="metric-tile-title">Moderation Queue</div>
                <div className="metric-tile-number" style={{ color: 'var(--accent-rose)' }}>{flaggedQueue.length}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>requires review</div>
              </div>
            </div>

            {/* Moderation Queue Card */}
            {flaggedQueue.length > 0 && (
              <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', borderLeft: '4px solid var(--accent-rose)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                  <h2 className="title-section" style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-main)' }}>
                    Content Moderation &amp; Review Queue
                  </h2>
                  <span className="badge badge-confession">{flaggedQueue.length} items flagged</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {flaggedQueue.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--space-3) var(--space-4)',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)',
                        flexWrap: 'wrap',
                        gap: 'var(--space-3)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="badge badge-dev">{item.type}</span>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{item.title}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          Reason: <em>{item.reason}</em> • Flagged by {item.reportedBy}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                          onClick={() => handleDismissReport(item.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ borderRadius: 'var(--radius-full)' }}
                        >
                          Approve / Clear
                        </button>
                        <button
                          onClick={() => handleDismissReport(item.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--accent-rose)' }}
                        >
                          Redact
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Directory & Role Promotion Table */}
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div>
                  <h2 className="title-section" style={{ fontSize: '1.15rem', margin: 0 }}>User Directory &amp; Role Assignments</h2>
                  <p className="text-secondary" style={{ fontSize: '0.825rem', margin: 0 }}>
                    Promote contributors to Administrator or suspend accounts violating the Safe Harbor pledge.
                  </p>
                </div>
                <span className="badge badge-neutral">{usersList.length} registered accounts</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.885rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      <th style={{ padding: '0.75rem 0.5rem' }}>USER</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>EMAIL</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>SPECIFIED ROLE</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>PUSHES</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>STATUS</th>
                      <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>MANAGE ROLE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.name}</div>
                          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          {u.role === 'admin' ? (
                            <span className="badge badge-tutorial" style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-indigo)' }}>
                              admin
                            </span>
                          ) : (
                            <span className="badge badge-neutral">user (author)</span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem' }}>{u.postsCount}</td>
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.8rem',
                              color: u.status === 'Active' ? 'var(--status-emerald)' : 'var(--accent-rose)',
                              fontWeight: 600
                            }}
                          >
                            ● {u.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                          <button
                            onClick={() => toggleUserRole(u.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.65rem', fontSize: '0.775rem', borderRadius: 'var(--radius-full)' }}
                          >
                            {u.role === 'admin' ? 'Demote to Author' : 'Promote to Admin'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
