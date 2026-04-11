import React from 'react';
import { AbsoluteFill, interpolate, useVideoConfig } from 'remotion';
import { getSlideMotionTiming } from '../templates/animationTiming';
import { getElementProgress } from '../templates/runtimeTiming';
import { getSafeAreaInsets } from './safeArea';
import type { SharedLayoutProps } from './types';

interface ChartBar {
  label?: string;
  value?: number;
  color?: string;
}

interface ChartDataShape {
  type?: 'bar' | 'progress' | 'pie';
  values?: ChartBar[];
  bars?: ChartBar[];
}

export const ChartLayout: React.FC<SharedLayoutProps> = ({
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
  const chart = (slide.data?.chart as ChartDataShape | undefined) || (slide.data as ChartDataShape | undefined);
  const items = (chart?.values || chart?.bars || []).slice(0, 5);
  const chartType = chart?.type || (chart?.values ? 'bar' : 'progress');
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
  const maxValue = Math.max(...items.map((item) => item.value || 0), 1);

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

        {chartType === 'progress' ? (
          <div style={{ display: 'grid', gap: 18 }}>
            {items.map((item, itemIndex) => {
              const progress = getElementProgress({
                frame,
                fps,
                elementTimings: slide.elementTimings,
                slideAudioStart: slide.audioStart,
                id: `chart-bar-${itemIndex}`,
                fallbackStart: timing.pointsStart + itemIndex * theme.motion.staggerFrames,
                damping: theme.motion.damping,
                stiffness: theme.motion.stiffness,
              });
              const accent = item.color || theme.palette.accents[itemIndex % theme.palette.accents.length];
              const width = ((item.value || 0) / maxValue) * 100 * progress;
              return (
                <div key={`${item.label}-${itemIndex}`} style={{ opacity: progress }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                      fontSize: theme.typography.bodySize - 4,
                    }}
                  >
                    <span>{item.label}</span>
                    <span style={{ color: accent, fontWeight: 800 }}>{item.value}</span>
                  </div>
                  <div
                    style={{
                      height: 18,
                      borderRadius: 999,
                      background: theme.palette.surfaceAlt,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${width}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
                        boxShadow: `0 0 16px ${accent}45`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 360, marginTop: 12 }}>
            {items.map((item, itemIndex) => {
              const progress = getElementProgress({
                frame,
                fps,
                elementTimings: slide.elementTimings,
                slideAudioStart: slide.audioStart,
                id: `chart-bar-${itemIndex}`,
                fallbackStart: timing.pointsStart + itemIndex * theme.motion.staggerFrames,
                damping: theme.motion.damping,
                stiffness: theme.motion.stiffness,
              });
              const accent = item.color || theme.palette.accents[itemIndex % theme.palette.accents.length];
              const height = ((item.value || 0) / maxValue) * 250 * progress;

              return (
                <div
                  key={`${item.label}-${itemIndex}`}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                    opacity: progress,
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 800, color: accent }}>{item.value}</div>
                  <div
                    style={{
                      width: '100%',
                      height,
                      borderRadius: '16px 16px 6px 6px',
                      background: `linear-gradient(180deg, ${accent}, ${accent}cc)`,
                      boxShadow: `0 0 18px ${accent}40`,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 16,
                      color: theme.palette.muted,
                      textAlign: 'center',
                      lineHeight: 1.35,
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
