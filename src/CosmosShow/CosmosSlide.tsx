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
  bg: '#07070f',
  gold: '#f5a623',
  goldBright: '#fdd366',
  purple: '#a78bfa',
  purpleDim: '#7c5cbf',
  white: '#ffffff',
  whiteDim: 'rgba(255,255,255,0.88)',
  muted: '#8a94b0',
  mutedDark: '#4e5878',
  surface: 'rgba(255,255,255,0.05)',
  surfaceHover: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.07)',
  borderGold: 'rgba(245,166,35,0.25)',
  borderPurple: 'rgba(167,139,250,0.25)',
  glowGold: 'rgba(245,166,35,0.18)',
  glowPurple: 'rgba(167,139,250,0.15)',
} as const;

// ============================================================
// STAR FIELD
// ============================================================
const StarField: React.FC = () => {
  const frame = useCurrentFrame();

  const stars = useMemo(() => {
    return Array.from({ length: 88 }, (_, i) => {
      // Deterministic pseudo-random positions
      const x = ((i * 1597 + 31337) % 9973) / 9973;
      const y = ((i * 9871 + 12345) % 9769) / 9769;
      const phase = ((i * 3571 + 54321) % 6283) / 1000; // 0..2π
      const speed = 0.02 + ((i * 137) % 100) / 1000; // 0.02..0.12
      const size = 1 + ((i * 7) % 3) * 0.6; // 1, 1.6, 2.2
      const baseOpacity = 0.15 + ((i * 11) % 60) / 100; // 0.15..0.75
      return { x, y, phase, speed, size, baseOpacity };
    });
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {stars.map((star, i) => {
        const twinkle = (Math.sin(frame * star.speed + star.phase) + 1) / 2;
        const opacity = star.baseOpacity * (0.5 + twinkle * 0.5);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${star.x * 100}%`,
              top: `${star.y * 100}%`,
              width: star.size,
              height: star.size,
              borderRadius: '50%',
              background: 'white',
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};

// ============================================================
// NEBULA GLOW — subtle colored radial gradients in bg
// ============================================================
const NebulaGlow: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
    {/* Purple nebula top-left */}
    <div style={{
      position: 'absolute',
      top: '-10%', left: '-15%',
      width: '70%', height: '50%',
      background: 'radial-gradient(ellipse, rgba(120,80,200,0.12) 0%, transparent 65%)',
    }} />
    {/* Gold nebula bottom-right */}
    <div style={{
      position: 'absolute',
      bottom: '-5%', right: '-10%',
      width: '60%', height: '45%',
      background: 'radial-gradient(ellipse, rgba(200,130,30,0.08) 0%, transparent 65%)',
    }} />
    {/* Center dim glow */}
    <div style={{
      position: 'absolute',
      top: '30%', left: '20%',
      width: '60%', height: '40%',
      background: 'radial-gradient(ellipse, rgba(80,60,160,0.06) 0%, transparent 70%)',
    }} />
  </div>
);

// ============================================================
// ANIMATED STAT NUMBER
// ============================================================
interface StatItem {
  numericValue?: number;
  decimals?: number;
  suffix?: string;
  displayValue?: string;
  label: string;
  color?: string;
}

const AnimatedStat: React.FC<StatItem & { startFrame: number }> = ({
  numericValue,
  decimals = 0,
  suffix = '',
  displayValue,
  label,
  startFrame,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 22, stiffness: 48 },
  });

  const fadeIn = interpolate(Math.min(progress * 3, 1), [0, 1], [0, 1]);

  let display: string;
  if (numericValue !== undefined) {
    const val = interpolate(progress, [0, 1], [0, numericValue]);
    display = decimals > 0
      ? val.toFixed(decimals) + suffix
      : Math.round(val).toLocaleString() + suffix;
  } else {
    display = displayValue || '';
  }

  const statColor = color || C.gold;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      opacity: fadeIn,
      transform: `translateY(${interpolate(fadeIn, [0, 1], [24, 0])}px)`,
    }}>
      <div style={{
        fontSize: 76,
        fontWeight: 800,
        color: statColor,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
        letterSpacing: '-0.02em',
        textShadow: `0 0 48px ${statColor}55`,
      }}>
        {display}
      </div>
      <div style={{
        fontSize: 22,
        color: C.muted,
        fontWeight: 400,
        letterSpacing: '0.02em',
        textAlign: 'center',
      }}>
        {label}
      </div>
    </div>
  );
};

// ============================================================
// DIVIDER LINE
// ============================================================
const Divider: React.FC<{ progress: number; color?: string }> = ({
  progress,
  color = C.gold,
}) => (
  <div style={{
    width: `${interpolate(progress, [0, 1], [0, 120])}px`,
    height: 3,
    background: `linear-gradient(90deg, ${color}, ${color}44)`,
    borderRadius: 2,
    boxShadow: `0 0 16px ${color}60`,
    margin: '0 auto',
  }} />
);

// ============================================================
// LAYOUT: HERO
// ============================================================
interface HeroData {
  badge?: string;
  accentWord?: string;
  stats?: StatItem[];
}

const HeroLayout: React.FC<{
  title: string;
  subtitle?: string;
  data?: HeroData;
  durationInFrames: number;
}> = ({ title, subtitle, data, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timing = getSlideMotionTiming(durationInFrames, (data?.stats?.length ?? 0) + 1);

  const badge = data?.badge;
  const accentWord = data?.accentWord;
  const stats = data?.stats ?? [];

  const badgeP = spring({ frame: frame - 4, fps, config: { damping: 18, stiffness: 85 } });
  const titleP = spring({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
  const subtitleP = spring({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });
  const dividerP = spring({ frame: frame - timing.lineStart, fps, config: { damping: 18, stiffness: 80 } });

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 64px',
    }}>
      {/* Badge tag */}
      {badge && (
        <div style={{
          opacity: badgeP,
          transform: `translateY(${interpolate(badgeP, [0, 1], [16, 0])}px)`,
          marginBottom: 44,
        }}>
          <span style={{
            fontSize: 19,
            fontWeight: 600,
            color: C.gold,
            letterSpacing: '0.25em',
            fontFamily: "'Courier New', 'SF Mono', monospace",
          }}>
            {badge}
          </span>
        </div>
      )}

      {/* Accent word */}
      {accentWord && (
        <div style={{
          opacity: titleP,
          transform: `scale(${0.88 + titleP * 0.12})`,
          marginBottom: 4,
          textAlign: 'center',
        }}>
          <span style={{
            fontSize: 144,
            fontWeight: 900,
            color: C.purple,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            display: 'block',
            textShadow: `0 0 80px ${C.purple}60`,
          }}>
            {accentWord}
          </span>
        </div>
      )}

      {/* Main title */}
      <div style={{
        opacity: titleP,
        transform: `translateY(${interpolate(titleP, [0, 1], [24, 0])}px)`,
        textAlign: 'center',
        marginBottom: 28,
      }}>
        <div style={{
          fontSize: 80,
          fontWeight: 800,
          color: C.white,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          whiteSpace: 'pre-line',
        }}>
          {title}
        </div>
      </div>

      {/* Divider */}
      <div style={{ marginBottom: 28 }}>
        <Divider progress={dividerP} />
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div style={{
          opacity: subtitleP,
          transform: `translateY(${interpolate(subtitleP, [0, 1], [16, 0])}px)`,
          marginBottom: stats.length > 0 ? 64 : 0,
        }}>
          <div style={{
            fontSize: 34,
            color: C.muted,
            textAlign: 'center',
            letterSpacing: '0.01em',
            lineHeight: 1.5,
            maxWidth: 860,
          }}>
            {subtitle}
          </div>
        </div>
      )}

      {/* Stats row */}
      {stats.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 0,
        }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'stretch' }}>
              {i > 0 && (
                <div style={{
                  width: 1,
                  background: C.border,
                  margin: '8px 40px',
                  alignSelf: 'stretch',
                }} />
              )}
              <AnimatedStat
                {...stat}
                startFrame={timing.pointsStart + i * 10}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// LAYOUT: STATS
// ============================================================
interface StatsData {
  stats: Array<{
    numericValue?: number;
    decimals?: number;
    suffix?: string;
    displayValue?: string;
    label: string;
    color?: string;
    desc?: string;
  }>;
}

const StatsLayout: React.FC<{
  title: string;
  subtitle?: string;
  data?: StatsData;
  durationInFrames: number;
}> = ({ title, subtitle, data, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stats = data?.stats ?? [];
  const timing = getSlideMotionTiming(durationInFrames, stats.length);

  const titleP = spring({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
  const subP = spring({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '80px 64px',
    }}>
      {/* Title */}
      <div style={{
        opacity: titleP,
        transform: `translateY(${interpolate(titleP, [0, 1], [20, 0])}px)`,
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 60, fontWeight: 800, color: C.white, letterSpacing: '-0.02em' }}>
          {title}
        </div>
      </div>
      {subtitle && (
        <div style={{
          opacity: subP,
          transform: `translateY(${interpolate(subP, [0, 1], [16, 0])}px)`,
          marginBottom: 48,
        }}>
          <div style={{ fontSize: 28, color: C.muted }}>{subtitle}</div>
        </div>
      )}

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: stats.length <= 2 ? '1fr 1fr' : stats.length === 4 ? '1fr 1fr' : '1fr 1fr 1fr',
        gap: 32,
        alignContent: 'center',
      }}>
        {stats.map((stat, i) => {
          const p = spring({
            frame: frame - (timing.pointsStart + i * timing.pointStagger),
            fps,
            config: { damping: 18, stiffness: 70 },
          });
          return (
            <div
              key={i}
              style={{
                background: C.surface,
                border: `1px solid ${stat.color ? stat.color + '33' : C.borderGold}`,
                borderRadius: 24,
                padding: '36px 32px',
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [32, 0])}px) scale(${0.95 + p * 0.05})`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <AnimatedStat
                {...stat}
                startFrame={timing.pointsStart + i * timing.pointStagger}
              />
              {stat.desc && (
                <div style={{ fontSize: 22, color: C.mutedDark, textAlign: 'center', marginTop: -4 }}>
                  {stat.desc}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// LAYOUT: LIST
// ============================================================
interface ListData {
  items: Array<{
    icon?: string;
    text: string;
    desc?: string;
    color?: string;
  }>;
}

const ListLayout: React.FC<{
  title: string;
  subtitle?: string;
  data?: ListData;
  durationInFrames: number;
}> = ({ title, subtitle, data, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = data?.items ?? [];
  const timing = getSlideMotionTiming(durationInFrames, items.length);

  const titleP = spring({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
  const subP = spring({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });

  const accentColors = [C.gold, C.purple, '#22d3ee', '#f472b6', '#34d399'];

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '80px 64px',
    }}>
      <div style={{
        opacity: titleP,
        transform: `translateY(${interpolate(titleP, [0, 1], [20, 0])}px)`,
        marginBottom: 8,
      }}>
        <div style={{ fontSize: 62, fontWeight: 800, color: C.white, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          {title}
        </div>
      </div>
      {subtitle && (
        <div style={{
          opacity: subP,
          transform: `translateY(${interpolate(subP, [0, 1], [14, 0])}px)`,
          marginBottom: 40,
        }}>
          <div style={{ fontSize: 28, color: C.muted }}>{subtitle}</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'center' }}>
        {items.map((item, i) => {
          const p = spring({
            frame: frame - (timing.pointsStart + i * timing.pointStagger),
            fps,
            config: { damping: 18, stiffness: 80 },
          });
          const accent = item.color || accentColors[i % accentColors.length];
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderLeft: `3px solid ${accent}`,
                borderRadius: 20,
                padding: '24px 32px',
                opacity: p,
                transform: `translateX(${interpolate(p, [0, 1], [-40, 0])}px)`,
              }}
            >
              {/* Icon / number */}
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: accent + '18',
                border: `1px solid ${accent}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: item.icon ? 28 : 24,
                fontWeight: 700,
                color: accent,
                flexShrink: 0,
              }}>
                {item.icon || (i + 1)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 34, fontWeight: 700, color: C.whiteDim, lineHeight: 1.2 }}>
                  {item.text}
                </div>
                {item.desc && (
                  <div style={{ fontSize: 24, color: C.muted, marginTop: 4 }}>
                    {item.desc}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// LAYOUT: STEPS
// ============================================================
interface StepsData {
  steps: Array<{
    title: string;
    description?: string;
    icon?: string;
  }>;
}

const StepsLayout: React.FC<{
  title: string;
  subtitle?: string;
  data?: StepsData;
  durationInFrames: number;
}> = ({ title, subtitle, data, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const steps = data?.steps ?? [];
  const timing = getSlideMotionTiming(durationInFrames, steps.length);

  const titleP = spring({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
  const subP = spring({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '80px 64px',
    }}>
      <div style={{
        opacity: titleP,
        transform: `translateY(${interpolate(titleP, [0, 1], [20, 0])}px)`,
        marginBottom: 8,
      }}>
        <div style={{ fontSize: 62, fontWeight: 800, color: C.white, letterSpacing: '-0.02em' }}>
          {title}
        </div>
      </div>
      {subtitle && (
        <div style={{
          opacity: subP,
          marginBottom: 40,
        }}>
          <div style={{ fontSize: 28, color: C.muted }}>{subtitle}</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
        {steps.map((step, i) => {
          const p = spring({
            frame: frame - (timing.pointsStart + i * timing.pointStagger),
            fps,
            config: { damping: 18, stiffness: 80 },
          });
          const isLast = i === steps.length - 1;
          return (
            <div key={i} style={{ display: 'flex', gap: 24, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [28, 0])}px)` }}>
              {/* Timeline column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 52 }}>
                <div style={{
                  width: 52, height: 52,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${C.gold}, ${C.purple})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 800, color: C.bg,
                  boxShadow: `0 4px 24px ${C.gold}40`,
                  flexShrink: 0,
                }}>
                  {step.icon || (i + 1)}
                </div>
                {!isLast && (
                  <div style={{
                    width: 2,
                    flex: 1,
                    background: `linear-gradient(180deg, ${C.gold}60, transparent)`,
                    marginTop: 4,
                    marginBottom: 4,
                    minHeight: 24,
                  }} />
                )}
              </div>
              {/* Content */}
              <div style={{ flex: 1, paddingBottom: isLast ? 0 : 28 }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: C.white, lineHeight: 1.2, marginBottom: 6 }}>
                  {step.title}
                </div>
                {step.description && (
                  <div style={{ fontSize: 26, color: C.muted, lineHeight: 1.4 }}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// LAYOUT: COMPARE
// ============================================================
interface CompareData {
  left: { label: string; value: string; desc?: string; color?: string };
  right: { label: string; value: string; desc?: string; color?: string };
  vsText?: string;
}

const CompareLayout: React.FC<{
  title: string;
  subtitle?: string;
  data?: CompareData;
  durationInFrames: number;
}> = ({ title, subtitle, data, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timing = getSlideMotionTiming(durationInFrames, 2);

  const titleP = spring({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
  const subP = spring({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });
  const leftP = spring({ frame: frame - timing.pointsStart, fps, config: { damping: 18, stiffness: 75 } });
  const rightP = spring({ frame: frame - (timing.pointsStart + 10), fps, config: { damping: 18, stiffness: 75 } });
  const vsP = spring({ frame: frame - (timing.pointsStart + 5), fps, config: { damping: 20, stiffness: 90 } });

  const left = data?.left;
  const right = data?.right;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 64px' }}>
      <div style={{ opacity: titleP, transform: `translateY(${interpolate(titleP, [0, 1], [20, 0])}px)`, marginBottom: 8 }}>
        <div style={{ fontSize: 62, fontWeight: 800, color: C.white, letterSpacing: '-0.02em' }}>{title}</div>
      </div>
      {subtitle && (
        <div style={{ opacity: subP, marginBottom: 40 }}>
          <div style={{ fontSize: 28, color: C.muted }}>{subtitle}</div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginTop: 16 }}>
        {/* Left card */}
        <div style={{
          flex: 1,
          background: C.surface,
          border: `1px solid ${left?.color ? left.color + '44' : C.mutedDark + '44'}`,
          borderRadius: 28,
          padding: '44px 36px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          opacity: leftP,
          transform: `translateX(${interpolate(leftP, [0, 1], [-50, 0])}px)`,
        }}>
          <div style={{ fontSize: 24, color: left?.color || C.mutedDark, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {left?.label}
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, color: left?.color || C.mutedDark, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {left?.value}
          </div>
          {left?.desc && <div style={{ fontSize: 24, color: C.muted, textAlign: 'center' }}>{left.desc}</div>}
        </div>

        {/* VS */}
        <div style={{
          opacity: vsP,
          transform: `scale(${0.6 + vsP * 0.4})`,
          fontSize: 44, fontWeight: 900, color: C.purple,
          textShadow: `0 0 30px ${C.purple}80`,
          flexShrink: 0,
        }}>
          {data?.vsText || 'VS'}
        </div>

        {/* Right card */}
        <div style={{
          flex: 1,
          background: `linear-gradient(135deg, ${C.glowGold}, ${C.surface})`,
          border: `1px solid ${right?.color ? right.color + '55' : C.borderGold}`,
          borderRadius: 28,
          padding: '44px 36px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          opacity: rightP,
          transform: `translateX(${interpolate(rightP, [0, 1], [50, 0])}px)`,
          boxShadow: `0 0 60px ${C.gold}1a`,
        }}>
          <div style={{ fontSize: 24, color: right?.color || C.gold, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {right?.label}
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, color: right?.color || C.gold, lineHeight: 1, letterSpacing: '-0.02em', textShadow: `0 0 40px ${C.gold}55` }}>
            {right?.value}
          </div>
          {right?.desc && <div style={{ fontSize: 24, color: C.muted, textAlign: 'center' }}>{right.desc}</div>}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// LAYOUT: QUOTE
// ============================================================
interface QuoteData {
  quote: string;
  author?: string;
}

const QuoteLayout: React.FC<{
  title: string;
  data?: QuoteData;
  durationInFrames: number;
}> = ({ title, data, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timing = getSlideMotionTiming(durationInFrames, 1);

  const titleP = spring({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
  const quoteP = spring({ frame: frame - timing.pointsStart, fps, config: { damping: 18, stiffness: 70 } });
  const authorP = spring({ frame: frame - (timing.pointsStart + 14), fps, config: { damping: 18, stiffness: 70 } });

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 64px' }}>
      {/* Decorative quote mark */}
      <div style={{
        fontSize: 180,
        color: C.gold,
        opacity: 0.12,
        lineHeight: 1,
        position: 'absolute',
        top: 80,
        left: 60,
        fontFamily: 'Georgia, serif',
        userSelect: 'none',
      }}>
        "
      </div>

      <div style={{ opacity: titleP, transform: `translateY(${interpolate(titleP, [0, 1], [20, 0])}px)`, marginBottom: 48 }}>
        <div style={{ fontSize: 28, color: C.gold, letterSpacing: '0.2em', fontWeight: 600, textAlign: 'center' }}>
          {title}
        </div>
      </div>

      <div style={{
        opacity: quoteP,
        transform: `translateY(${interpolate(quoteP, [0, 1], [30, 0])}px)`,
        background: C.surface,
        border: `1px solid ${C.borderGold}`,
        borderRadius: 32,
        padding: '52px 60px',
        maxWidth: 900,
        boxShadow: `0 0 80px ${C.gold}0f`,
        marginBottom: 36,
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          fontSize: 42,
          color: C.whiteDim,
          lineHeight: 1.6,
          textAlign: 'center',
          fontWeight: 400,
          letterSpacing: '0.01em',
        }}>
          {data?.quote || ''}
        </div>
      </div>

      {data?.author && (
        <div style={{
          opacity: authorP,
          transform: `translateY(${interpolate(authorP, [0, 1], [16, 0])}px)`,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ width: 32, height: 2, background: C.gold, borderRadius: 1 }} />
          <div style={{ fontSize: 26, color: C.gold, fontWeight: 600 }}>{data.author}</div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// LAYOUT: DEFAULT (title + points)
// ============================================================
const DefaultLayout: React.FC<{
  title: string;
  subtitle?: string;
  points?: string[];
  durationInFrames: number;
}> = ({ title, subtitle, points, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timing = getSlideMotionTiming(durationInFrames, points?.length ?? 0);

  const titleP = spring({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
  const subP = spring({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });
  const lineP = spring({ frame: frame - timing.lineStart, fps, config: { damping: 18, stiffness: 80 } });

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 64px' }}>
      <div style={{ opacity: titleP, transform: `translateY(${interpolate(titleP, [0, 1], [24, 0])}px)`, marginBottom: 16 }}>
        <div style={{ fontSize: 68, fontWeight: 800, color: C.white, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {title}
        </div>
      </div>
      <div style={{ marginBottom: 28 }}>
        <Divider progress={lineP} />
      </div>
      {subtitle && (
        <div style={{ opacity: subP, marginBottom: 36 }}>
          <div style={{ fontSize: 30, color: C.muted, lineHeight: 1.5 }}>{subtitle}</div>
        </div>
      )}
      {points && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'center' }}>
          {points.map((point, i) => {
            const p = spring({
              frame: frame - (timing.pointsStart + i * timing.pointStagger),
              fps,
              config: { damping: 18, stiffness: 80 },
            });
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 20,
                opacity: p,
                transform: `translateX(${interpolate(p, [0, 1], [-28, 0])}px)`,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i % 2 === 0 ? C.gold : C.purple,
                  marginTop: 16, flexShrink: 0,
                  boxShadow: `0 0 10px ${i % 2 === 0 ? C.gold : C.purple}80`,
                }} />
                <div style={{ fontSize: 34, color: C.whiteDim, lineHeight: 1.4, flex: 1 }}>
                  {point}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================
// LAYOUT: CHART (horizontal progress bars)
// ============================================================
interface ChartBarItem {
  label: string;
  value: number; // 0..100
  color?: string;
}

interface ChartData {
  title: string;
  bars: ChartBarItem[];
}

const ChartLayout: React.FC<{
  title: string;
  subtitle?: string;
  data?: ChartData;
  durationInFrames: number;
}> = ({ title, subtitle, data, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bars = data?.bars ?? [];
  const timing = getSlideMotionTiming(durationInFrames, bars.length);

  const titleP = spring({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
  const subP = spring({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });

  const barColors = [C.gold, C.purple, '#22d3ee', '#34d399'];
  const BAR_MAX_WIDTH = 820;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '80px 64px',
    }}>
      {/* Title */}
      <div style={{
        opacity: titleP,
        transform: `translateY(${interpolate(titleP, [0, 1], [20, 0])}px)`,
        marginBottom: 8,
      }}>
        <div style={{
          fontSize: 62,
          fontWeight: 800,
          background: 'linear-gradient(135deg, #f5a623, #fdd366)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}>
          {title}
        </div>
      </div>

      {subtitle && (
        <div style={{
          opacity: subP,
          transform: `translateY(${interpolate(subP, [0, 1], [14, 0])}px)`,
          marginBottom: 40,
        }}>
          <div style={{ fontSize: 28, color: C.muted }}>{subtitle}</div>
        </div>
      )}

      {/* Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36, justifyContent: 'center' }}>
        {bars.map((bar, i) => {
          const p = spring({
            frame: frame - (timing.pointsStart + i * 10),
            fps,
            config: { damping: 20, stiffness: 70 },
          });
          const accent = bar.color || barColors[i % barColors.length];
          const fillWidth = interpolate(p, [0, 1], [0, (bar.value / 100) * BAR_MAX_WIDTH]);
          const fadeIn = interpolate(Math.min(p * 2, 1), [0, 1], [0, 1]);

          return (
            <div key={i} style={{ opacity: fadeIn }}>
              {/* Label row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 12,
              }}>
                <div style={{ fontSize: 28, fontWeight: 600, color: C.whiteDim }}>
                  {bar.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: accent }}>
                  {bar.value}%
                </div>
              </div>
              {/* Track */}
              <div style={{
                width: '100%',
                height: 20,
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: fillWidth,
                  height: '100%',
                  background: `linear-gradient(90deg, ${accent}, ${accent}99)`,
                  borderRadius: 10,
                  boxShadow: `0 0 18px ${accent}55`,
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// LAYOUT: TIMELINE
// ============================================================
interface TimelineItem {
  year: string;
  title: string;
  description?: string;
}

interface TimelineData {
  title: string;
  timeline: TimelineItem[];
}

const TimelineLayout: React.FC<{
  title: string;
  subtitle?: string;
  data?: TimelineData;
  durationInFrames: number;
}> = ({ title, subtitle, data, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = data?.timeline ?? [];
  const timing = getSlideMotionTiming(durationInFrames, items.length);

  const titleP = spring({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
  const subP = spring({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '80px 64px',
    }}>
      {/* Title */}
      <div style={{
        opacity: titleP,
        transform: `translateY(${interpolate(titleP, [0, 1], [20, 0])}px)`,
        marginBottom: 8,
      }}>
        <div style={{
          fontSize: 62,
          fontWeight: 800,
          background: 'linear-gradient(135deg, #f5a623, #fdd366)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}>
          {title}
        </div>
      </div>

      {subtitle && (
        <div style={{
          opacity: subP,
          transform: `translateY(${interpolate(subP, [0, 1], [14, 0])}px)`,
          marginBottom: 40,
        }}>
          <div style={{ fontSize: 28, color: C.muted }}>{subtitle}</div>
        </div>
      )}

      {/* Timeline items */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
        {items.map((item, i) => {
          const p = spring({
            frame: frame - (timing.pointsStart + i * timing.pointStagger),
            fps,
            config: { damping: 18, stiffness: 75 },
          });
          const isLast = i === items.length - 1;

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 0,
                opacity: p,
                transform: `translateX(${interpolate(p, [0, 1], [40, 0])}px)`,
              }}
            >
              {/* Year column */}
              <div style={{
                width: 120,
                flexShrink: 0,
                paddingTop: 8,
                paddingBottom: isLast ? 0 : 32,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                paddingRight: 0,
              }}>
                <div style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.gold,
                  letterSpacing: '-0.01em',
                }}>
                  {item.year}
                </div>
              </div>

              {/* Connector column */}
              <div style={{
                width: 52,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingBottom: isLast ? 0 : 8,
              }}>
                {/* Dot */}
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: C.gold,
                  border: `2px solid ${C.goldBright}`,
                  boxShadow: `0 0 14px ${C.gold}80`,
                  marginTop: 8,
                  flexShrink: 0,
                }} />
                {/* Line */}
                {!isLast && (
                  <div style={{
                    width: 2,
                    flex: 1,
                    background: `linear-gradient(180deg, ${C.gold}60, transparent)`,
                    marginTop: 4,
                    minHeight: 28,
                  }} />
                )}
              </div>

              {/* Content column */}
              <div style={{
                flex: 1,
                paddingLeft: 20,
                paddingBottom: isLast ? 0 : 32,
                paddingTop: 4,
              }}>
                <div style={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: C.white,
                  lineHeight: 1.25,
                  marginBottom: 6,
                }}>
                  {item.title}
                </div>
                {item.description && (
                  <div style={{
                    fontSize: 24,
                    color: C.muted,
                    lineHeight: 1.45,
                  }}>
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// LAYOUT: HIGHLIGHT (keyword chips)
// ============================================================
interface HighlightData {
  title: string;
  keywords?: string[];
  items?: string[];
}

const HighlightLayout: React.FC<{
  title: string;
  subtitle?: string;
  data?: HighlightData;
  durationInFrames: number;
}> = ({ title, subtitle, data, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const keywords = data?.keywords ?? data?.items ?? [];
  const timing = getSlideMotionTiming(durationInFrames, keywords.length);

  const titleP = spring({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 80 } });
  const subP = spring({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });

  const chipColors = [C.gold, C.purple, '#22d3ee', '#34d399'];

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '80px 64px',
    }}>
      {/* Title */}
      <div style={{
        opacity: titleP,
        transform: `translateY(${interpolate(titleP, [0, 1], [20, 0])}px)`,
        marginBottom: 8,
      }}>
        <div style={{
          fontSize: 62,
          fontWeight: 800,
          background: 'linear-gradient(135deg, #f5a623, #fdd366)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}>
          {title}
        </div>
      </div>

      {subtitle && (
        <div style={{
          opacity: subP,
          transform: `translateY(${interpolate(subP, [0, 1], [14, 0])}px)`,
          marginBottom: 40,
        }}>
          <div style={{ fontSize: 28, color: C.muted }}>{subtitle}</div>
        </div>
      )}

      {/* Chips grid */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 24,
        alignContent: 'center',
        alignItems: 'center',
      }}>
        {keywords.map((kw, i) => {
          const p = spring({
            frame: frame - (timing.pointsStart + i * timing.pointStagger),
            fps,
            config: { damping: 20, stiffness: 85 },
          });
          const accent = chipColors[i % chipColors.length];

          return (
            <div
              key={i}
              style={{
                opacity: p,
                transform: `scale(${0.75 + p * 0.25})`,
                background: accent + '14',
                border: `1.5px solid ${accent}55`,
                borderRadius: 40,
                padding: '16px 36px',
                boxShadow: `0 0 20px ${accent}22`,
              }}
            >
              <span style={{
                fontSize: 30,
                fontWeight: 700,
                color: C.white,
                letterSpacing: '0.01em',
              }}>
                {kw}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// LAYOUT: CTA (call-to-action)
// ============================================================
interface CTAData {
  cta: string;
  badge?: string;
  items?: string[];
}

const CTALayout: React.FC<{
  title: string;
  subtitle?: string;
  data?: CTAData;
  durationInFrames: number;
}> = ({ title, subtitle, data, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = data?.items ?? [];
  const timing = getSlideMotionTiming(durationInFrames, items.length + 1);

  const badgeP = spring({ frame: frame - 4, fps, config: { damping: 18, stiffness: 85 } });
  const ctaP = spring({ frame: frame - timing.titleStart, fps, config: { damping: 16, stiffness: 70 } });
  const subP = spring({ frame: frame - timing.subtitleStart, fps, config: { damping: 15, stiffness: 80 } });

  const chipColors = [C.gold, C.purple, '#22d3ee', '#34d399'];

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 64px',
    }}>
      {/* Background glow orb */}
      <div style={{
        position: 'absolute',
        top: '35%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, ${C.glowGold} 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      {/* Optional badge */}
      {data?.badge && (
        <div style={{
          opacity: badgeP,
          transform: `translateY(${interpolate(badgeP, [0, 1], [16, 0])}px)`,
          marginBottom: 40,
          position: 'relative',
          zIndex: 1,
        }}>
          <span style={{
            fontSize: 19,
            fontWeight: 600,
            color: C.muted,
            letterSpacing: '0.2em',
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            padding: '8px 24px',
          }}>
            {data.badge}
          </span>
        </div>
      )}

      {/* Main CTA text */}
      <div style={{
        opacity: ctaP,
        transform: `translateY(${interpolate(ctaP, [0, 1], [32, 0])}px) scale(${0.9 + ctaP * 0.1})`,
        textAlign: 'center',
        marginBottom: subtitle ? 28 : (items.length > 0 ? 52 : 0),
        position: 'relative',
        zIndex: 1,
        maxWidth: 900,
      }}>
        <div style={{
          fontSize: 52,
          fontWeight: 800,
          color: C.white,
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
        }}>
          {data?.cta || title}
        </div>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div style={{
          opacity: subP,
          transform: `translateY(${interpolate(subP, [0, 1], [16, 0])}px)`,
          textAlign: 'center',
          marginBottom: items.length > 0 ? 52 : 0,
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{ fontSize: 30, color: C.muted, lineHeight: 1.5 }}>{subtitle}</div>
        </div>
      )}

      {/* Supporting chips */}
      {items.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 20,
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          {items.map((item, i) => {
            const p = spring({
              frame: frame - (timing.pointsStart + i * timing.pointStagger),
              fps,
              config: { damping: 20, stiffness: 85 },
            });
            const accent = chipColors[i % chipColors.length];
            return (
              <div
                key={i}
                style={{
                  opacity: p,
                  transform: `scale(${0.8 + p * 0.2})`,
                  background: accent + '14',
                  border: `1px solid ${accent}44`,
                  borderRadius: 32,
                  padding: '12px 28px',
                }}
              >
                <span style={{ fontSize: 24, fontWeight: 600, color: C.whiteDim }}>
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================
// SLIDE PROGRESS INDICATOR
// ============================================================
const ProgressDots: React.FC<{ index: number; total: number }> = ({ index, total }) => (
  <div style={{
    position: 'absolute',
    bottom: 18,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 10,
  }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        width: i === index ? 24 : 8,
        height: 8,
        borderRadius: 4,
        background: i === index ? C.gold : 'rgba(255,255,255,0.15)',
        transition: 'none',
        boxShadow: i === index ? `0 0 12px ${C.gold}80` : 'none',
      }} />
    ))}
  </div>
);

// ============================================================
// MAIN SLIDE COMPONENT
// ============================================================
export interface CosmosSlideProps {
  title: string;
  subtitle?: string;
  type?: string;
  data?: Record<string, unknown>;
  points?: string[];
  index: number;
  totalSlides: number;
  durationInFrames: number;
}

export const CosmosSlide: React.FC<CosmosSlideProps> = ({
  title,
  subtitle,
  type,
  data,
  points,
  index,
  totalSlides,
  durationInFrames,
}) => {
  const renderContent = () => {
    switch (type) {
      case 'hero':
        return (
          <HeroLayout
            title={title}
            subtitle={subtitle}
            data={data as HeroData}
            durationInFrames={durationInFrames}
          />
        );
      case 'stats':
        return (
          <StatsLayout
            title={title}
            subtitle={subtitle}
            data={data as unknown as StatsData}
            durationInFrames={durationInFrames}
          />
        );
      case 'list':
        return (
          <ListLayout
            title={title}
            subtitle={subtitle}
            data={data as unknown as ListData}
            durationInFrames={durationInFrames}
          />
        );
      case 'steps':
        return (
          <StepsLayout
            title={title}
            subtitle={subtitle}
            data={data as unknown as StepsData}
            durationInFrames={durationInFrames}
          />
        );
      case 'compare':
        return (
          <CompareLayout
            title={title}
            subtitle={subtitle}
            data={data as unknown as CompareData}
            durationInFrames={durationInFrames}
          />
        );
      case 'quote':
        return (
          <QuoteLayout
            title={title}
            data={data as unknown as QuoteData}
            durationInFrames={durationInFrames}
          />
        );
      case 'chart':
        return (
          <ChartLayout
            title={title}
            subtitle={subtitle}
            data={data as unknown as ChartData}
            durationInFrames={durationInFrames}
          />
        );
      case 'timeline':
        return (
          <TimelineLayout
            title={title}
            subtitle={subtitle}
            data={data as unknown as TimelineData}
            durationInFrames={durationInFrames}
          />
        );
      case 'highlight':
        return (
          <HighlightLayout
            title={title}
            subtitle={subtitle}
            data={data as unknown as HighlightData}
            durationInFrames={durationInFrames}
          />
        );
      case 'cta':
        return (
          <CTALayout
            title={title}
            subtitle={subtitle}
            data={data as unknown as CTAData}
            durationInFrames={durationInFrames}
          />
        );
      default:
        return (
          <DefaultLayout
            title={title}
            subtitle={subtitle}
            points={points}
            durationInFrames={durationInFrames}
          />
        );
    }
  };

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Nebula glow layers */}
      <NebulaGlow />
      {/* Star field */}
      <StarField />
      {/* Content */}
      {renderContent()}
      {/* Progress dots */}
      {totalSlides > 1 && (
        <ProgressDots index={index} total={totalSlides} />
      )}
    </AbsoluteFill>
  );
};
