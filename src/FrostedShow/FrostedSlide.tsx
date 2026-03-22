import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";

// 毛玻璃配色
const colors = {
  bg1: "#667eea",
  bg2: "#764ba2",
  bg3: "#f093fb",
  accent1: "#4facfe",
  accent2: "#00f2fe",
  accent3: "#fa709a",
  accent4: "#fee140",
  glass: "rgba(255, 255, 255, 0.18)",
  glassBorder: "rgba(255, 255, 255, 0.3)",
  text: "#ffffff",
  muted: "rgba(255, 255, 255, 0.75)",
};

// ===== 动态渐变背景 =====
const GradientBg: React.FC<{ frame: number }> = ({ frame }) => {
  const shift = frame * 0.15;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(circle at ${30 + Math.sin(shift * 0.01) * 20}% ${20 + Math.cos(shift * 0.01) * 15}%,
            rgba(240, 147, 251, 0.4) 0%, transparent 50%),
          radial-gradient(circle at ${70 + Math.cos(shift * 0.012) * 20}% ${80 + Math.sin(shift * 0.01) * 15}%,
            rgba(79, 172, 254, 0.4) 0%, transparent 50%),
          radial-gradient(circle at ${50 + Math.sin(shift * 0.008) * 25}% ${50 + Math.cos(shift * 0.008) * 25}%,
            rgba(250, 112, 154, 0.3) 0%, transparent 50%),
          linear-gradient(135deg, ${colors.bg1} 0%, ${colors.bg2} 50%, ${colors.bg3} 100%)
        `,
      }}
    />
  );
};

// ===== 浮动光球 =====
const LightOrb: React.FC<{
  frame: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  speed: number;
}> = ({ frame, x, y, size, color, delay, speed }) => {
  const progress = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 15 },
  });

  const floatX = Math.sin(frame * speed + delay) * 60;
  const floatY = Math.cos(frame * speed * 0.8 + delay) * 40;
  const scale = 1 + Math.sin(frame * speed * 1.2 + delay) * 0.15;

  return (
    <div
      style={{
        position: "absolute",
        left: x + floatX,
        top: y + floatY,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${color})`,
        filter: "blur(40px)",
        opacity: progress * 0.6,
        transform: `scale(${scale})`,
      }}
    />
  );
};

// ===== 毛玻璃层叠卡片 =====
const GlassLayers: React.FC<{
  children: React.ReactNode;
  frame: number;
  delay: number;
}> = ({ children, frame, delay }) => {
  const progress = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 18, stiffness: 80 },
  });

  const breathe = 1 + Math.sin(frame * 0.02) * 0.005;

  return (
    <div
      style={{
        position: "relative",
        opacity: progress,
        transform: `scale(${progress * breathe}) translateY(${(1 - progress) * 30}px)`,
      }}
    >
      {/* 底层光晕 */}
      <div
        style={{
          position: "absolute",
          inset: -30,
          borderRadius: 60,
          background: `linear-gradient(135deg, ${colors.accent1}40, ${colors.accent3}40)`,
          filter: "blur(60px)",
          opacity: 0.5,
        }}
      />

      {/* 第二层玻璃 */}
      <div
        style={{
          position: "absolute",
          inset: -8,
          borderRadius: 52,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      />

      {/* 主玻璃卡片 */}
      <div
        style={{
          position: "relative",
          padding: "75px 60px",
          background: `
            linear-gradient(135deg,
              rgba(255,255,255,0.25) 0%,
              rgba(255,255,255,0.1) 50%,
              rgba(255,255,255,0.2) 100%
            )
          `,
          backdropFilter: "blur(60px)",
          WebkitBackdropFilter: "blur(60px)",
          borderRadius: 44,
          border: "1px solid rgba(255,255,255,0.35)",
          boxShadow: `
            0 30px 60px -15px rgba(0,0,0,0.2),
            0 0 0 1px rgba(255,255,255,0.1),
            inset 0 1px 1px rgba(255,255,255,0.5),
            inset 0 -1px 1px rgba(0,0,0,0.05)
          `,
        }}
      >
        {/* 顶部高光 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 20,
            right: 20,
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
          }}
        />

        {children}
      </div>
    </div>
  );
};

// ===== 玻璃胶囊按钮 =====
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
        gap: 8,
        padding: "12px 24px",
        background: color ? `${color}30` : "rgba(255,255,255,0.15)",
        backdropFilter: "blur(20px)",
        borderRadius: 25,
        border: `1px solid ${color ? `${color}50` : "rgba(255,255,255,0.25)"}`,
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.3)",
        fontSize: 20,
        fontWeight: 600,
        color: colors.text,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 15}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ===== 玻璃图标 =====
const GlassIcon: React.FC<{
  frame: number;
  color: string;
}> = ({ frame, color }) => {
  const pulse = 1 + Math.sin(frame * 0.08) * 0.08;

  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 18,
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        boxShadow: `
          0 8px 25px ${color}50,
          inset 0 2px 4px rgba(255,255,255,0.4),
          inset 0 -2px 4px rgba(0,0,0,0.1)
        `,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontSize: 24,
        fontWeight: 700,
        transform: `scale(${pulse})`,
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </div>
  );
};

// ===== 单个幻灯片组件 =====
export const FrostedSlide: React.FC<{
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

  // 入场动画
  const titleProgress = spring({
    frame: frame - timing.titleStart,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const subtitleProgress = spring({
    frame: frame - timing.subtitleStart,
    fps,
    config: { damping: 15, stiffness: 90 },
  });

  const pointProgresses = (points || []).map((_, i) =>
    spring({
      frame: frame - timing.pointsStart - i * timing.pointStagger,
      fps,
      config: { damping: 12, stiffness: 100 },
    })
  );

  // 淡出
  const exitOpacity = interpolate(
    frame,
    [timing.exitStart, timing.exitEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 光球配置
  const orbs = [
    { x: 100, y: 200, size: 300, color: colors.accent1, delay: 5, speed: 0.008 },
    { x: 700, y: 100, size: 350, color: colors.accent3, delay: 10, speed: 0.006 },
    { x: 50, y: 900, size: 280, color: colors.accent2, delay: 15, speed: 0.007 },
    { x: 800, y: 800, size: 320, color: colors.accent4, delay: 20, speed: 0.0065 },
    { x: 150, y: 1400, size: 260, color: colors.accent1, delay: 25, speed: 0.0075 },
    { x: 750, y: 1500, size: 300, color: colors.accent3, delay: 30, speed: 0.0055 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${colors.bg1}, ${colors.bg2})`,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 动态渐变背景 */}
      <GradientBg frame={frame} />

      {/* 浮动光球 */}
      {orbs.map((orb, i) => (
        <LightOrb
          key={i}
          frame={frame}
          x={orb.x}
          y={orb.y}
          size={orb.size}
          color={orb.color}
          delay={orb.delay}
          speed={orb.speed}
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
        {/* 顶部信息栏 */}
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 50,
            right: 50,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            <GlassPill text="Frosted Glass" frame={frame} delay={5} />
            <GlassPill text="Blur Effect" frame={frame} delay={10} color={colors.accent2} />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 24px",
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(20px)",
              borderRadius: 25,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <span style={{ fontSize: 26, fontWeight: 700, color: colors.text }}>{index + 1}</span>
            <span style={{ fontSize: 26, color: colors.muted }}>|</span>
            <span style={{ fontSize: 26, color: colors.muted }}>{totalSlides}</span>
          </div>
        </div>

        {/* 主玻璃卡片 */}
        <GlassLayers frame={frame} delay={8}>
          <div
            style={{
              width: 880,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* 标题 */}
            <h1
              style={{
                fontSize: 90,
                fontWeight: 800,
                color: colors.text,
                margin: 0,
                marginBottom: 14,
                transform: `translateY(${interpolate(titleProgress, [0, 1], [30, 0])}px)`,
                opacity: titleProgress,
                textShadow: "0 2px 20px rgba(0,0,0,0.15)",
                letterSpacing: "-2px",
              }}
            >
              {title}
            </h1>

            {/* 渐变分隔线 */}
            <div
              style={{
                width: interpolate(titleProgress, [0, 1], [0, 120]),
                height: 5,
                borderRadius: 3,
                background: `linear-gradient(90deg, ${colors.accent1}, ${colors.accent2}, ${colors.accent3}, ${colors.accent4})`,
                marginBottom: 20,
                boxShadow: "0 4px 15px rgba(255,255,255,0.3)",
              }}
            />

            {/* 副标题 */}
            {subtitle && (
              <p
                style={{
                  fontSize: 36,
                  color: colors.muted,
                  margin: 0,
                  marginBottom: 50,
                  transform: `translateY(${interpolate(subtitleProgress, [0, 1], [20, 0])}px)`,
                  opacity: subtitleProgress,
                  fontWeight: 400,
                  textShadow: "0 1px 10px rgba(0,0,0,0.1)",
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
                  gap: 18,
                  width: "100%",
                }}
              >
                {points.map((point, i) => {
                  const progress = pointProgresses[i] || 0;
                  const accentColors = [colors.accent1, colors.accent2, colors.accent3, colors.accent4];

                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 22,
                        padding: "22px 28px",
                        background: "rgba(255,255,255,0.12)",
                        backdropFilter: "blur(15px)",
                        borderRadius: 24,
                        border: "1px solid rgba(255,255,255,0.2)",
                        boxShadow: `
                          0 4px 15px rgba(0,0,0,0.08),
                          inset 0 1px 1px rgba(255,255,255,0.3)
                        `,
                        transform: `translateX(${interpolate(progress, [0, 1], [-50, 0])}px)`,
                        opacity: progress,
                      }}
                    >
                      <GlassIcon frame={frame} color={accentColors[i % 4]} />
                      <span
                        style={{
                          fontSize: 32,
                          color: colors.text,
                          fontWeight: 600,
                          textShadow: "0 1px 8px rgba(0,0,0,0.1)",
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
        </GlassLayers>

        {/* 底部进度条 */}
        <div
          style={{
            position: "absolute",
            bottom: 50,
            display: "flex",
            gap: 10,
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
                  ? `linear-gradient(90deg, ${colors.accent1}, ${colors.accent2})`
                  : "rgba(255,255,255,0.25)",
                boxShadow: i === index ? "0 4px 15px rgba(255,255,255,0.3)" : "none",
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
