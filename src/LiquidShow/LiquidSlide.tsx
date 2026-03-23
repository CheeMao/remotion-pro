import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";

// 深色液态玻璃配色
const colors = {
  bg: "#0a0a12",
  blob1: "#ff6b9d",
  blob2: "#c44dff",
  blob3: "#00d4aa",
  blob4: "#ff9f43",
  blob5: "#5f9eff",
  blob6: "#a855f7",
  text: "#ffffff",
  textSecondary: "rgba(255,255,255,0.8)",
  muted: "rgba(255,255,255,0.6)",
};

// ===== 大型液态 Blob =====
const MegaBlob: React.FC<{
  frame: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  phase: number;
}> = ({ frame, x, y, size, color, speedX, speedY, phase }) => {
  const moveX = Math.sin(frame * speedX + phase) * 120 + Math.cos(frame * speedX * 0.7) * 60;
  const moveY = Math.cos(frame * speedY + phase) * 100 + Math.sin(frame * speedY * 0.6) * 50;
  const morph1 = 30 + Math.sin(frame * 0.015 + phase) * 30;
  const morph2 = 70 + Math.cos(frame * 0.012 + phase) * 35;
  const morph3 = 50 + Math.sin(frame * 0.018 + phase + 1) * 32;
  const morph4 = 60 + Math.cos(frame * 0.014 + phase + 2) * 28;
  const scale = 1 + Math.sin(frame * 0.008 + phase) * 0.15;

  return (
    <div
      style={{
        position: "absolute",
        left: x + moveX,
        top: y + moveY,
        width: size,
        height: size,
        background: color,
        borderRadius: `${morph1}% ${morph2}% ${morph3}% ${morph4}%`,
        filter: "blur(120px)",
        opacity: 0.7,
        transform: `scale(${scale})`,
      }}
    />
  );
};

// ===== 渐变背景 =====
const GradientBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const shift = Math.sin(frame * 0.005) * 25;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(ellipse 100% 80% at ${50 + shift}% 20%, rgba(255,107,157,0.25) 0%, transparent 50%),
          radial-gradient(ellipse 80% 100% at ${20 + shift * 0.5}% 80%, rgba(196,77,255,0.2) 0%, transparent 45%),
          radial-gradient(ellipse 120% 90% at ${80 - shift * 0.3}% 60%, rgba(0,212,170,0.15) 0%, transparent 40%),
          linear-gradient(180deg, #0a0a12 0%, #0f0f1a 50%, #0a0a12 100%)
        `,
      }}
    />
  );
};

// ===== 毛玻璃卡片 =====
const GlassCard: React.FC<{
  children: React.ReactNode;
  frame: number;
  delay: number;
}> = ({ children, frame, delay }) => {
  const progress = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 20, stiffness: 100 },
  });

  const breathe = 1 + Math.sin(frame * 0.02) * 0.01;

  return (
    <div
      style={{
        position: "relative",
        opacity: progress,
        transform: `scale(${progress * breathe}) translateY(${(1 - progress) * 30}px)`,
      }}
    >
      {/* 外发光 */}
      <div
        style={{
          position: "absolute",
          inset: -4,
          borderRadius: 50,
          background: `linear-gradient(135deg, ${colors.blob2}40, ${colors.blob1}40, ${colors.blob3}40)`,
          filter: "blur(30px)",
          opacity: 0.6,
        }}
      />

      {/* 主卡片 */}
      <div
        style={{
          position: "relative",
          padding: "60px 50px",
          background: `
            linear-gradient(135deg,
              rgba(255,255,255,0.12) 0%,
              rgba(255,255,255,0.05) 50%,
              rgba(255,255,255,0.08) 100%
            )
          `,
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderRadius: 44,
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: `
            0 30px 60px -15px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.08),
            inset 0 1px 1px rgba(255,255,255,0.15),
            inset 0 -1px 1px rgba(0,0,0,0.1)
          `,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ===== 浮动光球 =====
const FloatingOrb: React.FC<{
  frame: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}> = ({ frame, x, y, size, color, delay }) => {
  const progress = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 15 },
  });

  const floatY = Math.sin(frame * 0.02 + delay) * 15;
  const floatX = Math.cos(frame * 0.015 + delay * 0.7) * 10;

  return (
    <div
      style={{
        position: "absolute",
        left: x + floatX,
        top: y + floatY,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `
          radial-gradient(circle at 30% 30%,
            rgba(255,255,255,0.9) 0%,
            ${color} 50%,
            ${color}99 100%
          )
        `,
        boxShadow: `
          0 10px 40px ${color}60,
          inset 0 -8px 16px rgba(0,0,0,0.2),
          inset 0 8px 16px rgba(255,255,255,0.9)
        `,
        opacity: progress * 0.9,
        transform: `scale(${progress})`,
      }}
    />
  );
};

// ===== 动画数字 =====
const AnimatedNumber: React.FC<{
  value: number;
  suffix?: string;
  startFrame: number;
  color: string;
}> = ({ value, suffix = "", startFrame, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20, stiffness: 50 },
  });

  const displayValue = Math.round(interpolate(progress, [0, 1], [0, value]));

  return (
    <span style={{ fontVariantNumeric: "tabular-nums", color }}>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
};

// ===== 进度条 =====
const ProgressBar: React.FC<{
  percent: number;
  label: string;
  color: string;
  delay: number;
}> = ({ percent, label, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15 },
  });

  const width = interpolate(progress, [0, 1], [0, percent]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <span style={{ fontSize: 24, color: colors.text, width: 110, flexShrink: 0, fontWeight: 500 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 12, background: "rgba(255,255,255,0.08)", borderRadius: 6, overflow: "hidden" }}>
        <div
          style={{
            width: `${width}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            borderRadius: 6,
            boxShadow: `0 0 20px ${color}70`,
          }}
        />
      </div>
      <span style={{ fontSize: 22, color, fontWeight: 600, width: 55, textAlign: "right" }}>
        {Math.round(width)}%
      </span>
    </div>
  );
};

// ===== 步骤卡片 =====
const StepCard: React.FC<{
  title: string;
  description?: string;
  index: number;
  color: string;
  progress: number;
}> = ({ title, description, index, color, progress }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 18,
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 22,
            fontWeight: 700,
            color: "white",
            boxShadow: `0 8px 25px ${color}60`,
          }}
        >
          {index + 1}
        </div>
        <div style={{ width: 2, flex: 1, background: "rgba(255,255,255,0.1)", marginTop: 8 }} />
      </div>
      <div style={{ flex: 1, paddingBottom: 28 }}>
        <h3 style={{ fontSize: 28, fontWeight: 600, color: colors.text, margin: "0 0 6px 0" }}>
          {title}
        </h3>
        {description && (
          <p style={{ fontSize: 22, color: colors.muted, margin: 0 }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

// ===== 时间线项 =====
const TimelineItem: React.FC<{
  year: string;
  title: string;
  description?: string;
  color: string;
  progress: number;
  isLeft: boolean;
}> = ({ year, title, description, color, progress, isLeft }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        flexDirection: isLeft ? "row" : "row-reverse",
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [isLeft ? -40 : 40, 0])}px)`,
      }}
    >
      <div style={{ flex: 1, textAlign: isLeft ? "right" : "left" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color, marginBottom: 4 }}>{year}</div>
        <div style={{ fontSize: 26, fontWeight: 600, color: colors.text, marginBottom: 4 }}>{title}</div>
        {description && (
          <div style={{ fontSize: 20, color: colors.muted }}>{description}</div>
        )}
      </div>
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 20px ${color}`,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1 }} />
    </div>
  );
};

// ===== 主组件 =====
export const LiquidSlide: React.FC<{
  title: string;
  subtitle?: string;
  points?: string[];
  type?: 'default' | 'steps' | 'timeline' | 'chart' | 'highlight' | 'list' | 'compare' | 'stats' | 'quote' | 'hero';
  data?: Record<string, unknown>;
  index: number;
  totalSlides: number;
  durationInFrames: number;
}> = ({ title, subtitle, points, type = 'default', data, index, totalSlides, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 根据 type 计算动画元素数量
  const getAnimCount = () => {
    if (type === 'steps' && Array.isArray(data?.steps)) return (data.steps as unknown[]).length;
    if (type === 'timeline' && Array.isArray(data?.timeline)) return (data.timeline as unknown[]).length;
    if (type === 'chart' && Array.isArray(data?.bars)) return (data.bars as unknown[]).length;
    if (type === 'stats' && Array.isArray(data?.stats)) return (data.stats as unknown[]).length;
    if (type === 'list' && Array.isArray(data?.items)) return (data.items as unknown[]).length;
    if (type === 'compare') return 2;
    return points?.length ?? 0;
  };

  const timing = getSlideMotionTiming(durationInFrames, getAnimCount());

  const titleProgress = spring({
    frame: frame - timing.titleStart,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const subtitleProgress = spring({
    frame: frame - timing.subtitleStart,
    fps,
    config: { damping: 15, stiffness: 90 },
  });

  const pointProgresses = (points || []).map((_, i) =>
    spring({
      frame: frame - timing.pointsStart - i * timing.pointStagger,
      fps,
      config: { damping: 12, stiffness: 100 },
    })
  );

  const exitOpacity = interpolate(
    frame,
    [timing.exitStart, timing.exitEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ===== 渲染不同类型内容 =====
  const renderContent = () => {
    switch (type) {
      // ===== 统计数据 =====
      case 'stats': {
        const stats = (data?.stats as Array<{ value: number; suffix?: string; label: string; color?: string }>) || [];
        return (
          <div style={{ display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap", width: "100%" }}>
            {stats.map((stat, i) => {
              const statProgress = spring({
                frame: frame - 10 - i * 8,
                fps,
                config: { damping: 12, stiffness: 100 },
              });
              const statColor = stat.color || [colors.blob1, colors.blob2, colors.blob3, colors.blob4, colors.blob5][i % 5];
              return (
                <div
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(20px)",
                    borderRadius: 28,
                    border: "1px solid rgba(255,255,255,0.15)",
                    padding: "36px 44px",
                    textAlign: "center",
                    opacity: statProgress,
                    transform: `translateY(${interpolate(statProgress, [0, 1], [40, 0])}px) scale(${interpolate(statProgress, [0, 1], [0.9, 1])})`,
                    minWidth: 180,
                  }}
                >
                  <div style={{ fontSize: 68, fontWeight: 800, marginBottom: 8 }}>
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} startFrame={15 + i * 8} color={statColor} />
                  </div>
                  <div style={{ fontSize: 24, color: colors.muted }}>{stat.label}</div>
                </div>
              );
            })}
          </div>
        );
      }

      // ===== 对比 =====
      case 'compare': {
        const compareData = data as { left?: { label: string; value: string; desc?: string }; right?: { label: string; value: string; desc?: string }; vsText?: string };
        const leftProgress = spring({ frame: frame - 12, fps, config: { damping: 12 } });
        const rightProgress = spring({ frame: frame - 24, fps, config: { damping: 12 } });

        return (
          <div style={{ display: "flex", gap: 24, alignItems: "center", justifyContent: "center", width: "100%" }}>
            <div
              style={{
                flex: 1,
                background: "rgba(255,107,157,0.12)",
                backdropFilter: "blur(20px)",
                borderRadius: 28,
                border: "1px solid rgba(255,107,157,0.25)",
                padding: "40px 36px",
                textAlign: "center",
                opacity: leftProgress,
                transform: `translateX(${interpolate(leftProgress, [0, 1], [-50, 0])}px)`,
              }}
            >
              <div style={{ fontSize: 20, color: colors.blob1, marginBottom: 12, fontWeight: 600 }}>
                {compareData?.left?.label || "Before"}
              </div>
              <div style={{ fontSize: 48, fontWeight: 800, color: colors.text, marginBottom: 8 }}>
                {compareData?.left?.value || "-"}
              </div>
              {compareData?.left?.desc && (
                <div style={{ fontSize: 20, color: colors.muted }}>{compareData.left.desc}</div>
              )}
            </div>

            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 24,
                fontWeight: 800,
                color: colors.text,
                flexShrink: 0,
                boxShadow: "0 0 40px rgba(255,255,255,0.1)",
              }}
            >
              {compareData?.vsText || "VS"}
            </div>

            <div
              style={{
                flex: 1,
                background: "rgba(0,212,170,0.12)",
                backdropFilter: "blur(20px)",
                borderRadius: 28,
                border: "1px solid rgba(0,212,170,0.25)",
                padding: "40px 36px",
                textAlign: "center",
                opacity: rightProgress,
                transform: `translateX(${interpolate(rightProgress, [0, 1], [50, 0])}px)`,
              }}
            >
              <div style={{ fontSize: 20, color: colors.blob3, marginBottom: 12, fontWeight: 600 }}>
                {compareData?.right?.label || "After"}
              </div>
              <div style={{ fontSize: 48, fontWeight: 800, color: colors.text, marginBottom: 8 }}>
                {compareData?.right?.value || "+"}
              </div>
              {compareData?.right?.desc && (
                <div style={{ fontSize: 20, color: colors.muted }}>{compareData.right.desc}</div>
              )}
            </div>
          </div>
        );
      }

      // ===== 步骤 =====
      case 'steps': {
        const steps = (data?.steps as Array<{ title: string; description?: string }>) || [];
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 0, width: "100%", maxWidth: 650 }}>
            {steps.map((step, i) => {
              const stepProgress = spring({
                frame: frame - 10 - i * 10,
                fps,
                config: { damping: 12, stiffness: 100 },
              });
              const stepColor = [colors.blob1, colors.blob2, colors.blob3, colors.blob4, colors.blob5][i % 5];
              return (
                <StepCard
                  key={i}
                  title={step.title}
                  description={step.description}
                  index={i}
                  color={stepColor}
                  progress={stepProgress}
                />
              );
            })}
          </div>
        );
      }

      // ===== 图表 =====
      case 'chart': {
        const bars = (data?.bars as Array<{ label: string; value: number; color?: string }>) || [];
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%", maxWidth: 650 }}>
            {bars.map((bar, i) => {
              const barColor = bar.color || [colors.blob1, colors.blob2, colors.blob3, colors.blob4, colors.blob5][i % 5];
              return (
                <ProgressBar
                  key={i}
                  percent={bar.value}
                  label={bar.label}
                  color={barColor}
                  delay={10 + i * 8}
                />
              );
            })}
          </div>
        );
      }

      // ===== 列表 =====
      case 'list': {
        const items = (data?.items as Array<{ icon?: string; text: string; desc?: string }>) || [];
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18, width: "100%", maxWidth: 780 }}>
            {items.map((item, i) => {
              const itemProgress = spring({
                frame: frame - 8 - i * 6,
                fps,
                config: { damping: 12, stiffness: 100 },
              });
              return (
                <div
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(20px)",
                    borderRadius: 24,
                    border: "1px solid rgba(255,255,255,0.12)",
                    padding: "28px 32px",
                    opacity: itemProgress,
                    transform: `translateY(${interpolate(itemProgress, [0, 1], [30, 0])}px) scale(${interpolate(itemProgress, [0, 1], [0.95, 1])})`,
                  }}
                >
                  <div style={{ fontSize: 44, marginBottom: 12 }}>{item.icon || "✓"}</div>
                  <div style={{ fontSize: 26, fontWeight: 600, color: colors.text, marginBottom: 6 }}>{item.text}</div>
                  {item.desc && (
                    <div style={{ fontSize: 20, color: colors.muted }}>{item.desc}</div>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      // ===== 时间线 =====
      case 'timeline': {
        const timeline = (data?.timeline as Array<{ year: string; title: string; description?: string }>) || [];
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 22, width: "100%", maxWidth: 720, position: "relative" }}>
            <div style={{
              position: "absolute",
              left: "50%",
              top: 18,
              bottom: 18,
              width: 2,
              background: "rgba(255,255,255,0.1)",
              transform: "translateX(-50%)",
            }} />
            {timeline.map((item, i) => {
              const tlProgress = spring({
                frame: frame - 10 - i * 12,
                fps,
                config: { damping: 12, stiffness: 100 },
              });
              const tlColor = [colors.blob1, colors.blob2, colors.blob3, colors.blob4, colors.blob5][i % 5];
              return (
                <TimelineItem
                  key={i}
                  year={item.year}
                  title={item.title}
                  description={item.description}
                  color={tlColor}
                  progress={tlProgress}
                  isLeft={i % 2 === 0}
                />
              );
            })}
          </div>
        );
      }

      // ===== 高亮 =====
      case 'highlight': {
        const items = (data?.items as string[]) || [];
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", width: "100%", maxWidth: 780 }}>
            {items.map((item, i) => {
              const hlProgress = spring({
                frame: frame - 6 - i * 5,
                fps,
                config: { damping: 12, stiffness: 100 },
              });
              const hlColor = [colors.blob1, colors.blob2, colors.blob3, colors.blob4, colors.blob5][i % 5];
              return (
                <div
                  key={i}
                  style={{
                    background: `${hlColor}20`,
                    backdropFilter: "blur(20px)",
                    borderRadius: 22,
                    border: `2px solid ${hlColor}50`,
                    padding: "18px 36px",
                    opacity: hlProgress,
                    transform: `scale(${interpolate(hlProgress, [0, 1], [0.8, 1])})`,
                    boxShadow: `0 8px 32px ${hlColor}30`,
                  }}
                >
                  <span style={{ fontSize: 26, fontWeight: 600, color: colors.text }}>{item}</span>
                </div>
              );
            })}
          </div>
        );
      }

      // ===== 引用 =====
      case 'quote': {
        const quoteData = data as { quote?: string; author?: string };
        const quoteProgress = spring({ frame: frame - 10, fps, config: { damping: 15 } });
        return (
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(30px)",
              borderRadius: 32,
              border: "1px solid rgba(255,255,255,0.12)",
              padding: "50px 60px",
              maxWidth: 780,
              opacity: quoteProgress,
              transform: `translateY(${interpolate(quoteProgress, [0, 1], [40, 0])}px)`,
            }}
          >
            <div style={{ fontSize: 80, color: colors.blob2, marginBottom: 8, lineHeight: 1 }}>"</div>
            <p style={{ fontSize: 34, fontStyle: "italic", color: colors.text, margin: 0, lineHeight: 1.5 }}>
              {quoteData?.quote || title}
            </p>
            <p style={{ fontSize: 22, color: colors.muted, marginTop: 28, textAlign: "right" }}>
              — {quoteData?.author || subtitle}
            </p>
          </div>
        );
      }

      // ===== Hero =====
      case 'hero': {
        const heroData = data as { badge?: string; cta?: string };
        const pulseScale = 1 + Math.sin(frame * 0.08) * 0.02;
        return (
          <div style={{ textAlign: "center" }}>
            {heroData?.badge && (
              <div
                style={{
                  display: "inline-block",
                  padding: "12px 28px",
                  background: `${colors.blob2}20`,
                  backdropFilter: "blur(15px)",
                  borderRadius: 22,
                  border: `1px solid ${colors.blob2}40`,
                  fontSize: 20,
                  fontWeight: 600,
                  color: colors.blob2,
                  marginBottom: 24,
                  opacity: titleProgress,
                }}
              >
                {heroData.badge}
              </div>
            )}
            <h1
              style={{
                fontSize: 80,
                fontWeight: 800,
                color: colors.text,
                margin: 0,
                marginBottom: 24,
                textShadow: `0 0 80px ${colors.blob2}30`,
                letterSpacing: "-2px",
                lineHeight: 1.1,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: 32, color: colors.muted, margin: 0, marginBottom: 48 }}>
                {subtitle}
              </p>
            )}
            {heroData?.cta && (
              <div
                style={{
                  display: "inline-block",
                  padding: "22px 52px",
                  background: `linear-gradient(135deg, ${colors.blob1}, ${colors.blob2})`,
                  borderRadius: 36,
                  fontSize: 28,
                  fontWeight: 700,
                  color: "white",
                  transform: `scale(${pulseScale})`,
                  boxShadow: `0 15px 50px ${colors.blob1}50`,
                }}
              >
                {heroData.cta}
              </div>
            )}
          </div>
        );
      }

      // ===== Default =====
      default:
        return points && points.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              width: "100%",
            }}
          >
            {points.map((point, i) => {
              const progress = pointProgresses[i] || 0;
              const pointColor = [colors.blob1, colors.blob2, colors.blob3, colors.blob4, colors.blob5, colors.blob6][i % 6];

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    padding: "22px 28px",
                    background: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(20px)",
                    borderRadius: 22,
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    transform: `translateX(${interpolate(progress, [0, 1], [-40, 0])}px)`,
                    opacity: progress,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${pointColor}, ${pointColor}cc)`,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: 20,
                      fontWeight: 600,
                      color: "white",
                      boxShadow: `0 6px 20px ${pointColor}50`,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 28, color: colors.text, fontWeight: 500 }}>
                    {point}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null;
    }
  };

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
      <GradientBackground frame={frame} />

      {/* 大型液态 Blobs */}
      <MegaBlob frame={frame} x={-250} y={-150} size={800} color={colors.blob1} speedX={0.005} speedY={0.004} phase={0} />
      <MegaBlob frame={frame} x={550} y={-50} size={900} color={colors.blob2} speedX={0.004} speedY={0.005} phase={2} />
      <MegaBlob frame={frame} x={50} y={500} size={850} color={colors.blob3} speedX={0.006} speedY={0.004} phase={4} />
      <MegaBlob frame={frame} x={500} y={850} size={750} color={colors.blob4} speedX={0.0045} speedY={0.0055} phase={1} />
      <MegaBlob frame={frame} x={-200} y={1100} size={700} color={colors.blob5} speedX={0.0055} speedY={0.0045} phase={3} />
      <MegaBlob frame={frame} x={600} y={1200} size={800} color={colors.blob6} speedX={0.004} speedY={0.006} phase={5} />

      {/* 浮动光球 */}
      <FloatingOrb frame={frame} x={60} y={250} size={32} color={colors.blob2} delay={8} />
      <FloatingOrb frame={frame} x={920} y={350} size={26} color={colors.blob3} delay={12} />
      <FloatingOrb frame={frame} x={80} y={720} size={28} color={colors.blob1} delay={10} />
      <FloatingOrb frame={frame} x={900} y={820} size={30} color={colors.blob5} delay={15} />
      <FloatingOrb frame={frame} x={50} y={1280} size={24} color={colors.blob4} delay={18} />
      <FloatingOrb frame={frame} x={930} y={1380} size={28} color={colors.blob6} delay={6} />

      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "50px",
          zIndex: 10,
        }}
      >
        {/* 页码 */}
        <div
          style={{
            position: "absolute",
            top: 50,
            right: 50,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            borderRadius: 22,
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 600, color: colors.text }}>{index + 1}</span>
          <span style={{ fontSize: 20, color: colors.muted }}>/</span>
          <span style={{ fontSize: 20, color: colors.muted }}>{totalSlides}</span>
        </div>

        {/* 主卡片 */}
        <GlassCard frame={frame} delay={8}>
          <div
            style={{
              width: 880,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* 标题区域 */}
            {type !== 'hero' && type !== 'quote' && (
              <>
                <h1
                  style={{
                    fontSize: type === 'stats' || type === 'compare' ? 52 : 60,
                    fontWeight: 800,
                    color: colors.text,
                    margin: 0,
                    marginBottom: 12,
                    transform: `translateY(${interpolate(titleProgress, [0, 1], [30, 0])}px)`,
                    opacity: titleProgress,
                    letterSpacing: "-1px",
                    textAlign: "center",
                    textShadow: `0 0 60px ${colors.blob2}30`,
                  }}
                >
                  {title}
                </h1>

                <div
                  style={{
                    width: interpolate(titleProgress, [0, 1], [0, 100]),
                    height: 5,
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${colors.blob1}, ${colors.blob2}, ${colors.blob3}, ${colors.blob4})`,
                    marginBottom: subtitle ? 14 : 30,
                    boxShadow: `0 4px 20px ${colors.blob2}50`,
                  }}
                />

                {subtitle && (
                  <p
                    style={{
                      fontSize: 26,
                      color: colors.muted,
                      margin: 0,
                      marginBottom: 36,
                      transform: `translateY(${interpolate(subtitleProgress, [0, 1], [20, 0])}px)`,
                      opacity: subtitleProgress,
                      fontWeight: 400,
                    }}
                  >
                    {subtitle}
                  </p>
                )}
              </>
            )}

            {/* 内容区域 */}
            {renderContent()}
          </div>
        </GlassCard>

        {/* 底部指示器 */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            display: "flex",
            gap: 10,
          }}
        >
          {[...Array(totalSlides)].map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 36 : 12,
                height: 12,
                borderRadius: 6,
                background: i === index
                  ? `linear-gradient(90deg, ${colors.blob1}, ${colors.blob2})`
                  : "rgba(255,255,255,0.15)",
                boxShadow: i === index ? `0 4px 16px ${colors.blob1}50` : "none",
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};