'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TutorialRunnerPage() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);

  const toggleStep = (stepNum: number) => {
    setCompletedSteps(prev =>
      prev.includes(stepNum) ? prev.filter(s => s !== stepNum) : [...prev, stepNum]
    );
  };

  const totalSteps = 4;
  const progressPercent = Math.round((completedSteps.length / totalSteps) * 100);

  return (
    <main className="page-wrapper">
      <div className="container">

        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-4)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link href="/tutorials">Tutorials Hub</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Building a Heatmap</span>
        </div>

        <div className="tutorial-runner-layout">
          
          {/* Left Sidebar: Steps Checklist */}
          <aside className="tutorial-sidebar-nav">
            <div style={{ marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Your Progress
              </div>
              <div style={{ fontSize: '0.885rem', fontWeight: 700, color: 'var(--accent-sage)', margin: '0.35rem 0' }}>
                {completedSteps.length} of {totalSteps} steps completed ({progressPercent}%)
              </div>
              <div className="tutorial-progress-mini">
                <div
                  className="tutorial-progress-fill"
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--brand-terracotta), var(--accent-sage))',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 250ms ease'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {[
                { num: 1, title: '1. CSS Grid Layout' },
                { num: 2, title: '2. Quantile Bins' },
                { num: 3, title: '3. Fastify Service' },
                { num: 4, title: '4. Accessibility Spec' },
              ].map(step => {
                const isDone = completedSteps.includes(step.num);
                return (
                  <button
                    key={step.num}
                    onClick={() => toggleStep(step.num)}
                    className={`tutorial-step-item ${isDone ? 'active' : ''}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      fontFamily: 'inherit'
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '1.15rem',
                        height: '1.15rem',
                        borderRadius: '4px',
                        border: isDone ? 'none' : '1.5px solid var(--border-strong)',
                        backgroundColor: isDone ? 'var(--status-emerald)' : 'transparent',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        marginRight: '0.5rem',
                        flexShrink: 0
                      }}
                    >
                      {isDone && '✓'}
                    </span>
                    <span>{step.title}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div>Author: Alex Rivera</div>
              <div>Completions: 1,450 developers</div>
            </div>
          </aside>

          {/* Right Content: Step Execution */}
          <article>
            
            <header style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <span className="badge badge-tutorial">Step-by-step masterclass</span>
                <span className="badge badge-neutral">⏱️ ~25 Mins</span>
              </div>
              <h1 className="title-page">
                Building a High-Performance Public Insights Heatmap from Scratch
              </h1>
              <p className="text-secondary" style={{ fontSize: '1.05rem', marginTop: 'var(--space-2)', lineHeight: 1.6 }}>
                Learn how to visualize readership activity grids using pure CSS Grid, minimal DOM memory overhead, and Fastify aggregation endpoints.
              </p>
            </header>

            {/* Prerequisites Card */}
            <div className="card" style={{ marginBottom: 'var(--space-6)', borderLeft: '4px solid var(--accent-sage)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem', color: 'var(--text-main)' }}>Prerequisites</div>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.885rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                <li>Node.js 18+ and a running Fastify 5.x or Next.js 15 app.</li>
                <li>Basic knowledge of CSS Grid layout principles.</li>
                <li>An open terminal window.</li>
              </ul>
            </div>

            {/* Step 1 */}
            <section id="step-1" className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-tutorial">Step 01</span>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Est. 5 mins</span>
              </div>

              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 'var(--space-3) 0 var(--space-2)' }}>
                Define the CSS Grid Activity Heatmap Layout
              </h2>
              <p className="text-secondary" style={{ fontSize: '0.925rem', lineHeight: 1.6 }}>
                To eliminate heavy third-party charting libraries (which add 150kb+ to your bundle), construct the 52-week activity grid with semantic HTML divs and CSS Grid.
              </p>

              <div className="code-container">
                <div className="code-toolbar">
                  <span>styles/heatmap.css</span>
                  <button className="code-copy-action">
                    <span className="icon icon-sm">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                    </span>
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="code-pre">
                  <code>{`.activity-grid-52 {
  display: grid;
  grid-template-columns: repeat(26, 1fr);
  gap: 6px;
}

.activity-cell {
  aspect-ratio: 1;
  border-radius: 4px;
  background-color: var(--bg-subtle);
  transition: transform 150ms ease;
}`}</code>
                </pre>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                <button
                  onClick={() => toggleStep(1)}
                  className={`btn btn-sm ${completedSteps.includes(1) ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  {completedSteps.includes(1) ? 'Completed ✓ (Click to undo)' : 'Mark Step 1 Complete'}
                </button>
              </div>
            </section>

            {/* Step 2 */}
            <section id="step-2" className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-tutorial">Step 02</span>
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Est. 7 mins</span>
              </div>

              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 'var(--space-3) 0 var(--space-2)' }}>
                Compute Quantile Bins for Intensity
              </h2>
              <p className="text-secondary" style={{ fontSize: '0.925rem', lineHeight: 1.6 }}>
                Normalize raw activity numbers into 4 discreet warmth scales using logarithmic distribution rather than linear thresholds.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                <button
                  onClick={() => toggleStep(2)}
                  className={`btn btn-sm ${completedSteps.includes(2) ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  {completedSteps.includes(2) ? 'Completed ✓ (Click to undo)' : 'Mark Step 2 Complete'}
                </button>
              </div>
            </section>

          </article>

        </div>

      </div>
    </main>
  );
}
