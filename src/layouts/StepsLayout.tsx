import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSlideMotionTiming } from '../templates/animationTiming';
import { getElementProgress } from '../templates/runtimeTiming';
import type { SharedLayoutProps } from './types';

interface StepData {
  title?: string;
  description?: string;
}

export const StepsLayout: React.FC<SharedLayoutProps> = ({
  slide,
  theme,
  frame,
  fps,
  index,
  totalSlides,
  durationInFrames,
}) => {
  const stepItems: StepData[] =
    ((slide.data?.steps as StepData[] | undefined) || []).length > 0
      ? ((slide.data?.steps as StepData[] | undefined) || [])
      : (slide.points || []).map((point) => ({ title: point, description: undefined }));
  const timing = getSlideMotionTiming(durationInFrames, stepItems.length);

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
        padding: '64px 58px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            `radial-gradient(circle at 18% 18%, ${theme.palette.accents[0]}24 0%, transparent 32%),` +
            `radial-gradient(circle at 80% 18%, ${theme.palette.accents[1]}20 0%, transparent 28%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 40,
          right: 48,
          fontSize: 22,
          fontWeight: 800,
          color: theme.palette.muted,
        }}
      >
        {String(index + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            padding: '10px 16px',
            borderRadius: theme.radius.chip,
            fontSize: theme.typography.overlineSize,
            letterSpacing: '0.14em',
            fontWeight: 800,
            color: theme.palette.muted,
            background: theme.palette.surfaceAlt,
            border: `1px solid ${theme.palette.border}`,
            display: 'inline-flex',
            marginBottom: 18,
          }}
        >
          {(slide.data?.stepsLabel as string | undefined) ?? 'STEP FLOW'}
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: theme.typography.titleSize - 6,
            lineHeight: 1.03,
            fontWeight: theme.typography.titleWeight,
            maxWidth: 780,
            opacity: titleProgress,
            transform: `translateY(${interpolate(titleProgress, [0, 1], [38, 0])}px)`,
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

        <div style={{ position: 'relative', display: 'grid', gap: 16, marginTop: 12 }}>
          <div
            style={{
              position: 'absolute',
              left: 31,
              top: 24,
              bottom: 24,
              width: 2,
              background: `linear-gradient(180deg, ${theme.palette.accents[0]}, ${theme.palette.accents[1]})`,
              opacity: 0.55,
            }}
          />
          {stepItems.map((step, stepIndex) => {
            const progress = getElementProgress({
              frame,
              fps,
              elementTimings: slide.elementTimings,
              slideAudioStart: slide.audioStart,
              id: `step-${stepIndex}`,
              fallbackStart:
                timing.pointsStart + stepIndex * theme.motion.staggerFrames,
              damping: theme.motion.damping,
              stiffness: theme.motion.stiffness,
            });
            const accent = theme.palette.accents[stepIndex % theme.palette.accents.length];

            return (
              <div
                key={`${stepIndex}-${step.title}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '64px 1fr',
                  gap: 18,
                  alignItems: 'start',
                  opacity: progress,
                  transform: `translateX(${interpolate(progress, [0, 1], [-32, 0])}px)`,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
                    color: '#fff',
                    fontSize: 24,
                    fontWeight: 900,
                    boxShadow: `0 12px 24px ${accent}3d`,
                    zIndex: 1,
                  }}
                >
                  {stepIndex + 1}
                </div>
                <div
                  style={{
                    padding: '20px 22px',
                    borderRadius: theme.radius.panel,
                    background: theme.palette.surface,
                    border: `1px solid ${theme.palette.border}`,
                    boxShadow: theme.effects.glass
                      ? '0 24px 50px rgba(0,0,0,0.18)'
                      : '0 18px 40px rgba(0,0,0,0.12)',
                  }}
                >
                  <div
                    style={{
                      fontSize: theme.typography.bodySize + 2,
                      fontWeight: 800,
                      lineHeight: 1.3,
                      marginBottom: step.description ? 8 : 0,
                    }}
                  >
                    {step.title}
                  </div>
                  {step.description ? (
                    <div
                      style={{
                        fontSize: theme.typography.bodySize - 4,
                        lineHeight: 1.55,
                        color: theme.palette.muted,
                      }}
                    >
                      {step.description}
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
