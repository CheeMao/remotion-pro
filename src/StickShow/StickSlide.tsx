import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import { StickFigure } from './figure/StickFigure';
import {
  chartChoreo,
  compareChoreo,
  ctaChoreo,
  defaultChoreo,
  heroChoreo,
  highlightChoreo,
  listChoreo,
  quoteChoreo,
  statsChoreo,
  stepsChoreo,
  timelineChoreo,
} from './figure/actions';
import {
  getCta,
  getQuote,
  toChart,
  toCompare,
  toHighlights,
  toList,
  toStats,
  toSteps,
  toTimeline,
  type SlideType,
} from '../landscape/normalize';

// ===================================================================
// STICK — 火柴人 + 数据卡片混合模板
// 黑板感深底 + 粉笔/黄色重点 + 手绘抖动
// ===================================================================

const STICK = {
  bg: '#1a1814',
  bgGradient: 'radial-gradient(ellipse 1200px 1800px at 50% 30%, #2a2520 0%, #0e0c0a 80%)',
  ink: '#fffefb',
  inkDim: 'rgba(255,254,251,0.66)',
  inkFaint: 'rgba(255,254,251,0.30)',
  chalk: '#fffefb',
  yellow: '#fbbf24',
  pink: '#f472b6',
  cyan: '#67e8f9',
  green: '#86efac',
  red: '#f87171',
  rule: 'rgba(255,254,251,0.18)',
  font: "'Caveat', 'Marker Felt', 'Comic Sans MS', 'PingFang SC', sans-serif",
  fontHeading:
    "'Caveat', 'Permanent Marker', 'Comic Sans MS', 'PingFang SC', sans-serif",
};

// ===== UTILS =====

const ease = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

// ===== BACKGROUND =====
const StickBg: React.FC<{ frame: number }> = ({ frame }) => {
  const grain = (frame * 0.02) % 100;
  void grain;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: STICK.bg }} />
      <AbsoluteFill style={{ background: STICK.bgGradient }} />
      {/* 粉笔颗粒 */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(rgba(255,254,251,0.04) 1px, transparent 1px),
                            radial-gradient(rgba(255,254,251,0.025) 1px, transparent 1px)`,
          backgroundSize: '4px 4px, 9px 9px',
          backgroundPosition: '0 0, 2px 2px',
          opacity: 0.7,
        }}
      />
      {/* 地面线 */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          bottom: 230,
          height: 3,
          background: STICK.rule,
          borderRadius: 2,
        }}
      />
    </AbsoluteFill>
  );
};

// ===== HAND-DRAWN BORDER (装饰用边框) =====
const HandBorder: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  frame: number;
  delay?: number;
  fill?: string;
}> = ({ x, y, w, h, color = STICK.yellow, frame, delay = 0, fill = 'transparent' }) => {
  const a = ease(frame, delay, delay + 14);
  const draw = ease(frame, delay + 2, delay + 26);
  const perimeter = 2 * (w + h);
  return (
    <>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={fill}
        rx={14}
        opacity={a * 0.9}
      />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={perimeter}
        strokeDashoffset={perimeter * (1 - draw)}
        rx={14}
      />
    </>
  );
};

// ===== ATOMS =====

const ChalkText: React.FC<{
  text: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  frame: number;
  delay?: number;
  weight?: number;
  textAnchor?: 'start' | 'middle' | 'end';
  maxWidth?: number;
}> = ({
  text,
  x,
  y,
  size = 64,
  color = STICK.chalk,
  frame,
  delay = 0,
  weight = 700,
  textAnchor = 'start',
  maxWidth,
}) => {
  const a = ease(frame, delay, delay + 22);
  return (
    <text
      x={x}
      y={y + (1 - a) * 18}
      fill={color}
      fontSize={size}
      fontWeight={weight}
      fontFamily={STICK.fontHeading}
      textAnchor={textAnchor}
      opacity={a}
      style={{
        letterSpacing: '0.01em',
        ...(maxWidth ? { maxWidth } : {}),
      }}
    >
      {text}
    </text>
  );
};

const Underline: React.FC<{
  x: number;
  y: number;
  width: number;
  color?: string;
  frame: number;
  delay?: number;
  thickness?: number;
}> = ({ x, y, width, color = STICK.yellow, frame, delay = 0, thickness = 8 }) => {
  const t = ease(frame, delay, delay + 26);
  return (
    <line
      x1={x}
      y1={y}
      x2={x + width * t}
      y2={y}
      stroke={color}
      strokeWidth={thickness}
      strokeLinecap="round"
    />
  );
};

// ===== PROPS =====

interface Props {
  title?: string;
  subtitle?: string;
  points?: string[];
  type?: SlideType;
  data?: Record<string, unknown>;
  index: number;
  totalSlides: number;
  durationInFrames: number;
}

// ===================================================================
// MAIN
// ===================================================================

export const StickSlide: React.FC<Props> = ({
  title = '',
  subtitle,
  points,
  type = 'default',
  data,
  index,
  totalSlides,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  // ----- 火柴人 pose -----
  const choosePose = () => {
    switch (type) {
      case 'hero':
        return heroChoreo(frame);
      case 'stats':
        return statsChoreo(frame);
      case 'compare':
        return compareChoreo(frame);
      case 'chart':
        return chartChoreo(frame);
      case 'steps': {
        const steps = toSteps(points, data);
        return stepsChoreo(frame, Math.max(2, Math.min(4, steps.length || 3)));
      }
      case 'timeline': {
        const tl = toTimeline(points, data);
        return timelineChoreo(frame, Math.max(2, Math.min(4, tl.length || 3)));
      }
      case 'list':
        return listChoreo(frame);
      case 'highlight':
        return highlightChoreo(frame);
      case 'quote':
        return quoteChoreo(frame);
      case 'cta':
        return ctaChoreo(frame);
      default:
        return defaultChoreo(frame);
    }
  };

  const pose = choosePose();

  // ----- HEADER (页码) -----
  const renderHeader = () => (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: 60,
        right: 60,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        opacity: ease(frame, 0, 18),
        fontFamily: STICK.font,
        color: STICK.inkDim,
        fontSize: 26,
        fontWeight: 700,
      }}
    >
      <span>✦ {(type || 'default').toUpperCase()}</span>
      <span>
        {String(index + 1).padStart(2, '0')} /{' '}
        {String(totalSlides).padStart(2, '0')}
      </span>
    </div>
  );

  // ----- 数据卡片层（DOM） -----
  const renderCards = () => {
    switch (type) {
      case 'hero':
        return renderHeroCards();
      case 'stats':
        return renderStatsCards();
      case 'compare':
        return renderCompareCards();
      case 'chart':
        return renderChartCards();
      case 'steps':
        return renderStepsCards();
      case 'timeline':
        return renderTimelineCards();
      case 'list':
        return renderListCards();
      case 'highlight':
        return renderHighlightCards();
      case 'quote':
        return renderQuoteCards();
      case 'cta':
        return renderCtaCards();
      default:
        return renderListCards();
    }
  };

  const renderHeroCards = () => (
    <div
      style={{
        position: 'absolute',
        top: 220,
        left: 60,
        right: 60,
        textAlign: 'center',
        fontFamily: STICK.fontHeading,
        color: STICK.ink,
      }}
    >
      <div
        style={{
          fontSize: 30,
          color: STICK.yellow,
          fontWeight: 700,
          letterSpacing: '0.1em',
          opacity: ease(frame, 18, 34),
        }}
      >
        ✦  HOOK  ✦
      </div>
      <div
        style={{
          fontSize: 96,
          fontWeight: 800,
          lineHeight: 1.1,
          marginTop: 26,
          letterSpacing: '-0.01em',
          opacity: ease(frame, 24, 50),
          transform: `translateY(${(1 - ease(frame, 24, 50)) * 24}px)`,
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div
          style={{
            fontSize: 38,
            color: STICK.inkDim,
            marginTop: 20,
            fontWeight: 600,
            opacity: ease(frame, 40, 60),
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );

  const renderStatsCards = () => {
    const stats = toStats(points, data).slice(0, 3);
    return (
      <>
        <div
          style={{
            position: 'absolute',
            top: 130,
            left: 60,
            right: 60,
            fontFamily: STICK.fontHeading,
            color: STICK.ink,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.12,
              opacity: ease(frame, 8, 28),
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: 28,
                color: STICK.inkDim,
                marginTop: 14,
                opacity: ease(frame, 18, 36),
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 460,
            right: 60,
            display: 'flex',
            flexDirection: 'column',
            gap: 36,
            width: 580,
          }}
        >
          {stats.map((s, i) => {
            const triggers = [30, 70, 110];
            const t = triggers[i] || 30;
            const a = ease(frame, t, t + 22);
            const numProgress = ease(frame, t + 4, t + 30);
            return (
              <div
                key={s.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  opacity: a,
                  transform: `translateY(${(1 - a) * 20}px)`,
                }}
              >
                <div
                  style={{
                    fontFamily: STICK.fontHeading,
                    fontSize: 132,
                    fontWeight: 900,
                    lineHeight: 0.92,
                    color: STICK.yellow,
                    letterSpacing: '-0.04em',
                  }}
                >
                  {s.rawValue % 1 !== 0
                    ? (s.rawValue * numProgress).toFixed(1)
                    : Math.floor(s.rawValue * numProgress)}
                  <span style={{ fontSize: 60, color: STICK.pink }}>{s.suffix}</span>
                </div>
                <div
                  style={{
                    fontFamily: STICK.fontHeading,
                    fontSize: 32,
                    color: STICK.ink,
                    fontWeight: 700,
                  }}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderCompareCards = () => {
    const { left, right } = toCompare(points, data);
    return (
      <>
        <div
          style={{
            position: 'absolute',
            top: 130,
            left: 60,
            right: 60,
            fontFamily: STICK.fontHeading,
            color: STICK.ink,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.12,
              opacity: ease(frame, 6, 26),
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: 26,
                color: STICK.inkDim,
                marginTop: 12,
                opacity: ease(frame, 14, 32),
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
        {/* 左卡片 */}
        <div
          style={{
            position: 'absolute',
            top: 360,
            left: 80,
            width: 460,
            padding: '24px 26px 28px',
            border: `4px solid ${STICK.cyan}`,
            borderRadius: 18,
            opacity: ease(frame, 26, 50),
            transform: `translateY(${(1 - ease(frame, 26, 50)) * 16}px)`,
          }}
        >
          <div
            style={{
              fontFamily: STICK.fontHeading,
              fontSize: 24,
              color: STICK.cyan,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            ① {left.label}
          </div>
          <div
            style={{
              fontFamily: STICK.fontHeading,
              fontSize: 44,
              color: STICK.ink,
              fontWeight: 800,
              lineHeight: 1.15,
              marginTop: 14,
            }}
          >
            {left.value}
          </div>
          {left.desc ? (
            <div style={{ fontSize: 22, color: STICK.inkDim, marginTop: 12, lineHeight: 1.5 }}>
              {left.desc}
            </div>
          ) : null}
        </div>
        {/* 右卡片 */}
        <div
          style={{
            position: 'absolute',
            top: 360,
            right: 80,
            width: 460,
            padding: '24px 26px 28px',
            border: `4px solid ${STICK.yellow}`,
            borderRadius: 18,
            opacity: ease(frame, 78, 100),
            transform: `translateY(${(1 - ease(frame, 78, 100)) * 16}px)`,
          }}
        >
          <div
            style={{
              fontFamily: STICK.fontHeading,
              fontSize: 24,
              color: STICK.yellow,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            ② {right.label}
          </div>
          <div
            style={{
              fontFamily: STICK.fontHeading,
              fontSize: 44,
              color: STICK.ink,
              fontWeight: 800,
              lineHeight: 1.15,
              marginTop: 14,
            }}
          >
            {right.value}
          </div>
          {right.desc ? (
            <div style={{ fontSize: 22, color: STICK.inkDim, marginTop: 12, lineHeight: 1.5 }}>
              {right.desc}
            </div>
          ) : null}
        </div>
        {/* VS */}
        <div
          style={{
            position: 'absolute',
            top: 460,
            left: '50%',
            transform: `translateX(-50%) scale(${ease(frame, 60, 80)})`,
            fontFamily: STICK.fontHeading,
            fontSize: 70,
            color: STICK.red,
            fontWeight: 900,
          }}
        >
          VS
        </div>
      </>
    );
  };

  const renderChartCards = () => {
    const bars = toChart(points, data).slice(0, 4);
    return (
      <>
        <div
          style={{
            position: 'absolute',
            top: 130,
            left: 60,
            right: 60,
            fontFamily: STICK.fontHeading,
            color: STICK.ink,
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 800, opacity: ease(frame, 8, 28) }}>{title}</div>
          {subtitle ? (
            <div style={{ fontSize: 26, color: STICK.inkDim, marginTop: 12, opacity: ease(frame, 16, 34) }}>
              {subtitle}
            </div>
          ) : null}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 380,
            right: 60,
            width: 600,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {bars.map((b, i) => {
            const beats = [25, 55, 85, 115];
            const t = beats[i] || 25;
            const fill = ease(frame, t, t + 30);
            const w = Math.max(0, Math.min(100, b.value));
            const colors = [STICK.yellow, STICK.cyan, STICK.pink, STICK.green];
            const color = colors[i % colors.length];
            return (
              <div key={`${b.label}-${i}`} style={{ opacity: ease(frame, t, t + 14) }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    fontFamily: STICK.fontHeading,
                    color: STICK.ink,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 30, fontWeight: 800 }}>{b.label}</span>
                  <span style={{ fontSize: 38, fontWeight: 900, color }}>
                    {Math.floor(w * fill)}%
                  </span>
                </div>
                <div
                  style={{
                    height: 22,
                    border: `3px solid ${STICK.inkFaint}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${w * fill}%`,
                      background: color,
                      borderRadius: 11,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderStepsCards = () => {
    const steps = toSteps(points, data).slice(0, 4);
    return (
      <>
        <div
          style={{
            position: 'absolute',
            top: 130,
            left: 60,
            right: 60,
            fontFamily: STICK.fontHeading,
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 800, color: STICK.ink, opacity: ease(frame, 6, 26) }}>
            {title}
          </div>
          {subtitle ? (
            <div style={{ fontSize: 26, color: STICK.inkDim, marginTop: 12, opacity: ease(frame, 14, 32) }}>
              {subtitle}
            </div>
          ) : null}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 350,
            left: 60,
            right: 60,
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(steps.length, 4)}, 1fr)`,
            gap: 24,
          }}
        >
          {steps.map((step, i) => {
            const t = 24 + i * 28;
            const a = ease(frame, t, t + 24);
            const colors = [STICK.yellow, STICK.cyan, STICK.pink, STICK.green];
            const color = colors[i % colors.length];
            return (
              <div
                key={`${step.title}-${i}`}
                style={{
                  border: `4px solid ${color}`,
                  borderRadius: 16,
                  padding: '20px 18px',
                  opacity: a,
                  transform: `translateY(${(1 - a) * 22}px)`,
                  fontFamily: STICK.fontHeading,
                }}
              >
                <div
                  style={{
                    fontSize: 56,
                    fontWeight: 900,
                    color,
                    lineHeight: 1,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: STICK.ink,
                    marginTop: 14,
                    lineHeight: 1.2,
                  }}
                >
                  {step.title}
                </div>
                {step.desc ? (
                  <div style={{ fontSize: 18, color: STICK.inkDim, marginTop: 8, lineHeight: 1.5 }}>
                    {step.desc}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderTimelineCards = () => {
    const timeline = toTimeline(points, data).slice(0, 4);
    return (
      <>
        <div style={{ position: 'absolute', top: 130, left: 60, right: 60, fontFamily: STICK.fontHeading }}>
          <div style={{ fontSize: 54, fontWeight: 800, color: STICK.ink, opacity: ease(frame, 6, 26) }}>
            {title}
          </div>
          {subtitle ? (
            <div style={{ fontSize: 24, color: STICK.inkDim, marginTop: 12, opacity: ease(frame, 14, 32) }}>
              {subtitle}
            </div>
          ) : null}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 360,
            left: 60,
            right: 60,
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(timeline.length, 4)}, 1fr)`,
            gap: 18,
          }}
        >
          {timeline.map((t, i) => {
            const start = 20 + i * 24;
            const a = ease(frame, start, start + 24);
            const colors = [STICK.yellow, STICK.cyan, STICK.pink, STICK.green];
            const color = colors[i % colors.length];
            return (
              <div
                key={`${t.year}-${i}`}
                style={{
                  fontFamily: STICK.fontHeading,
                  opacity: a,
                  transform: `translateY(${(1 - a) * 18}px)`,
                  borderTop: `4px solid ${color}`,
                  paddingTop: 16,
                }}
              >
                <div style={{ fontSize: 36, fontWeight: 900, color }}>{t.year}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: STICK.ink, marginTop: 8, lineHeight: 1.25 }}>
                  {t.title}
                </div>
                {t.desc ? (
                  <div style={{ fontSize: 17, color: STICK.inkDim, marginTop: 6, lineHeight: 1.5 }}>
                    {t.desc}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderListCards = () => {
    const items = toList(points, data).slice(0, 5);
    return (
      <>
        <div style={{ position: 'absolute', top: 130, left: 60, right: 60, fontFamily: STICK.fontHeading }}>
          <div style={{ fontSize: 60, fontWeight: 800, color: STICK.ink, opacity: ease(frame, 6, 26) }}>
            {title}
          </div>
          {subtitle ? (
            <div style={{ fontSize: 28, color: STICK.inkDim, marginTop: 12, opacity: ease(frame, 14, 32) }}>
              {subtitle}
            </div>
          ) : null}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 360,
            left: 60,
            right: 460,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {items.map((it, i) => {
            const t = 26 + i * 16;
            const a = ease(frame, t, t + 22);
            const colors = [STICK.yellow, STICK.cyan, STICK.pink, STICK.green, STICK.red];
            const color = colors[i % colors.length];
            return (
              <div
                key={`${it.title}-${i}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 1fr',
                  gap: 18,
                  alignItems: 'baseline',
                  padding: '14px 18px',
                  borderBottom: `2px dashed ${STICK.inkFaint}`,
                  opacity: a,
                  transform: `translateX(${(1 - a) * -20}px)`,
                  fontFamily: STICK.fontHeading,
                }}
              >
                <div style={{ fontSize: 48, fontWeight: 900, color }}>{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: STICK.ink, lineHeight: 1.25 }}>
                    {it.title}
                  </div>
                  {it.desc ? (
                    <div style={{ fontSize: 20, color: STICK.inkDim, marginTop: 4, lineHeight: 1.5 }}>
                      {it.desc}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderHighlightCards = () => {
    const items = toHighlights(points, data).slice(0, 4);
    return (
      <>
        <div style={{ position: 'absolute', top: 130, left: 60, right: 60, fontFamily: STICK.fontHeading }}>
          <div style={{ fontSize: 56, fontWeight: 800, color: STICK.ink, opacity: ease(frame, 6, 26) }}>
            {title}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 320,
            left: 60,
            right: 60,
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
            alignItems: 'flex-start',
          }}
        >
          {items.map((it, i) => {
            const triggers = [25, 55, 85, 115];
            const t = triggers[i] || 25;
            const a = ease(frame, t, t + 22);
            const colors = [STICK.yellow, STICK.cyan, STICK.pink, STICK.green];
            const color = colors[i % colors.length];
            const offset = i % 2 === 0 ? 0 : 80;
            return (
              <div
                key={`${it}-${i}`}
                style={{
                  marginLeft: offset,
                  fontFamily: STICK.fontHeading,
                  fontSize: 56,
                  fontWeight: 800,
                  color: STICK.ink,
                  opacity: a,
                  transform: `translateX(${(1 - a) * (i % 2 === 0 ? -30 : 30)}px) scale(${0.92 + a * 0.08})`,
                  lineHeight: 1.15,
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: -36,
                    top: 12,
                    color,
                    fontSize: 32,
                    fontWeight: 900,
                  }}
                >
                  ✦
                </span>
                {it}
                <div
                  style={{
                    position: 'absolute',
                    bottom: -6,
                    left: 0,
                    height: 6,
                    width: `${a * 100}%`,
                    background: color,
                    borderRadius: 4,
                  }}
                />
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderQuoteCards = () => {
    const { quote, author } = getQuote(data, title, subtitle);
    return (
      <>
        <div
          style={{
            position: 'absolute',
            top: 280,
            left: 60,
            right: 460,
            fontFamily: STICK.fontHeading,
          }}
        >
          <div
            style={{
              fontSize: 220,
              color: STICK.yellow,
              opacity: 0.18 * ease(frame, 4, 24),
              lineHeight: 0.7,
              fontWeight: 900,
              marginBottom: -60,
            }}
          >
            "
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: STICK.ink,
              lineHeight: 1.22,
              opacity: ease(frame, 18, 50),
              transform: `translateY(${(1 - ease(frame, 18, 50)) * 18}px)`,
            }}
          >
            {quote}
          </div>
          {author ? (
            <div
              style={{
                marginTop: 36,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity: ease(frame, 50, 70),
              }}
            >
              <div style={{ width: 50, height: 4, background: STICK.yellow, borderRadius: 2 }} />
              <div style={{ fontSize: 28, color: STICK.yellow, fontWeight: 800, letterSpacing: '0.06em' }}>
                {author}
              </div>
            </div>
          ) : null}
        </div>
      </>
    );
  };

  const renderCtaCards = () => {
    const cta = getCta(data) || '点赞收藏';
    const tags = toHighlights(points, data).slice(0, 4);
    const pulse = 1 + Math.sin(frame * 0.13) * 0.04;
    return (
      <>
        <div
          style={{
            position: 'absolute',
            top: 200,
            left: 60,
            right: 60,
            textAlign: 'center',
            fontFamily: STICK.fontHeading,
          }}
        >
          <div
            style={{
              fontSize: 30,
              color: STICK.yellow,
              fontWeight: 700,
              letterSpacing: '0.16em',
              opacity: ease(frame, 6, 24),
            }}
          >
            ✦  THE END  ✦
          </div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              color: STICK.ink,
              lineHeight: 1.1,
              marginTop: 28,
              opacity: ease(frame, 16, 42),
              transform: `translateY(${(1 - ease(frame, 16, 42)) * 22}px)`,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: 32,
                color: STICK.inkDim,
                marginTop: 18,
                opacity: ease(frame, 30, 50),
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 540,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            opacity: ease(frame, 70, 90),
          }}
        >
          <div
            style={{
              padding: '28px 64px',
              border: `6px solid ${STICK.yellow}`,
              borderRadius: 999,
              background: 'rgba(251,191,36,0.10)',
              fontFamily: STICK.fontHeading,
              fontSize: 48,
              fontWeight: 800,
              color: STICK.yellow,
              transform: `scale(${pulse})`,
            }}
          >
            → {cta}
          </div>
        </div>
        {tags.length > 0 ? (
          <div
            style={{
              position: 'absolute',
              top: 680,
              left: 0,
              right: 0,
              display: 'flex',
              gap: 14,
              justifyContent: 'center',
              flexWrap: 'wrap',
              fontFamily: STICK.fontHeading,
              opacity: ease(frame, 86, 110),
            }}
          >
            {tags.map((t, i) => {
              const colors = [STICK.cyan, STICK.pink, STICK.green, STICK.yellow];
              const color = colors[i % colors.length];
              return (
                <span
                  key={`${t}-${i}`}
                  style={{
                    padding: '10px 20px',
                    border: `3px solid ${color}`,
                    borderRadius: 999,
                    fontSize: 24,
                    color,
                    fontWeight: 800,
                  }}
                >
                  #{t}
                </span>
              );
            })}
          </div>
        ) : null}
      </>
    );
  };

  void Underline;
  void HandBorder;
  void ChalkText;
  void durationInFrames;

  return (
    <AbsoluteFill style={{ background: STICK.bg, fontFamily: STICK.font }}>
      <StickBg frame={frame} />
      {renderHeader()}
      {renderCards()}
      {/* 火柴人 SVG 层 */}
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        <StickFigure pose={pose} frame={frame} color={STICK.chalk} strokeWidth={9} fillColor={STICK.bg} />
      </svg>
    </AbsoluteFill>
  );
};
