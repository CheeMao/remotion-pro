import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";

// 新拟态风格幻灯片组件
export const NeuSlide: React.FC<{
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

  // 新拟态配色
  const bgColor = "#e8eef5";  // 浅灰蓝背景
  const shadowDark = "#bec3c9";  // 深阴影
  const shadowLight = "#ffffff"; // 浅阴影
  const accentColors = [
    "#6366f1",  // 靛蓝
    "#8b5cf6",  // 紫色
    "#ec4899",  // 粉色
    "#14b8a6",  // 青绿
    "#f97316",  // 橙色
  ];
  const accent = accentColors[index % accentColors.length];

  // 标题入场
  const titleProgress = spring({
    frame: frame - timing.titleStart,
    fps,
    config: { damping: 15, stiffness: 80 },
  });
  const titleY = interpolate(titleProgress, [0, 1], [40, 0]);

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

  // 新拟态阴影样式
  const neumorphismRaised = {
    boxShadow: `20px 20px 60px ${shadowDark}, -20px -20px 60px ${shadowLight}`,
  };

  const neumorphismInset = {
    boxShadow: `inset 8px 8px 16px ${shadowDark}, inset -8px -8px 16px ${shadowLight}`,
  };

  return (
    <AbsoluteFill
      style={{
        background: bgColor,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, 'PingFang SC', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 背景装饰圆 - 新拟态风格 */}
      <div
        style={{
          position: "absolute",
          top: -150,
          right: -150,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: bgColor,
          ...neumorphismRaised,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -200,
          left: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: bgColor,
          ...neumorphismRaised,
          opacity: 0.5,
        }}
      />

      {/* 主内容区 */}
      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px 50px",
          zIndex: 10,
        }}
      >
        {/* 页码 - 新拟态胶囊 */}
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 60,
            padding: "18px 36px",
            borderRadius: 50,
            background: bgColor,
            ...neumorphismRaised,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{
            fontSize: 34,
            fontWeight: 800,
            color: accent,
          }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span style={{
            fontSize: 24,
            color: "#94a3b8",
            fontWeight: 500,
          }}>
            / {String(totalSlides).padStart(2, "0")}
          </span>
        </div>

        {/* 主卡片 - 新拟态凸起 */}
        <div
          style={{
            width: "90%",
            padding: "60px 50px",
            borderRadius: 40,
            background: bgColor,
            ...neumorphismRaised,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* 标题图标 */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: bgColor,
              ...neumorphismRaised,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 30,
              transform: `scale(${titleProgress})`,
              opacity: titleProgress,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              }}
            />
          </div>

          {/* 标题 */}
          <h1
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: "#0f172a",
              textAlign: "center",
              margin: 0,
              marginBottom: 20,
              transform: `translateY(${titleY}px)`,
              opacity: titleProgress,
              letterSpacing: "-2px",
              textShadow: `0 2px 0 ${shadowLight}, 0 -1px 0 ${shadowDark}`,
            }}
          >
            {title}
          </h1>

          {/* 副标题 */}
          {subtitle && (
            <p
              style={{
                fontSize: 36,
                color: "#475569",
                textAlign: "center",
                margin: 0,
                marginBottom: 40,
                opacity: subtitleProgress,
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              {subtitle}
            </p>
          )}

          {/* 分隔线 - 新拟态凹陷 */}
          <div
            style={{
              width: 120,
              height: 8,
              borderRadius: 4,
              background: bgColor,
              ...neumorphismInset,
              marginBottom: 40,
              opacity: subtitleProgress,
            }}
          />

          {/* 要点列表 */}
          {points && points.length > 0 && (
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
                const pointColor = accentColors[(index + i) % accentColors.length];

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 24,
                      padding: "26px 32px",
                      borderRadius: 24,
                      background: bgColor,
                      ...neumorphismRaised,
                      transform: `translateX(${interpolate(progress, [0, 1], [-60, 0])}px)`,
                      opacity: progress,
                    }}
                  >
                    {/* 序号 - 凹陷效果 */}
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        background: bgColor,
                        ...neumorphismInset,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: 26,
                        fontWeight: 800,
                        color: pointColor,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </div>
                    {/* 文字 */}
                    <span
                      style={{
                        fontSize: 32,
                        color: "#1e293b",
                        fontWeight: 600,
                        letterSpacing: "0.3px",
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

        {/* 底部进度指示器 */}
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
                width: i === index ? 50 : 20,
                height: 20,
                borderRadius: 10,
                background: bgColor,
                ...neumorphismRaised,
                transition: "width 0.3s",
              }}
            >
              {i === index && (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 10,
                    background: `linear-gradient(90deg, ${accent}80, ${accent}40)`,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
