import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";
import { getSafeAreaInsets } from "../layouts/safeArea";

// 流体渐变配色
const colors = {
  bg: "#0f0f1a",
  card: "rgba(255,255,255,0.08)",
  cardBorder: "rgba(255,255,255,0.12)",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.6)",
  accent1: "#6366f1",
  accent2: "#a855f7",
  accent3: "#22d3ee",
  accent4: "#f43f5e",
  gradient1: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  gradient2: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  gradient3: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  gradient4: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
};

// 卡片基础样式
const cardStyle = {
  background: colors.card,
  borderRadius: 20,
  border: `1px solid ${colors.cardBorder}`,
  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  overflow: "hidden" as const,
  backdropFilter: "blur(10px)",
};

// ===== Bento 卡片组件 =====
const BentoCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  delay?: number;
  gradient?: string;
}> = ({ children, style, delay = 0, gradient }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const scale = interpolate(progress, [0, 1], [0.9, 1]);

  return (
    <div
      style={{
        ...cardStyle,
        transform: `scale(${scale})`,
        opacity: progress,
        background: gradient || colors.card,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ===== 数字动画 =====
const AnimatedNumber: React.FC<{ value: number; suffix?: string; startFrame: number }> = ({
  value,
  suffix = "",
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20, stiffness: 50 },
  });

  const displayValue = Math.round(interpolate(progress, [0, 1], [0, value]));

  return (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
};

// ===== 打字机效果 =====
const Typewriter: React.FC<{ text: string; startFrame: number }> = ({ text, startFrame }) => {
  const frame = useCurrentFrame();
  const chars = text.split("");
  const visibleChars = Math.floor(
    interpolate(frame, [startFrame, startFrame + text.length * 2], [0, text.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <span>
      {chars.slice(0, visibleChars).join("")}
      {visibleChars < text.length && (
        <span style={{ opacity: frame % 10 < 5 ? 1 : 0, color: colors.accent1 }}>|</span>
      )}
    </span>
  );
};

// ===== 进度环 =====
const ProgressRing: React.FC<{ percent: number; color: string; label: string; delay: number }> = ({
  percent,
  color,
  label,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15 },
  });

  const currentPercent = interpolate(progress, [0, 1], [0, percent]);
  const circumference = 2 * Math.PI * 50;
  const strokeDashoffset = circumference - (currentPercent / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 130, height: 130 }}>
        <svg width={130} height={130} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={65} cy={65} r={50} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={10} />
          <circle
            cx={65}
            cy={65}
            r={50}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 700,
            color: colors.text,
          }}
        >
          {Math.round(currentPercent)}%
        </div>
      </div>
      <span style={{ fontSize: 24, color: colors.muted }}>{label}</span>
    </div>
  );
};

// ===== 主组件 =====
export const RichSlide: React.FC<{
  type: string;
  data?: Record<string, unknown>;
  index: number;
  totalSlides: number;
  durationInFrames: number;
}> = ({ type, data = {}, index, totalSlides, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const safeArea = getSafeAreaInsets(width, height);
  const itemCount = Array.isArray(data.items)
    ? (data.items as unknown[]).length
    : Array.isArray(data.stats)
      ? (data.stats as unknown[]).length
      : Array.isArray(data.bars)
        ? (data.bars as unknown[]).length
        : 0;
  const timing = getSlideMotionTiming(durationInFrames, itemCount);

  // 淡出
  const exitOpacity = interpolate(
    frame,
    [timing.exitStart, timing.exitEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 渲染不同类型
  const renderContent = () => {
    switch (type) {
      // ===== 标题页 =====
      case "title":
        return (
          <div style={{ textAlign: "center", maxWidth: 900 }}>
            <h1
              style={{
                fontSize: 84,
                fontWeight: 900,
                color: colors.text,
                margin: 0,
                marginBottom: 32,
                textShadow: `0 0 60px ${colors.accent1}40`,
                letterSpacing: "-2px",
                lineHeight: 1.06,
              }}
            >
              {String(data.title ?? "")}
            </h1>
            {typeof data.subtitle === 'string' && (
              <p style={{ fontSize: 42, color: colors.muted, margin: 0 }}>
                <Typewriter text={data.subtitle} startFrame={20} />
              </p>
            )}
          </div>
        );

      // ===== 数据统计页 =====
      case "stats":
        return (
          <div style={{ width: "92%" }}>
            <h2 style={{ fontSize: 48, fontWeight: 800, color: colors.text, margin: "0 0 42px 0", textAlign: "left" }}>
              {String(data.title ?? "")}
            </h2>
            <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
              {Array.isArray(data.stats) && (data.stats as Array<{ value: number; suffix?: string; label: string }>).map((stat, i) => {
                const gradients = [colors.gradient1, colors.gradient2, colors.gradient3, colors.gradient4];
                return (
                  <BentoCard
                    key={i}
                    delay={10 + i * 8}
                    gradient={gradients[i % gradients.length]}
                    style={{ width: 300, alignItems: "center", padding: 40 }}
                  >
                    <div style={{ fontSize: 80, fontWeight: 900, color: "#fff", marginBottom: 12 }}>
                      <AnimatedNumber value={stat.value} suffix={stat.suffix} startFrame={15 + i * 8} />
                    </div>
                    <div style={{ fontSize: 28, color: "rgba(255,255,255,0.9)" }}>{stat.label}</div>
                  </BentoCard>
                );
              })}
            </div>
          </div>
        );

      // ===== 高亮展示页 =====
      case "highlight":
        return (
          <div style={{ width: "92%" }}>
            <h2 style={{ fontSize: 48, fontWeight: 800, color: colors.text, margin: "0 0 32px 0", textAlign: "left" }}>
              {String(data.title ?? "")}
            </h2>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
              {Array.isArray(data.items) && (data.items as string[]).map((item, i) => {
                const accents = [colors.accent1, colors.accent2, colors.accent3, colors.accent4];
                return (
                  <BentoCard
                    key={i}
                    delay={10 + i * 8}
                    style={{
                      background: `${accents[i % accents.length]}20`,
                      border: `2px solid ${accents[i % accents.length]}`,
                      padding: "28px 44px",
                    }}
                  >
                    <span style={{ fontSize: 36, fontWeight: 700, color: "#fff" }}>{item}</span>
                  </BentoCard>
                );
              })}
            </div>
          </div>
        );

      // ===== 进度环页 =====
      case "progress":
        return (
          <div style={{ width: "92%" }}>
            <h2 style={{ fontSize: 48, fontWeight: 800, color: colors.text, margin: "0 0 32px 0", textAlign: "left" }}>
              {String(data.title ?? "")}
            </h2>
            <div style={{ display: "flex", gap: 30, justifyContent: "center", flexWrap: "wrap" }}>
              {Array.isArray(data.bars) && (data.bars as Array<{ percent: number; label: string }>).map((bar, i) => {
                const accentColors = [colors.accent1, colors.accent2, colors.accent3, colors.accent4];
                return (
                  <BentoCard key={i} delay={10 + i * 10} style={{ alignItems: "center", padding: 32 }}>
                    <ProgressRing
                      percent={bar.percent}
                      color={accentColors[i % accentColors.length]}
                      label={bar.label}
                      delay={15 + i * 10}
                    />
                  </BentoCard>
                );
              })}
            </div>
          </div>
        );

      // ===== 引用页 =====
      case "quote":
        return (
          <BentoCard
            delay={5}
            gradient={colors.gradient2}
            style={{ maxWidth: 850, padding: 60 }}
          >
            <div style={{ fontSize: 80, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>"</div>
            <p style={{ fontSize: 40, fontStyle: "italic", color: "#fff", margin: 0, lineHeight: 1.6 }}>
              {String(data.quote ?? "")}
            </p>
            <p style={{ fontSize: 26, color: "rgba(255,255,255,0.8)", marginTop: 30, textAlign: "right" }}>
              — {String(data.author ?? "")}
            </p>
          </BentoCard>
        );

      // ===== 对比页 =====
      case "compare":
        return (
          <div style={{ width: "92%" }}>
            <h2 style={{ fontSize: 48, fontWeight: 800, color: colors.text, margin: "0 0 40px 0", textAlign: "left" }}>
              {String(data.title ?? "")}
            </h2>
            <div style={{ display: "flex", gap: 30, alignItems: "center", justifyContent: "center" }}>
              <BentoCard
                delay={5}
                style={{ background: "rgba(244,63,94,0.15)", border: "2px solid rgba(244,63,94,0.4)", width: 350, alignItems: "center", padding: 40 }}
              >
                <div style={{ fontSize: 24, color: colors.accent4, marginBottom: 12 }}>{String((data.left as { label: string })?.label ?? "")}</div>
                <div style={{ fontSize: 42, fontWeight: 800, color: "#fff" }}>{String((data.left as { value: string })?.value ?? "")}</div>
              </BentoCard>

              <div style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 800,
                color: "#fff",
              }}>
                VS
              </div>

              <BentoCard
                delay={15}
                style={{ background: "rgba(34,211,238,0.15)", border: "2px solid rgba(34,211,238,0.4)", width: 350, alignItems: "center", padding: 40 }}
              >
                <div style={{ fontSize: 24, color: colors.accent3, marginBottom: 12 }}>{String((data.right as { label: string })?.label ?? "")}</div>
                <div style={{ fontSize: 42, fontWeight: 800, color: "#fff" }}>{String((data.right as { value: string })?.value ?? "")}</div>
              </BentoCard>
            </div>
          </div>
        );

      // ===== 列表页 =====
      case "list":
        return (
          <div style={{ width: "92%" }}>
            <h2 style={{ fontSize: 48, fontWeight: 800, color: colors.text, margin: "0 0 32px 0", textAlign: "left" }}>
              {String(data.title ?? "")}
            </h2>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
              {Array.isArray(data.items) && (data.items as Array<{ icon?: string; text: string; desc?: string }>).map((item, i) => {
                const gradients = [colors.gradient1, colors.gradient2, colors.gradient3, colors.gradient4];
                return (
                  <BentoCard
                    key={i}
                    delay={10 + i * 10}
                    gradient={gradients[i % gradients.length]}
                    style={{ width: 320, alignItems: "center", padding: 36 }}
                  >
                    <div style={{ fontSize: 56, marginBottom: 16 }}>{item.icon || "✓"}</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: "#fff" }}>{item.text}</div>
                    {item.desc && (
                      <div style={{ fontSize: 22, color: "rgba(255,255,255,0.8)", marginTop: 10 }}>{item.desc}</div>
                    )}
                  </BentoCard>
                );
              })}
            </div>
          </div>
        );

      // ===== 步骤页 =====
      case "steps": {
        const steps = (data.steps as Array<{ title: string; description?: string }>) || [];
        return (
          <div style={{ width: "92%" }}>
            <h2 style={{ fontSize: 48, fontWeight: 800, color: colors.text, margin: "0 0 32px 0", textAlign: "left" }}>
              {String(data.title ?? "")}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {steps.map((step, i) => {
                const accentColors = [colors.accent1, colors.accent2, colors.accent3, colors.accent4];
                const accent = accentColors[i % accentColors.length];
                const gradients = [colors.gradient1, colors.gradient2, colors.gradient3, colors.gradient4];
                const itemProgress = (() => {
                  const frame = i;
                  void frame;
                  return 1;
                })();
                void itemProgress;
                return (
                  <BentoCard
                    key={i}
                    delay={10 + i * 10}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 28,
                      padding: "28px 36px",
                      background: `linear-gradient(135deg, ${accent}18 0%, rgba(255,255,255,0.04) 100%)`,
                      border: `1px solid ${accent}50`,
                    }}
                  >
                    <div
                      style={{
                        minWidth: 72,
                        height: 72,
                        borderRadius: "50%",
                        background: gradients[i % gradients.length],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 30,
                        fontWeight: 900,
                        color: "#fff",
                        flexShrink: 0,
                        boxShadow: `0 4px 20px ${accent}50`,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 30, fontWeight: 800, color: colors.text, lineHeight: 1.2 }}>
                        {step.title}
                      </div>
                      {step.description && (
                        <div style={{ fontSize: 22, color: colors.muted, marginTop: 8, lineHeight: 1.5 }}>
                          {step.description}
                        </div>
                      )}
                    </div>
                  </BentoCard>
                );
              })}
            </div>
          </div>
        );
      }

      // ===== 时间线页 =====
      case "timeline": {
        const timeline = (data.timeline as Array<{ year: string; title: string; description?: string }>) || [];
        return (
          <div style={{ width: "92%" }}>
            <h2 style={{ fontSize: 48, fontWeight: 800, color: colors.text, margin: "0 0 32px 0", textAlign: "left" }}>
              {String(data.title ?? "")}
            </h2>
            <div style={{ position: "relative", paddingLeft: 32 }}>
              {/* 连接线 */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 16,
                  bottom: 16,
                  width: 2,
                  background: `linear-gradient(180deg, ${colors.accent1} 0%, ${colors.accent2} 50%, ${colors.accent3} 100%)`,
                  borderRadius: 2,
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {timeline.map((item, i) => {
                  const accentColors = [colors.accent1, colors.accent2, colors.accent3, colors.accent4];
                  const accent = accentColors[i % accentColors.length];
                  return (
                    <div key={i} style={{ position: "relative" }}>
                      {/* 时间点 */}
                      <div
                        style={{
                          position: "absolute",
                          left: -39,
                          top: 20,
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: accent,
                          boxShadow: `0 0 12px ${accent}`,
                        }}
                      />
                      <BentoCard
                        delay={10 + i * 10}
                        style={{
                          padding: "22px 28px",
                          background: `linear-gradient(135deg, ${accent}12 0%, rgba(255,255,255,0.04) 100%)`,
                          border: `1px solid ${accent}40`,
                        }}
                      >
                        <div
                          style={{
                            display: "inline-flex",
                            padding: "6px 18px",
                            borderRadius: 999,
                            background: `${accent}25`,
                            border: `1px solid ${accent}50`,
                            fontSize: 20,
                            fontWeight: 800,
                            color: accent,
                            marginBottom: 12,
                          }}
                        >
                          {item.year}
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: colors.text, lineHeight: 1.2 }}>
                          {item.title}
                        </div>
                        {item.description && (
                          <div style={{ fontSize: 21, color: colors.muted, marginTop: 8, lineHeight: 1.5 }}>
                            {item.description}
                          </div>
                        )}
                      </BentoCard>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      // ===== Hero 页 =====
      case "hero": {
        return (
          <div style={{ textAlign: "center", maxWidth: 900 }}>
            {typeof data.badge === 'string' && (
              <div
                style={{
                  display: "inline-flex",
                  padding: "10px 28px",
                  borderRadius: 999,
                  background: `linear-gradient(135deg, ${colors.accent1}40, ${colors.accent2}40)`,
                  border: `1px solid ${colors.accent1}60`,
                  fontSize: 24,
                  fontWeight: 700,
                  color: colors.accent3,
                  marginBottom: 36,
                  letterSpacing: "0.06em",
                  boxShadow: `0 0 30px ${colors.accent1}30`,
                }}
              >
                {data.badge}
              </div>
            )}
            <h1
              style={{
                fontSize: 90,
                fontWeight: 900,
                color: colors.text,
                margin: 0,
                marginBottom: 32,
                background: `linear-gradient(135deg, ${colors.text} 0%, ${colors.accent3} 60%, ${colors.accent2} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-2px",
                lineHeight: 1.04,
              }}
            >
              {String(data.title ?? "")}
            </h1>
            {typeof data.subtitle === 'string' && (
              <p style={{ fontSize: 40, color: colors.muted, margin: 0, lineHeight: 1.5 }}>
                {data.subtitle}
              </p>
            )}
          </div>
        );
      }

      // ===== CTA 页 =====
      case "cta": {
        const pulseScale = 1 + Math.sin(frame * 0.08) * 0.02;

        return (
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: colors.text,
                margin: 0,
                marginBottom: 20,
                textShadow: `0 0 60px ${colors.accent1}40`,
              }}
            >
              {String(data.title ?? "")}
            </h1>
            {typeof data.subtitle === 'string' && (
              <p style={{ fontSize: 34, color: colors.muted, marginBottom: 50 }}>{data.subtitle}</p>
            )}
            {typeof data.button === 'string' && (
              <div
                style={{
                  display: "inline-block",
                  padding: "28px 60px",
                  background: colors.gradient1,
                  borderRadius: 60,
                  fontSize: 36,
                  fontWeight: 800,
                  color: "#fff",
                  transform: `scale(${pulseScale})`,
                  boxShadow: `0 10px 50px ${colors.accent1}50`,
                }}
              >
                {String(data.button)}
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, 'PingFang SC', sans-serif",
        overflow: "hidden",
        padding: `${safeArea.top}px ${safeArea.right}px ${safeArea.bottom}px ${safeArea.left}px`,
      }}
    >
      {/* 流体渐变背景 */}
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          top: "20%",
          left: "20%",
          background: `radial-gradient(ellipse, ${colors.accent1}25 0%, transparent 60%)`,
          filter: "blur(80px)",
          transform: `translate(${Math.sin(frame * 0.02) * 40}px, ${Math.cos(frame * 0.015) * 30}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          top: "30%",
          right: "10%",
          background: `radial-gradient(ellipse, ${colors.accent2}20 0%, transparent 60%)`,
          filter: "blur(80px)",
          transform: `translate(${Math.cos(frame * 0.018) * 35}px, ${Math.sin(frame * 0.02) * 40}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          bottom: "10%",
          left: "30%",
          background: `radial-gradient(ellipse, ${colors.accent3}15 0%, transparent 60%)`,
          filter: "blur(70px)",
          transform: `translate(${Math.sin(frame * 0.015) * 50}px, ${Math.cos(frame * 0.02) * 35}px)`,
        }}
      />

      {/* 页码指示器 */}
      <div
        style={{
          position: "absolute",
          bottom: Math.max(28, safeArea.bottom - 18),
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
        }}
      >
        {[...Array(totalSlides)].map((_, i) => (
          <div
            key={i}
            style={{
              width: i === index ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === index ? "#fff" : "rgba(255,255,255,0.3)",
              boxShadow: i === index ? "0 0 15px rgba(255,255,255,0.5)" : "none",
            }}
          />
        ))}
      </div>

      <div
        style={{
          opacity: exitOpacity,
          width: "100%",
          maxWidth: 920,
          minHeight: Math.min(1280, Math.max(1080, height - safeArea.top - safeArea.bottom)),
          padding: "34px 34px 40px",
          borderRadius: 32,
          background: "linear-gradient(180deg, rgba(10, 10, 20, 0.48), rgba(18, 20, 38, 0.32))",
          border: `1px solid ${colors.cardBorder}`,
          boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            marginBottom: 26,
          }}
        >
          <div style={{ fontSize: 20, color: "rgba(255,255,255,0.64)", fontWeight: 600 }}>
            {String(index + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>{renderContent()}</div>
      </div>
    </AbsoluteFill>
  );
};
