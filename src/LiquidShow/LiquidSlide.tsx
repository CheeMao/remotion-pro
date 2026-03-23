import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";

// macOS 26 液态玻璃配色
const colors = {
  bg: "#e8e8ed",
  blob1: "#ff6b9d",
  blob2: "#c44dff",
  blob3: "#00d4aa",
  blob4: "#ff9f43",
  blob5: "#5f9eff",
  blob6: "#a855f7",
  text: "#1d1d1f",
  textSecondary: "#424245",
  muted: "#6e6e73",
};

// ===== 超大液态 Blob =====
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
  const moveX = Math.sin(frame * speedX + phase) * 100 + Math.cos(frame * speedX * 0.7) * 50;
  const moveY = Math.cos(frame * speedY + phase) * 80 + Math.sin(frame * speedY * 0.6) * 40;
  const morph1 = 30 + Math.sin(frame * 0.015 + phase) * 25;
  const morph2 = 70 + Math.cos(frame * 0.012 + phase) * 30;
  const morph3 = 50 + Math.sin(frame * 0.018 + phase + 1) * 28;
  const morph4 = 60 + Math.cos(frame * 0.014 + phase + 2) * 22;
  const scale = 1 + Math.sin(frame * 0.008 + phase) * 0.12;

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
        filter: "blur(100px)",
        opacity: 0.85,
        transform: `scale(${scale})`,
      }}
    />
  );
};

// ===== 渐变背景 =====
const GradientBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const shift = Math.sin(frame * 0.005) * 20;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(ellipse 80% 60% at ${50 + shift}% 30%, rgba(255,107,157,0.15) 0%, transparent 60%),
          radial-gradient(ellipse 70% 80% at ${30 + shift * 0.5}% 70%, rgba(196,77,255,0.12) 0%, transparent 55%),
          radial-gradient(ellipse 90% 70% at ${70 - shift * 0.3}% 50%, rgba(0,212,170,0.1) 0%, transparent 50%),
          linear-gradient(180deg, #f0f0f5 0%, #e8e8ed 50%, #e0e0e5 100%)
        `,
      }}
    />
  );
};

// ===== 主毛玻璃卡片 =====
const LiquidGlassCard: React.FC<{
  children: React.ReactNode;
  frame: number;
  delay: number;
  width?: number;
  padding?: string;
}> = ({ children, frame, delay, width = 920, padding = "70px 55px" }) => {
  const progress = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 20, stiffness: 100 },
  });

  const breathe = 1 + Math.sin(frame * 0.025) * 0.008;

  return (
    <div
      style={{
        position: "relative",
        opacity: progress,
        transform: `scale(${progress * breathe}) translateY(${(1 - progress) * 20}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -2,
          borderRadius: 46,
          background: "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.2))",
          filter: "blur(20px)",
          opacity: 0.5,
        }}
      />

      <div
        style={{
          position: "relative",
          width,
          padding,
          background: `
            linear-gradient(135deg,
              rgba(255,255,255,0.75) 0%,
              rgba(255,255,255,0.65) 50%,
              rgba(255,255,255,0.7) 100%
            )
          `,
          backdropFilter: "blur(80px) saturate(200%)",
          WebkitBackdropFilter: "blur(80px) saturate(200%)",
          borderRadius: 44,
          border: "1px solid rgba(255,255,255,0.8)",
          boxShadow: `
            0 25px 50px -12px rgba(0,0,0,0.08),
            0 12px 24px -8px rgba(0,0,0,0.04),
            0 0 0 1px rgba(255,255,255,0.5),
            inset 0 1px 2px rgba(255,255,255,1),
            inset 0 -1px 1px rgba(0,0,0,0.03)
          `,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ===== 浮动装饰球 =====
const FloatingSphere: React.FC<{
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

  const floatY = Math.sin(frame * 0.025 + delay) * 12;
  const floatX = Math.cos(frame * 0.018 + delay * 0.7) * 8;

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
          radial-gradient(circle at 35% 35%,
            rgba(255,255,255,0.9) 0%,
            ${color} 40%,
            ${color}cc 100%
          )
        `,
        boxShadow: `
          0 8px 32px ${color}50,
          inset 0 -6px 12px rgba(0,0,0,0.15),
          inset 0 6px 12px rgba(255,255,255,0.9)
        `,
        opacity: progress * 0.9,
        transform: `scale(${progress})`,
      }}
    />
  );
};

// ===== 玻璃胶囊标签 =====
const GlassPill: React.FC<{
  text: string;
  frame: number;
  delay: number;
  color?: string;
}> = ({ text, frame, delay, color }) => {
  const progress = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 12 },
  });

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "10px 20px",
        background: color ? `${color}25` : "rgba(255,255,255,0.6)",
        backdropFilter: "blur(20px)",
        borderRadius: 24,
        border: `1px solid ${color ? `${color}40` : "rgba(255,255,255,0.8)"}`,
        boxShadow: `0 4px 12px rgba(0,0,0,0.04), inset 0 1px 1px rgba(255,255,255,0.9)`,
        fontSize: 18,
        fontWeight: 600,
        color: color || colors.textSecondary,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 10}px)`,
      }}
    >
      {text}
    </div>
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
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ fontSize: 22, color: colors.text, width: 100, flexShrink: 0, fontWeight: 500 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 14, background: "rgba(0,0,0,0.06)", borderRadius: 7, overflow: "hidden" }}>
        <div
          style={{
            width: `${width}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            borderRadius: 7,
            boxShadow: `0 2px 12px ${color}50`,
          }}
        />
      </div>
      <span style={{ fontSize: 20, color, fontWeight: 600, width: 50, textAlign: "right" }}>
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
        gap: 16,
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [25, 0])}px)`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 20,
            fontWeight: 700,
            color: "white",
            boxShadow: `0 6px 20px ${color}50`,
          }}
        >
          {index + 1}
        </div>
        <div style={{ width: 2, flex: 1, background: "rgba(0,0,0,0.08)", marginTop: 6 }} />
      </div>
      <div style={{ flex: 1, paddingBottom: 24 }}>
        <h3 style={{ fontSize: 26, fontWeight: 600, color: colors.text, margin: "0 0 4px 0" }}>
          {title}
        </h3>
        {description && (
          <p style={{ fontSize: 20, color: colors.muted, margin: 0 }}>
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
        gap: 16,
        flexDirection: isLeft ? "row" : "row-reverse",
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [isLeft ? -30 : 30, 0])}px)`,
      }}
    >
      <div style={{ flex: 1, textAlign: isLeft ? "right" : "left" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color, marginBottom: 2 }}>{year}</div>
        <div style={{ fontSize: 24, fontWeight: 600, color: colors.text, marginBottom: 2 }}>{title}</div>
        {description && (
          <div style={{ fontSize: 18, color: colors.muted }}>{description}</div>
        )}
      </div>
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 16px ${color}`,
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
    config: { damping: 18, stiffness: 100 },
  });

  const subtitleProgress = spring({
    frame: frame - timing.subtitleStart,
    fps,
    config: { damping: 18, stiffness: 90 },
  });

  const pointProgresses = (points || []).map((_, i) =>
    spring({
      frame: frame - timing.pointsStart - i * timing.pointStagger,
      fps,
      config: { damping: 14, stiffness: 100 },
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
          <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", width: "100%" }}>
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
                    background: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(15px)",
                    borderRadius: 24,
                    border: "1px solid rgba(255,255,255,0.8)",
                    padding: "32px 40px",
                    textAlign: "center",
                    opacity: statProgress,
                    transform: `translateY(${interpolate(statProgress, [0, 1], [30, 0])}px) scale(${interpolate(statProgress, [0, 1], [0.9, 1])})`,
                    minWidth: 170,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ fontSize: 60, fontWeight: 700, marginBottom: 6 }}>
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} startFrame={15 + i * 8} color={statColor} />
                  </div>
                  <div style={{ fontSize: 22, color: colors.muted }}>{stat.label}</div>
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
        const rightProgress = spring({ frame: frame - 22, fps, config: { damping: 12 } });

        return (
          <div style={{ display: "flex", gap: 20, alignItems: "center", justifyContent: "center", width: "100%" }}>
            <div
              style={{
                flex: 1,
                background: "rgba(255,107,157,0.1)",
                backdropFilter: "blur(15px)",
                borderRadius: 24,
                border: "1px solid rgba(255,107,157,0.25)",
                padding: "36px 32px",
                textAlign: "center",
                opacity: leftProgress,
                transform: `translateX(${interpolate(leftProgress, [0, 1], [-40, 0])}px)`,
              }}
            >
              <div style={{ fontSize: 18, color: colors.blob1, marginBottom: 10, fontWeight: 600 }}>
                {compareData?.left?.label || "Before"}
              </div>
              <div style={{ fontSize: 42, fontWeight: 700, color: colors.text, marginBottom: 6 }}>
                {compareData?.left?.value || "-"}
              </div>
              {compareData?.left?.desc && (
                <div style={{ fontSize: 18, color: colors.muted }}>{compareData.left.desc}</div>
              )}
            </div>

            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 20,
                fontWeight: 700,
                color: colors.text,
                flexShrink: 0,
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
            >
              {compareData?.vsText || "VS"}
            </div>

            <div
              style={{
                flex: 1,
                background: "rgba(0,212,170,0.1)",
                backdropFilter: "blur(15px)",
                borderRadius: 24,
                border: "1px solid rgba(0,212,170,0.25)",
                padding: "36px 32px",
                textAlign: "center",
                opacity: rightProgress,
                transform: `translateX(${interpolate(rightProgress, [0, 1], [40, 0])}px)`,
              }}
            >
              <div style={{ fontSize: 18, color: colors.blob3, marginBottom: 10, fontWeight: 600 }}>
                {compareData?.right?.label || "After"}
              </div>
              <div style={{ fontSize: 42, fontWeight: 700, color: colors.text, marginBottom: 6 }}>
                {compareData?.right?.value || "+"}
              </div>
              {compareData?.right?.desc && (
                <div style={{ fontSize: 18, color: colors.muted }}>{compareData.right.desc}</div>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 650 }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, width: "100%", maxWidth: 750 }}>
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
                    background: "rgba(255,255,255,0.55)",
                    backdropFilter: "blur(15px)",
                    borderRadius: 22,
                    border: "1px solid rgba(255,255,255,0.8)",
                    padding: "24px 28px",
                    opacity: itemProgress,
                    transform: `translateY(${interpolate(itemProgress, [0, 1], [25, 0])}px) scale(${interpolate(itemProgress, [0, 1], [0.95, 1])})`,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{item.icon || "✓"}</div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: colors.text, marginBottom: 4 }}>{item.text}</div>
                  {item.desc && (
                    <div style={{ fontSize: 18, color: colors.muted }}>{item.desc}</div>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", maxWidth: 700, position: "relative" }}>
            <div style={{
              position: "absolute",
              left: "50%",
              top: 16,
              bottom: 16,
              width: 2,
              background: "rgba(0,0,0,0.08)",
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", width: "100%", maxWidth: 750 }}>
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
                    background: `${hlColor}15`,
                    backdropFilter: "blur(15px)",
                    borderRadius: 18,
                    border: `2px solid ${hlColor}50`,
                    padding: "16px 30px",
                    opacity: hlProgress,
                    transform: `scale(${interpolate(hlProgress, [0, 1], [0.8, 1])})`,
                    boxShadow: `0 4px 20px ${hlColor}25`,
                  }}
                >
                  <span style={{ fontSize: 24, fontWeight: 600, color: colors.text }}>{item}</span>
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
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(20px)",
              borderRadius: 28,
              border: "1px solid rgba(255,255,255,0.8)",
              padding: "44px 50px",
              maxWidth: 750,
              opacity: quoteProgress,
              transform: `translateY(${interpolate(quoteProgress, [0, 1], [30, 0])}px)`,
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ fontSize: 70, color: colors.blob2, marginBottom: 8, lineHeight: 1 }}>"</div>
            <p style={{ fontSize: 32, fontStyle: "italic", color: colors.text, margin: 0, lineHeight: 1.5 }}>
              {quoteData?.quote || title}
            </p>
            <p style={{ fontSize: 20, color: colors.muted, marginTop: 20, textAlign: "right" }}>
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
                  padding: "10px 24px",
                  background: `${colors.blob2}15`,
                  backdropFilter: "blur(10px)",
                  borderRadius: 18,
                  border: `1px solid ${colors.blob2}40`,
                  fontSize: 18,
                  fontWeight: 600,
                  color: colors.blob2,
                  marginBottom: 20,
                  opacity: titleProgress,
                }}
              >
                {heroData.badge}
              </div>
            )}
            <h1
              style={{
                fontSize: 70,
                fontWeight: 700,
                color: colors.text,
                margin: 0,
                marginBottom: 20,
                letterSpacing: "-2px",
                lineHeight: 1.1,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: 30, color: colors.muted, margin: 0, marginBottom: 40 }}>
                {subtitle}
              </p>
            )}
            {heroData?.cta && (
              <div
                style={{
                  display: "inline-block",
                  padding: "20px 48px",
                  background: `linear-gradient(135deg, ${colors.blob1}, ${colors.blob2})`,
                  borderRadius: 32,
                  fontSize: 26,
                  fontWeight: 600,
                  color: "white",
                  transform: `scale(${pulseScale})`,
                  boxShadow: `0 10px 40px ${colors.blob1}40`,
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
              gap: 14,
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
                    gap: 18,
                    padding: "20px 24px",
                    background: "rgba(255,255,255,0.5)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 22,
                    border: "1px solid rgba(255,255,255,0.7)",
                    boxShadow: `0 2px 8px rgba(0,0,0,0.03), inset 0 1px 1px rgba(255,255,255,0.8)`,
                    transform: `translateX(${interpolate(progress, [0, 1], [-30, 0])}px)`,
                    opacity: progress,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${pointColor}, ${pointColor}cc)`,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: 18,
                      fontWeight: 600,
                      color: "white",
                      boxShadow: `0 4px 14px ${pointColor}40`,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 26, color: colors.text, fontWeight: 500 }}>
                    {point}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null;
    }
  };

  // 计算卡片尺寸
  const getCardSize = () => {
    if (type === 'hero') return { width: 900, padding: "60px 50px" };
    if (type === 'stats') return { width: 920, padding: "55px 45px" };
    if (type === 'compare') return { width: 880, padding: "50px 40px" };
    if (type === 'quote') return { width: 800, padding: "50px 45px" };
    return { width: 880, padding: "60px 50px" };
  };

  const cardSize = getCardSize();

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

      <MegaBlob frame={frame} x={-200} y={-100} size={700} color={colors.blob1} speedX={0.006} speedY={0.005} phase={0} />
      <MegaBlob frame={frame} x={600} y={0} size={800} color={colors.blob2} speedX={0.005} speedY={0.006} phase={2} />
      <MegaBlob frame={frame} x={100} y={600} size={750} color={colors.blob3} speedX={0.007} speedY={0.005} phase={4} />
      <MegaBlob frame={frame} x={550} y={900} size={650} color={colors.blob4} speedX={0.0055} speedY={0.0065} phase={1} />
      <MegaBlob frame={frame} x={-150} y={1200} size={600} color={colors.blob5} speedX={0.0065} speedY={0.0055} phase={3} />
      <MegaBlob frame={frame} x={650} y={1300} size={700} color={colors.blob6} speedX={0.005} speedY={0.007} phase={5} />

      <FloatingSphere frame={frame} x={80} y={280} size={28} color={colors.blob2} delay={8} />
      <FloatingSphere frame={frame} x={920} y={380} size={22} color={colors.blob3} delay={12} />
      <FloatingSphere frame={frame} x={100} y={750} size={24} color={colors.blob1} delay={10} />
      <FloatingSphere frame={frame} x={890} y={850} size={26} color={colors.blob5} delay={15} />
      <FloatingSphere frame={frame} x={70} y={1300} size={20} color={colors.blob4} delay={18} />
      <FloatingSphere frame={frame} x={940} y={1400} size={24} color={colors.blob6} delay={6} />

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
        {/* 顶部信息栏 */}
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 50,
            right: 50,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(20px)",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.75)",
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 600, color: colors.text }}>{index + 1}</span>
            <span style={{ fontSize: 18, color: colors.muted }}>/</span>
            <span style={{ fontSize: 18, color: colors.muted }}>{totalSlides}</span>
          </div>
        </div>

        {/* 主玻璃卡片 */}
        <LiquidGlassCard frame={frame} delay={8} width={cardSize.width} padding={cardSize.padding}>
          <div
            style={{
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
                    fontSize: type === 'stats' || type === 'compare' ? 48 : 56,
                    fontWeight: 700,
                    color: colors.text,
                    margin: 0,
                    marginBottom: 10,
                    transform: `translateY(${interpolate(titleProgress, [0, 1], [20, 0])}px)`,
                    opacity: titleProgress,
                    letterSpacing: "-1px",
                    textAlign: "center",
                  }}
                >
                  {title}
                </h1>

                <div
                  style={{
                    width: interpolate(titleProgress, [0, 1], [0, 80]),
                    height: 5,
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${colors.blob1}, ${colors.blob2}, ${colors.blob3}, ${colors.blob4})`,
                    marginBottom: subtitle ? 12 : 28,
                    boxShadow: `0 2px 10px ${colors.blob2}40`,
                  }}
                />

                {subtitle && (
                  <p
                    style={{
                      fontSize: 26,
                      color: colors.muted,
                      margin: 0,
                      marginBottom: 32,
                      transform: `translateY(${interpolate(subtitleProgress, [0, 1], [14, 0])}px)`,
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
        </LiquidGlassCard>

        {/* 底部指示器 */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            display: "flex",
            gap: 8,
          }}
        >
          {[...Array(totalSlides)].map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 32 : 10,
                height: 10,
                borderRadius: 5,
                background: i === index
                  ? `linear-gradient(90deg, ${colors.blob1}, ${colors.blob2})`
                  : "rgba(0,0,0,0.1)",
                boxShadow: i === index ? `0 2px 8px ${colors.blob1}40` : "none",
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};