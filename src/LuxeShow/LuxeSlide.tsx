import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";

// 暗黑奢华配色
const colors = {
  bg: "#08080a",
  gold: "#d4af37",
  goldLight: "#f4e4bc",
  goldDark: "#8b7355",
  cream: "#faf8f5",
  muted: "rgba(250,248,245,0.6)",
};

// ===== 金色粒子 =====
const GoldParticles: React.FC<{ frame: number }> = ({ frame }) => {
  const particles = [];
  for (let i = 0; i < 25; i++) {
    const x = random(`px${i}`) * 1080;
    const baseY = random(`py${i}`) * 1920;
    const y = baseY + Math.sin(frame * 0.02 + i) * 30;
    const size = 1 + random(`ps${i}`) * 3;
    const opacity = 0.3 + Math.sin(frame * 0.05 + i * 0.5) * 0.2;

    particles.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: "50%",
          background: colors.gold,
          boxShadow: `0 0 ${size * 4}px ${colors.gold}`,
          opacity,
        }}
      />
    );
  }
  return <>{particles}</>;
};

// ===== 金色光晕 =====
const GoldGlow: React.FC<{ frame: number }> = ({ frame }) => {
  const pulse = 1 + Math.sin(frame * 0.03) * 0.15;
  const rotate = frame * 0.1;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 800,
        height: 800,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${pulse})`,
        background: `conic-gradient(from 0deg, ${colors.gold}08, transparent, ${colors.gold}05, transparent, ${colors.gold}08)`,
        filter: "blur(60px)",
        opacity: 0.6,
      }}
    />
  );
};

// ===== 几何装饰线 =====
const GeometricLines: React.FC<{ frame: number }> = ({ frame }) => {
  const progress = Math.min(1, frame / 60);

  return (
    <svg
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      {/* 左上角装饰 */}
      <line
        x1={50}
        y1={150}
        x2={50 + 150 * progress}
        y2={150}
        stroke={colors.gold}
        strokeWidth={1}
        opacity={0.4}
      />
      <line
        x1={50}
        y1={150}
        x2={50}
        y2={150 + 150 * progress}
        stroke={colors.gold}
        strokeWidth={1}
        opacity={0.4}
      />
      {/* 右下角装饰 */}
      <line
        x1={1030}
        y1={1770}
        x2={1030 - 150 * progress}
        y2={1770}
        stroke={colors.gold}
        strokeWidth={1}
        opacity={0.4}
      />
      <line
        x1={1030}
        y1={1770}
        x2={1030}
        y2={1770 - 150 * progress}
        stroke={colors.gold}
        strokeWidth={1}
        opacity={0.4}
      />
    </svg>
  );
};

// ===== 钻石装饰 =====
const DiamondDecor: React.FC<{ frame: number; x: number; y: number; size: number; delay: number }> = ({
  frame,
  x,
  y,
  size,
  delay,
}) => {
  const progress = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 15 },
  });
  const shimmer = 0.6 + Math.sin(frame * 0.08 + delay) * 0.3;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `rotate(45deg) scale(${progress})`,
        border: `1px solid ${colors.gold}`,
        boxShadow: `0 0 ${15 * shimmer}px ${colors.gold}60, inset 0 0 ${10 * shimmer}px ${colors.gold}30`,
        opacity: progress * shimmer,
      }}
    />
  );
};

// ===== 装饰性边框 =====
const LuxeBorder: React.FC = () => {
  const corners = [
    { top: 40, left: 40 },
    { top: 40, right: 40 },
    { bottom: 40, left: 40 },
    { bottom: 40, right: 40 },
  ];

  return (
    <>
      {corners.map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            width: 60,
            height: 60,
            border: `1px solid ${colors.gold}40`,
            opacity: 0.6,
          }}
        />
      ))}
      {/* 顶部金线 */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: "50%",
          transform: "translateX(-50%)",
          width: 200,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${colors.gold}, transparent)`,
        }}
      />
      {/* 底部金线 */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          left: "50%",
          transform: "translateX(-50%)",
          width: 200,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${colors.gold}, transparent)`,
        }}
      />
    </>
  );
};

// ===== 单个幻灯片组件 =====
export const LuxeSlide: React.FC<{
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
    config: { damping: 15, stiffness: 80 },
  });

  // 副标题入场
  const subtitleProgress = spring({
    frame: frame - timing.subtitleStart,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  // 要点入场
  const pointProgresses = (points || []).map((_, i) =>
    spring({
      frame: frame - timing.pointsStart - i * timing.pointStagger,
      fps,
      config: { damping: 12, stiffness: 80 },
    })
  );

  // 淡出
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
        fontFamily: "'Playfair Display', 'Songti SC', serif",
        overflow: "hidden",
      }}
    >
      {/* 金色光晕 */}
      <GoldGlow frame={frame} />

      {/* 几何装饰线 */}
      <GeometricLines frame={frame} />

      {/* 金色粒子 */}
      <GoldParticles frame={frame} />

      {/* 钻石装饰 */}
      <DiamondDecor frame={frame} x={100} y={200} size={12} delay={10} />
      <DiamondDecor frame={frame} x={950} y={300} size={8} delay={15} />
      <DiamondDecor frame={frame} x={150} y={1500} size={10} delay={20} />
      <DiamondDecor frame={frame} x={900} y={1600} size={14} delay={25} />

      {/* 装饰边框 */}
      <LuxeBorder />

      {/* 主内容区 */}
      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "100px 70px",
          zIndex: 10,
        }}
      >
        {/* 页码 */}
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 80,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 300,
              color: colors.gold,
              letterSpacing: 4,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </div>
          <div
            style={{
              fontSize: 20,
              color: colors.muted,
              letterSpacing: 2,
            }}
          >
            / {String(totalSlides).padStart(2, "0")}
          </div>
        </div>

        {/* 装饰花纹 */}
        <div
          style={{
            position: "absolute",
            top: 85,
            left: 80,
            fontSize: 24,
            color: colors.gold,
            opacity: 0.4,
            letterSpacing: 8,
          }}
        >
          ✦ ✦ ✦
        </div>

        {/* 主卡片 */}
        <div
          style={{
            width: "100%",
            maxWidth: 880,
            padding: "60px 50px",
            textAlign: "center",
          }}
        >
          {/* 标题 */}
          <h1
            style={{
              fontSize: 72,
              fontWeight: 400,
              color: colors.cream,
              margin: 0,
              marginBottom: 16,
              transform: `translateY(${interpolate(titleProgress, [0, 1], [40, 0])}px)`,
              opacity: titleProgress,
              letterSpacing: 8,
              textShadow: `0 2px 20px ${colors.gold}20`,
            }}
          >
            {title}
          </h1>

          {/* 金色分割线 */}
          <div
            style={{
              width: interpolate(titleProgress, [0, 1], [0, 120]),
              height: 1,
              background: colors.gold,
              margin: "0 auto 24px",
              boxShadow: `0 0 10px ${colors.gold}40`,
            }}
          />

          {/* 副标题 */}
          {subtitle && (
            <p
              style={{
                fontSize: 28,
                color: colors.muted,
                margin: 0,
                marginBottom: 50,
                transform: `translateY(${interpolate(subtitleProgress, [0, 1], [20, 0])}px)`,
                opacity: subtitleProgress,
                letterSpacing: 4,
                fontWeight: 300,
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
                marginTop: 20,
              }}
            >
              {points.map((point, i) => {
                const progress = pointProgresses[i] || 0;

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 20,
                      padding: "18px 0",
                      borderBottom: i < points.length - 1 ? `1px solid ${colors.gold}20` : "none",
                      transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
                      opacity: progress,
                    }}
                  >
                    {/* 金色菱形标记 */}
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        transform: "rotate(45deg)",
                        background: colors.gold,
                        boxShadow: `0 0 10px ${colors.gold}`,
                        flexShrink: 0,
                      }}
                    />
                    {/* 文字 */}
                    <span
                      style={{
                        fontSize: 26,
                        color: colors.cream,
                        letterSpacing: 2,
                        fontWeight: 300,
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

        {/* 底部装饰 */}
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "center",
            gap: 15,
          }}
        >
          {[...Array(totalSlides)].map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 40 : 6,
                height: 6,
                transform: i === index ? "rotate(45deg)" : "none",
                background: i === index ? colors.gold : `${colors.gold}30`,
                boxShadow: i === index ? `0 0 10px ${colors.gold}` : "none",
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
