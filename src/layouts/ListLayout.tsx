import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSlideMotionTiming } from '../templates/animationTiming';
import { getElementProgress } from '../templates/runtimeTiming';
import type { SharedLayoutProps } from './types';

interface ListItem {
  icon?: string;
  text?: string;
  title?: string;
  desc?: string;
}

export const ListLayout: React.FC<SharedLayoutProps> = ({
  slide,
  theme,
  frame,
  fps,
  index,
  totalSlides,
  durationInFrames,
}) => {
  const items: ListItem[] =
    ((slide.data?.items as ListItem[] | undefined) || []).length > 0
      ? ((slide.data?.items as ListItem[] | undefined) || [])
      : (slide.points || []).map((point, itemIndex) => ({
          icon: String(itemIndex + 1).padStart(2, '0'),
          text: point,
          title: point,
          desc: undefined,
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
              margin: '16px 0 30px',
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
            gridTemplateColumns: items.length >= 4 ? '1fr 1fr' : '1fr',
            gap: 16,
          }}
        >
          {items.map((item, itemIndex) => {
            const progress = getElementProgress({
              frame,
              fps,
              elementTimings: slide.elementTimings,
              slideAudioStart: slide.audioStart,
              id: `item-${itemIndex}`,
              fallbackStart: timing.pointsStart + itemIndex * theme.motion.staggerFrames,
              damping: theme.motion.damping,
              stiffness: theme.motion.stiffness,
            });
            const accent = theme.palette.accents[itemIndex % theme.palette.accents.length];
            return (
              <div
                key={`${item.title || item.text}-${itemIndex}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '58px 1fr',
                  gap: 16,
                  alignItems: 'start',
                  padding: '18px 20px',
                  borderRadius: theme.radius.panel,
                  background: theme.palette.surface,
                  border: `1px solid ${theme.palette.border}`,
                  opacity: progress,
                  transform: `translateY(${interpolate(progress, [0, 1], [24, 0])}px)`,
                }}
              >
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 900,
                    boxShadow: `0 12px 24px ${accent}3d`,
                  }}
                >
                  {item.icon || String(itemIndex + 1).padStart(2, '0')}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: theme.typography.bodySize,
                      fontWeight: 800,
                      lineHeight: 1.35,
                      marginBottom: item.desc ? 6 : 0,
                    }}
                  >
                    {item.title || item.text}
                  </div>
                  {item.desc ? (
                    <div
                      style={{
                        fontSize: theme.typography.bodySize - 6,
                        color: theme.palette.muted,
                        lineHeight: 1.5,
                      }}
                    >
                      {item.desc}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
