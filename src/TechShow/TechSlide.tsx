import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Orbitron";
import { getSlideMotionTiming } from "../templates/animationTiming";

// 加载 Orbitron 字体
const { fontFamily } = loadFont();

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
          opacity: 0.8,
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
          opacity: 0.4,
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
          opacity: 0.6,
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
      style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.3 }}
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
          fontSize: 90,
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
  data: Record<string, any>;
  index: number;
  totalSlides: number;
  durationInFrames: number;
}> = ({ type, data, index, totalSlides, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const itemCount = Array.isArray(data.items)
    ? data.items.length
    : Array.isArray(data.stats)
      ? data.stats.length
      : Array.isArray(data.bars)
        ? data.bars.length
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
        top: 40,
        right: 40,
        fontFamily: "monospace",
        fontSize: 24,
        color: colors.primary,
        textShadow: `0 0 10px ${colors.primary}`,
      }}
    >
      [{String(index + 1).padStart(2, "0")}/{String(totalSlides).padStart(2, "0")}]
    </div>
  );

  // 渲染内容
  const renderContent = () => {
    switch (type) {
      // ===== 标题页 =====
      case "title":
        const titleGlitch = frame % 40 < 3;
        return (
          <div style={{ textAlign: "center" }}>
            {/* 终端提示 */}
            <div style={{ marginBottom: 40 }}>
              <TerminalText text="SYSTEM INITIALIZING..." delay={0} frame={frame} />
            </div>

            {/* 主标题 */}
            <h1
              style={{
                fontSize: 100,
                fontWeight: 900,
                color: titleGlitch ? colors.accent : colors.text,
                margin: 0,
                textShadow: titleGlitch
                  ? `3px 0 ${colors.primary}, -3px 0 ${colors.accent}`
                  : `0 0 40px ${colors.primary}60`,
                letterSpacing: "4px",
                transform: titleGlitch ? `translateX(${Math.sin(frame)}px)` : "none",
              }}
            >
              {data.title}
            </h1>

            {data.subtitle && (
              <p
                style={{
                  fontSize: 36,
                  color: colors.muted,
                  marginTop: 24,
                  letterSpacing: "2px",
                }}
              >
                {data.subtitle}
              </p>
            )}

            {/* 状态指示 */}
            <div
              style={{
                marginTop: 60,
                display: "flex",
                gap: 40,
                justifyContent: "center",
              }}
            >
              {["READY", "ONLINE", "SECURE"].map((status, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px 20px",
                    border: `1px solid ${colors.primary}`,
                    fontSize: 18,
                    color: colors.primary,
                    textShadow: `0 0 10px ${colors.primary}`,
                    opacity: spring({ frame: frame - 30 - i * 5, fps, config: { damping: 12 } }),
                  }}
                >
                  ◉ {status}
                </div>
              ))}
            </div>
          </div>
        );

      // ===== 数据页 =====
      case "stats":
        return (
          <div style={{ width: "90%" }}>
            <TerminalText text={data.title.toUpperCase()} delay={0} frame={frame} />

            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: 60,
              }}
            >
              {data.stats.map((stat: any, i: number) => {
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
                <TerminalText text={data.title.toUpperCase()} delay={0} frame={frame} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {data.items.map((item: any, i: number) => {
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
                        <div style={{ fontSize: 36, fontWeight: 700, color: colors.text }}>
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

      // ===== 进度页 =====
      case "progress":
        return (
          <div style={{ width: 700 }}>
            <TerminalText text={data.title.toUpperCase()} delay={0} frame={frame} />

            <div style={{ marginTop: 50 }}>
              {data.bars.map((bar: any, i: number) => {
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
            <TerminalText text={data.title.toUpperCase()} delay={0} frame={frame} />

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
                  // {data.left.label}
                </div>
                <div style={{ fontSize: 60, fontWeight: 900, color: colors.text }}>
                  {data.left.value}
                </div>
              </div>

              {/* VS */}
              <div
                style={{
                  fontSize: 40,
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
                  // {data.right.label}
                </div>
                <div style={{ fontSize: 60, fontWeight: 900, color: colors.text }}>
                  {data.right.value}
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
              <div style={{
                fontSize: 72,
                color: colors.primary,
                textShadow: `0 0 30px ${colors.primary}`,
                marginBottom: 20,
              }}>
                &lt;QUOTE&gt;
              </div>
              <p style={{
                fontSize: 40,
                fontStyle: "italic",
                color: colors.text,
                margin: 0,
                lineHeight: 1.6,
              }}>
                "{data.quote}"
              </p>
              <div style={{
                marginTop: 30,
                fontSize: 26,
                color: colors.secondary,
                textAlign: "right",
              }}>
                — {data.author}
              </div>
              <div style={{
                marginTop: 20,
                fontSize: 60,
                color: colors.primary,
                textShadow: `0 0 30px ${colors.primary}`,
                textAlign: "right",
              }}>
                &lt;/QUOTE&gt;
              </div>
            </div>
          </HoloFrame>
        );

      // ===== CTA 页 =====
      case "cta":
        const pulse = 1 + Math.sin(frame * 0.1) * 0.03;

        return (
          <div style={{ textAlign: "center" }}>
            <TerminalText text="MISSION READY" delay={0} frame={frame} />

            <h1
              style={{
                fontSize: 90,
                fontWeight: 900,
                color: colors.text,
                margin: "40px 0 20px",
                textShadow: `0 0 40px ${colors.primary}60`,
                letterSpacing: "3px",
              }}
            >
              {data.title}
            </h1>

            {data.subtitle && (
              <p style={{ fontSize: 34, color: colors.muted }}>
                {data.subtitle}
              </p>
            )}

            {data.button && (
              <div
                style={{
                  marginTop: 50,
                  padding: "24px 60px",
                  background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30)`,
                  border: `2px solid ${colors.primary}`,
                  display: "inline-block",
                  fontSize: 36,
                  fontWeight: 700,
                  color: colors.primary,
                  textShadow: `0 0 20px ${colors.primary}`,
                  transform: `scale(${pulse})`,
                  boxShadow: `0 0 30px ${colors.primary}50, inset 0 0 30px ${colors.primary}20`,
                }}
              >
                &gt;&gt; {data.button} &lt;&lt;
              </div>
            )}
          </div>
        );

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

      <div style={{ opacity: exitOpacity }}>
        {renderContent()}
      </div>
    </AbsoluteFill>
  );
};
