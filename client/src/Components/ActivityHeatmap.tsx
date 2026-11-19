'use client';

import { useState } from 'react';
import { ActivityHeatmapData, ActivityDay } from '@/lib/api';

interface ActivityHeatmapProps {
  activity: ActivityHeatmapData;
  username: string;
}

export default function ActivityHeatmap({ activity, username }: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<ActivityDay | null>(null);

  // Group days into 52 or 53 weeks (columns of 7)
  const weeks: ActivityDay[][] = [];
  let currentWeek: ActivityDay[] = [];

  activity.days.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === activity.days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getCellColor = (level: 0 | 1 | 2 | 3 | 4) => {
    switch (level) {
      case 1:
        return 'rgba(249, 115, 22, 0.3)';
      case 2:
        return 'rgba(249, 115, 22, 0.55)';
      case 3:
        return 'rgba(249, 115, 22, 0.8)';
      case 4:
        return 'var(--brand-terracotta, #f97316)';
      default:
        return 'var(--bg-tertiary, rgba(255, 255, 255, 0.04))';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00Z');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
      {/* Header with Title & Live Telemetry KPI pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-dev">Activity Telemetry</span>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>@{username}</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-display)' }}>
            52-Week Developer Contributions
          </h2>
        </div>

        {/* Contribution & Streak Badges */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div style={{ padding: '0.4rem 0.85rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-terracotta)', lineHeight: 1.1 }}>
              {activity.totalContributions.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Pushes
            </div>
          </div>

          <div style={{ padding: '0.4rem 0.85rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-sage, #10b981)', lineHeight: 1.1 }}>
              {activity.currentStreak}d
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Current Streak
            </div>
          </div>

          <div style={{ padding: '0.4rem 0.85rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {activity.longestStreak}d
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Longest Streak
            </div>
          </div>
        </div>
      </div>

      {/* Grid Canvas Wrapper with responsive horizontal scrollbar if needed */}
      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'inline-flex', gap: '3px', minWidth: '700px' }}>
          {weeks.map((week, wIdx) => (
            <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {week.map((day) => (
                <div
                  key={day.date}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  title={`${day.count} push${day.count === 1 ? '' : 'es'} on ${formatDate(day.date)}`}
                  style={{
                    width: '11px',
                    height: '11px',
                    borderRadius: '2px',
                    backgroundColor: getCellColor(day.level),
                    border: day.level === 0 ? '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))' : 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease, filter 0.1s ease',
                    boxShadow: hoveredDay?.date === day.date ? '0 0 6px var(--brand-terracotta)' : 'none',
                    transform: hoveredDay?.date === day.date ? 'scale(1.35)' : 'none',
                    zIndex: hoveredDay?.date === day.date ? 10 : 1
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Details: Active Tooltip & Scale Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div style={{ minHeight: '1.2rem', fontFamily: 'var(--font-mono)' }}>
          {hoveredDay ? (
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
              {hoveredDay.count} {hoveredDay.count === 1 ? 'push' : 'pushes'} on {formatDate(hoveredDay.date)}
            </span>
          ) : (
            <span>Hover over any block to view daily push history</span>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>Less</span>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: getCellColor(0), border: '1px solid var(--border-subtle)' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: getCellColor(1) }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: getCellColor(2) }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: getCellColor(3) }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: getCellColor(4) }} />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
