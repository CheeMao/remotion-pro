// 动态幻灯片单页组件 - 科技风格
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../animationTiming";

interface DynamicSlideProps {
  title: string;
  subtitle?: string;
  points?: string[];
  index: number;
  totalSlides: number;
  durationInFrames: number;
}

export const DynamicSlide: React.FC<DynamicSlideProps> = ({
  title,
  subtitle,
  points,
  index,
  totalSlides,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timing = getSlideMotionTiming(durationInFrames, points?.length ?? 0);

  // 科技感配色
  const colors = {
    primary: "#00f0ff",
    secondary: "#7c3aed",
    accent: "#06ffa5",
    pink: "#ff2e97",
  };

  // 背景动态光效
  const glowMove = Math.sin(frame * 0.02) * 50;

  // 动态调整动画时间（根据总时长）
  // 标题入场
  const titleProgress = spring({
    frame: frame - timing.titleStart,
    fps,
    config: { damping: 12, stiffness: 120 },
  });
  const titleY = interpolate(titleProgress, [0, 1], [80, 0]);
  const titleScale = interpolate(titleProgress, [0, 1], [0.9, 1]);

  // 副标题入场
  const subtitleProgress = spring({
    frame: frame - timing.subtitleStart,
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const subtitleY = interpolate(subtitleProgress, [0, 1], [50, 0]);

  // 分隔线动画
  const lineProgress = spring({
    frame: frame - timing.lineStart,
    fps,
    config: { damping: 12 },
  });
  const lineWidth = interpolate(lineProgress, [0, 1], [0, 500]);

  // 要点逐个入场
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

  // 数字跳动效果
  const numberPulse = Math.sin(frame * 0.15) * 0.05 + 1;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0c0c1d 0%, #1a1a3e 50%, #0d1b2a 100%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, 'PingFang SC', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 动态背景光效 */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: `translateX(-50%) translateX(${glowMove}px)`,
          width: 900,
          height: 900,
          background: `radial-gradient(ellipse, ${colors.primary}20 0%, transparent 60%)`,
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "0%",
          right: "10%",
          width: 600,
          height: 600,
          background: `radial-gradient(ellipse, ${colors.pink}15 0%, transparent 60%)`,
          filter: "blur(80px)",
        }}
      />

      {/* 科技网格 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${colors.primary}08 1px, transparent 1px),
            linear-gradient(90deg, ${colors.primary}08 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          opacity: 0.8,
        }}
      />

      {/* 主内容 */}
      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "70px 60px",
          zIndex: 10,
        }}
      >
        {/* 顶部装饰条 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, transparent, ${colors.primary}, ${colors.pink}, ${colors.accent}, transparent)`,
          }}
        />

        {/* 页码 */}
        <div
          style={{
            position: "absolute",
            top: 50,
            right: 60,
            display: "flex",
            alignItems: "baseline",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: colors.primary,
              textShadow: `0 0 40px ${colors.primary}80, 0 0 80px ${colors.primary}40`,
              transform: `scale(${numberPulse})`,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.4)",
              fontWeight: 400,
            }}
          >
            / {String(totalSlides).padStart(2, "0")}
          </span>
        </div>

        {/* 标题 */}
        <h1
          style={{
            fontSize: 88,
            fontWeight: 900,
            color: "#ffffff",
            textAlign: "center",
            margin: 0,
            marginBottom: 20,
            transform: `translateY(${titleY}px) scale(${titleScale})`,
            opacity: titleProgress,
            textShadow: `
              0 0 60px ${colors.primary}60,
              0 0 120px ${colors.primary}30,
              0 4px 30px rgba(0,0,0,0.5)
            `,
            letterSpacing: "-2px",
            lineHeight: 1.15,
          }}
        >
          {title}
        </h1>

        {/* 分隔线 */}
        <div
          style={{
            width: lineWidth,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${colors.primary}, ${colors.accent}, transparent)`,
            borderRadius: 2,
            marginBottom: 28,
            boxShadow: `0 0 30px ${colors.primary}80`,
          }}
        />

        {/* 副标题 */}
        {subtitle && (
          <p
            style={{
              fontSize: 38,
              color: "rgba(255,255,255,0.85)",
              textAlign: "center",
              margin: 0,
              marginBottom: 70,
              transform: `translateY(${subtitleY}px)`,
              opacity: subtitleProgress,
              fontWeight: 400,
              maxWidth: "85%",
              letterSpacing: "0.5px",
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
              gap: 32,
              maxWidth: "88%",
            }}
          >
            {points.map((point, i) => {
              const progress = pointProgresses[i] || 0;
              const pointX = interpolate(progress, [0, 1], [-100, 0]);
              const pointGlow = i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.accent : colors.pink;

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 28,
                    transform: `translateX(${pointX}px)`,
                    opacity: progress,
                  }}
                >
                  <div
                    style={{
                      minWidth: 64,
                      height: 64,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${pointGlow}25, ${pointGlow}10)`,
                      border: `2px solid ${pointGlow}`,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: 28,
                      fontWeight: 700,
                      color: pointGlow,
                      boxShadow: `0 0 30px ${pointGlow}50, inset 0 0 20px ${pointGlow}20`,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    style={{
                      fontSize: 36,
                      color: "#ffffff",
                      fontWeight: 500,
                      letterSpacing: "0.3px",
                      textShadow: "0 2px 20px rgba(0,0,0,0.4)",
                    }}
                  >
                    {point}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* 底部装饰条 */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, transparent, ${colors.accent}, ${colors.primary}, ${colors.pink}, transparent)`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
