import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSlideMotionTiming } from '../templates/animationTiming';
import { getElementProgress } from '../templates/runtimeTiming';
import type { SharedLayoutProps } from './types';

interface HighlightItem {
  text: string;
  color?: string;
}

export const HighlightLayout: React.FC<SharedLayoutProps> = ({
  slide,
  theme,
  frame,
  fps,
  index,
  totalSlides,
  durationInFrames,
}) => {
  const items: HighlightItem[] =
    ((slide.data?.highlights as HighlightItem[] | undefined) || []).length > 0
      ? ((slide.data?.highlights as HighlightItem[] | undefined) || [])
      : ((slide.data?.items as string[] | undefined) || (slide.points || [])).map((item) => ({
          text: typeof item === 'string' ? item : String(item),
          color: undefined,
        }));
  const timing = getSlideMotionTiming(durationInFrames, items.length);
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
        padding: '66px 62px',
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
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1
          style={{
            margin: 0,
            maxWidth: 780,
            fontSize: theme.typography.titleSize - 4,
            lineHeight: 1.02,
            fontWeight: theme.typography.titleWeight,
            opacity: titleProgress,
            transform: `translateY(${interpolate(titleProgress, [0, 1], [34, 0])}px)`,
          }}
        >
          {slide.title}
        </h1>
        {slide.subtitle ? (
          <p
            style={{
              margin: '18px 0 30px',
              maxWidth: 760,
              fontSize: theme.typography.subtitleSize,
              lineHeight: 1.45,
              color: theme.palette.muted,
            }}
          >
            {slide.subtitle}
          </p>
        ) : null}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, maxWidth: 860 }}>
          {items.map((item, itemIndex) => {
            const progress = getElementProgress({
              frame,
              fps,
              elementTimings: slide.elementTimings,
              slideAudioStart: slide.audioStart,
              id: `highlight-${itemIndex}`,
              fallbackStart: timing.pointsStart + itemIndex * theme.motion.staggerFrames,
              damping: theme.motion.damping,
              stiffness: theme.motion.stiffness,
            });
            const accent = item.color || theme.palette.accents[itemIndex % theme.palette.accents.length];
            return (
              <div
                key={`${item.text}-${itemIndex}`}
                style={{
                  padding: '16px 22px',
                  borderRadius: theme.radius.panel - 8,
                  background: `${accent}18`,
                  border: `1px solid ${accent}55`,
                  color: theme.palette.text,
                  fontSize: theme.typography.bodySize,
                  fontWeight: 800,
                  opacity: progress,
                  transform: `translateY(${interpolate(progress, [0, 1], [18, 0])}px) scale(${interpolate(progress, [0, 1], [0.96, 1])})`,
                  boxShadow: theme.effects.glow ? `0 0 18px ${accent}28` : 'none',
                }}
              >
                {item.text}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
