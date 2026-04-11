import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";
import { getSafeAreaInsets } from "../layouts/safeArea";

// 配色方案
const colors = {
  primary: "#8b5cf6",
  secondary: "#ec4899",
  accent: "#06b6d4",
  warm: "#f97316",
  success: "#22c55e",
};

// ===== 动画数字组件 =====
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

// ===== 进度条组件 =====
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
      <span style={{ fontSize: 26, color: "rgba(255,255,255,0.9)", width: 120, flexShrink: 0 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 16, background: "rgba(255,255,255,0.1)", borderRadius: 8, overflow: "hidden" }}>
        <div
          style={{
            width: `${width}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            borderRadius: 8,
            boxShadow: `0 0 20px ${color}60`,
          }}
        />
      </div>
      <span style={{ fontSize: 24, color, fontWeight: 600, width: 60, textAlign: "right" }}>
        {Math.round(width)}%
      </span>
    </div>
  );
};

// ===== 步骤组件 =====
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
        gap: 20,
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
      }}
    >
      {/* 连接线 */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 22,
            fontWeight: 700,
            color: "white",
            boxShadow: `0 8px 24px ${color}50`,
          }}
        >
          {index + 1}
        </div>
        <div style={{ width: 3, flex: 1, background: "rgba(255,255,255,0.15)", marginTop: 8 }} />
      </div>
      {/* 内容 */}
      <div style={{ flex: 1, paddingBottom: 28 }}>
        <h3 style={{ fontSize: 32, fontWeight: 600, color: "white", margin: "0 0 8px 0" }}>
          {title}
        </h3>
        {description && (
          <p style={{ fontSize: 24, color: "rgba(255,255,255,0.7)", margin: 0 }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

// ===== 时间线组件 =====
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
        gap: 20,
        flexDirection: isLeft ? "row" : "row-reverse",
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [isLeft ? -40 : 40, 0])}px)`,
      }}
    >
      <div style={{ flex: 1, textAlign: isLeft ? "right" : "left" }}>
        <div style={{ fontSize: 24, fontWeight: 700, color, marginBottom: 4 }}>{year}</div>
        <div style={{ fontSize: 28, fontWeight: 600, color: "white", marginBottom: 4 }}>{title}</div>
        {description && (
          <div style={{ fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{description}</div>
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
export const GlassSlide: React.FC<{
  title: string;
  subtitle?: string;
  points?: string[];
  type?: 'default' | 'steps' | 'timeline' | 'chart' | 'highlight' | 'list' | 'compare' | 'stats' | 'quote' | 'hero' | 'cta';
  data?: Record<string, unknown>;
  index: number;
  totalSlides: number;
  durationInFrames: number;
}> = ({ title, subtitle, points, type = 'default', data, index, totalSlides, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const safeArea = getSafeAreaInsets(width, height);

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

  const bgRotate = frame * 0.3;

  const titleProgress = spring({
    frame: frame - timing.titleStart,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const titleY = interpolate(titleProgress, [0, 1], [60, 0]);
  const titleBlur = interpolate(titleProgress, [0, 1], [10, 0]);

  const subtitleProgress = spring({
    frame: frame - timing.subtitleStart,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const subtitleY = interpolate(subtitleProgress, [0, 1], [40, 0]);

  const pointProgresses = (points || []).map((_, i) =>
    spring({
      frame: frame - timing.pointsStart - i * timing.pointStagger,
      fps,
      config: { damping: 10, stiffness: 100 },
    })
  );

  const cardFloat = Math.sin(frame * 0.03) * 8;

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
              const statColor = stat.color || [colors.primary, colors.accent, colors.secondary, colors.warm, colors.success][i % 5];
              return (
                <div
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(15px)",
                    borderRadius: 28,
                    border: "1px solid rgba(255,255,255,0.12)",
                    padding: "36px 48px",
                    textAlign: "center",
                    opacity: statProgress,
                    transform: `translateY(${interpolate(statProgress, [0, 1], [40, 0])}px) scale(${interpolate(statProgress, [0, 1], [0.9, 1])})`,
                    minWidth: 200,
                  }}
                >
                  <div style={{ fontSize: 72, fontWeight: 800, marginBottom: 8 }}>
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} startFrame={15 + i * 8} color={statColor} />
                  </div>
                  <div style={{ fontSize: 26, color: "rgba(255,255,255,0.8)" }}>{stat.label}</div>
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
          <div style={{ display: "flex", gap: 24, alignItems: "center", justifyContent: "center", width: "100%" }}>
            {/* 左侧 */}
            <div
              style={{
                flex: 1,
                background: "rgba(244,63,94,0.12)",
                backdropFilter: "blur(15px)",
                borderRadius: 28,
                border: "1px solid rgba(244,63,94,0.25)",
                padding: "40px 36px",
                textAlign: "center",
                opacity: leftProgress,
                transform: `translateX(${interpolate(leftProgress, [0, 1], [-50, 0])}px)`,
              }}
            >
              <div style={{ fontSize: 22, color: colors.warm, marginBottom: 12, fontWeight: 600 }}>
                {compareData?.left?.label || "Before"}
              </div>
              <div style={{ fontSize: 48, fontWeight: 800, color: "white", marginBottom: 8 }}>
                {compareData?.left?.value || "-"}
              </div>
              {compareData?.left?.desc && (
                <div style={{ fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{compareData.left.desc}</div>
              )}
            </div>

            {/* VS */}
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
                color: "white",
                flexShrink: 0,
                boxShadow: "0 0 30px rgba(255,255,255,0.1)",
              }}
            >
              {compareData?.vsText || "VS"}
            </div>

            {/* 右侧 */}
            <div
              style={{
                flex: 1,
                background: "rgba(34,211,238,0.12)",
                backdropFilter: "blur(15px)",
                borderRadius: 28,
                border: "1px solid rgba(34,211,238,0.25)",
                padding: "40px 36px",
                textAlign: "center",
                opacity: rightProgress,
                transform: `translateX(${interpolate(rightProgress, [0, 1], [50, 0])}px)`,
              }}
            >
              <div style={{ fontSize: 22, color: colors.accent, marginBottom: 12, fontWeight: 600 }}>
                {compareData?.right?.label || "After"}
              </div>
              <div style={{ fontSize: 48, fontWeight: 800, color: "white", marginBottom: 8 }}>
                {compareData?.right?.value || "+"}
              </div>
              {compareData?.right?.desc && (
                <div style={{ fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{compareData.right.desc}</div>
              )}
            </div>
          </div>
        );
      }

      // ===== 步骤 =====
      case 'steps': {
        const steps = (data?.steps as Array<{ title: string; description?: string }>) || [];
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 0, width: "100%", maxWidth: 700 }}>
            {steps.map((step, i) => {
              const stepProgress = spring({
                frame: frame - 10 - i * 10,
                fps,
                config: { damping: 12, stiffness: 100 },
              });
              const stepColor = [colors.primary, colors.accent, colors.secondary, colors.warm, colors.success][i % 5];
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
          <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", maxWidth: 700 }}>
            {bars.map((bar, i) => {
              const barColor = bar.color || [colors.primary, colors.accent, colors.secondary, colors.warm, colors.success][i % 5];
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
        const listColors = [colors.primary, colors.accent, colors.secondary, colors.warm, colors.success];
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 0, width: "100%", maxWidth: 700 }}>
            {items.map((item, i) => {
              const itemProgress = spring({
                frame: frame - 10 - i * 8,
                fps,
                config: { damping: 12, stiffness: 100 },
              });
              const itemColor = listColors[i % listColors.length];
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 20,
                    opacity: itemProgress,
                    transform: `translateX(${interpolate(itemProgress, [0, 1], [-30, 0])}px)`,
                  }}
                >
                  {/* Icon circle + connector line */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${itemColor}, ${itemColor}cc)`,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: 26,
                        boxShadow: `0 8px 24px ${itemColor}50`,
                      }}
                    >
                      {item.icon || "✦"}
                    </div>
                    {i < items.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: "rgba(255,255,255,0.12)", marginTop: 6 }} />
                    )}
                  </div>
                  {/* Text content */}
                  <div style={{ flex: 1, paddingBottom: i < items.length - 1 ? 22 : 0, paddingTop: 6 }}>
                    <div style={{ fontSize: 30, fontWeight: 600, color: "white", marginBottom: 6, lineHeight: 1.2 }}>{item.text}</div>
                    {item.desc && (
                      <div style={{ fontSize: 22, color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>{item.desc}</div>
                    )}
                  </div>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%", maxWidth: 750, position: "relative" }}>
            {/* 中轴线 */}
            <div style={{
              position: "absolute",
              left: "50%",
              top: 20,
              bottom: 20,
              width: 3,
              background: "rgba(255,255,255,0.15)",
              transform: "translateX(-50%)",
            }} />
            {timeline.map((item, i) => {
              const tlProgress = spring({
                frame: frame - 10 - i * 12,
                fps,
                config: { damping: 12, stiffness: 100 },
              });
              const tlColor = [colors.primary, colors.accent, colors.secondary, colors.warm, colors.success][i % 5];
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", width: "100%", maxWidth: 800 }}>
            {items.map((item, i) => {
              const hlProgress = spring({
                frame: frame - 8 - i * 6,
                fps,
                config: { damping: 12, stiffness: 100 },
              });
              const hlColor = [colors.primary, colors.accent, colors.secondary, colors.warm, colors.success][i % 5];
              return (
                <div
                  key={i}
                  style={{
                    background: `${hlColor}20`,
                    backdropFilter: "blur(15px)",
                    borderRadius: 20,
                    border: `2px solid ${hlColor}60`,
                    padding: "20px 36px",
                    opacity: hlProgress,
                    transform: `scale(${interpolate(hlProgress, [0, 1], [0.8, 1])})`,
                    boxShadow: `0 8px 30px ${hlColor}30`,
                  }}
                >
                  <span style={{ fontSize: 28, fontWeight: 600, color: "white" }}>{item}</span>
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
              backdropFilter: "blur(20px)",
              borderRadius: 32,
              border: "1px solid rgba(255,255,255,0.12)",
              padding: "50px 60px",
              maxWidth: 800,
              opacity: quoteProgress,
              transform: `translateY(${interpolate(quoteProgress, [0, 1], [40, 0])}px)`,
            }}
          >
            <div style={{ fontSize: 80, color: colors.primary, marginBottom: 10, lineHeight: 1 }}>"</div>
            <p style={{ fontSize: 36, fontStyle: "italic", color: "white", margin: 0, lineHeight: 1.5 }}>
              {quoteData?.quote || title}
            </p>
            <p style={{ fontSize: 24, color: "rgba(255,255,255,0.7)", marginTop: 24, textAlign: "right" }}>
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
                  background: `${colors.primary}30`,
                  backdropFilter: "blur(10px)",
                  borderRadius: 20,
                  border: `1px solid ${colors.primary}50`,
                  fontSize: 22,
                  fontWeight: 600,
                  color: colors.primary,
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
                fontWeight: 900,
                color: "white",
                margin: 0,
                marginBottom: 24,
                textShadow: `0 0 60px ${colors.primary}40`,
                letterSpacing: "-2px",
                lineHeight: 1.1,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: 36, color: "rgba(255,255,255,0.8)", margin: 0, marginBottom: 48 }}>
                {subtitle}
              </p>
            )}
            {heroData?.cta && (
              <div
                style={{
                  display: "inline-block",
                  padding: "24px 56px",
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  borderRadius: 40,
                  fontSize: 32,
                  fontWeight: 700,
                  color: "white",
                  transform: `scale(${pulseScale})`,
                  boxShadow: `0 15px 50px ${colors.primary}50`,
                }}
              >
                {heroData.cta}
              </div>
            )}
          </div>
        );
      }

      // ===== CTA (行动收束页) =====
      case 'cta': {
        const ctaData = data as { cta?: string; button?: string; items?: string[]; badge?: string };
        const ctaText = ctaData?.cta || ctaData?.button || '点赞收藏';
        const tags = Array.isArray(ctaData?.items) ? ctaData.items : [];
        const pulseScale = 1 + Math.sin(frame * 0.12) * 0.04;
        const titleA = spring({ frame: frame - 8, fps, config: { damping: 14 } });
        const ctaA = spring({ frame: frame - 26, fps, config: { damping: 12, stiffness: 120 } });
        return (
          <div style={{ textAlign: 'center', maxWidth: 820 }}>
            <div
              style={{
                display: 'inline-block',
                padding: '10px 22px',
                borderRadius: 999,
                background: `${colors.accent}25`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${colors.accent}50`,
                fontSize: 20,
                fontWeight: 700,
                color: colors.accent,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: 28,
                opacity: titleA,
              }}
            >
              {ctaData?.badge ?? '↳ FIN'}
            </div>
            <h1
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: 'white',
                margin: 0,
                marginBottom: 22,
                lineHeight: 1.12,
                letterSpacing: '-1.5px',
                opacity: titleA,
                transform: `translateY(${interpolate(titleA, [0, 1], [24, 0])}px)`,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  fontSize: 28,
                  color: 'rgba(255,255,255,0.78)',
                  margin: '0 0 40px',
                  opacity: titleA,
                }}
              >
                {subtitle}
              </p>
            )}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 14,
                padding: '26px 56px',
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                borderRadius: 999,
                fontSize: 32,
                fontWeight: 800,
                color: 'white',
                boxShadow: `0 24px 70px ${colors.primary}60, inset 0 1px 0 rgba(255,255,255,0.4)`,
                transform: `scale(${pulseScale * interpolate(ctaA, [0, 1], [0.85, 1])})`,
                opacity: ctaA,
                letterSpacing: '0.04em',
              }}
            >
              <span style={{ fontSize: 28 }}>→</span>
              {ctaText}
            </div>
            {tags.length > 0 && (
              <div
                style={{
                  marginTop: 32,
                  display: 'flex',
                  gap: 12,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  opacity: ctaA,
                }}
              >
                {tags.slice(0, 4).map((t, i) => {
                  const tagColor = [colors.primary, colors.accent, colors.secondary, colors.warm][i % 4];
                  return (
                    <span
                      key={i}
                      style={{
                        padding: '10px 18px',
                        borderRadius: 999,
                        background: `${tagColor}20`,
                        border: `1px solid ${tagColor}45`,
                        fontSize: 18,
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.86)',
                      }}
                    >
                      #{t}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      // ===== Default (默认列表) =====
      default:
        return points && points.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              width: "100%",
              maxWidth: 700,
            }}
          >
            {points.map((point, i) => {
              const progress = pointProgresses[i] || 0;
              const pointColor = [colors.primary, colors.accent, colors.secondary, colors.warm][i % 4];

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    padding: "22px 28px",
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 18,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transform: `translateX(${interpolate(progress, [0, 1], [-40, 0])}px)`,
                    opacity: progress,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${pointColor}, ${pointColor}cc)`,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "white",
                      boxShadow: `0 6px 18px ${pointColor}40`,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 26, color: "rgba(255, 255, 255, 0.95)", fontWeight: 500 }}>
                    {point}
                  </span>
                </div>
              );
            })}
          </div>
        ) : null;
    }
  };

  const getCardMinHeight = () => {
    if (type === 'hero') return 980;
    if (type === 'compare') return 900;
    if (type === 'quote') return 920;
    return 1180;
  };

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, 'PingFang SC', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 动态渐变背景 */}
      <div
        style={{
          position: "absolute",
          width: 1500,
          height: 1500,
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${bgRotate}deg)`,
          background: `conic-gradient(from 0deg, ${colors.primary}40, ${colors.secondary}40, ${colors.accent}40, ${colors.warm}40, ${colors.primary}40)`,
          filter: "blur(100px)",
          opacity: 0.6,
        }}
      />

      {/* 装饰圆点 */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2 + frame * 0.01;
        const radius = 350;
        const x = Math.cos(angle) * radius + 540;
        const y = Math.sin(angle) * radius + 960;
        const dotColors = [colors.primary, colors.secondary, colors.accent, colors.warm];

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: dotColors[i % 4],
              boxShadow: `0 0 40px ${dotColors[i % 4]}80`,
              opacity: 0.38,
            }}
          />
        );
      })}

      {/* 主内容区 */}
      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: `${safeArea.top}px ${safeArea.right}px ${safeArea.bottom}px ${safeArea.left}px`,
          zIndex: 10,
        }}
      >
        {/* 毛玻璃主卡片 */}
        <div
          style={{
            width: "90%",
            maxWidth: 920,
            minHeight: getCardMinHeight(),
            padding: "34px 34px 40px",
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
            borderRadius: 34,
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: `
              0 25px 50px rgba(0, 0, 0, 0.3),
              inset 0 1px 1px rgba(255, 255, 255, 0.1)
            `,
            transform: `translateY(${cardFloat}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "flex-start",
          }}
        >
          {/* 页码标签 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                color: "white",
              }}
            >
              <span style={{ fontSize: 34, fontWeight: 800 }}>{String(index + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: 18, color: "rgba(255,255,255,0.55)" }}>
                / {String(totalSlides).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* 标题区域 (非 hero 类型) */}
          {type !== 'hero' && type !== 'quote' && (
            <>
              <h1
                style={{
                  fontSize: type === 'stats' || type === 'compare' ? 52 : 58,
                  fontWeight: 800,
                  color: "#ffffff",
                  textAlign: "left",
                  margin: 0,
                  marginBottom: 12,
                  transform: `translateY(${titleY}px)`,
                  opacity: titleProgress,
                  filter: `blur(${titleBlur}px)`,
                  textShadow: "0 4px 30px rgba(0,0,0,0.3)",
                  letterSpacing: "-1px",
                  lineHeight: 1.08,
                  maxWidth: 760,
                }}
              >
                {title}
              </h1>

              <div
                style={{
                  width: interpolate(titleProgress, [0, 1], [0, 180]),
                  height: 4,
                  background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
                  borderRadius: 2,
                  marginBottom: subtitle ? 16 : 32,
                }}
              />

              {subtitle && (
                <p
                  style={{
                    fontSize: 28,
                    color: "rgba(255, 255, 255, 0.78)",
                    textAlign: "left",
                    margin: 0,
                    marginBottom: 36,
                    transform: `translateY(${subtitleY}px)`,
                    opacity: subtitleProgress,
                    fontWeight: 400,
                    maxWidth: 760,
                    lineHeight: 1.45,
                  }}
                >
                  {subtitle}
                </p>
              )}
            </>
          )}

          {/* 内容区域 */}
          <div style={{ flex: 1, display: "flex", alignItems: type === 'timeline' ? "flex-start" : "stretch", justifyContent: "center", width: "100%", overflow: "visible", paddingTop: type === 'quote' ? 24 : 0 }}>
            {renderContent()}
          </div>
        </div>

        {/* 底部进度条 */}
        <div
          style={{
            marginTop: 36,
            display: "flex",
            gap: 10,
          }}
        >
          {[...Array(totalSlides)].map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 36 : 10,
                height: 10,
                borderRadius: 5,
                background:
                  i === index
                    ? `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`
                    : "rgba(255, 255, 255, 0.3)",
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
