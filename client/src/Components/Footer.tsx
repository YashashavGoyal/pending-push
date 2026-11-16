'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer completely on focused authentication pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="brand-icon" style={{ width: '1.75rem', height: '1.75rem', borderRadius: 'var(--radius-sm)' }}>
            <svg className="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="6" y1="3" x2="6" y2="15" />
              <circle cx="18" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
          </span>
          <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>Pending Push</span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span className="text-muted">A friendly, high-craft publishing platform for developers</span>
        </div>

        <ul className="footer-nav">
          <li><Link href="/articles">Articles</Link></li>
          <li><Link href="/dev-logs">Dev Logs</Link></li>
          <li><Link href="/tutorials">Tutorials</Link></li>
          <li><Link href="/confessions">Confessions</Link></li>
          <li><Link href="/random">Surprise Me</Link></li>
          <li><Link href="/dashboard">Dashboard</Link></li>
          <li><Link href="/privacy">Privacy Policy</Link></li>
          <li><Link href="/login">Sign In</Link></li>
        </ul>
      </div>
    </footer>
  );
}
