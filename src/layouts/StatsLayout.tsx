import React from 'react';
import { AbsoluteFill, interpolate, useVideoConfig } from 'remotion';
import { getSlideMotionTiming } from '../templates/animationTiming';
import { getElementProgress } from '../templates/runtimeTiming';
import { getSafeAreaInsets } from './safeArea';
import type { SharedLayoutProps } from './types';

interface StatItem {
  value?: number | string;
  suffix?: string;
  label?: string;
}

export const StatsLayout: React.FC<SharedLayoutProps> = ({
  slide,
  theme,
  frame,
  fps,
  index,
  totalSlides,
  durationInFrames,
}) => {
  const { width, height } = useVideoConfig();
  const safeArea = getSafeAreaInsets(width, height);
  const stats = ((slide.data?.stats as StatItem[] | undefined) || []).slice(0, 4);
  const timing = getSlideMotionTiming(durationInFrames, stats.length || 3);
  const titleProgress = getElementProgress({
    frame,
    fps,
    elementTimings: slide.elementTimings,
    slideAudioStart: slide.audioStart,
    id: 'title',
    fallbackStart: timing.titleStart,
    damping: theme.motion.damping,
    stiffness: theme.motion.stiffness,
  });

  return (
    <AbsoluteFill
      style={{
        background: theme.palette.background,
        color: theme.palette.text,
        fontFamily: theme.typography.fontFamily,
        padding: `${safeArea.top}px ${safeArea.right}px ${safeArea.bottom}px ${safeArea.left}px`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: safeArea.headerTop,
          right: safeArea.headerSide,
          color: theme.palette.muted,
          fontSize: 22,
          fontWeight: 800,
        }}
      >
        {String(index + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1
          style={{
            margin: 0,
            maxWidth: 760,
            fontSize: theme.typography.titleSize - 4,
            lineHeight: 1.02,
            fontWeight: theme.typography.titleWeight,
            opacity: titleProgress,
            transform: `translateY(${interpolate(titleProgress, [0, 1], [36, 0])}px)`,
          }}
        >
          {slide.title}
        </h1>
        {slide.subtitle ? (
          <p
            style={{
              margin: '16px 0 28px',
              maxWidth: 760,
              fontSize: theme.typography.subtitleSize,
              lineHeight: 1.45,
              color: theme.palette.muted,
            }}
          >
            {slide.subtitle}
          </p>
        ) : null}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: stats.length > 2 ? '1fr 1fr' : `repeat(${Math.max(stats.length, 1)}, 1fr)`,
            gap: 18,
            marginTop: 18,
          }}
        >
          {stats.map((stat, statIndex) => {
            const progress = getElementProgress({
              frame,
              fps,
              elementTimings: slide.elementTimings,
              slideAudioStart: slide.audioStart,
              id: `stat-${statIndex}`,
              fallbackStart: timing.pointsStart + statIndex * theme.motion.staggerFrames,
              damping: theme.motion.damping,
              stiffness: theme.motion.stiffness,
            });
            const accent = theme.palette.accents[statIndex % theme.palette.accents.length];
            return (
              <div
                key={`${stat.label}-${statIndex}`}
                style={{
                  padding: '28px 24px',
                  borderRadius: theme.radius.panel,
                  background: theme.palette.surface,
                  border: `1px solid ${theme.palette.border}`,
                  opacity: progress,
                  transform: `translateY(${interpolate(progress, [0, 1], [32, 0])}px)`,
                  boxShadow: theme.effects.glass
                    ? '0 24px 50px rgba(0,0,0,0.18)'
                    : '0 18px 40px rgba(0,0,0,0.12)',
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: accent,
                    letterSpacing: '0.12em',
                    marginBottom: 14,
                  }}
                >
                  {String(statIndex + 1).padStart(2, '0')}
                </div>
                <div
                  style={{
                    fontSize: theme.typography.titleSize - 10,
                    lineHeight: 1,
                    fontWeight: 900,
                    color: theme.palette.text,
                  }}
                >
                  {stat.value}
                  {stat.suffix || ''}
                </div>
                <div
                  style={{
                    marginTop: 16,
                    fontSize: theme.typography.bodySize - 2,
                    color: theme.palette.muted,
                    lineHeight: 1.45,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
