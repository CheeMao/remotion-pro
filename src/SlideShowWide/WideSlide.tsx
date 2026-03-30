import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { getSlideMotionTiming } from '../templates/animationTiming';

export const WideSlide: React.FC<{
  title: string;
  subtitle?: string;
  points?: string[];
  index: number;
  totalSlides: number;
  durationInFrames: number;
}> = ({ title, subtitle, points, index, totalSlides, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timing = getSlideMotionTiming(durationInFrames, points?.length ?? 0);

  const titleProgress = spring({
    frame: frame - timing.titleStart,
    fps,
    config: { damping: 14, stiffness: 110 },
  });
  const titleX = interpolate(titleProgress, [0, 1], [-60, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  const subtitleProgress = spring({
    frame: frame - timing.subtitleStart,
    fps,
    config: { damping: 16, stiffness: 100 },
  });
  const subtitleY = interpolate(subtitleProgress, [0, 1], [24, 0]);

  const lineProgress = spring({
    frame: frame - timing.lineStart,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const pointProgresses = (points || []).map((_, i) =>
    spring({
      frame: frame - timing.pointsStart - i * timing.pointStagger,
      fps,
      config: { damping: 11, stiffness: 96 },
    })
  );

  const exitOpacity = interpolate(frame, [timing.exitStart, timing.exitEnd], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 22% 24%, rgba(0,240,255,0.12) 0%, rgba(0,240,255,0) 28%), radial-gradient(circle at 82% 18%, rgba(124,58,237,0.16) 0%, rgba(124,58,237,0) 22%), linear-gradient(135deg, #050816 0%, #0b1430 52%, #080c18 100%)',
        fontFamily: "system-ui, -apple-system, 'PingFang SC', sans-serif",
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(82, 168, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(82, 168, 255, 0.07) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          opacity: 0.4,
        }}
      />

      <AbsoluteFill
        style={{
          padding: '74px 86px 82px',
          opacity: exitOpacity,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 42,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 18px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(133, 196, 255, 0.22)',
              color: 'rgba(255,255,255,0.82)',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Landscape
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span
              style={{
                fontSize: 54,
                fontWeight: 900,
                color: '#5ae6ff',
                textShadow: '0 0 28px rgba(90,230,255,0.45)',
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <span
              style={{
                fontSize: 24,
                color: 'rgba(255,255,255,0.38)',
                fontWeight: 500,
              }}
            >
              / {String(totalSlides).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.08fr) minmax(440px, 0.92fr)',
            gap: 42,
            minHeight: 0,
          }}
        >
          <div
            style={{
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                transform: `translateX(${titleX}px)`,
                opacity: titleOpacity,
              }}
            >
              <h1
                style={{
                  margin: 0,
                  color: '#fff',
                  fontSize: 104,
                  fontWeight: 900,
                  lineHeight: 1.02,
                  letterSpacing: '-0.04em',
                  textShadow: '0 10px 30px rgba(0, 0, 0, 0.32)',
                }}
              >
                {title}
              </h1>
            </div>

            <div
              style={{
                width: interpolate(lineProgress, [0, 1], [0, 260]),
                height: 4,
                borderRadius: 999,
                margin: subtitle ? '28px 0 22px' : '28px 0 0',
                background:
                  'linear-gradient(90deg, rgba(90,230,255,1) 0%, rgba(6,255,165,0.86) 60%, rgba(6,255,165,0) 100%)',
                boxShadow: '0 0 22px rgba(90,230,255,0.35)',
              }}
            />

            {subtitle ? (
              <p
                style={{
                  margin: 0,
                  maxWidth: 760,
                  fontSize: 34,
                  lineHeight: 1.45,
                  color: 'rgba(255,255,255,0.78)',
                  transform: `translateY(${subtitleY}px)`,
                  opacity: subtitleProgress,
                }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>

          <div
            style={{
              minWidth: 0,
              borderRadius: 34,
              padding: '34px 32px',
              background: 'linear-gradient(180deg, rgba(7,11,27,0.82) 0%, rgba(13,20,43,0.62) 100%)',
              border: '1px solid rgba(116, 146, 255, 0.16)',
              boxShadow: '0 26px 70px rgba(0,0,0,0.26)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 18,
            }}
          >
            {(points || []).map((point, i) => {
              const progress = pointProgresses[i] || 0;
              const pointY = interpolate(progress, [0, 1], [34, 0]);
              const tones = ['#5ae6ff', '#06ffa5', '#ff2e97'];
              const tone = tones[i % tones.length];

              return (
                <div
                  key={`${point}-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 18,
                    padding: '18px 18px 18px 16px',
                    borderRadius: 24,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transform: `translateY(${pointY}px)`,
                    opacity: progress,
                  }}
                >
                  <div
                    style={{
                      minWidth: 52,
                      height: 52,
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `${tone}22`,
                      border: `1px solid ${tone}66`,
                      color: tone,
                      fontSize: 24,
                      fontWeight: 800,
                      boxShadow: `0 0 18px ${tone}24`,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div
                    style={{
                      color: '#fff',
                      fontSize: 30,
                      lineHeight: 1.4,
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {point}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
