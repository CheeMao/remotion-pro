import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";
import { getSafeAreaInsets } from "../layouts/safeArea";

// 使用系统等宽/科技风字体，避免从 Google CDN 加载
const fontFamily = "'Courier New', 'Consolas', monospace";

// 科技感配色
const colors = {
  bg: "#050510",
  primary: "#00f0ff",     // 青色霓虹
  secondary: "#00ff88",   // 绿色
  accent: "#ff00aa",      // 粉紫
  warning: "#ffaa00",     // 橙黄
  text: "#ffffff",
  muted: "rgba(255,255,255,0.5)",
};

// ===== 扫描线效果 =====
const ScanLines: React.FC<{ frame: number }> = ({ frame }) => {
  const y = (frame * 8) % 1920;

  return (
    <>
      {/* 主扫描线 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: y,
          width: "100%",
          height: 2,
          background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
          boxShadow: `0 0 20px ${colors.primary}, 0 0 40px ${colors.primary}`,
          opacity: 0.42,
        }}
      />
      {/* 次扫描线 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: (y + 400) % 1920,
          width: "100%",
          height: 1,
          background: `linear-gradient(90deg, transparent, ${colors.secondary}, transparent)`,
          opacity: 0.2,
        }}
      />
    </>
  );
};

// ===== 数据流粒子 =====
const DataParticles: React.FC<{ frame: number }> = ({ frame }) => {
  const particles = [];
  for (let i = 0; i < 20; i++) {
    const x = (i * 60 + frame * 2) % 1200;
    const y = (i * 100 + frame * 3) % 2000;
    const size = 2 + (i % 3);
    const color = i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.secondary : colors.accent;

    particles.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size * 4,
          background: color,
          borderRadius: 2,
          opacity: 0.28,
          boxShadow: `0 0 10px ${color}`,
        }}
      />
    );
  }
  return <>{particles}</>;
};

// ===== 电路线条 =====
const CircuitLines: React.FC<{ frame: number }> = ({ frame }) => {
  const paths = [
    { x1: 0, y1: 200, x2: 300, y2: 200, delay: 0 },
    { x1: 300, y1: 200, x2: 300, y2: 400, delay: 10 },
    { x1: 300, y1: 400, x2: 600, y2: 400, delay: 20 },
    { x1: 780, y1: 100, x2: 780, y2: 500, delay: 5 },
    { x1: 780, y1: 500, x2: 1080, y2: 500, delay: 15 },
  ];

  return (
    <svg
      style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.16 }}
    >
      {paths.map((p, i) => {
        const progress = Math.min(1, Math.max(0, (frame - p.delay * 3) / 30));
        const currentX2 = p.x1 + (p.x2 - p.x1) * progress;
        const currentY2 = p.y1 + (p.y2 - p.y1) * progress;

        return (
          <line
            key={i}
            x1={p.x1}
            y1={p.y1}
            x2={currentX2}
            y2={currentY2}
            stroke={colors.primary}
            strokeWidth={2}
            style={{
              filter: `drop-shadow(0 0 5px ${colors.primary})`,
            }}
          />
        );
      })}
    </svg>
  );
};

// ===== 全息框 =====
const HoloFrame: React.FC<{
  children: React.ReactNode;
  delay: number;
  frame: number;
  fps: number;
}> = ({ children, delay, frame, fps }) => {
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const glitchOffset = frame % 30 < 3 ? Math.sin(frame * 0.5) * 3 : 0;

  return (
    <div
      style={{
        position: "relative",
        transform: `translateX(${glitchOffset}px) scale(${interpolate(progress, [0, 1], [0.8, 1])})`,
        opacity: progress,
      }}
    >
      {/* 角落装饰 */}
      <div style={{
        position: "absolute",
        top: -10,
        left: -10,
        width: 40,
        height: 40,
        borderTop: `3px solid ${colors.primary}`,
        borderLeft: `3px solid ${colors.primary}`,
        boxShadow: `0 0 15px ${colors.primary}80`,
      }} />
      <div style={{
        position: "absolute",
        top: -10,
        right: -10,
        width: 40,
        height: 40,
        borderTop: `3px solid ${colors.primary}`,
        borderRight: `3px solid ${colors.primary}`,
        boxShadow: `0 0 15px ${colors.primary}80`,
      }} />
      <div style={{
        position: "absolute",
        bottom: -10,
        left: -10,
        width: 40,
        height: 40,
        borderBottom: `3px solid ${colors.primary}`,
        borderLeft: `3px solid ${colors.primary}`,
        boxShadow: `0 0 15px ${colors.primary}80`,
      }} />
      <div style={{
        position: "absolute",
        bottom: -10,
        right: -10,
        width: 40,
        height: 40,
        borderBottom: `3px solid ${colors.primary}`,
        borderRight: `3px solid ${colors.primary}`,
        boxShadow: `0 0 15px ${colors.primary}80`,
      }} />

      {/* 内容区 */}
      <div
        style={{
          padding: 50,
          background: `linear-gradient(135deg, rgba(0,240,255,0.1), rgba(0,255,136,0.05))`,
          border: `1px solid ${colors.primary}40`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ===== 数字计数器 =====
const CyberCounter: React.FC<{
  value: number;
  suffix?: string;
  label: string;
  color: string;
  delay: number;
  frame: number;
  fps: number;
}> = ({ value, suffix = "", label, color, delay, frame, fps }) => {
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12 },
  });

  const displayValue = Math.round(interpolate(progress, [0, 1], [0, value]));
  const glitch = frame % 20 < 2;

  return (
    <div
      style={{
        textAlign: "center",
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
      }}
    >
      <div
        style={{
          fontSize: 76,
          fontWeight: 900,
          color: glitch ? colors.accent : color,
          textShadow: `0 0 30px ${color}, 0 0 60px ${color}50`,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "2px",
        }}
      >
        {displayValue}{suffix}
      </div>
      <div
        style={{
          fontSize: 26,
          color: colors.muted,
          marginTop: 8,
          textTransform: "uppercase",
          letterSpacing: "4px",
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ===== 终端文字 =====
const TerminalText: React.FC<{
  text: string;
  delay: number;
  frame: number;
}> = ({ text, delay, frame }) => {
  const visibleChars = Math.floor(
    interpolate(frame, [delay, delay + text.length * 1.5], [0, text.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <div
      style={{
        fontFamily: "monospace",
        fontSize: 30,
        color: colors.secondary,
        textShadow: `0 0 10px ${colors.secondary}`,
      }}
    >
      <span style={{ color: colors.primary }}>&gt; </span>
      {text.slice(0, visibleChars)}
      <span style={{
        opacity: frame % 10 < 5 ? 1 : 0,
        color: colors.primary,
      }}>_</span>
    </div>
  );
};

// ===== 进度条 =====
const CyberProgress: React.FC<{
  label: string;
  percent: number;
  color: string;
  delay: number;
  frame: number;
  fps: number;
}> = ({ label, percent, color, delay, frame, fps }) => {
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15 },
  });

  const width = interpolate(progress, [0, 1], [0, percent]);

  return (
    <div style={{ width: "100%", marginBottom: 24 }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 8,
        fontSize: 24,
      }}>
        <span style={{ color: colors.text }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{Math.round(width)}%</span>
      </div>
      <div style={{
        height: 8,
        background: "rgba(255,255,255,0.1)",
        borderRadius: 4,
        overflow: "hidden",
      }}>
        <div
          style={{
            width: `${width}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color}, ${color}80)`,
            borderRadius: 4,
            boxShadow: `0 0 20px ${color}`,
          }}
        />
      </div>
    </div>
  );
};

// ===== 主组件 =====
export const TechSlide: React.FC<{
  type: string;
  data?: Record<string, unknown>;
  index: number;
  totalSlides: number;
  durationInFrames: number;
}> = ({ type, data = {}, index, totalSlides, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
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

  // 页码
  const PageNum = () => (
    <div
      style={{
        position: "absolute",
        top: safeArea.headerTop,
        right: safeArea.headerSide,
        fontFamily: "monospace",
        fontSize: 16,
        color: "rgba(255,255,255,0.28)",
      }}
    >
      [{String(index + 1).padStart(2, "0")}/{String(totalSlides).padStart(2, "0")}]
    </div>
  );

  // 渲染内容
  const renderContent = () => {
    switch (type) {
      // ===== 标题页 =====
      case "title": {
        const titleGlitch = frame % 40 < 3;
        return (
          <div style={{ textAlign: "center" }}>
            {/* 主标题 */}
            <h1
              style={{
                fontSize: 82,
                fontWeight: 900,
                color: titleGlitch ? colors.accent : colors.text,
                margin: 0,
                textShadow: titleGlitch
                  ? `3px 0 ${colors.primary}, -3px 0 ${colors.accent}`
                  : `0 0 40px ${colors.primary}60`,
                letterSpacing: "2px",
                lineHeight: 1.05,
                transform: titleGlitch ? `translateX(${Math.sin(frame)}px)` : "none",
              }}
            >
              {String(data.title ?? "")}
            </h1>

            {typeof data.subtitle === 'string' && (
              <p
                style={{
                  fontSize: 30,
                  color: colors.muted,
                  marginTop: 24,
                  letterSpacing: "2px",
                }}
              >
                {data.subtitle}
              </p>
            )}

          </div>
        );
      }

      // ===== 数据页 =====
      case "stats":
        return (
          <div style={{ width: "90%" }}>
            <TerminalText text={String(data.title ?? "").toUpperCase()} delay={0} frame={frame} />

            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: 60,
              }}
            >
              {Array.isArray(data.stats) && (data.stats as Array<{ value: number; suffix?: string; label: string }>).map((stat, i) => {
                const colorSet = [colors.primary, colors.secondary, colors.accent, colors.warning];
                return (
                  <CyberCounter
                    key={i}
                    value={stat.value}
                    suffix={stat.suffix}
                    label={stat.label}
                    color={colorSet[i % colorSet.length]}
                    delay={15 + i * 10}
                    frame={frame}
                    fps={fps}
                  />
                );
              })}
            </div>
          </div>
        );

      // ===== 列表页 =====
      case "list":
        return (
          <HoloFrame delay={5} frame={frame} fps={fps}>
            <div style={{ width: 800 }}>
              <div style={{
                borderBottom: `1px solid ${colors.primary}40`,
                paddingBottom: 20,
                marginBottom: 30,
              }}>
                <TerminalText text={String(data.title ?? "").toUpperCase()} delay={0} frame={frame} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {Array.isArray(data.items) && (data.items as Array<{ icon?: string; text: string; desc?: string }>).map((item, i) => {
                  const itemProgress = spring({
                    frame: frame - 20 - i * 10,
                    fps,
                    config: { damping: 12 },
                  });

                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                        opacity: itemProgress,
                        transform: `translateX(${interpolate(itemProgress, [0, 1], [-30, 0])}px)`,
                      }}
                    >
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          border: `2px solid ${colors.primary}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 30,
                          color: colors.primary,
                          textShadow: `0 0 10px ${colors.primary}`,
                        }}
                      >
                        {item.icon || String(i + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <div style={{ fontSize: 30, fontWeight: 700, color: colors.text }}>
                          {item.text}
                        </div>
                        {item.desc && (
                          <div style={{ fontSize: 24, color: colors.muted, marginTop: 4 }}>
                            {item.desc}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </HoloFrame>
        );

      // ===== 步骤页 (steps) =====
      case "steps": {
        const steps = (data.steps as Array<{ title: string; description?: string }>) || [];
        return (
          <div style={{ width: 880 }}>
            <TerminalText text={String(data.title ?? "").toUpperCase()} delay={0} frame={frame} />
            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 18 }}>
              {steps.map((step, i) => {
                const stepProgress = spring({
                  frame: frame - 18 - i * 10,
                  fps,
                  config: { damping: 14 },
                });
                const colorSet = [colors.primary, colors.secondary, colors.accent, colors.warning];
                const accent = colorSet[i % colorSet.length];
                return (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "100px 1fr",
                      gap: 22,
                      alignItems: "center",
                      padding: "18px 22px",
                      border: `1px solid ${accent}55`,
                      background: `linear-gradient(90deg, ${accent}10 0%, transparent 80%)`,
                      opacity: stepProgress,
                      transform: `translateX(${interpolate(stepProgress, [0, 1], [-40, 0])}px)`,
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        background: accent,
                        boxShadow: `0 0 12px ${accent}`,
                      }}
                    />
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 42,
                        fontWeight: 900,
                        color: accent,
                        textShadow: `0 0 14px ${accent}90`,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {`STEP_${String(i + 1).padStart(2, "0")}`.slice(5)}
                    </div>
                    <div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: colors.text }}>
                        {step.title}
                      </div>
                      {step.description && (
                        <div style={{ fontSize: 19, color: colors.muted, marginTop: 4 }}>
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
      }

      // ===== 时间线页 (timeline) =====
      case "timeline": {
        const timeline = (data.timeline as Array<{ year: string; title: string; description?: string }>) || [];
        return (
          <div style={{ width: 900 }}>
            <TerminalText text={String(data.title ?? "").toUpperCase()} delay={0} frame={frame} />
            <div style={{ marginTop: 50, position: "relative", paddingLeft: 50 }}>
              <div
                style={{
                  position: "absolute",
                  left: 24,
                  top: 16,
                  bottom: 16,
                  width: 2,
                  background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                  boxShadow: `0 0 12px ${colors.primary}80`,
                  transform: `scaleY(${spring({ frame: frame - 12, fps, config: { damping: 18 } })})`,
                  transformOrigin: "top",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {timeline.map((item, i) => {
                  const itemProgress = spring({
                    frame: frame - 22 - i * 12,
                    fps,
                    config: { damping: 14 },
                  });
                  const colorSet = [colors.primary, colors.secondary, colors.accent, colors.warning];
                  const accent = colorSet[i % colorSet.length];
                  return (
                    <div
                      key={i}
                      style={{
                        position: "relative",
                        opacity: itemProgress,
                        transform: `translateX(${interpolate(itemProgress, [0, 1], [-20, 0])}px)`,
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: -34,
                          top: 14,
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: accent,
                          boxShadow: `0 0 14px ${accent}, 0 0 0 4px ${accent}30`,
                        }}
                      />
                      <div
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 22,
                          color: accent,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          fontWeight: 800,
                        }}
                      >
                        {`> ${item.year}`}
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: colors.text, marginTop: 2 }}>
                        {item.title}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: 19, color: colors.muted, marginTop: 4 }}>
                          {item.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      // ===== 关键词页 (highlight) =====
      case "highlight": {
        const items = ((data.items as unknown[]) || []).map((it) =>
          typeof it === "string" ? it : (it as { text?: string }).text || ""
        );
        return (
          <div style={{ width: 900 }}>
            <TerminalText text={String(data.title ?? "").toUpperCase()} delay={0} frame={frame} />
            <div
              style={{
                marginTop: 50,
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                justifyContent: "center",
              }}
            >
              {items.map((it, i) => {
                const tagProgress = spring({
                  frame: frame - 20 - i * 8,
                  fps,
                  config: { damping: 12 },
                });
                const colorSet = [colors.primary, colors.secondary, colors.accent, colors.warning];
                const accent = colorSet[i % colorSet.length];
                return (
                  <div
                    key={i}
                    style={{
                      padding: "20px 30px",
                      border: `1px solid ${accent}`,
                      background: `${accent}12`,
                      boxShadow: `0 0 24px ${accent}30, inset 0 0 14px ${accent}10`,
                      fontSize: 30,
                      fontWeight: 800,
                      color: colors.text,
                      letterSpacing: "0.04em",
                      opacity: tagProgress,
                      transform: `scale(${interpolate(tagProgress, [0, 1], [0.86, 1])})`,
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        color: accent,
                        marginRight: 12,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 22,
                      }}
                    >
                      [{String(i + 1).padStart(2, "0")}]
                    </span>
                    {it}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      // ===== 进度页 =====
      case "progress":
        return (
          <div style={{ width: 700 }}>
            <TerminalText text={String(data.title ?? "").toUpperCase()} delay={0} frame={frame} />

            <div style={{ marginTop: 50 }}>
              {Array.isArray(data.bars) && (data.bars as Array<{ label: string; percent: number }>).map((bar, i) => {
                const colorSet = [colors.primary, colors.secondary, colors.accent, colors.warning];
                return (
                  <CyberProgress
                    key={i}
                    label={bar.label}
                    percent={bar.percent}
                    color={colorSet[i % colorSet.length]}
                    delay={15 + i * 10}
                    frame={frame}
                    fps={fps}
                  />
                );
              })}
            </div>
          </div>
        );

      // ===== 对比页 =====
      case "compare":
        return (
          <div style={{ width: "90%" }}>
            <TerminalText text={String(data.title ?? "").toUpperCase()} delay={0} frame={frame} />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 40,
                marginTop: 50,
              }}
            >
              {/* 左边 */}
              <div
                style={{
                  padding: 40,
                  border: `2px solid ${colors.accent}`,
                  background: `${colors.accent}10`,
                  opacity: spring({ frame: frame - 15, fps, config: { damping: 12 } }),
                }}
              >
                <div style={{ fontSize: 24, color: colors.accent, marginBottom: 10 }}>
                  // {String((data.left as { label: string })?.label ?? "")}
                </div>
                <div style={{ fontSize: 48, fontWeight: 900, color: colors.text }}>
                  {String((data.left as { value: string })?.value ?? "")}
                </div>
              </div>

              {/* VS */}
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 900,
                  color: colors.primary,
                  textShadow: `0 0 20px ${colors.primary}`,
                }}
              >
                VS
              </div>

              {/* 右边 */}
              <div
                style={{
                  padding: 40,
                  border: `2px solid ${colors.secondary}`,
                  background: `${colors.secondary}10`,
                  opacity: spring({ frame: frame - 25, fps, config: { damping: 12 } }),
                }}
              >
                <div style={{ fontSize: 24, color: colors.secondary, marginBottom: 10 }}>
                  // {String((data.right as { label: string })?.label ?? "")}
                </div>
                <div style={{ fontSize: 48, fontWeight: 900, color: colors.text }}>
                  {String((data.right as { value: string })?.value ?? "")}
                </div>
              </div>
            </div>
          </div>
        );

      // ===== 引用页 =====
      case "quote":
        return (
          <HoloFrame delay={5} frame={frame} fps={fps}>
            <div style={{ maxWidth: 800 }}>
              <p style={{
                fontSize: 34,
                fontStyle: "italic",
                color: colors.text,
                margin: 0,
                lineHeight: 1.6,
              }}>
                "{String(data.quote ?? "")}"
              </p>
              <div style={{
                marginTop: 30,
                fontSize: 26,
                color: colors.secondary,
                textAlign: "right",
              }}>
                — {String(data.author ?? "")}
              </div>
            </div>
          </HoloFrame>
        );

      // ===== Hero 页 =====
      case "hero": {
        const titleGlitch = frame % 40 < 3;
        const items = Array.isArray(data.items)
          ? (data.items as string[])
          : [];
        return (
          <div style={{ textAlign: "center", width: "90%" }}>
            {typeof data.badge === 'string' && (
              <div
                style={{
                  display: "inline-flex",
                  padding: "10px 28px",
                  border: `1px solid ${colors.primary}`,
                  background: `${colors.primary}18`,
                  boxShadow: `0 0 20px ${colors.primary}40, inset 0 0 14px ${colors.primary}10`,
                  fontSize: 22,
                  fontWeight: 700,
                  color: colors.primary,
                  textShadow: `0 0 10px ${colors.primary}`,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                  marginBottom: 36,
                }}
              >
                {data.badge}
              </div>
            )}
            <h1
              style={{
                fontSize: 84,
                fontWeight: 900,
                color: titleGlitch ? colors.accent : colors.text,
                margin: 0,
                textShadow: titleGlitch
                  ? `3px 0 ${colors.primary}, -3px 0 ${colors.accent}`
                  : `0 0 40px ${colors.primary}60`,
                letterSpacing: "2px",
                lineHeight: 1.05,
                transform: titleGlitch ? `translateX(${Math.sin(frame)}px)` : "none",
              }}
            >
              {String(data.title ?? "")}
            </h1>
            {typeof data.subtitle === 'string' && (
              <p
                style={{
                  fontSize: 30,
                  color: colors.muted,
                  marginTop: 24,
                  letterSpacing: "2px",
                }}
              >
                {data.subtitle}
              </p>
            )}
            {items.length > 0 && (
              <div
                style={{
                  marginTop: 48,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  justifyContent: "center",
                }}
              >
                {items.map((item, i) => {
                  const chipColors = [colors.primary, colors.secondary, colors.accent, colors.warning];
                  const chipColor = chipColors[i % chipColors.length];
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "12px 26px",
                        border: `1px solid ${chipColor}`,
                        background: `${chipColor}15`,
                        boxShadow: `0 0 14px ${chipColor}30`,
                        fontSize: 24,
                        fontWeight: 700,
                        color: chipColor,
                        textShadow: `0 0 8px ${chipColor}`,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {item}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      // ===== CTA 页 =====
      case "cta": {
        const pulse = 1 + Math.sin(frame * 0.1) * 0.03;

        return (
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: 76,
                fontWeight: 900,
                color: colors.text,
                margin: "40px 0 20px",
                textShadow: `0 0 40px ${colors.primary}60`,
                letterSpacing: "3px",
              }}
            >
              {String(data.title ?? "")}
            </h1>

            {typeof data.subtitle === 'string' && (
              <p style={{ fontSize: 34, color: colors.muted }}>
                {data.subtitle}
              </p>
            )}

            {typeof data.button === 'string' && (
              <div
                style={{
                  marginTop: 50,
                  padding: "24px 60px",
                  background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30)`,
                  border: `2px solid ${colors.primary}`,
                  display: "inline-block",
                  fontSize: 30,
                  fontWeight: 700,
                  color: colors.primary,
                  textShadow: `0 0 20px ${colors.primary}`,
                  transform: `scale(${pulse})`,
                  boxShadow: `0 0 30px ${colors.primary}50, inset 0 0 30px ${colors.primary}20`,
                }}
              >
                {data.button}
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
        background: colors.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: `"${fontFamily}", "PingFang SC", "Microsoft YaHei", sans-serif`,
        overflow: "hidden",
        padding: `${safeArea.top}px ${safeArea.right}px ${safeArea.bottom}px ${safeArea.left}px`,
      }}
    >
      {/* 网格背景 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${colors.primary}08 1px, transparent 1px),
            linear-gradient(90deg, ${colors.primary}08 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* 扫描线 */}
      <ScanLines frame={frame} />

      {/* 数据流粒子 */}
      <DataParticles frame={frame} />

      {/* 电路线条 */}
      <CircuitLines frame={frame} />

      <PageNum />

        <div
          style={{
            opacity: exitOpacity,
            width: "100%",
            maxWidth: 920,
            minHeight: Math.min(1260, Math.max(1080, height - safeArea.top - safeArea.bottom)),
            padding: "32px 34px 38px",
            borderRadius: 32,
            background: "linear-gradient(180deg, rgba(4,8,20,0.76), rgba(4,10,18,0.62))",
            border: `1px solid ${colors.primary}20`,
            boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              marginBottom: 28,
            }}
          >
            <div style={{ fontSize: 20, color: "rgba(255,255,255,0.64)", fontWeight: 600 }}>
              {String(index + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: Math.max(880, height - safeArea.top - safeArea.bottom - 120) }}>
            {renderContent()}
          </div>
        </div>
      </AbsoluteFill>
  );
};
