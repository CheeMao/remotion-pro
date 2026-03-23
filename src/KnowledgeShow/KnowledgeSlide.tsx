import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";
import type { HighlightWord, StepItem, TimelineItem, ChartData } from "../templates/types";

// 知识类配色 - 清爽专业
const colors = {
  bg: "#0f172a",
  cardBg: "rgba(30, 41, 59, 0.85)",
  accent1: "#3b82f6",
  accent2: "#8b5cf6",
  accent3: "#06b6d4",
  accent4: "#10b981",
  accent5: "#f59e0b",
  accent6: "#ef4444",
  text: "#f8fafc",
  textMuted: "#94a3b8",
  border: "rgba(148, 163, 184, 0.2)",
  glow: "rgba(59, 130, 246, 0.3)",
};

// ===== 动态网格背景 =====
const GridBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const offset = (frame * 0.5) % 100;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `
          linear-gradient(${colors.bg} 1px, transparent 1px),
          linear-gradient(90deg, ${colors.bg} 1px, transparent 1px),
          linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px",
        backgroundPosition: `-${offset}px -${offset}px`,
      }}
    />
  );
};

// ===== 浮动粒子 =====
const Particle: React.FC<{ frame: number; x: number; y: number; delay: number }> = ({
  frame,
  x,
  y,
  delay,
}) => {
  const progress = spring({ frame: frame - delay, fps: 30, config: { damping: 20 } });
  const floatY = Math.sin(frame * 0.02 + delay) * 15;
  const opacity = 0.3 + Math.sin(frame * 0.03 + delay) * 0.2;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + floatY,
        width: 4,
        height: 4,
        borderRadius: "50%",
        background: colors.accent1,
        opacity: progress * opacity,
        boxShadow: `0 0 10px ${colors.accent1}`,
      }}
    />
  );
};

// ===== 主卡片容器 =====
const KnowledgeCard: React.FC<{
  children: React.ReactNode;
  frame: number;
  delay: number;
}> = ({ children, frame, delay }) => {
  const progress = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 20, stiffness: 80 },
  });

  return (
    <div
      style={{
        position: "relative",
        padding: "60px 50px",
        background: colors.cardBg,
        backdropFilter: "blur(20px)",
        borderRadius: 32,
        border: `1px solid ${colors.border}`,
        boxShadow: `
          0 25px 50px -12px rgba(0, 0, 0, 0.5),
          0 0 0 1px rgba(59, 130, 246, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.05)
        `,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 30}px) scale(${0.95 + progress * 0.05})`,
      }}
    >
      {children}
    </div>
  );
};

// ===== 重点强调组件 =====
const HighlightText: React.FC<{
  highlights: HighlightWord[];
  frame: number;
  delay: number;
}> = ({ highlights, frame, delay }) => {
  const accentColors = [colors.accent1, colors.accent2, colors.accent3, colors.accent4, colors.accent5];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
      {highlights.map((word, i) => {
        const wordProgress = spring({
          frame: frame - delay - i * 3,
          fps: 30,
          config: { damping: 12 },
        });
        const accentColor = word.color || accentColors[i % accentColors.length];

        // 强调动画
        let transform = `translateY(${(1 - wordProgress) * 20}px)`;
        if (word.emphasis === "bounce") {
          const bounce = Math.sin(frame * 0.1 + i) * 3;
          transform += ` translateY(${bounce}px)`;
        } else if (word.emphasis === "scale") {
          const scale = 1 + Math.sin(frame * 0.08 + i) * 0.05;
          transform = `translateY(${(1 - wordProgress) * 20}px) scale(${scale})`;
        }

        // 发光效果
        const glowStyle = word.emphasis === "glow"
          ? { boxShadow: `0 0 20px ${accentColor}60, 0 0 40px ${accentColor}30` }
          : {};

        return (
          <div
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "16px 28px",
              background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
              borderRadius: 16,
              border: `2px solid ${accentColor}60`,
              fontSize: 32,
              fontWeight: 700,
              color: colors.text,
              opacity: wordProgress,
              transform,
              ...glowStyle,
            }}
          >
            {word.emphasis === "underline" && (
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: 16,
                  right: 16,
                  height: 3,
                  borderRadius: 2,
                  background: accentColor,
                  transform: `scaleX(${wordProgress})`,
                }}
              />
            )}
            {word.text}
          </div>
        );
      })}
    </div>
  );
};

// ===== 步骤流程组件 =====
const StepsFlow: React.FC<{
  steps: StepItem[];
  frame: number;
  delay: number;
}> = ({ steps, frame, delay }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
      {steps.map((step, i) => {
        const progress = spring({
          frame: frame - delay - i * 5,
          fps: 30,
          config: { damping: 15 },
        });
        const accentColors = [colors.accent1, colors.accent2, colors.accent3, colors.accent4];
        const accentColor = accentColors[i % accentColors.length];

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              opacity: progress,
              transform: `translateX(${(1 - progress) * 50}px)`,
            }}
          >
            {/* 步骤编号 */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 26,
                fontWeight: 800,
                color: "white",
                boxShadow: `0 8px 20px ${accentColor}40`,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>

            {/* 连接线 */}
            {i < steps.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  left: 28,
                  top: 60,
                  width: 2,
                  height: 30,
                  background: `linear-gradient(180deg, ${accentColor}, transparent)`,
                  opacity: 0.5,
                }}
              />
            )}

            {/* 内容 */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                {step.title}
              </div>
              {step.description && (
                <div style={{ fontSize: 22, color: colors.textMuted }}>{step.description}</div>
              )}
            </div>

            {/* 箭头 */}
            <div style={{ color: accentColor, fontSize: 24, opacity: 0.6 }}>→</div>
          </div>
        );
      })}
    </div>
  );
};

// ===== 时间线组件 =====
const TimelineView: React.FC<{
  items: TimelineItem[];
  frame: number;
  delay: number;
}> = ({ items, frame, delay }) => {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* 中心线 */}
      <div
        style={{
          position: "absolute",
          left: 50,
          top: 0,
          bottom: 0,
          width: 3,
          background: `linear-gradient(180deg, ${colors.accent1}, ${colors.accent2}, ${colors.accent3})`,
          borderRadius: 2,
        }}
      />

      {items.map((item, i) => {
        const progress = spring({
          frame: frame - delay - i * 6,
          fps: 30,
          config: { damping: 15 },
        });
        const isLeft = i % 2 === 0;
        const accentColors = [colors.accent1, colors.accent2, colors.accent3, colors.accent4];
        const accentColor = accentColors[i % accentColors.length];

        return (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: isLeft ? "row" : "row-reverse",
              alignItems: "center",
              gap: 24,
              marginBottom: 24,
              opacity: progress,
              transform: `translateX(${(1 - progress) * (isLeft ? -30 : 30)}px)`,
            }}
          >
            {/* 年份节点 */}
            <div
              style={{
                width: 100,
                textAlign: isLeft ? "right" : "left",
                fontSize: 24,
                fontWeight: 800,
                color: accentColor,
                flexShrink: 0,
              }}
            >
              {item.year}
            </div>

            {/* 圆点 */}
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: accentColor,
                boxShadow: `0 0 15px ${accentColor}80`,
                flexShrink: 0,
                zIndex: 1,
              }}
            />

            {/* 内容卡片 */}
            <div
              style={{
                flex: 1,
                padding: "16px 20px",
                background: `${accentColor}15`,
                borderRadius: 16,
                border: `1px solid ${accentColor}30`,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                {item.title}
              </div>
              {item.description && (
                <div style={{ fontSize: 18, color: colors.textMuted }}>{item.description}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ===== 数据图表组件 =====
const ChartView: React.FC<{
  chart: ChartData;
  frame: number;
  delay: number;
}> = ({ chart, frame, delay }) => {
  if (chart.type === "progress") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
        {chart.values.map((item, i) => {
          const progress = spring({
            frame: frame - delay - i * 4,
            fps: 30,
            config: { damping: 15 },
          });
          const accentColors = [colors.accent1, colors.accent2, colors.accent3, colors.accent4];
          const accentColor = item.color || accentColors[i % accentColors.length];
          const barWidth = (item.value / 100) * progress;

          return (
            <div key={i} style={{ opacity: progress }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 600, color: colors.text }}>{item.label}</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: accentColor }}>{item.value}%</span>
              </div>
              <div
                style={{
                  height: 16,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${barWidth * 100}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`,
                    borderRadius: 8,
                    boxShadow: `0 0 15px ${accentColor}50`,
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
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 250, width: "100%" }}>
        {chart.values.map((item, i) => {
          const progress = spring({
            frame: frame - delay - i * 4,
            fps: 30,
            config: { damping: 15 },
          });
          const accentColors = [colors.accent1, colors.accent2, colors.accent3, colors.accent4, colors.accent5];
          const accentColor = item.color || accentColors[i % accentColors.length];
          const barHeight = (item.value / maxValue) * 200 * progress;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                flex: 1,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: barHeight,
                  background: `linear-gradient(180deg, ${accentColor}, ${accentColor}80)`,
                  borderRadius: "12px 12px 0 0",
                  boxShadow: `0 0 20px ${accentColor}40`,
                }}
              />
              <div style={{ fontSize: 18, fontWeight: 700, color: accentColor }}>{item.value}</div>
              <div style={{ fontSize: 16, color: colors.textMuted, textAlign: "center" }}>{item.label}</div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

// ===== 页码指示器 =====
const PageIndicator: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div
    style={{
      position: "absolute",
      top: 40,
      right: 40,
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 20px",
      background: "rgba(0,0,0,0.3)",
      backdropFilter: "blur(10px)",
      borderRadius: 20,
    }}
  >
    <span style={{ fontSize: 24, fontWeight: 700, color: colors.text }}>{current + 1}</span>
    <span style={{ fontSize: 24, color: colors.textMuted }}>/</span>
    <span style={{ fontSize: 24, color: colors.textMuted }}>{total}</span>
  </div>
);

// ===== 主幻灯片组件 =====
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

  // 粒子位置
  const particles = [
    { x: 100, y: 200 }, { x: 900, y: 150 }, { x: 150, y: 800 },
    { x: 850, y: 700 }, { x: 500, y: 400 }, { x: 80, y: 1400 },
    { x: 920, y: 1350 }, { x: 450, y: 1000 },
  ];

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

      {/* 粒子 */}
      {particles.map((p, i) => (
        <Particle key={i} frame={frame} x={p.x} y={p.y} delay={i * 3} />
      ))}

      <PageIndicator current={index} total={totalSlides} />

      <div style={{ opacity: exitOpacity, padding: "50px", width: "100%", maxWidth: 900 }}>
        {/* 标题 */}
        {title && (
          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: colors.text,
              margin: 0,
              marginBottom: 12,
              textAlign: "center",
              transform: `translateY(${interpolate(titleProgress, [0, 1], [30, 0])}px)`,
              opacity: titleProgress,
              letterSpacing: "-1px",
            }}
          >
            {title}
          </h1>
        )}

        {/* 副标题 */}
        {subtitle && (
          <p
            style={{
              fontSize: 32,
              color: colors.textMuted,
              margin: 0,
              marginBottom: 40,
              textAlign: "center",
              transform: `translateY(${interpolate(subtitleProgress, [0, 1], [20, 0])}px)`,
              opacity: subtitleProgress,
            }}
          >
            {subtitle}
          </p>
        )}

        <KnowledgeCard frame={frame} delay={10}>
          {/* 重点强调 */}
          {highlights && highlights.length > 0 && (
            <HighlightText highlights={highlights} frame={frame} delay={15} />
          )}

          {/* 步骤流程 */}
          {steps && steps.length > 0 && (
            <StepsFlow steps={steps} frame={frame} delay={15} />
          )}

          {/* 时间线 */}
          {timeline && timeline.length > 0 && (
            <TimelineView items={timeline} frame={frame} delay={15} />
          )}

          {/* 图表 */}
          {chart && (
            <ChartView chart={chart} frame={frame} delay={15} />
          )}

          {/* 普通要点列表 */}
          {points && points.length > 0 && !highlights && !steps && !timeline && !chart && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {points.map((point, i) => {
                const progress = spring({
                  frame: frame - timing.pointsStart - i * timing.pointStagger,
                  fps,
                  config: { damping: 14 },
                });
                const accentColors = [colors.accent1, colors.accent2, colors.accent3, colors.accent4];

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "18px 22px",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 16,
                      border: `1px solid ${colors.border}`,
                      transform: `translateX(${interpolate(progress, [0, 1], [-30, 0])}px)`,
                      opacity: progress,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: accentColors[i % 4],
                        boxShadow: `0 0 10px ${accentColors[i % 4]}`,
                      }}
                    />
                    <span style={{ fontSize: 26, color: colors.text, fontWeight: 500 }}>{point}</span>
                  </div>
                );
              })}
            </div>
          )}
        </KnowledgeCard>

        {/* 底部指示器 */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 30 }}>
          {[...Array(totalSlides)].map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 32 : 8,
                height: 8,
                borderRadius: 4,
                background: i === index
                  ? `linear-gradient(90deg, ${colors.accent1}, ${colors.accent2})`
                  : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};