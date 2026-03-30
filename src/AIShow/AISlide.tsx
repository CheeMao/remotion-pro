import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Orbitron";
import { getSlideMotionTiming } from "../templates/animationTiming";

loadFont();

// AI 科技配色
const colors = {
  bg: "#0a0a0f",
  primary: "#00d9ff",    // 电光蓝
  secondary: "#a855f7",  // AI紫
  accent: "#22d3ee",     // 青色
  success: "#10b981",    // 成功绿
  warning: "#f59e0b",    // 警告黄
  text: "#ffffff",
  muted: "rgba(255,255,255,0.6)",
};

// ===== 神经网络节点 =====
const NeuralNode: React.FC<{
  x: number;
  y: number;
  delay: number;
  frame: number;
  color: string;
  size?: number;
}> = ({ x, y, delay, frame, color, size = 8 }) => {
  const progress = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 12 },
  });

  const pulse = 1 + Math.sin((frame - delay) * 0.1) * 0.3;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 ${20 * pulse}px ${color}, 0 0 ${40 * pulse}px ${color}80`,
        opacity: progress,
        transform: `scale(${progress * pulse})`,
      }}
    />
  );
};

// ===== 神经网络连线 =====
const NeuralConnection: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
  frame: number;
  color: string;
}> = ({ x1, y1, x2, y2, delay, frame, color }) => {
  const progress = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 15 },
  });

  const midX = x1 + (x2 - x1) * progress;
  const midY = y1 + (y2 - y1) * progress;

  return (
    <svg
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <line
        x1={x1}
        y1={y1}
        x2={midX}
        y2={midY}
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="4 4"
        opacity={progress * 0.3}
        style={{
          filter: `drop-shadow(0 0 4px ${color})`,
        }}
      />
    </svg>
  );
};

// ===== 数据流粒子 =====
const DataFlow: React.FC<{ frame: number }> = ({ frame }) => {
  const particles = [];
  for (let i = 0; i < 30; i++) {
    const startY = -50;
    const x = 80 + i * 35;
    const speed = 2 + (i % 3);
    const y = startY + (frame * speed + i * 80) % 2100;
    const size = 3 + (i % 2) * 2;
    const color = i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.secondary : colors.accent;

    particles.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size * 6,
          background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
          borderRadius: 2,
          opacity: 0.22,
        }}
      />
    );
  }
  return <>{particles}</>;
};

// ===== AI 核心动画 =====
const AICore: React.FC<{ frame: number }> = ({ frame }) => {
  const rotate = frame * 0.5;
  const pulse = 1 + Math.sin(frame * 0.08) * 0.1;

  return (
    <div
      style={{
        position: "absolute",
        top: 100,
        right: 80,
        width: 200,
        height: 200,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* 外圈 */}
      <div
        style={{
          position: "absolute",
          width: 180,
          height: 180,
          borderRadius: "50%",
          border: `2px solid ${colors.primary}40`,
          transform: `rotate(${rotate}deg) scale(${pulse})`,
        }}
      />
      {/* 中圈 */}
      <div
        style={{
          position: "absolute",
          width: 140,
          height: 140,
          borderRadius: "50%",
          border: `2px solid ${colors.secondary}60`,
          transform: `rotate(${-rotate * 1.5}deg) scale(${pulse})`,
        }}
      />
      {/* 内圈 */}
      <div
        style={{
          position: "absolute",
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.primary}20, ${colors.secondary}20)`,
          border: `1px solid ${colors.accent}40`,
          boxShadow: `0 0 40px ${colors.primary}40, inset 0 0 40px ${colors.secondary}20`,
        }}
      />
      {/* 核心 */}
      <div
        style={{
          position: "absolute",
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          boxShadow: `0 0 30px ${colors.primary}, 0 0 60px ${colors.secondary}`,
          animation: "pulse 2s ease-in-out infinite",
        }}
      />
    </div>
  );
};

// ===== 单个幻灯片组件 =====
export const AISlide: React.FC<{
  title: string;
  subtitle?: string;
  points?: string[];
  index: number;
  totalSlides: number;
  durationInFrames: number;
}> = ({ title, subtitle, points, index, totalSlides, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timing = getSlideMotionTiming(durationInFrames, points?.length ?? 0);

  // 标题入场
  const titleProgress = spring({
    frame: frame - timing.titleStart,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // 副标题入场
  const subtitleProgress = spring({
    frame: frame - timing.subtitleStart,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  // 要点入场
  const pointProgresses = (points || []).map((_, i) =>
    spring({
      frame: frame - timing.pointsStart - i * timing.pointStagger,
      fps,
      config: { damping: 10, stiffness: 100 },
    })
  );

  // 淡出
  const exitOpacity = interpolate(
    frame,
    [timing.exitStart, timing.exitEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 神经网络节点数据
  const nodes = [
    { x: 60, y: 300, delay: 0, color: colors.primary },
    { x: 120, y: 450, delay: 5, color: colors.secondary },
    { x: 80, y: 600, delay: 10, color: colors.accent },
    { x: 150, y: 750, delay: 15, color: colors.primary },
    { x: 60, y: 900, delay: 20, color: colors.secondary },
    { x: 100, y: 1200, delay: 25, color: colors.accent },
    { x: 140, y: 1400, delay: 30, color: colors.primary },
    // 右侧
    { x: 980, y: 200, delay: 35, color: colors.secondary },
    { x: 1020, y: 400, delay: 40, color: colors.accent },
    { x: 960, y: 550, delay: 45, color: colors.primary },
    { x: 1000, y: 700, delay: 50, color: colors.secondary },
    { x: 940, y: 850, delay: 55, color: colors.accent },
    { x: 1000, y: 1100, delay: 60, color: colors.primary },
    { x: 980, y: 1300, delay: 65, color: colors.secondary },
  ];

  return (
    <AbsoluteFill
      style={{
        background: colors.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: '"Orbitron", "PingFang SC", "Microsoft YaHei", sans-serif',
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
          backgroundSize: "60px 60px",
        }}
      />

      {/* 数据流 */}
      <DataFlow frame={frame} />

      {/* 神经网络节点 */}
      {nodes.map((node, i) => (
        <NeuralNode
          key={i}
          x={node.x}
          y={node.y}
          delay={node.delay}
          frame={frame}
          color={node.color}
        />
      ))}

      {/* 连线 */}
      {nodes.slice(0, 6).map((node, i) => (
        <NeuralConnection
          key={i}
          x1={node.x}
          y1={node.y}
          x2={nodes[i + 1].x}
          y2={nodes[i + 1].y}
          delay={node.delay + 5}
          frame={frame}
          color={node.color}
        />
      ))}

      {/* 主内容区 */}
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
        {/* 主卡片 */}
        <div
          style={{
            width: "90%",
            maxWidth: 920,
            minHeight: 1260,
            padding: "34px 34px 38px",
            background: `linear-gradient(135deg, rgba(0,217,255,0.08), rgba(168,85,247,0.05))`,
            backdropFilter: "blur(20px)",
            borderRadius: 30,
            border: `1px solid ${colors.primary}30`,
            boxShadow: `
              0 0 60px ${colors.primary}15,
              inset 0 1px 0 rgba(255,255,255,0.1)
            `,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 28,
            }}
          >
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <div
                style={{
                  padding: "10px 24px",
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  borderRadius: 20,
                  fontSize: 18,
                  fontWeight: 700,
                  color: colors.text,
                  boxShadow: `0 8px 30px ${colors.primary}50`,
                }}
              >
                AI-{String(index + 1).padStart(2, "0")}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: [colors.success, colors.warning, colors.secondary][i],
                      boxShadow: `0 0 10px ${[colors.success, colors.warning, colors.secondary][i]}`,
                      opacity: 0.8,
                    }}
                  />
                ))}
              </div>
            </div>

            <div
              style={{
                padding: "10px 24px",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: 20,
                border: `1px solid ${colors.primary}30`,
                fontSize: 18,
                fontWeight: 600,
                color: colors.muted,
              }}
            >
              {index + 1} / {totalSlides}
            </div>
          </div>

          {/* 标题 */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 24,
              marginBottom: 20,
            }}
          >
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontSize: 68,
                  fontWeight: 800,
                  color: colors.text,
                  textAlign: "left",
                  margin: 0,
                  marginBottom: 16,
                  transform: `translateY(${interpolate(titleProgress, [0, 1], [50, 0])}px)`,
                  opacity: titleProgress,
                  textShadow: `0 0 40px ${colors.primary}40`,
                  letterSpacing: "-0.5px",
                  lineHeight: 1.06,
                  maxWidth: 620,
                }}
              >
                {title}
              </h1>
            </div>
            <div style={{ flexShrink: 0 }}>
              <AICore frame={frame} />
            </div>
          </div>

          {/* 装饰线 */}
          <div
            style={{
              width: interpolate(titleProgress, [0, 1], [0, 180]),
              height: 3,
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, ${colors.accent})`,
              borderRadius: 2,
              marginBottom: 20,
              boxShadow: `0 0 20px ${colors.primary}60`,
            }}
          />

          {/* 副标题 */}
          {subtitle && (
            <p
              style={{
                fontSize: 28,
                color: colors.muted,
              textAlign: "left",
                margin: 0,
                marginBottom: 50,
                transform: `translateY(${interpolate(subtitleProgress, [0, 1], [30, 0])}px)`,
                opacity: subtitleProgress,
                fontWeight: 400,
              }}
            >
              {subtitle}
            </p>
          )}

          {/* 要点列表 */}
          {points && points.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                width: "100%",
                maxWidth: "100%",
                marginTop: 18,
              }}
            >
              {points.map((point, i) => {
                const progress = pointProgresses[i] || 0;
                const pointColors = [colors.primary, colors.secondary, colors.accent, colors.success];
                const pointColor = pointColors[i % pointColors.length];

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      padding: "22px 28px",
                      background: `${pointColor}10`,
                      borderRadius: 16,
                      border: `1px solid ${pointColor}30`,
                      transform: `translateX(${interpolate(progress, [0, 1], [-60, 0])}px)`,
                      opacity: progress,
                    }}
                  >
                    {/* 图标 */}
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: `linear-gradient(135deg, ${pointColor}, ${pointColor}cc)`,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: 20,
                        fontWeight: 700,
                        color: colors.text,
                        boxShadow: `0 6px 20px ${pointColor}40`,
                        flexShrink: 0,
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    {/* 文字 */}
                    <span
                      style={{
                        fontSize: 28,
                        color: colors.text,
                        fontWeight: 500,
                      }}
                    >
                      {point}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部进度指示 */}
        <div
          style={{
            marginTop: 35,
            display: "flex",
            gap: 10,
          }}
        >
          {[...Array(totalSlides)].map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 50 : 10,
                height: 10,
                borderRadius: 5,
                background: i === index
                  ? `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`
                  : `${colors.primary}30`,
                boxShadow: i === index ? `0 0 20px ${colors.primary}60` : "none",
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
