import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSlideMotionTiming } from '../templates/animationTiming';
import { getElementProgress } from '../templates/runtimeTiming';
import type { SharedLayoutProps } from './types';

interface TimelineEntry {
  year?: string;
  title?: string;
  description?: string;
}

export const TimelineLayout: React.FC<SharedLayoutProps> = ({
  slide,
  theme,
  frame,
  fps,
  index,
  totalSlides,
  durationInFrames,
}) => {
  const items = ((slide.data?.timeline as TimelineEntry[] | undefined) || []).slice(0, 5);
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
              margin: '16px 0 32px',
              maxWidth: 760,
              fontSize: theme.typography.subtitleSize,
              lineHeight: 1.45,
              color: theme.palette.muted,
            }}
          >
            {slide.subtitle}
          </p>
        ) : null}

        <div style={{ position: 'relative', display: 'grid', gap: 16 }}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 'calc(50% - 1px)',
              width: 2,
              background: `linear-gradient(180deg, ${theme.palette.accents[0]}, ${theme.palette.accents[1] || theme.palette.accents[0]})`,
              opacity: 0.45,
            }}
          />
          {items.map((item, itemIndex) => {
            const progress = getElementProgress({
              frame,
              fps,
              elementTimings: slide.elementTimings,
              slideAudioStart: slide.audioStart,
              id: `timeline-${itemIndex}`,
              fallbackStart: timing.pointsStart + itemIndex * theme.motion.staggerFrames,
              damping: theme.motion.damping,
              stiffness: theme.motion.stiffness,
            });
            const isLeft = itemIndex % 2 === 0;
            const accent = theme.palette.accents[itemIndex % theme.palette.accents.length];

            return (
              <div
                key={`${item.year}-${item.title}-${itemIndex}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 36px 1fr',
                  gap: 18,
                  alignItems: 'center',
                  opacity: progress,
                  transform: `translateX(${interpolate(progress, [0, 1], [isLeft ? -34 : 34, 0])}px)`,
                }}
              >
                <div style={{ textAlign: isLeft ? 'right' : 'left', order: isLeft ? 0 : 2 }}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: accent,
                      marginBottom: 4,
                    }}
                  >
                    {item.year}
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.bodySize,
                      fontWeight: 800,
                      lineHeight: 1.3,
                      marginBottom: item.description ? 6 : 0,
                    }}
                  >
                    {item.title}
                  </div>
                  {item.description ? (
                    <div
                      style={{
                        fontSize: theme.typography.bodySize - 6,
                        color: theme.palette.muted,
                        lineHeight: 1.5,
                      }}
                    >
                      {item.description}
                    </div>
                  ) : null}
                </div>
                <div
                  style={{
                    order: 1,
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background: accent,
                    boxShadow: `0 0 18px ${accent}`,
                    justifySelf: 'center',
                  }}
                />
                <div style={{ order: isLeft ? 2 : 0 }} />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
