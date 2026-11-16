'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // 1. Completely hide navbar on focused auth pages (/login & /register)
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="site-header" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <div className="container navbar">
        {/* Brand Link */}
        <Link href="/" className="brand-link">
          <span className="brand-icon">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="6" y1="3" x2="6" y2="15" />
              <circle cx="18" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
          </span>
          <span>Pending Push</span>
        </Link>

        {/* 4 Dedicated Spaces Navigation (Segmented Pill) */}
        <nav>
          <ul className="spaces-nav">
            <li className="spaces-nav-item">
              <Link href="/articles" className={isActive('/articles') ? 'active' : ''}>
                <span className="icon icon-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                    <path d="M6 6h10" />
                    <path d="M6 10h10" />
                  </svg>
                </span>
                <span>Articles</span>
              </Link>
            </li>
            <li className="spaces-nav-item">
              <Link href="/dev-logs" className={isActive('/dev-logs') ? 'active' : ''}>
                <span className="icon icon-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </span>
                <span>Dev Logs</span>
              </Link>
            </li>
            <li className="spaces-nav-item">
              <Link href="/tutorials" className={isActive('/tutorials') ? 'active' : ''}>
                <span className="icon icon-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </span>
                <span>Tutorials</span>
              </Link>
            </li>
            <li className="spaces-nav-item">
              <Link href="/confessions" className={isActive('/confessions') ? 'active' : ''}>
                <span className="icon icon-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span>Confessions</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right Nav Utilities */}
        <div className="nav-actions">
          {/* Surprise Me Randomizer */}
          <Link href="/random" className="nav-icon-btn" title="Surprise Me (Random Push)">
            <span className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </span>
          </Link>

          {/* Theme Toggler */}
          <button className="nav-icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            <span className="icon">
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </span>
          </button>

          {/* AUTHENTICATION STATE RENDERING */}
          {!isLoading && isAuthenticated && user ? (
            <>
              {/* Write a Push CTA */}
              <Link href="/studio" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
                <span className="icon icon-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
                <span>Write a Push</span>
              </Link>

              {/* Logged In User Avatar & Dropdown */}
              <div className="user-menu-wrapper" style={{ position: 'relative' }}>
                <button
                  className="user-avatar-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-label="Open User Menu"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <img
                    className="user-avatar-img"
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                    alt={user.name}
                    style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-full)', border: '2px solid var(--brand-terracotta)' }}
                  />
                  <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      style={{ position: 'fixed', inset: 0, zIndex: 1090 }}
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div
                      className="dropdown-menu show"
                      style={{
                        display: 'block',
                        position: 'absolute',
                        right: 0,
                        top: '110%',
                        minWidth: '220px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-card)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-popup)',
                        padding: 'var(--space-2)',
                        zIndex: 1100
                      }}
                    >
                    <div style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)', marginBottom: 'var(--space-2)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{user.name}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        @{user.username} • <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
                      </div>
                    </div>
                    <Link href="/studio" className="dropdown-link" onClick={() => setDropdownOpen(false)}>
                      <span className="icon icon-sm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </span>
                      <span>Markdown Studio</span>
                    </Link>
                    <Link href="/dashboard" className="dropdown-link" onClick={() => setDropdownOpen(false)}>
                      <span className="icon icon-sm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <path d="M3 9h18" />
                          <path d="M9 21V9" />
                        </svg>
                      </span>
                      <span>Dashboard &amp; Telemetry</span>
                    </Link>
                    <Link href={`/profile/${user.username}`} className="dropdown-link" onClick={() => setDropdownOpen(false)}>
                      <span className="icon icon-sm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <span>Public Profile &amp; Heatmap</span>
                    </Link>
                    <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: 'var(--space-2) 0' }} />
                    <Link href="/settings" className="dropdown-link" onClick={() => setDropdownOpen(false)}>
                      <span>Account Settings</span>
                    </Link>
                    <Link href="/preferences" className="dropdown-link" onClick={() => setDropdownOpen(false)}>
                      <span>Display Preferences</span>
                    </Link>
                    <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: 'var(--space-2) 0' }} />
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="dropdown-link"
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-rose)',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      <span className="icon icon-sm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                      </span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                  </>
                )}
              </div>
            </>
          ) : (
            /* LOGGED OUT STATE */
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Link
                href="/login"
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem' }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn btn-primary btn-sm"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem' }}
              >
                Create Account
              </Link>
            </div>
          )}

          {/* Mobile Drawer Trigger */}
          <button className="mobile-nav-toggle" onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}>
            <span className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="mobile-drawer open" style={{ display: 'flex' }}>
          <Link href="/articles" className="dropdown-link" onClick={() => setMobileDrawerOpen(false)}>Articles Space</Link>
          <Link href="/dev-logs" className="dropdown-link" onClick={() => setMobileDrawerOpen(false)}>Dev Logs Space</Link>
          <Link href="/tutorials" className="dropdown-link" onClick={() => setMobileDrawerOpen(false)}>Tutorials Space</Link>
          <Link href="/confessions" className="dropdown-link" onClick={() => setMobileDrawerOpen(false)}>Confessions Space</Link>
          <Link href="/random" className="dropdown-link" onClick={() => setMobileDrawerOpen(false)}>Surprise Me</Link>
          <div className="dropdown-divider" />
          {isAuthenticated && user ? (
            <>
              <Link href="/studio" className="dropdown-link" onClick={() => setMobileDrawerOpen(false)}>Markdown Studio</Link>
              <Link href="/dashboard" className="dropdown-link" onClick={() => setMobileDrawerOpen(false)}>Dashboard</Link>
              <button
                onClick={() => {
                  logout();
                  setMobileDrawerOpen(false);
                }}
                className="dropdown-link"
                style={{ color: 'var(--accent-rose)', width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="dropdown-link" onClick={() => setMobileDrawerOpen(false)} style={{ color: 'var(--brand-terracotta)', fontWeight: 600 }}>Sign In</Link>
              <Link href="/register" className="dropdown-link" onClick={() => setMobileDrawerOpen(false)}>Create Account</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
