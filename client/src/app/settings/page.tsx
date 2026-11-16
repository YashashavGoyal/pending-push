'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [name, setName] = useState('Alex Rivera');
  const [handle, setHandle] = useState('alexrivera');
  const [email, setEmail] = useState('alex@pendingpush.dev');
  const [bio, setBio] = useState('Staff Engineer & Technical Writer. Building modern full-stack systems with Fastify and Next.js 15. Open source contributor and architecture advocate. Sharing notes over coffee.');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <main className="page-wrapper">
      <div className="container">

        <div className="settings-layout">
          
          <aside className="settings-sidebar">
            <Link href="/settings" className="settings-tab-link active">Profile &amp; Credentials</Link>
            <Link href="/preferences" className="settings-tab-link">Display Preferences</Link>
            <Link href="/profile/alexrivera" className="settings-tab-link">View Public Profile</Link>
          </aside>

          <section className="card" style={{ padding: 'var(--space-8)' }}>
            <h1 className="title-page" style={{ fontSize: '1.45rem', marginBottom: 'var(--space-6)' }}>Profile &amp; Visibility Settings</h1>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-5)', borderBottom: '1px solid var(--border-subtle)' }}>
              <img
                style={{ width: '4.5rem', height: '4.5rem', borderRadius: '999px', objectFit: 'cover', border: '2px solid var(--border-subtle)' }}
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="Alex Rivera"
              />
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button type="button" className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>Upload Photo</button>
                <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-rose)' }}>Remove</button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
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

        </div>

      </div>
    </main>
  );
}
