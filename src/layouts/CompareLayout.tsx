import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSlideMotionTiming } from '../templates/animationTiming';
import { getElementProgress } from '../templates/runtimeTiming';
import type { SharedLayoutProps } from './types';

interface CompareSide {
  label?: string;
  title?: string;
  value?: string;
  desc?: string;
  points?: string[];
}

export const CompareLayout: React.FC<SharedLayoutProps> = ({
  slide,
  theme,
  frame,
  fps,
  index,
  totalSlides,
  durationInFrames,
}) => {
  const data = slide.data as
    | {
        left?: CompareSide;
        right?: CompareSide;
        centerLabel?: string;
        vsText?: string;
      }
    | undefined;
  const timing = getSlideMotionTiming(durationInFrames, 2);

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

  const renderPanel = (side: CompareSide | undefined, id: string, fallbackStart: number, accent: string, direction: number) => {
    const progress = getElementProgress({
      frame,
      fps,
      elementTimings: slide.elementTimings,
      slideAudioStart: slide.audioStart,
      id,
      fallbackStart,
      damping: theme.motion.damping,
      stiffness: theme.motion.stiffness,
    });

    if (!side) return null;

    return (
      <div
        style={{
          flex: 1,
          minHeight: 420,
          padding: '28px 26px',
          borderRadius: theme.radius.panel,
          background: theme.palette.surface,
          border: `1px solid ${theme.palette.border}`,
          opacity: progress,
          transform: `translateX(${interpolate(progress, [0, 1], [direction * 54, 0])}px)`,
          boxShadow: theme.effects.glass
            ? '0 24px 50px rgba(0,0,0,0.18)'
            : '0 18px 40px rgba(0,0,0,0.12)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '10px 16px',
            borderRadius: theme.radius.chip,
            background: `${accent}22`,
            border: `1px solid ${accent}55`,
            color: accent,
            fontSize: theme.typography.overlineSize,
            fontWeight: 800,
            letterSpacing: '0.14em',
          }}
        >
          {side.label || (direction < 0 ? 'LEFT' : 'RIGHT')}
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: theme.typography.bodySize + 8,
            fontWeight: 800,
            lineHeight: 1.2,
          }}
        >
          {side.title || side.value}
        </div>
        {side.desc ? (
          <div
            style={{
              marginTop: 14,
              fontSize: theme.typography.bodySize - 2,
              color: theme.palette.muted,
              lineHeight: 1.5,
            }}
          >
            {side.desc}
          </div>
        ) : null}
        {side.points && side.points.length > 0 ? (
          <div style={{ display: 'grid', gap: 12, marginTop: 22 }}>
            {side.points.map((point, pointIndex) => (
              <div
                key={`${id}-${pointIndex}`}
                style={{
                  padding: '14px 16px',
                  borderRadius: 18,
                  background: theme.palette.surfaceAlt,
                  color: theme.palette.text,
                  fontSize: theme.typography.bodySize - 4,
                  lineHeight: 1.45,
                }}
              >
                {point}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{
        background: theme.palette.background,
        color: theme.palette.text,
        fontFamily: theme.typography.fontFamily,
        padding: '58px 54px',
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
              margin: '16px 0 26px',
              maxWidth: 760,
              fontSize: theme.typography.subtitleSize,
              lineHeight: 1.45,
              color: theme.palette.muted,
            }}
          >
            {slide.subtitle}
          </p>
        ) : null}

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {renderPanel(data?.left, 'compare-left', timing.pointsStart, theme.palette.accents[0], -1)}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: theme.radius.chip,
              background: theme.palette.surfaceAlt,
              border: `1px solid ${theme.palette.border}`,
              color: theme.palette.text,
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: '0.08em',
            }}
          >
            {data?.centerLabel || data?.vsText || 'VS'}
          </div>
          {renderPanel(data?.right, 'compare-right', timing.pointsStart + theme.motion.staggerFrames, theme.palette.accents[1] || theme.palette.accents[0], 1)}
        </div>
      </div>
    </AbsoluteFill>
  );
};
