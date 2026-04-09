import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { useMemo } from 'react';
import { getSlideMotionTiming } from '../templates/animationTiming';

// ============================================================
// THEME COLORS
// ============================================================
const C = {
  bg: '#0c1629',
  bgAlt: '#0d1b30',
  blue1: '#4a9fd5',
  blue2: '#87ceeb',
  orange: '#f5821f',
  orangeDim: 'rgba(245,130,31,0.15)',
  white: '#ffffff',
  text: '#e8f0fe',
  muted: '#64748b',
  surface: 'rgba(255,255,255,0.04)',
  surfaceAlt: 'rgba(74,159,213,0.08)',
  border: 'rgba(100,160,220,0.2)',
  borderChip: 'rgba(100,160,220,0.35)',
  chipText: '#7ab8e8',
  cardBorder: 'rgba(255,255,255,0.07)',
  divider: 'rgba(100,160,220,0.2)',
} as const;

const blueGradient = {
  background: 'linear-gradient(135deg, #4a9fd5, #87ceeb)',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  backgroundClip: 'text' as const,
} as const;

// ============================================================
// BRAND DATA TYPES
// ============================================================
export interface BrandData {
  name: string;
  badge?: string;
  tagline?: string;
  chips?: string[];
  attribution?: string;
}

export interface ProjectSlideData {
  brand?: BrandData;
  // hero
  subtitleLines?: string[];
  // problems
  problemsTitle?: string;
  problems?: Array<{ icon: string; title: string; desc?: string }>;
  // stats
  countPrefix?: string;
  countValue?: number;
  countSuffix?: string;
  badges?: string[];
  highlight?: string;
  highlightAccent?: string;
  // list/default
  items?: Array<{ icon: string; title: string; desc?: string }>;
  // generic
  points?: string[];
  // compare
  left?: { label: string; value: string; desc?: string; points?: string[] };
  right?: { label: string; value: string; desc?: string; points?: string[] };
  vsText?: string;
  // steps
  steps?: Array<{ title: string; description?: string }>;
  // chart
  bars?: Array<{ label: string; value: number; color?: string }>;
  // timeline
  timeline?: Array<{ year: string; title: string; description?: string }>;
  // highlight / keywords
  keywords?: string[];
  // quote
  quote?: string;
  author?: string;
  // cta
  cta?: string;
}

export type SlideType =
  | 'hero'
  | 'problems'
  | 'stats'
  | 'list'
  | 'default'
  | 'compare'
  | 'steps'
  | 'chart'
  | 'timeline'
  | 'highlight'
  | 'quote'
  | 'cta';

export interface ProjectSlideProps {
  type?: SlideType | string;
  title?: string;
  subtitle?: string;
  data?: ProjectSlideData;
  points?: string[];
  index?: number;
  totalSlides?: number;
  durationInFrames: number;
}

// ============================================================
// PERSISTENT HEADER
// ============================================================
const PersistentHeader: React.FC<{
  brand: BrandData;
  entryProgress: number;
}> = ({ brand, entryProgress }) => {
  const translateY = interpolate(entryProgress, [0, 1], [-60, 0]);
  const opacity = interpolate(entryProgress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 380,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 220,
        paddingLeft: 64,
        paddingRight: 64,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Name + Badge row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 20,
          marginBottom: 20,
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            ...blueGradient,
          }}
        >
          {brand.name}
        </span>
        {brand.badge && (
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: C.chipText,
              border: '1px solid rgba(120,180,230,0.5)',
              borderRadius: 999,
              padding: '6px 16px',
              letterSpacing: '0.01em',
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            {brand.badge}
          </span>
        )}
      </div>

      {/* Tagline */}
      {brand.tagline && (
        <div
          style={{
            fontSize: 22,
            fontWeight: 400,
            color: C.text,
            textAlign: 'center',
            lineHeight: 1.5,
            maxWidth: 800,
            marginBottom: 28,
          }}
        >
          {brand.tagline}
        </div>
      )}

      {/* Divider */}
      <div
        style={{
          width: '80%',
          height: 1,
          background: C.divider,
        }}
      />
    </div>
  );
};

// ============================================================
// PERSISTENT FOOTER
// ============================================================
const PersistentFooter: React.FC<{
  brand: BrandData;
  entryProgress: number;
}> = ({ brand, entryProgress }) => {
  const translateY = interpolate(entryProgress, [0, 1], [60, 0]);
  const opacity = interpolate(entryProgress, [0, 1], [0, 1]);
  const chips = brand.chips ?? [];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 380,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingLeft: 48,
        paddingRight: 48,
        paddingBottom: 160,
        gap: 20,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Chips row */}
      {chips.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          {chips.map((chip, i) => (
            <span
              key={i}
              style={{
                fontSize: 22,
                fontWeight: 500,
                color: C.chipText,
                border: `1px solid ${C.borderChip}`,
                borderRadius: 999,
                padding: '7px 18px',
                letterSpacing: '0.01em',
                lineHeight: 1,
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {/* Attribution */}
      {brand.attribution && (
        <div
          style={{
            fontSize: 20,
            fontWeight: 400,
            color: C.muted,
            textAlign: 'center',
            letterSpacing: '0.02em',
          }}
        >
          {brand.attribution}
        </div>
      )}
    </div>
  );
};

// ============================================================
// HERO CONTENT
// ============================================================
const HeroContent: React.FC<{
  brandName: string;
  subtitleLines?: string[];
  contentProgress: number;
  durationInFrames: number;
}> = ({ brandName, subtitleLines, contentProgress }) => {
  const opacity = interpolate(contentProgress, [0, 1], [0, 1]);
  const scale = interpolate(contentProgress, [0, 1], [0.88, 1]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* Big brand name */}
      <div
        style={{
          fontSize: 120,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          textAlign: 'center',
          ...blueGradient,
        }}
      >
        {brandName}
      </div>

      {/* Subtitle lines */}
      {subtitleLines && subtitleLines.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {subtitleLines.map((line, i) => (
            <div
              key={i}
              style={{
                fontSize: 30,
                fontWeight: 400,
                color: C.text,
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// PROBLEMS CONTENT
// ============================================================
const ProblemsContent: React.FC<{
  title?: string;
  problems?: Array<{ icon: string; title: string; desc?: string }>;
  frame: number;
  fps: number;
  pointsStart: number;
  pointStagger: number;
}> = ({ title, problems = [], frame, fps, pointsStart, pointStagger }) => {
  const titleP = spring({
    frame: frame - pointsStart + 10,
    fps,
    config: { damping: 16, stiffness: 90 },
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 24,
        width: '100%',
      }}
    >
      {/* Section title */}
      {title && (
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: C.orange,
            textAlign: 'left',
            opacity: titleP,
            transform: `translateX(${interpolate(titleP, [0, 1], [-24, 0])}px)`,
            marginBottom: 8,
          }}
        >
          {title}
        </div>
      )}

      {/* Problem cards */}
      {problems.map((p, i) => {
        const cardStart = pointsStart + i * pointStagger;
        const cardP = spring({
          frame: frame - cardStart,
          fps,
          config: { damping: 16, stiffness: 90 },
        });
        const cardOpacity = interpolate(cardP, [0, 1], [0, 1]);
        const cardY = interpolate(cardP, [0, 1], [32, 0]);

        return (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              background: C.surface,
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 12,
              padding: '22px 24px',
              opacity: cardOpacity,
              transform: `translateY(${cardY}px)`,
            }}
          >
            {/* Icon badge */}
            <div
              style={{
                width: 50,
                height: 50,
                flexShrink: 0,
                background: C.orangeDim,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                color: C.orange,
                fontWeight: 700,
              }}
            >
              {p.icon}
            </div>

            {/* Text content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: C.white,
                  lineHeight: 1.2,
                  marginBottom: p.desc ? 6 : 0,
                }}
              >
                {p.title}
              </div>
              {p.desc && (
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 400,
                    color: C.muted,
                    lineHeight: 1.4,
                  }}
                >
                  {p.desc}
                </div>
              )}
            </div>

            {/* X mark */}
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: C.orange,
                flexShrink: 0,
              }}
            >
              ✕
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// ANIMATED COUNT NUMBER
// ============================================================
const AnimatedCount: React.FC<{
  prefix?: string;
  value?: number;
  suffix?: string;
  frame: number;
  fps: number;
  startFrame: number;
}> = ({ prefix = '', value = 0, suffix = '', frame, fps, startFrame }) => {
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 22, stiffness: 48 },
  });

  const displayValue = Math.round(interpolate(progress, [0, 1], [0, value]));
  const opacity = interpolate(Math.min(progress * 3, 1), [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.8, 1]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: 8,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {prefix && (
        <span style={{ fontSize: 80, lineHeight: 1 }}>{prefix}</span>
      )}
      <span
        style={{
          fontSize: 96,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          fontVariantNumeric: 'tabular-nums',
          ...blueGradient,
        }}
      >
        {displayValue.toLocaleString()}
      </span>
      {suffix && (
        <span
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1,
            ...blueGradient,
          }}
        >
          {suffix}
        </span>
      )}
    </div>
  );
};

// ============================================================
// STATS CONTENT
// ============================================================
const StatsContent: React.FC<{
  countPrefix?: string;
  countValue?: number;
  countSuffix?: string;
  badges?: string[];
  highlight?: string;
  highlightAccent?: string;
  frame: number;
  fps: number;
  pointsStart: number;
  pointStagger: number;
}> = ({
  countPrefix,
  countValue,
  countSuffix,
  badges = [],
  highlight,
  highlightAccent,
  frame,
  fps,
  pointsStart,
  pointStagger,
}) => {
  const badgesStart = pointsStart + pointStagger;
  const highlightStart = badgesStart + pointStagger;

  const badgesP = spring({
    frame: frame - badgesStart,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const highlightP = spring({
    frame: frame - highlightStart,
    fps,
    config: { damping: 16, stiffness: 90 },
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 36,
        width: '100%',
      }}
    >
      {/* Animated count */}
      <AnimatedCount
        prefix={countPrefix}
        value={countValue}
        suffix={countSuffix}
        frame={frame}
        fps={fps}
        startFrame={pointsStart}
      />

      {/* Badge chips */}
      {badges.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 14,
            justifyContent: 'center',
            opacity: badgesP,
            transform: `translateY(${interpolate(badgesP, [0, 1], [20, 0])}px)`,
          }}
        >
          {badges.map((badge, i) => (
            <span
              key={i}
              style={{
                fontSize: 24,
                fontWeight: 500,
                color: C.chipText,
                border: `1px solid ${C.borderChip}`,
                borderRadius: 999,
                padding: '8px 22px',
                lineHeight: 1,
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* Highlight quote block */}
      {(highlight || highlightAccent) && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            opacity: highlightP,
            transform: `translateY(${interpolate(highlightP, [0, 1], [20, 0])}px)`,
          }}
        >
          {highlight && (
            <div
              style={{
                fontSize: 28,
                fontWeight: 400,
                color: C.text,
                textAlign: 'center',
                lineHeight: 1.5,
                maxWidth: 800,
              }}
            >
              {highlight}
            </div>
          )}
          {highlightAccent && (
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: C.orange,
                textAlign: 'center',
                lineHeight: 1.4,
                maxWidth: 800,
              }}
            >
              {highlightAccent}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// LIST / DEFAULT CONTENT
// ============================================================
const ListContent: React.FC<{
  title?: string;
  items?: Array<{ icon: string; title: string; desc?: string }>;
  points?: string[];
  frame: number;
  fps: number;
  pointsStart: number;
  pointStagger: number;
}> = ({ title, items = [], points = [], frame, fps, pointsStart, pointStagger }) => {
  const titleP = spring({
    frame: frame - pointsStart + 10,
    fps,
    config: { damping: 16, stiffness: 90 },
  });

  const allItems = items.length > 0
    ? items
    : points.map((p, i) => ({ icon: `${i + 1}`, title: p, desc: undefined }));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 18,
        width: '100%',
      }}
    >
      {title && (
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: C.text,
            textAlign: 'left',
            opacity: titleP,
            transform: `translateX(${interpolate(titleP, [0, 1], [-24, 0])}px)`,
            marginBottom: 8,
          }}
        >
          {title}
        </div>
      )}

      {allItems.map((item, i) => {
        const itemStart = pointsStart + i * pointStagger;
        const itemP = spring({
          frame: frame - itemStart,
          fps,
          config: { damping: 16, stiffness: 90 },
        });
        const itemOpacity = interpolate(itemP, [0, 1], [0, 1]);
        const itemX = interpolate(itemP, [0, 1], [30, 0]);

        return (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 18,
              opacity: itemOpacity,
              transform: `translateX(${itemX}px)`,
            }}
          >
            {/* Icon badge */}
            <div
              style={{
                width: 48,
                height: 48,
                flexShrink: 0,
                background: C.surfaceAlt,
                border: `1px solid ${C.borderChip}`,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                color: C.chipText,
                fontWeight: 700,
              }}
            >
              {item.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 600,
                  color: C.white,
                  lineHeight: 1.3,
                  marginBottom: item.desc ? 4 : 0,
                }}
              >
                {item.title}
              </div>
              {item.desc && (
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 400,
                    color: C.muted,
                    lineHeight: 1.4,
                  }}
                >
                  {item.desc}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// COMPARE CONTENT
// ============================================================
const CompareContent: React.FC<{
  left?: { label: string; value: string; desc?: string; points?: string[] };
  right?: { label: string; value: string; desc?: string; points?: string[] };
  vsText?: string;
  frame: number;
  fps: number;
  pointsStart: number;
  pointStagger: number;
}> = ({ left, right, vsText = 'VS', frame, fps, pointsStart, pointStagger }) => {
  const leftP = spring({
    frame: frame - pointsStart,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const vsP = spring({
    frame: frame - pointsStart - pointStagger,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const rightP = spring({
    frame: frame - pointsStart - pointStagger * 2,
    fps,
    config: { damping: 16, stiffness: 90 },
  });

  const panelStyle = (tint: 'blue' | 'orange', p: number): React.CSSProperties => ({
    width: '100%',
    background:
      tint === 'blue'
        ? 'rgba(74,159,213,0.08)'
        : 'rgba(245,130,31,0.08)',
    border: `1px solid ${tint === 'blue' ? 'rgba(74,159,213,0.3)' : 'rgba(245,130,31,0.3)'}`,
    borderRadius: 16,
    padding: '28px 32px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
    opacity: interpolate(p, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(p, [0, 1], [32, 0])}px)`,
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 0,
        width: '100%',
      }}
    >
      {/* Left / Top panel */}
      {left && (
        <div style={panelStyle('blue', leftP)}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: '0.04em',
              marginBottom: 4,
              ...blueGradient,
            }}
          >
            {left.label}
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: C.white,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {left.value}
          </div>
          {left.desc && (
            <div style={{ fontSize: 22, color: C.muted, lineHeight: 1.4 }}>{left.desc}</div>
          )}
          {left.points && left.points.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              {left.points.map((pt, i) => (
                <div key={i} style={{ fontSize: 22, color: C.text, lineHeight: 1.4 }}>
                  • {pt}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VS separator */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          paddingLeft: 24,
          paddingRight: 24,
          marginTop: 8,
          marginBottom: 8,
          opacity: interpolate(vsP, [0, 1], [0, 1]),
          transform: `scale(${interpolate(vsP, [0, 1], [0.7, 1])})`,
        }}
      >
        <div style={{ flex: 1, height: 1, background: C.divider }} />
        <span
          style={{
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: '0.12em',
            ...blueGradient,
          }}
        >
          {vsText}
        </span>
        <div style={{ flex: 1, height: 1, background: C.divider }} />
      </div>

      {/* Right / Bottom panel */}
      {right && (
        <div style={panelStyle('orange', rightP)}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: C.orange,
              marginBottom: 4,
            }}
          >
            {right.label}
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: C.white,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {right.value}
          </div>
          {right.desc && (
            <div style={{ fontSize: 22, color: C.muted, lineHeight: 1.4 }}>{right.desc}</div>
          )}
          {right.points && right.points.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              {right.points.map((pt, i) => (
                <div key={i} style={{ fontSize: 22, color: C.text, lineHeight: 1.4 }}>
                  • {pt}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// STEPS CONTENT
// ============================================================
const StepsContent: React.FC<{
  steps?: Array<{ title: string; description?: string }>;
  frame: number;
  fps: number;
  pointsStart: number;
  pointStagger: number;
}> = ({ steps = [], frame, fps, pointsStart, pointStagger }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 0,
        width: '100%',
        position: 'relative',
      }}
    >
      {/* Vertical progress line */}
      <div
        style={{
          position: 'absolute',
          left: 38,
          top: 24,
          bottom: 24,
          width: 2,
          background: C.divider,
          zIndex: 0,
        }}
      />

      {steps.map((step, i) => {
        const stepStart = pointsStart + i * pointStagger;
        const stepP = spring({
          frame: frame - stepStart,
          fps,
          config: { damping: 16, stiffness: 85 },
        });
        const stepOpacity = interpolate(stepP, [0, 1], [0, 1]);
        const stepX = interpolate(stepP, [0, 1], [40, 0]);
        const numStr = String(i + 1).padStart(2, '0');

        return (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 24,
              paddingBottom: i < steps.length - 1 ? 32 : 0,
              opacity: stepOpacity,
              transform: `translateX(${stepX}px)`,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Step number circle */}
            <div
              style={{
                width: 52,
                height: 52,
                flexShrink: 0,
                background: C.bgAlt,
                border: `2px solid ${C.blue1}`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  ...blueGradient,
                }}
              >
                {numStr}
              </span>
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0, paddingTop: 8 }}>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: C.white,
                  lineHeight: 1.25,
                  marginBottom: step.description ? 8 : 0,
                }}
              >
                {step.title}
              </div>
              {step.description && (
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 400,
                    color: C.muted,
                    lineHeight: 1.45,
                  }}
                >
                  {step.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// CHART CONTENT
// ============================================================
const ChartContent: React.FC<{
  bars?: Array<{ label: string; value: number; color?: string }>;
  frame: number;
  fps: number;
  pointsStart: number;
  pointStagger: number;
}> = ({ bars = [], frame, fps, pointsStart, pointStagger }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 28,
        width: '100%',
      }}
    >
      {bars.map((bar, i) => {
        const barStart = pointsStart + i * pointStagger;
        const barP = spring({
          frame: frame - barStart,
          fps,
          config: { damping: 18, stiffness: 70 },
        });
        const rowOpacity = interpolate(barP, [0, 1], [0, 1]);
        const rowY = interpolate(barP, [0, 1], [20, 0]);
        const fillWidth = interpolate(barP, [0, 1], [0, Math.min(100, Math.max(0, bar.value))]);

        return (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              opacity: rowOpacity,
              transform: `translateY(${rowY}px)`,
            }}
          >
            {/* Label + value row */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 26, fontWeight: 600, color: C.white }}>
                {bar.label}
              </span>
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  ...blueGradient,
                }}
              >
                {bar.value}%
              </span>
            </div>

            {/* Bar track */}
            <div
              style={{
                width: '100%',
                height: 16,
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${fillWidth}%`,
                  height: '100%',
                  background: bar.color ?? 'linear-gradient(90deg, #4a9fd5, #87ceeb)',
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// TIMELINE CONTENT
// ============================================================
const TimelineContent: React.FC<{
  timeline?: Array<{ year: string; title: string; description?: string }>;
  frame: number;
  fps: number;
  pointsStart: number;
  pointStagger: number;
}> = ({ timeline = [], frame, fps, pointsStart, pointStagger }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 0,
        width: '100%',
        position: 'relative',
      }}
    >
      {/* Vertical line */}
      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 12,
          bottom: 12,
          width: 2,
          background: C.divider,
          zIndex: 0,
        }}
      />

      {timeline.map((item, i) => {
        const itemStart = pointsStart + i * pointStagger;
        const itemP = spring({
          frame: frame - itemStart,
          fps,
          config: { damping: 16, stiffness: 85 },
        });
        const itemOpacity = interpolate(itemP, [0, 1], [0, 1]);
        const itemX = interpolate(itemP, [0, 1], [50, 0]);

        return (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 0,
              paddingBottom: i < timeline.length - 1 ? 36 : 0,
              position: 'relative',
              zIndex: 1,
              opacity: itemOpacity,
              transform: `translateX(${itemX}px)`,
            }}
          >
            {/* Year */}
            <div
              style={{
                width: 70,
                flexShrink: 0,
                paddingTop: 2,
                fontSize: 22,
                fontWeight: 800,
                lineHeight: 1,
                ...blueGradient,
              }}
            >
              {item.year}
            </div>

            {/* Dot */}
            <div
              style={{
                width: 14,
                height: 14,
                flexShrink: 0,
                marginTop: 4,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${C.blue1}, ${C.blue2})`,
                boxShadow: `0 0 8px rgba(74,159,213,0.6)`,
                marginRight: 20,
              }}
            />

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: C.white,
                  lineHeight: 1.25,
                  marginBottom: item.description ? 6 : 0,
                }}
              >
                {item.title}
              </div>
              {item.description && (
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 400,
                    color: C.muted,
                    lineHeight: 1.45,
                  }}
                >
                  {item.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// HIGHLIGHT CONTENT
// ============================================================
const HighlightContent: React.FC<{
  keywords?: string[];
  frame: number;
  fps: number;
  pointsStart: number;
  pointStagger: number;
}> = ({ keywords = [], frame, fps, pointsStart, pointStagger }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        width: '100%',
      }}
    >
      {keywords.map((kw, i) => {
        const kwStart = pointsStart + i * pointStagger;
        const kwP = spring({
          frame: frame - kwStart,
          fps,
          config: { damping: 14, stiffness: 110 },
        });
        const kwOpacity = interpolate(kwP, [0, 1], [0, 1]);
        const kwScale = interpolate(kwP, [0, 1], [0.6, 1]);

        const isOrange = i % 3 === 2;

        return (
          <span
            key={i}
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: isOrange ? C.orange : C.chipText,
              border: `1px solid ${isOrange ? 'rgba(245,130,31,0.4)' : C.borderChip}`,
              borderRadius: 999,
              padding: '10px 24px',
              letterSpacing: '0.02em',
              lineHeight: 1,
              boxShadow: isOrange
                ? '0 0 14px rgba(245,130,31,0.15)'
                : '0 0 14px rgba(74,159,213,0.15)',
              opacity: kwOpacity,
              transform: `scale(${kwScale})`,
            }}
          >
            {kw}
          </span>
        );
      })}
    </div>
  );
};

// ============================================================
// QUOTE CONTENT
// ============================================================
const QuoteContent: React.FC<{
  quote?: string;
  author?: string;
  contentProgress: number;
  frame: number;
  fps: number;
  pointsStart: number;
}> = ({ quote, author, contentProgress, frame, fps, pointsStart }) => {
  const authorP = spring({
    frame: frame - pointsStart - 12,
    fps,
    config: { damping: 16, stiffness: 80 },
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        width: '100%',
        background: C.surface,
        border: `1px solid rgba(74,159,213,0.25)`,
        borderRadius: 20,
        padding: '48px 48px',
        boxShadow: '0 0 40px rgba(74,159,213,0.08)',
        opacity: interpolate(contentProgress, [0, 1], [0, 1]),
        transform: `scale(${interpolate(contentProgress, [0, 1], [0.92, 1])})`,
      }}
    >
      {/* Decorative quote mark */}
      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          lineHeight: 0.6,
          color: 'rgba(74,159,213,0.25)',
          alignSelf: 'flex-start',
          marginBottom: 8,
          fontFamily: 'Georgia, serif',
        }}
      >
        "
      </div>

      {/* Quote text */}
      {quote && (
        <div
          style={{
            fontSize: 36,
            fontWeight: 500,
            color: C.white,
            textAlign: 'center',
            lineHeight: 1.6,
            fontStyle: 'italic',
          }}
        >
          {quote}
        </div>
      )}

      {/* Author */}
      {author && (
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: C.chipText,
            textAlign: 'center',
            letterSpacing: '0.04em',
            opacity: interpolate(authorP, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(authorP, [0, 1], [12, 0])}px)`,
          }}
        >
          — {author}
        </div>
      )}
    </div>
  );
};

// ============================================================
// CTA CONTENT
// ============================================================
const CtaContent: React.FC<{
  cta?: string;
  items?: string[];
  contentProgress: number;
  frame: number;
  fps: number;
  pointsStart: number;
  pointStagger: number;
}> = ({ cta, items = [], contentProgress, frame, fps, pointsStart, pointStagger }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 36,
        width: '100%',
        position: 'relative',
      }}
    >
      {/* Glow behind CTA */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 300,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(74,159,213,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main CTA text */}
      {cta && (
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: C.white,
            textAlign: 'center',
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
            opacity: interpolate(contentProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(contentProgress, [0, 1], [0.85, 1])})`,
            position: 'relative',
          }}
        >
          {cta}
        </div>
      )}

      {/* Optional chips */}
      {items.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
          }}
        >
          {items.map((item, i) => {
            const chipStart = pointsStart + i * pointStagger;
            const chipP = spring({
              frame: frame - chipStart,
              fps,
              config: { damping: 14, stiffness: 100 },
            });
            return (
              <span
                key={i}
                style={{
                  fontSize: 26,
                  fontWeight: 600,
                  color: C.chipText,
                  border: `1px solid ${C.borderChip}`,
                  borderRadius: 999,
                  padding: '10px 24px',
                  lineHeight: 1,
                  opacity: interpolate(chipP, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(chipP, [0, 1], [16, 0])}px)`,
                }}
              >
                {item}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN PROJECT SLIDE COMPONENT
// ============================================================
export const ProjectSlide: React.FC<ProjectSlideProps> = ({
  type = 'default',
  title,
  subtitle,
  data,
  points = [],
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const brand: BrandData = useMemo(
    () => ({
      name: title ?? 'Project',
      badge: undefined,
      tagline: subtitle,
      chips: [],
      attribution: undefined,
      ...(data?.brand ?? {}),
    }),
    [data?.brand, title, subtitle]
  );

  // Determine point count for timing
  const pointCount = useMemo(() => {
    if (type === 'problems') return (data?.problems?.length ?? 0) + 1;
    if (type === 'stats') return 3;
    if (type === 'list' || type === 'default') {
      return (data?.items?.length ?? 0) || points.length;
    }
    if (type === 'compare') return 2;
    if (type === 'steps') return data?.steps?.length ?? 1;
    if (type === 'chart') return data?.bars?.length ?? 1;
    if (type === 'timeline') return data?.timeline?.length ?? 1;
    if (type === 'highlight') return (data?.keywords ?? data?.items?.map(i => i.title) ?? []).length;
    if (type === 'quote' || type === 'cta') return 1;
    return 1;
  }, [type, data, points]);

  const timing = getSlideMotionTiming(durationInFrames, pointCount);

  // Header entry (slides from top)
  const headerP = spring({
    frame: frame - 0,
    fps,
    config: { damping: 18, stiffness: 90 },
  });

  // Footer entry (slides from bottom)
  const footerP = spring({
    frame: frame - 4,
    fps,
    config: { damping: 18, stiffness: 90 },
  });

  // Content area entry
  const contentP = spring({
    frame: frame - timing.titleStart,
    fps,
    config: { damping: 16, stiffness: 80 },
  });

  const renderContent = () => {
    switch (type) {
      case 'hero':
        return (
          <HeroContent
            brandName={brand.name}
            subtitleLines={
              data?.subtitleLines ??
              (subtitle ? [subtitle] : undefined) ??
              (title ? [title] : undefined)
            }
            contentProgress={contentP}
            durationInFrames={durationInFrames}
          />
        );

      case 'problems':
        return (
          <ProblemsContent
            title={data?.problemsTitle ?? title}
            problems={
              data?.problems ??
              points.map((p) => {
                const sep = p.indexOf('：') !== -1 ? '：' : p.indexOf(':') !== -1 ? ':' : null;
                if (sep) {
                  const idx = p.indexOf(sep);
                  return { icon: '⚡', title: p.slice(0, idx).trim(), desc: p.slice(idx + 1).trim() };
                }
                return { icon: '⚡', title: p };
              })
            }
            frame={frame}
            fps={fps}
            pointsStart={timing.pointsStart}
            pointStagger={timing.pointStagger || 10}
          />
        );

      case 'stats':
        return (
          <StatsContent
            countPrefix={data?.countPrefix}
            countValue={data?.countValue}
            countSuffix={data?.countSuffix}
            badges={data?.badges ?? points.slice(0, 4)}
            highlight={data?.highlight ?? subtitle}
            highlightAccent={data?.highlightAccent}
            frame={frame}
            fps={fps}
            pointsStart={timing.pointsStart}
            pointStagger={timing.pointStagger || 12}
          />
        );

      case 'compare':
        if (data?.left || data?.right) {
          return (
            <CompareContent
              left={data?.left}
              right={data?.right}
              vsText={data?.vsText}
              frame={frame}
              fps={fps}
              pointsStart={timing.pointsStart}
              pointStagger={timing.pointStagger || 12}
            />
          );
        }
        // fall through to list when compare data is absent
        return (
          <ListContent
            title={title}
            items={data?.items}
            points={data?.points ?? points}
            frame={frame}
            fps={fps}
            pointsStart={timing.pointsStart}
            pointStagger={timing.pointStagger || 10}
          />
        );

      case 'steps':
        return (
          <StepsContent
            steps={
              data?.steps ??
              points.map((p) => {
                const sep = p.indexOf('：') !== -1 ? '：' : p.indexOf(':') !== -1 ? ':' : null;
                if (sep) {
                  const idx = p.indexOf(sep);
                  return { title: p.slice(0, idx).trim(), description: p.slice(idx + 1).trim() };
                }
                return { title: p };
              })
            }
            frame={frame}
            fps={fps}
            pointsStart={timing.pointsStart}
            pointStagger={timing.pointStagger || 10}
          />
        );

      case 'chart':
        return (
          <ChartContent
            bars={
              data?.bars ??
              points.map((p, i) => ({
                label: p,
                value: Math.round(80 - i * (60 / Math.max(points.length - 1, 1))),
              }))
            }
            frame={frame}
            fps={fps}
            pointsStart={timing.pointsStart}
            pointStagger={timing.pointStagger || 10}
          />
        );

      case 'timeline':
        return (
          <TimelineContent
            timeline={
              data?.timeline ??
              points.map((p, i) => {
                const sep = p.indexOf('：') !== -1 ? '：' : p.indexOf(':') !== -1 ? ':' : null;
                if (sep) {
                  const idx = p.indexOf(sep);
                  return { year: p.slice(0, idx).trim(), title: p.slice(idx + 1).trim() };
                }
                return { year: String(i + 1), title: p };
              })
            }
            frame={frame}
            fps={fps}
            pointsStart={timing.pointsStart}
            pointStagger={timing.pointStagger || 12}
          />
        );

      case 'highlight':
        return (
          <HighlightContent
            keywords={data?.keywords ?? data?.items?.map(i => i.title) ?? points}
            frame={frame}
            fps={fps}
            pointsStart={timing.pointsStart}
            pointStagger={timing.pointStagger || 8}
          />
        );

      case 'quote':
        return (
          <QuoteContent
            quote={data?.quote ?? subtitle ?? points[0]}
            author={data?.author}
            contentProgress={contentP}
            frame={frame}
            fps={fps}
            pointsStart={timing.pointsStart}
          />
        );

      case 'cta':
        return (
          <CtaContent
            cta={data?.cta ?? title}
            items={data?.items?.map(i => i.title) ?? data?.points ?? points}
            contentProgress={contentP}
            frame={frame}
            fps={fps}
            pointsStart={timing.pointsStart}
            pointStagger={timing.pointStagger || 8}
          />
        );

      case 'list':
      default:
        return (
          <ListContent
            title={title}
            items={data?.items}
            points={data?.points ?? points}
            frame={frame}
            fps={fps}
            pointsStart={timing.pointsStart}
            pointStagger={timing.pointStagger || 10}
          />
        );
    }
  };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bgAlt} 100%)`,
        fontFamily: "'SF Pro Display', 'PingFang SC', 'Noto Sans SC', sans-serif",
      }}
    >
      {/* Subtle top glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: 300,
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(74,159,213,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Persistent Header */}
      <PersistentHeader brand={brand} entryProgress={headerP} />

      {/* Main content area — between header (380px) and footer (280px) */}
      <div
        style={{
          position: 'absolute',
          top: 380,
          bottom: 380,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 72px',
        }}
      >
        {renderContent()}
      </div>

      {/* Persistent Footer */}
      <PersistentFooter brand={brand} entryProgress={footerP} />
    </AbsoluteFill>
  );
};
