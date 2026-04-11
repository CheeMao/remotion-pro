import React from 'react';
import { AbsoluteFill, interpolate, useVideoConfig } from 'remotion';
import { getSlideMotionTiming } from '../templates/animationTiming';
import { getElementProgress } from '../templates/runtimeTiming';
import { getSafeAreaInsets } from './safeArea';
import type { SharedLayoutProps } from './types';

export const DefaultLayout: React.FC<SharedLayoutProps> = ({
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
  const timing = getSlideMotionTiming(durationInFrames, slide.points?.length ?? 0);
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
  const subtitleProgress = getElementProgress({
    frame,
    fps,
    elementTimings: slide.elementTimings,
    slideAudioStart: slide.audioStart,
    id: 'subtitle',
    fallbackStart: timing.subtitleStart,
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
        justifyContent: 'center',
      }}
    >
      {theme.effects.grid ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(${theme.palette.border} 1px, transparent 1px),
              linear-gradient(90deg, ${theme.palette.border} 1px, transparent 1px)
            `,
            backgroundSize: '72px 72px',
            opacity: 0.4,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          top: safeArea.headerTop,
          left: safeArea.headerSide,
          padding: '10px 16px',
          borderRadius: theme.radius.chip,
          fontSize: theme.typography.overlineSize,
          letterSpacing: '0.14em',
          fontWeight: 800,
          color: theme.palette.muted,
          background: theme.palette.surfaceAlt,
          border: `1px solid ${theme.palette.border}`,
        }}
      >
        SHARED LAYOUT
      </div>
      <div
        style={{
          position: 'absolute',
          top: safeArea.headerTop,
          right: safeArea.headerSide,
          fontSize: 22,
          fontWeight: 800,
          color: theme.palette.muted,
        }}
      >
        {String(index + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: theme.typography.titleSize,
            lineHeight: 1.03,
            fontWeight: theme.typography.titleWeight,
            maxWidth: 780,
            opacity: titleProgress,
            transform: `translateY(${interpolate(titleProgress, [0, 1], [42, 0])}px)`,
          }}
        >
          {slide.title}
        </h1>

        {slide.subtitle ? (
          <p
            style={{
              margin: 0,
              maxWidth: 760,
              fontSize: theme.typography.subtitleSize,
              lineHeight: 1.45,
              color: theme.palette.muted,
              opacity: subtitleProgress,
              transform: `translateY(${interpolate(subtitleProgress, [0, 1], [26, 0])}px)`,
            }}
          >
            {slide.subtitle}
          </p>
        ) : null}

        {slide.points && slide.points.length > 0 ? (
          <div style={{ display: 'grid', gap: 16, marginTop: 18, maxWidth: 820 }}>
            {slide.points.map((point, pointIndex) => {
              const progress = getElementProgress({
                frame,
                fps,
                elementTimings: slide.elementTimings,
                slideAudioStart: slide.audioStart,
                id: `point-${pointIndex}`,
                fallbackStart:
                  timing.pointsStart + pointIndex * theme.motion.staggerFrames,
                damping: theme.motion.damping,
                stiffness: theme.motion.stiffness,
              });
              const accent = theme.palette.accents[pointIndex % theme.palette.accents.length];

              return (
                <div
                  key={`${pointIndex}-${point}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '14px 1fr',
                    gap: 16,
                    alignItems: 'center',
                    padding: '18px 22px',
                    borderRadius: theme.radius.panel,
                    background: theme.palette.surface,
                    border: `1px solid ${theme.palette.border}`,
                    opacity: progress,
                    transform: `translateX(${interpolate(progress, [0, 1], [-36, 0])}px)`,
                    boxShadow: theme.effects.glass
                      ? '0 24px 50px rgba(0,0,0,0.18)'
                      : '0 18px 40px rgba(0,0,0,0.12)',
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 999,
                      background: accent,
                      boxShadow: theme.effects.glow ? `0 0 18px ${accent}` : 'none',
                    }}
                  />
                  <div
                    style={{
                      fontSize: theme.typography.bodySize,
                      lineHeight: 1.45,
                      fontWeight: theme.typography.bodyWeight,
                    }}
                  >
                    {point}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
