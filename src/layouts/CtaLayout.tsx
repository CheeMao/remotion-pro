import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSlideMotionTiming } from '../templates/animationTiming';
import { getElementProgress } from '../templates/runtimeTiming';
import type { SharedLayoutProps } from './types';

export const CtaLayout: React.FC<SharedLayoutProps> = ({
  slide,
  theme,
  frame,
  fps,
  index,
  totalSlides,
  durationInFrames,
}) => {
  const timing = getSlideMotionTiming(durationInFrames, 1);
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
  const cta =
    (slide.data?.cta as string | undefined) ||
    (slide.data?.button as string | undefined) ||
    'Learn More';

  return (
    <AbsoluteFill
      style={{
        background: theme.palette.background,
        color: theme.palette.text,
        fontFamily: theme.typography.fontFamily,
        padding: '74px 72px',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
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
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '42px 46px',
          borderRadius: theme.radius.panel + 6,
          background: theme.palette.surface,
          border: `1px solid ${theme.palette.border}`,
          maxWidth: 860,
          textAlign: 'center',
          boxShadow: theme.effects.glass
            ? '0 24px 50px rgba(0,0,0,0.18)'
            : '0 18px 40px rgba(0,0,0,0.12)',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: theme.typography.titleSize,
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
              margin: '18px auto 0',
              maxWidth: 720,
              fontSize: theme.typography.subtitleSize,
              lineHeight: 1.45,
              color: theme.palette.muted,
              opacity: subtitleProgress,
              transform: `translateY(${interpolate(subtitleProgress, [0, 1], [24, 0])}px)`,
            }}
          >
            {slide.subtitle}
          </p>
        ) : null}
        <div
          style={{
            marginTop: 32,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 28px',
            borderRadius: theme.radius.chip,
            background: `linear-gradient(135deg, ${theme.palette.accents[0]}, ${theme.palette.accents[1] || theme.palette.accents[0]})`,
            color: '#fff',
            fontSize: theme.typography.bodySize - 2,
            fontWeight: 800,
            letterSpacing: '0.04em',
            boxShadow: `0 18px 34px ${theme.palette.accents[0]}40`,
          }}
        >
          {cta}
        </div>
      </div>
    </AbsoluteFill>
  );
};
