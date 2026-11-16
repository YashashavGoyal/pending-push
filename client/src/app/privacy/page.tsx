import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy & Data Pledge — Pending Push',
  description: 'Our commitment to zero third-party tracking, safe harbor anonymous confessions, and author data ownership.'
};

export default function PrivacyPage() {
  return (
    <main className="page-wrapper">
      <div className="container-narrow">

        <header style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-dev">Legal &amp; Trust</span>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Effective November 2026</span>
          </div>
          <h1 className="title-page">Privacy Policy &amp; Data Pledge</h1>
          <p className="text-secondary" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
            At <strong>Pending Push</strong>, we believe engineering publications should respect your focus, your privacy, and your intellectual property. No bloated trackers, no surveillance capitalism.
          </p>
        </header>

        <div className="card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-6)' }}>
          <div className="prose">
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-2)' }}>
              1. The Zero-Surveillance Guarantee
            </h2>
            <p>
              We do not sell, rent, or monetize your personal data. We do not embed third-party advertising networks, cross-site trackers, or invasive analytics pixels. Readership telemetry (views, read-completion rates) is computed entirely in-house using aggregate, privacy-preserving counters.
            </p>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', margin: 'var(--space-6) 0 var(--space-2)' }}>
              2. Confessions Space Safe Harbor
            </h2>
            <p>
              The <strong>Confessions Space</strong> is built on radical developer empathy. When you submit a confession:
            </p>
            <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.7 }}>
              <li>Your submission is completely unlinked from your user account.</li>
              <li>Network IP addresses and user agents are purged immediately upon receipt.</li>
              <li>Confessions are never indexed with personal identifying markers.</li>
            </ul>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', margin: 'var(--space-6) 0 var(--space-2)' }}>
              3. Author Content Ownership
            </h2>
            <p>
              You own 100% of the articles, dev logs, diffs, and tutorial tracks you author on Pending Push. You grant us a non-exclusive license to format and display your work. You may export your content in portable Markdown or delete your account at any time.
            </p>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', margin: 'var(--space-6) 0 var(--space-2)' }}>
              4. Cookies and Local Storage
            </h2>
            <p>
              We only use essential local storage keys to store your active session token and UI display preferences (such as light/dark mode and monospace font ligatures). We do not store third-party advertising cookies.
            </p>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', margin: 'var(--space-6) 0 var(--space-2)' }}>
              5. Account Deletion &amp; Data Rights
            </h2>
            <p>
              Under GDPR, CCPA, and our developer covenant, you have the right to request a complete export of your account data or instant deletion from our PostgreSQL databases.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-6)' }}>
          <Link
            href="/register"
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span className="icon icon-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </span>
            <span>Back to Registration</span>
          </Link>
          <Link href="/" className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
            Return to Gateway
          </Link>
        </div>

      </div>
    </main>
  );
}
