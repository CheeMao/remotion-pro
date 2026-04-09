import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";
import { getElementProgress } from "../templates/runtimeTiming";
import type { HighlightWord, StepItem, TimelineItem, ChartData, ElementTiming } from "../templates/types";

const colors = {
  bg: "#0f172a",
  card: "rgba(15, 23, 42, 0.78)",
  panel: "rgba(30, 41, 59, 0.72)",
  accent1: "#3b82f6",
  accent2: "#8b5cf6",
  accent3: "#06b6d4",
  accent4: "#10b981",
  accent5: "#f59e0b",
  text: "#f8fafc",
  muted: "#94a3b8",
  border: "rgba(148, 163, 184, 0.18)",
};

const GridBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const offset = (frame * 0.45) % 100;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `
          linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "28px 28px",
        backgroundPosition: `-${offset}px -${offset}px`,
      }}
    />
  );
};

const InfoCard: React.FC<{ children: React.ReactNode; frame: number; delay: number }> = ({
  children,
  frame,
  delay,
}) => {
  const progress = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 20, stiffness: 80 },
  });
  return (
    <div
      style={{
        position: "relative",
        padding: "34px 32px 30px",
        borderRadius: 30,
        background: colors.card,
        backdropFilter: "blur(18px)",
        border: `1px solid ${colors.border}`,
        boxShadow: "0 28px 70px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.05)",
        opacity: progress,
        transform: `translateY(${(1 - progress) * 28}px) scale(${0.97 + progress * 0.03})`,
      }}
    >
      {children}
    </div>
  );
};

const chipPalette = [colors.accent1, colors.accent2, colors.accent3, colors.accent4, colors.accent5];

const HighlightText: React.FC<{
  highlights: HighlightWord[];
  frame: number;
  delay: number;
  getProgress?: (id: string, fallbackStart: number) => number;
}> = ({
  highlights,
  frame,
  delay,
  getProgress,
}) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
    {highlights.map((word, i) => {
      const progress = getProgress
        ? getProgress(`highlight-${i}`, delay + i * 3)
        : spring({
            frame: frame - delay - i * 3,
            fps: 30,
            config: { damping: 12 },
          });
      const accent = word.color || chipPalette[i % chipPalette.length];
      return (
        <div
          key={i}
          style={{
            padding: "14px 22px",
            borderRadius: 16,
            background: `linear-gradient(135deg, ${accent}20, ${accent}10)`,
            border: `1px solid ${accent}55`,
            color: colors.text,
            fontSize: 30,
            fontWeight: 800,
            boxShadow: `0 0 18px ${accent}18`,
            opacity: progress,
            transform: `translateY(${(1 - progress) * 18}px)`,
          }}
        >
          {word.text}
        </div>
      );
    })}
  </div>
);

const StepsFlow: React.FC<{
  steps: StepItem[];
  frame: number;
  delay: number;
  getProgress?: (id: string, fallbackStart: number) => number;
}> = ({
  steps,
  frame,
  delay,
  getProgress,
}) => (
  <div style={{ display: "grid", gap: 14 }}>
    {steps.map((step, i) => {
      const progress = getProgress
        ? getProgress(`step-${i}`, delay + i * 5)
        : spring({
            frame: frame - delay - i * 5,
            fps: 30,
            config: { damping: 15 },
          });
      const accent = chipPalette[i % chipPalette.length];
      return (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "64px 1fr",
            gap: 16,
            alignItems: "start",
            padding: "16px 18px",
            borderRadius: 18,
            background: colors.panel,
            border: `1px solid ${accent}28`,
            opacity: progress,
            transform: `translateX(${(1 - progress) * 38}px)`,
          }}
        >
          <div
            style={{
              width: 64,
              height: 56,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontSize: 24,
              fontWeight: 900,
              boxShadow: `0 10px 20px ${accent}30`,
            }}
          >
            {i + 1}
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: colors.text, marginBottom: 4 }}>
              {step.title}
            </div>
            {step.description ? (
              <div style={{ fontSize: 20, color: colors.muted, lineHeight: 1.5 }}>{step.description}</div>
            ) : null}
          </div>
        </div>
      );
    })}
  </div>
);

const TimelineView: React.FC<{
  items: TimelineItem[];
  frame: number;
  delay: number;
  getProgress?: (id: string, fallbackStart: number) => number;
}> = ({
  items,
  frame,
  delay,
  getProgress,
}) => (
  <div style={{ display: "grid", gap: 14 }}>
    {items.map((item, i) => {
      const progress = getProgress
        ? getProgress(`timeline-${i}`, delay + i * 4)
        : spring({
            frame: frame - delay - i * 4,
            fps: 30,
            config: { damping: 16 },
          });
      const accent = chipPalette[i % chipPalette.length];
      return (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "120px 18px 1fr",
            gap: 16,
            alignItems: "center",
            opacity: progress,
            transform: `translateX(${(1 - progress) * (i % 2 === 0 ? -28 : 28)}px)`,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, color: accent, textAlign: "right" }}>{item.year}</div>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: accent, boxShadow: `0 0 14px ${accent}` }} />
          <div style={{ padding: "14px 18px", borderRadius: 18, background: colors.panel, border: `1px solid ${accent}24` }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.text, marginBottom: 4 }}>{item.title}</div>
            {item.description ? <div style={{ fontSize: 18, color: colors.muted, lineHeight: 1.5 }}>{item.description}</div> : null}
          </div>
        </div>
      );
    })}
  </div>
);

const ChartView: React.FC<{
  chart: ChartData;
  frame: number;
  delay: number;
  getProgress?: (id: string, fallbackStart: number) => number;
}> = ({
  chart,
  frame,
  delay,
  getProgress,
}) => {
  if (chart.type === "progress") {
    return (
      <div style={{ display: "grid", gap: 18 }}>
        {chart.values.map((item, i) => {
          const progress = getProgress
            ? getProgress(`chart-bar-${i}`, delay + i * 4)
            : spring({
                frame: frame - delay - i * 4,
                fps: 30,
                config: { damping: 15 },
              });
          const accent = item.color || chipPalette[i % chipPalette.length];
          return (
            <div key={i} style={{ opacity: progress }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: colors.text }}>{item.label}</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: accent }}>{item.value}%</span>
              </div>
              <div style={{ height: 16, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${item.value * progress}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
                    boxShadow: `0 0 14px ${accent}45`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (chart.type === "bar") {
    const maxValue = Math.max(...chart.values.map((v) => v.value));
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 250 }}>
        {chart.values.map((item, i) => {
          const progress = getProgress
            ? getProgress(`chart-bar-${i}`, delay + i * 4)
            : spring({
                frame: frame - delay - i * 4,
                fps: 30,
                config: { damping: 15 },
              });
          const accent = item.color || chipPalette[i % chipPalette.length];
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: "100%",
                  height: (item.value / maxValue) * 200 * progress,
                  borderRadius: "14px 14px 4px 4px",
                  background: `linear-gradient(180deg, ${accent}, ${accent}bb)`,
                  boxShadow: `0 0 18px ${accent}40`,
                }}
              />
              <div style={{ fontSize: 18, fontWeight: 800, color: accent }}>{item.value}</div>
              <div style={{ fontSize: 16, color: colors.muted, textAlign: "center" }}>{item.label}</div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

export const KnowledgeSlide: React.FC<{
  title?: string;
  subtitle?: string;
  points?: string[];
  highlights?: HighlightWord[];
  steps?: StepItem[];
  timeline?: TimelineItem[];
  chart?: ChartData;
  elementTimings?: ElementTiming[];
  slideAudioStart?: number;
  type?: string;
  data?: Record<string, unknown>;
  index: number;
  totalSlides: number;
  durationInFrames: number;
}> = ({
  title,
  subtitle,
  points,
  highlights,
  steps,
  timeline,
  chart,
  elementTimings,
  slideAudioStart,
  type,
  data,
  index,
  totalSlides,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timing = getSlideMotionTiming(durationInFrames, points?.length ?? 0);

  const resolveProgress = (id: string, fallbackStart: number) =>
    getElementProgress({
      frame,
      fps,
      elementTimings,
      slideAudioStart,
      id,
      fallbackStart,
      damping: 16,
      stiffness: 96,
    });

  const titleProgress = resolveProgress("title", timing.titleStart);
  const subtitleProgress = resolveProgress("subtitle", timing.subtitleStart);

  const exitOpacity = interpolate(
    frame,
    [timing.exitStart, timing.exitEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: colors.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', sans-serif",
        overflow: "hidden",
      }}
    >
      <GridBackground frame={frame} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 18%, rgba(59,130,246,0.14) 0%, transparent 28%), radial-gradient(circle at 80% 22%, rgba(139,92,246,0.1) 0%, transparent 24%), radial-gradient(circle at 58% 78%, rgba(6,182,212,0.1) 0%, transparent 28%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 40,
          right: 40,
          display: "flex",
          gap: 10,
          alignItems: "center",
          padding: "10px 18px",
          borderRadius: 999,
          background: "rgba(0,0,0,0.28)",
          border: `1px solid ${colors.border}`,
          color: colors.text,
          fontSize: 22,
          fontWeight: 800,
        }}
      >
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span style={{ color: colors.muted }}>/</span>
        <span style={{ color: colors.muted }}>{String(totalSlides).padStart(2, "0")}</span>
      </div>

      <div style={{ opacity: exitOpacity, padding: "46px", width: "100%", maxWidth: 920 }}>
        {title ? (
          <h1
            style={{
              margin: 0,
              fontSize: 72,
              lineHeight: 1.02,
              fontWeight: 900,
              color: colors.text,
              textAlign: "left",
              letterSpacing: "-0.05em",
              opacity: titleProgress,
              transform: `translateY(${interpolate(titleProgress, [0, 1], [30, 0])}px)`,
              maxWidth: 720,
            }}
          >
            {title}
          </h1>
        ) : null}

        {subtitle ? (
          <p
            style={{
              margin: "18px 0 26px",
              fontSize: 30,
              lineHeight: 1.5,
              color: colors.muted,
              maxWidth: 720,
              opacity: subtitleProgress,
              transform: `translateY(${interpolate(subtitleProgress, [0, 1], [18, 0])}px)`,
            }}
          >
            {subtitle}
          </p>
        ) : null}

        <InfoCard frame={frame} delay={10}>
          {/* ===== compare ===== */}
          {type === 'compare' && data?.left && data?.right ? (
            (() => {
              const left = data.left as { label?: string; value?: string; desc?: string };
              const right = data.right as { label?: string; value?: string; desc?: string };
              const lp = spring({ frame: frame - 18, fps: 30, config: { damping: 14 } });
              const rp = spring({ frame: frame - 28, fps: 30, config: { damping: 14 } });
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: 0, alignItems: 'stretch' }}>
                  <div
                    style={{
                      padding: '24px 24px 28px 0',
                      borderRight: `1px solid ${colors.border}`,
                      opacity: lp,
                      transform: `translateX(${interpolate(lp, [0, 1], [-18, 0])}px)`,
                    }}
                  >
                    <div style={{ fontSize: 18, color: colors.accent3, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                      ◇ {left.label || 'Before'}
                    </div>
                    <div style={{ marginTop: 14, fontSize: 38, fontWeight: 900, color: colors.text, lineHeight: 1.18, letterSpacing: '-0.02em' }}>
                      {left.value}
                    </div>
                    {left.desc ? (
                      <div style={{ marginTop: 12, fontSize: 20, color: colors.muted, lineHeight: 1.5 }}>{left.desc}</div>
                    ) : null}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: colors.accent5, opacity: spring({ frame: frame - 32, fps: 30 }) }}>
                    {(data as { vsText?: string })?.vsText ?? 'VS'}
                  </div>
                  <div
                    style={{
                      padding: '24px 0 28px 24px',
                      opacity: rp,
                      transform: `translateX(${interpolate(rp, [0, 1], [18, 0])}px)`,
                    }}
                  >
                    <div style={{ fontSize: 18, color: colors.accent2, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                      ◆ {right.label || 'After'}
                    </div>
                    <div style={{ marginTop: 14, fontSize: 38, fontWeight: 900, color: colors.text, lineHeight: 1.18, letterSpacing: '-0.02em' }}>
                      {right.value}
                    </div>
                    {right.desc ? (
                      <div style={{ marginTop: 12, fontSize: 20, color: colors.muted, lineHeight: 1.5 }}>{right.desc}</div>
                    ) : null}
                  </div>
                </div>
              );
            })()
          ) : null}

          {/* ===== quote ===== */}
          {type === 'quote' && (typeof data?.quote === 'string' || (points && points.length > 0)) ? (
            (() => {
              const quoteText = (typeof data?.quote === 'string' ? data.quote : points?.[0]) || '';
              const author = typeof data?.author === 'string' ? data.author : undefined;
              const qp = spring({ frame: frame - 18, fps: 30, config: { damping: 16 } });
              return (
                <div style={{ position: 'relative', padding: '20px 12px' }}>
                  <div
                    style={{
                      position: 'absolute',
                      top: -30,
                      left: -8,
                      fontSize: 200,
                      fontFamily: 'Georgia, serif',
                      fontWeight: 900,
                      color: colors.accent2,
                      opacity: 0.18 * qp,
                      lineHeight: 0.7,
                    }}
                  >
                    "
                  </div>
                  <div
                    style={{
                      position: 'relative',
                      fontSize: 38,
                      fontWeight: 800,
                      lineHeight: 1.3,
                      color: colors.text,
                      letterSpacing: '-0.02em',
                      opacity: qp,
                      transform: `translateY(${interpolate(qp, [0, 1], [16, 0])}px)`,
                      paddingLeft: 12,
                    }}
                  >
                    {quoteText}
                  </div>
                  {author ? (
                    <div
                      style={{
                        marginTop: 24,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        opacity: spring({ frame: frame - 36, fps: 30 }),
                        paddingLeft: 12,
                      }}
                    >
                      <div style={{ width: 40, height: 2, background: colors.accent2 }} />
                      <div style={{ fontSize: 20, color: colors.accent2, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        {author}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })()
          ) : null}

          {/* ===== cta ===== */}
          {type === 'cta' ? (
            (() => {
              const ctaText =
                (typeof data?.cta === 'string' && data.cta) ||
                (typeof data?.button === 'string' && data.button) ||
                '点赞收藏';
              const tags = points || [];
              const cp = spring({ frame: frame - 22, fps: 30, config: { damping: 13, stiffness: 110 } });
              const pulse = 1 + Math.sin(frame * 0.12) * 0.04;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, padding: '8px 0' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '24px 52px',
                      borderRadius: 999,
                      background: `linear-gradient(135deg, ${colors.accent1} 0%, ${colors.accent2} 100%)`,
                      fontSize: 30,
                      fontWeight: 800,
                      color: 'white',
                      boxShadow: `0 24px 56px ${colors.accent1}55, inset 0 1px 0 rgba(255,255,255,0.4)`,
                      transform: `scale(${pulse * interpolate(cp, [0, 1], [0.86, 1])})`,
                      opacity: cp,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    <span style={{ fontSize: 28 }}>→</span>
                    {String(ctaText)}
                  </div>
                  {tags.length > 0 ? (
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', opacity: cp }}>
                      {tags.slice(0, 4).map((tag, i) => {
                        const tagColor = chipPalette[i % chipPalette.length];
                        return (
                          <span
                            key={`${tag}-${i}`}
                            style={{
                              padding: '10px 18px',
                              borderRadius: 999,
                              background: `${tagColor}18`,
                              border: `1px solid ${tagColor}45`,
                              fontSize: 17,
                              fontWeight: 700,
                              color: colors.text,
                              letterSpacing: '0.02em',
                            }}
                          >
                            #{tag}
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })()
          ) : null}

          {/* ===== highlights / hero ===== */}
          {(type === 'highlight' || type === 'hero' || type === 'stats' || !type) &&
          highlights && highlights.length > 0 ? (
            <HighlightText
              highlights={highlights}
              frame={frame}
              delay={15}
              getProgress={resolveProgress}
            />
          ) : null}

          {/* ===== steps (prop-driven, non-type-gated) ===== */}
          {steps && steps.length > 0 && type !== 'steps' ? (
            <StepsFlow
              steps={steps}
              frame={frame}
              delay={15}
              getProgress={resolveProgress}
            />
          ) : null}

          {/* ===== steps (type-gated, reads data.steps or steps prop) ===== */}
          {type === 'steps' ? (
            (() => {
              const stepsData: StepItem[] = (
                Array.isArray(data?.steps) ? data.steps as StepItem[] :
                steps && steps.length > 0 ? steps :
                (points ?? []).map((p) => ({ title: p }))
              );
              return stepsData.length > 0 ? (
                <div style={{ display: 'grid', gap: 0 }}>
                  {stepsData.map((step, i) => {
                    const progress = resolveProgress(`step-${i}`, 15 + i * 10);
                    const accent = chipPalette[i % chipPalette.length];
                    const isLast = i === stepsData.length - 1;
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '72px 1fr',
                          gap: 18,
                          alignItems: 'stretch',
                          opacity: progress,
                          transform: `translateX(${interpolate(progress, [0, 1], [-36, 0])}px)`,
                        }}
                      >
                        {/* Left: number + connector line */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div
                            style={{
                              width: 56,
                              height: 56,
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              color: 'white',
                              fontSize: 22,
                              fontWeight: 900,
                              flexShrink: 0,
                              boxShadow: `0 8px 20px ${accent}40`,
                            }}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </div>
                          {!isLast ? (
                            <div
                              style={{
                                width: 2,
                                flex: 1,
                                minHeight: 20,
                                background: `linear-gradient(180deg, ${accent}88, ${chipPalette[(i + 1) % chipPalette.length]}44)`,
                                margin: '4px 0',
                              }}
                            />
                          ) : null}
                        </div>
                        {/* Right: content */}
                        <div
                          style={{
                            padding: '10px 18px 18px 0',
                            paddingBottom: isLast ? 0 : 18,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 28,
                              fontWeight: 800,
                              color: colors.text,
                              lineHeight: 1.3,
                              marginBottom: step.description ? 6 : 0,
                            }}
                          >
                            {step.title}
                          </div>
                          {step.description ? (
                            <div style={{ fontSize: 21, color: colors.muted, lineHeight: 1.5 }}>
                              {step.description}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null;
            })()
          ) : null}

          {/* ===== timeline (prop-driven, non-type-gated) ===== */}
          {timeline && timeline.length > 0 && type !== 'timeline' ? (
            <TimelineView
              items={timeline}
              frame={frame}
              delay={15}
              getProgress={resolveProgress}
            />
          ) : null}

          {/* ===== timeline (type-gated, reads data.timeline or timeline prop) ===== */}
          {type === 'timeline' ? (
            (() => {
              const tlData: TimelineItem[] = (
                Array.isArray(data?.timeline) ? data.timeline as TimelineItem[] :
                timeline && timeline.length > 0 ? timeline :
                []
              );
              return tlData.length > 0 ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  {tlData.map((item, i) => {
                    const progress = resolveProgress(`timeline-${i}`, 15 + i * 10);
                    const accent = chipPalette[i % chipPalette.length];
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '110px 28px 1fr',
                          gap: 12,
                          alignItems: 'center',
                          opacity: progress,
                          transform: `translateX(${interpolate(progress, [0, 1], [i % 2 === 0 ? -28 : 28, 0])}px)`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 900,
                            color: accent,
                            textAlign: 'right',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {item.year}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: accent,
                              boxShadow: `0 0 12px ${accent}`,
                              flexShrink: 0,
                            }}
                          />
                          {i < tlData.length - 1 ? (
                            <div
                              style={{
                                width: 2,
                                height: 32,
                                background: `linear-gradient(180deg, ${accent}66, transparent)`,
                                marginTop: 2,
                              }}
                            />
                          ) : null}
                        </div>
                        <div
                          style={{
                            padding: '12px 16px',
                            borderRadius: 16,
                            background: colors.panel,
                            border: `1px solid ${accent}28`,
                          }}
                        >
                          <div style={{ fontSize: 22, fontWeight: 800, color: colors.text, marginBottom: item.description ? 4 : 0 }}>
                            {item.title}
                          </div>
                          {item.description ? (
                            <div style={{ fontSize: 18, color: colors.muted, lineHeight: 1.5 }}>
                              {item.description}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null;
            })()
          ) : null}

          {/* ===== chart (prop-driven, non-type-gated) ===== */}
          {chart && type !== 'chart' ? (
            <ChartView
              chart={chart}
              frame={frame}
              delay={15}
              getProgress={resolveProgress}
            />
          ) : null}

          {/* ===== chart (type-gated, reads data.chart or chart prop) ===== */}
          {type === 'chart' ? (
            (() => {
              const chartData: ChartData | undefined =
                data?.chart && typeof (data.chart as ChartData).type === 'string'
                  ? data.chart as ChartData
                  : chart;
              return chartData ? (
                <ChartView
                  chart={chartData}
                  frame={frame}
                  delay={15}
                  getProgress={resolveProgress}
                />
              ) : null;
            })()
          ) : null}

          {/* ===== list ===== */}
          {type === 'list' ? (
            (() => {
              type ListItem = { icon?: string; title: string; description?: string };
              const listItems: ListItem[] = Array.isArray(data?.items)
                ? (data.items as ListItem[])
                : (points ?? []).map((p) => ({ title: p }));
              return listItems.length > 0 ? (
                <div style={{ display: 'grid', gap: 14 }}>
                  {listItems.map((item, i) => {
                    const progress = resolveProgress(`list-${i}`, 15 + i * 8);
                    const accent = chipPalette[i % chipPalette.length];
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: item.icon ? '60px 1fr' : '1fr',
                          gap: 16,
                          alignItems: 'flex-start',
                          padding: '18px 20px',
                          borderRadius: 20,
                          background: colors.panel,
                          border: `1px solid ${accent}28`,
                          boxShadow: `0 4px 16px rgba(0,0,0,0.18)`,
                          opacity: progress,
                          transform: `translateY(${interpolate(progress, [0, 1], [24, 0])}px) scale(${interpolate(progress, [0, 1], [0.97, 1])})`,
                        }}
                      >
                        {item.icon ? (
                          <div
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: 14,
                              background: `linear-gradient(135deg, ${accent}28, ${accent}14)`,
                              border: `1px solid ${accent}44`,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              fontSize: 26,
                              flexShrink: 0,
                            }}
                          >
                            {item.icon}
                          </div>
                        ) : null}
                        {!item.icon ? (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                            <div
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                background: accent,
                                boxShadow: `0 0 10px ${accent}`,
                                marginTop: 11,
                                flexShrink: 0,
                              }}
                            />
                            <div>
                              <div style={{ fontSize: 28, fontWeight: 800, color: colors.text, lineHeight: 1.35 }}>
                                {item.title}
                              </div>
                              {item.description ? (
                                <div style={{ marginTop: 4, fontSize: 21, color: colors.muted, lineHeight: 1.5 }}>
                                  {item.description}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: colors.text, lineHeight: 1.35 }}>
                              {item.title}
                            </div>
                            {item.description ? (
                              <div style={{ marginTop: 4, fontSize: 21, color: colors.muted, lineHeight: 1.5 }}>
                                {item.description}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null;
            })()
          ) : null}

          {/* ===== default ===== */}
          {type === 'default' ? (
            (() => {
              const hasPoints = points && points.length > 0;
              if (hasPoints) {
                return (
                  <div style={{ display: 'grid', gap: 14 }}>
                    {(points ?? []).map((point, i) => {
                      const progress = resolveProgress(`point-${i}`, timing.pointsStart + i * timing.pointStagger);
                      const accent = chipPalette[i % chipPalette.length];
                      return (
                        <div
                          key={i}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '14px 1fr',
                            gap: 14,
                            alignItems: 'center',
                            padding: '16px 18px',
                            borderRadius: 18,
                            background: colors.panel,
                            border: `1px solid ${accent}22`,
                            opacity: progress,
                            transform: `translateX(${interpolate(progress, [0, 1], [-30, 0])}px)`,
                          }}
                        >
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              background: accent,
                              boxShadow: `0 0 10px ${accent}`,
                            }}
                          />
                          <div style={{ fontSize: 26, color: colors.text, fontWeight: 600, lineHeight: 1.42 }}>
                            {point}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }
              // No points: centered title + subtitle
              const extraTitle = typeof data?.title === 'string' ? data.title : undefined;
              const cp = spring({ frame: frame - 18, fps: 30, config: { damping: 16 } });
              return (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 18,
                    padding: '24px 12px',
                    textAlign: 'center',
                  }}
                >
                  {extraTitle ? (
                    <div
                      style={{
                        fontSize: 44,
                        fontWeight: 900,
                        color: colors.text,
                        lineHeight: 1.2,
                        letterSpacing: '-0.03em',
                        opacity: cp,
                        transform: `translateY(${interpolate(cp, [0, 1], [20, 0])}px)`,
                      }}
                    >
                      {extraTitle}
                    </div>
                  ) : null}
                  {subtitle ? (
                    <div
                      style={{
                        fontSize: 26,
                        color: colors.muted,
                        lineHeight: 1.5,
                        maxWidth: 640,
                        opacity: spring({ frame: frame - 28, fps: 30, config: { damping: 16 } }),
                      }}
                    >
                      {subtitle}
                    </div>
                  ) : null}
                </div>
              );
            })()
          ) : null}

          {/* ===== generic points fallback (no special type or data) ===== */}
          {points && points.length > 0 && !highlights && !steps && !timeline && !chart &&
          type !== 'compare' && type !== 'quote' && type !== 'cta' &&
          type !== 'list' && type !== 'steps' && type !== 'timeline' && type !== 'chart' && type !== 'default' ? (
            <div style={{ display: "grid", gap: 14 }}>
              {points.map((point, i) => {
                const progress = resolveProgress(
                  `point-${i}`,
                  timing.pointsStart + i * timing.pointStagger
                );
                const accent = chipPalette[i % chipPalette.length];
                return (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "14px 1fr",
                      gap: 14,
                      alignItems: "center",
                      padding: "16px 18px",
                      borderRadius: 18,
                      background: colors.panel,
                      border: `1px solid ${accent}22`,
                      opacity: progress,
                      transform: `translateX(${interpolate(progress, [0, 1], [-30, 0])}px)`,
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: accent,
                        boxShadow: `0 0 10px ${accent}`,
                      }}
                    />
                    <div style={{ fontSize: 26, color: colors.text, fontWeight: 600, lineHeight: 1.42 }}>
                      {point}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </InfoCard>

        <div style={{ display: "flex", gap: 8, marginTop: 26 }}>
          {[...Array(totalSlides)].map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 34 : 10,
                height: 10,
                borderRadius: 999,
                background:
                  i === index
                    ? `linear-gradient(90deg, ${colors.accent1}, ${colors.accent2})`
                    : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
