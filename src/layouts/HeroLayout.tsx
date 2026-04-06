import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSlideMotionTiming } from '../templates/animationTiming';
import { getElementProgress } from '../templates/runtimeTiming';
import type { SharedLayoutProps } from './types';

export const HeroLayout: React.FC<SharedLayoutProps> = ({
  slide,
  theme,
  frame,
  fps,
  index,
  totalSlides,
  durationInFrames,
}) => {
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
  const badge =
    (slide.data?.badge as string | undefined) ||
    (slide.data?.eyebrow as string | undefined) ||
    'FEATURE';

  return (
    <AbsoluteFill
      style={{
        background: theme.palette.background,
        color: theme.palette.text,
        fontFamily: theme.typography.fontFamily,
        padding: '74px 72px',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            `radial-gradient(circle at 20% 24%, ${theme.palette.accents[0]}24 0%, transparent 34%),` +
            `radial-gradient(circle at 78% 24%, ${theme.palette.accents[1] || theme.palette.accents[0]}22 0%, transparent 30%),` +
            `radial-gradient(circle at 60% 78%, ${theme.palette.accents[2] || theme.palette.accents[0]}18 0%, transparent 30%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 38,
          right: 44,
          color: theme.palette.muted,
          fontSize: 22,
          fontWeight: 800,
        }}
      >
        {String(index + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
      </div>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 860 }}>
        <div
          style={{
            display: 'inline-flex',
            marginBottom: 20,
            padding: '10px 18px',
            borderRadius: theme.radius.chip,
            background: theme.palette.surfaceAlt,
            border: `1px solid ${theme.palette.border}`,
            color: theme.palette.text,
            fontSize: theme.typography.overlineSize,
            fontWeight: 800,
            letterSpacing: '0.14em',
            opacity: subtitleProgress,
          }}
        >
          {badge}
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: theme.typography.titleSize + 12,
            lineHeight: 0.98,
            fontWeight: theme.typography.titleWeight,
            opacity: titleProgress,
            transform: `translateY(${interpolate(titleProgress, [0, 1], [42, 0])}px)`,
            textShadow: theme.effects.glow ? `0 0 30px ${theme.palette.accents[0]}30` : 'none',
          }}
        >
          {slide.title}
        </h1>
        {slide.subtitle ? (
          <p
            style={{
              margin: '20px 0 0',
              fontSize: theme.typography.subtitleSize + 2,
              lineHeight: 1.45,
              color: theme.palette.muted,
              maxWidth: 760,
              opacity: subtitleProgress,
              transform: `translateY(${interpolate(subtitleProgress, [0, 1], [28, 0])}px)`,
            }}
          >
            {slide.subtitle}
          </p>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
