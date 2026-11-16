'use client';

import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useState } from 'react';

export default function PreferencesPage() {
  const { theme, toggleTheme } = useTheme();
  const [ligatures, setLigatures] = useState(true);
  const [lineNumbers, setLineNumbers] = useState(true);

  return (
    <main className="page-wrapper">
      <div className="container">

        <div className="settings-layout">
          
          <aside className="settings-sidebar">
            <Link href="/settings" className="settings-tab-link">Profile &amp; Credentials</Link>
            <Link href="/preferences" className="settings-tab-link active">Display Preferences</Link>
            <Link href="/profile/alexrivera" className="settings-tab-link">View Public Profile</Link>
          </aside>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            {/* Theme */}
            <div className="card" style={{ padding: 'var(--space-8)' }}>
              <h2 className="title-section" style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>Theme Mood</h2>
              <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 'var(--space-5)' }}>
                Select your reading palette. Both modes are calibrated for warm eye comfort with sunset tangerine accents.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div
                  className="card"
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    borderColor: theme === 'light' ? 'var(--brand-terracotta)' : 'var(--border-card)',
                    padding: 'var(--space-6)',
                    borderRadius: 'var(--radius-lg)'
                  }}
                  onClick={() => { if (theme !== 'light') toggleTheme(); }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem', color: 'var(--brand-terracotta)' }}>
                    ☀️
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Warm Parchment</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>Cozy daytime reading</div>
                </div>

                <div
                  className="card"
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    borderColor: theme === 'dark' ? 'var(--brand-terracotta)' : 'var(--border-card)',
                    padding: 'var(--space-6)',
                    borderRadius: 'var(--radius-lg)'
                  }}
                  onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem', color: 'var(--brand-terracotta)' }}>
                    🌙
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>Midnight Slate</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>Cozy low-strain dark mode</div>
                </div>
              </div>
            </div>

            {/* Code formatting */}
            <div className="card" style={{ padding: 'var(--space-8)' }}>
              <h2 className="title-section" style={{ fontSize: '1.15rem', marginBottom: 'var(--space-4)' }}>Dev Code Preferences</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>Enable Code Font Ligatures (=&gt;, !==, ===)</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>Uses JetBrains Mono ligatures</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={ligatures}
                    onChange={(e) => setLigatures(e.target.checked)}
                    style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>Show Line Numbers in Code Snippets</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>Display gutter markers for long diffs</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={lineNumbers}
                    onChange={(e) => setLineNumbers(e.target.checked)}
                    style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

          </section>

        </div>

      </div>
    </main>
  );
}
