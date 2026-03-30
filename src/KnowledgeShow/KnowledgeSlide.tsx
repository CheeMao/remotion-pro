import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";
import type { HighlightWord, StepItem, TimelineItem, ChartData } from "../templates/types";

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

const HighlightText: React.FC<{ highlights: HighlightWord[]; frame: number; delay: number }> = ({
  highlights,
  frame,
  delay,
}) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
    {highlights.map((word, i) => {
      const progress = spring({
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

const StepsFlow: React.FC<{ steps: StepItem[]; frame: number; delay: number }> = ({
  steps,
  frame,
  delay,
}) => (
  <div style={{ display: "grid", gap: 14 }}>
    {steps.map((step, i) => {
      const progress = spring({
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

const TimelineView: React.FC<{ items: TimelineItem[]; frame: number; delay: number }> = ({
  items,
  frame,
  delay,
}) => (
  <div style={{ display: "grid", gap: 14 }}>
    {items.map((item, i) => {
      const progress = spring({
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

const ChartView: React.FC<{ chart: ChartData; frame: number; delay: number }> = ({
  chart,
  frame,
  delay,
}) => {
  if (chart.type === "progress") {
    return (
      <div style={{ display: "grid", gap: 18 }}>
        {chart.values.map((item, i) => {
          const progress = spring({
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
          const progress = spring({
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
  index: number;
  totalSlides: number;
  durationInFrames: number;
}> = ({ title, subtitle, points, highlights, steps, timeline, chart, index, totalSlides, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timing = getSlideMotionTiming(durationInFrames, points?.length ?? 0);

  const titleProgress = spring({
    frame: frame - timing.titleStart,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  const subtitleProgress = spring({
    frame: frame - timing.subtitleStart,
    fps,
    config: { damping: 18, stiffness: 90 },
  });

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
          left: 40,
          display: "flex",
          gap: 10,
          alignItems: "center",
          padding: "10px 18px",
          borderRadius: 999,
          background: "rgba(0,0,0,0.28)",
          border: `1px solid ${colors.border}`,
          color: colors.muted,
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: "0.14em",
        }}
      >
        KNOWLEDGE
      </div>
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
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 16px",
              borderRadius: 999,
              background: "rgba(59,130,246,0.12)",
              border: `1px solid ${colors.accent1}30`,
              color: colors.text,
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: "0.12em",
              marginBottom: 22,
            }}
          >
            INSIGHT FRAME
          </div>

          {highlights && highlights.length > 0 ? (
            <HighlightText highlights={highlights} frame={frame} delay={15} />
          ) : null}
          {steps && steps.length > 0 ? <StepsFlow steps={steps} frame={frame} delay={15} /> : null}
          {timeline && timeline.length > 0 ? <TimelineView items={timeline} frame={frame} delay={15} /> : null}
          {chart ? <ChartView chart={chart} frame={frame} delay={15} /> : null}

          {points && points.length > 0 && !highlights && !steps && !timeline && !chart ? (
            <div style={{ display: "grid", gap: 14 }}>
              {points.map((point, i) => {
                const progress = spring({
                  frame: frame - timing.pointsStart - i * timing.pointStagger,
                  fps,
                  config: { damping: 14 },
                });
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
