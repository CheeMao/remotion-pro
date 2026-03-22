import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";

// 单个幻灯片组件 - 毛玻璃风格
export const GlassSlide: React.FC<{
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

  // 配色
  const colors = {
    primary: "#8b5cf6",    // 紫色
    secondary: "#ec4899",  // 粉色
    accent: "#06b6d4",     // 青色
    warm: "#f97316",       // 橙色
  };

  // 背景渐变动画
  const bgRotate = frame * 0.3;

  // 标题入场
  const titleProgress = spring({
    frame: frame - timing.titleStart,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const titleY = interpolate(titleProgress, [0, 1], [60, 0]);
  const titleBlur = interpolate(titleProgress, [0, 1], [10, 0]);

  // 副标题入场
  const subtitleProgress = spring({
    frame: frame - timing.subtitleStart,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const subtitleY = interpolate(subtitleProgress, [0, 1], [40, 0]);

  // 要点入场
  const pointProgresses = (points || []).map((_, i) =>
    spring({
      frame: frame - timing.pointsStart - i * timing.pointStagger,
      fps,
      config: { damping: 10, stiffness: 100 },
    })
  );

  // 卡片浮动效果
  const cardFloat = Math.sin(frame * 0.03) * 8;

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
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, 'PingFang SC', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 动态渐变背景圆 */}
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
              opacity: 0.8,
            }}
          />
        );
      })}

      {/* 主内容区 - 毛玻璃卡片 */}
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
        {/* 毛玻璃主卡片 - 固定高度，居中 */}
        <div
          style={{
            width: "92%",
            height: 900,
            padding: "60px 55px",
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
            borderRadius: 40,
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: `
              0 25px 50px rgba(0, 0, 0, 0.3),
              inset 0 1px 1px rgba(255, 255, 255, 0.1)
            `,
            transform: `translateY(${cardFloat}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* 页码标签 */}
          <div
            style={{
              position: "absolute",
              top: -20,
              right: 40,
              padding: "12px 28px",
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              borderRadius: 30,
              fontSize: 22,
              fontWeight: 700,
              color: "white",
              boxShadow: `0 10px 40px ${colors.primary}50`,
            }}
          >
            {index + 1} / {totalSlides}
          </div>

          {/* 标题 */}
          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#ffffff",
              textAlign: "center",
              margin: 0,
              marginBottom: 20,
              transform: `translateY(${titleY}px)`,
              opacity: titleProgress,
              filter: `blur(${titleBlur}px)`,
              textShadow: "0 4px 30px rgba(0,0,0,0.3)",
              letterSpacing: "-1px",
            }}
          >
            {title}
          </h1>

          {/* 装饰线 */}
          <div
            style={{
              width: interpolate(titleProgress, [0, 1], [0, 200]),
              height: 4,
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
              borderRadius: 2,
              marginBottom: 24,
            }}
          />

          {/* 副标题 */}
          {subtitle && (
            <p
              style={{
                fontSize: 32,
                color: "rgba(255, 255, 255, 0.8)",
                textAlign: "center",
                margin: 0,
                marginBottom: 50,
                transform: `translateY(${subtitleY}px)`,
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
                gap: 24,
                width: "100%",
                maxWidth: 750,
                marginTop: 10,
              }}
            >
              {points.map((point, i) => {
                const progress = pointProgresses[i] || 0;
                const pointColors = [colors.primary, colors.accent, colors.secondary, colors.warm];
                const pointColor = pointColors[i % pointColors.length];

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 24,
                      padding: "24px 30px",
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      borderRadius: 20,
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      transform: `translateX(${interpolate(progress, [0, 1], [-50, 0])}px)`,
                      opacity: progress,
                    }}
                  >
                    {/* 序号 */}
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: `linear-gradient(135deg, ${pointColor}, ${pointColor}cc)`,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: 24,
                        fontWeight: 700,
                        color: "white",
                        boxShadow: `0 8px 20px ${pointColor}40`,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </div>
                    {/* 文字 */}
                    <span
                      style={{
                        fontSize: 30,
                        color: "rgba(255, 255, 255, 0.95)",
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

        {/* 底部装饰 */}
        <div
          style={{
            marginTop: 40,
            display: "flex",
            gap: 12,
          }}
        >
          {[...Array(totalSlides)].map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 40 : 12,
                height: 12,
                borderRadius: 6,
                background: i === index
                  ? `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`
                  : "rgba(255, 255, 255, 0.3)",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
