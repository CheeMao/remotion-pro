import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSlideMotionTiming } from '../templates/animationTiming';
import { getElementProgress } from '../templates/runtimeTiming';
import type { SharedLayoutProps } from './types';

export const QuoteLayout: React.FC<SharedLayoutProps> = ({
  slide,
  theme,
  frame,
  fps,
  index,
  totalSlides,
  durationInFrames,
}) => {
  const data = slide.data as { quote?: string; author?: string } | undefined;
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
  const quoteProgress = getElementProgress({
    frame,
    fps,
    elementTimings: slide.elementTimings,
    slideAudioStart: slide.audioStart,
    id: 'quote-text',
    fallbackStart: timing.pointsStart,
    damping: theme.motion.damping,
    stiffness: theme.motion.stiffness,
  });

  return (
    <AbsoluteFill
      style={{
        background: theme.palette.background,
        color: theme.palette.text,
        fontFamily: theme.typography.fontFamily,
        padding: '74px 80px',
        justifyContent: 'center',
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
      {slide.title ? (
        <div
          style={{
            position: 'absolute',
            top: 54,
            left: 64,
            fontSize: theme.typography.overlineSize,
            letterSpacing: '0.14em',
            fontWeight: 800,
            color: theme.palette.muted,
            opacity: titleProgress,
          }}
        >
          {slide.title}
        </div>
      ) : null}
      <div
        style={{
          position: 'relative',
          padding: '42px 46px',
          borderRadius: theme.radius.panel + 6,
          background: theme.palette.surface,
          border: `1px solid ${theme.palette.border}`,
          boxShadow: theme.effects.glass
            ? '0 24px 50px rgba(0,0,0,0.18)'
            : '0 18px 40px rgba(0,0,0,0.12)',
          opacity: quoteProgress,
          transform: `translateY(${interpolate(quoteProgress, [0, 1], [30, 0])}px)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 18,
            left: 26,
            fontSize: 120,
            lineHeight: 1,
            color: theme.palette.accents[0],
            opacity: 0.26,
            fontWeight: 900,
          }}
        >
          "
        </div>
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            fontSize: theme.typography.titleSize - 12,
            lineHeight: 1.18,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            whiteSpace: 'pre-wrap',
          }}
        >
          {data?.quote || slide.subtitle || slide.title}
        </div>
        {(data?.author || slide.subtitle) ? (
          <div
            style={{
              marginTop: 28,
              textAlign: 'center',
              fontSize: theme.typography.bodySize - 2,
              color: theme.palette.muted,
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}
          >
            {data?.author || slide.subtitle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
