import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
  } from "remotion";
  import { getSlideMotionTiming } from "../templates/animationTiming";
  
  // macOS 26 液态玻璃配色
  const colors = {
    bg: "#e8e8ed",
    blob1: "#ff6b9d",     // 粉红
    blob2: "#c44dff",     // 紫色
    blob3: "#00d4aa",     // 青绿
    blob4: "#ff9f43",     // 橙色
    blob5: "#5f9eff",     // 蓝色
    blob6: "#a855f7",     // 紫粉
    text: "#1d1d1f",
    textSecondary: "#424245",
    muted: "#6e6e73",
  };
  
  // ===== 超大液态 Blob - 核心视觉 =====
  const MegaBlob: React.FC<{
    frame: number;
    x: number;
    y: number;
    size: number;
    color: string;
    speedX: number;
    speedY: number;
    phase: number;
  }> = ({ frame, x, y, size, color, speedX, speedY, phase }) => {
    // 有机运动
    const moveX = Math.sin(frame * speedX + phase) * 100 + Math.cos(frame * speedX * 0.7) * 50;
    const moveY = Math.cos(frame * speedY + phase) * 80 + Math.sin(frame * speedY * 0.6) * 40;
  
    // 形态变形 - 更极端的变形
    const morph1 = 30 + Math.sin(frame * 0.015 + phase) * 25;
    const morph2 = 70 + Math.cos(frame * 0.012 + phase) * 30;
    const morph3 = 50 + Math.sin(frame * 0.018 + phase + 1) * 28;
    const morph4 = 60 + Math.cos(frame * 0.014 + phase + 2) * 22;
  
    const scale = 1 + Math.sin(frame * 0.008 + phase) * 0.12;
  
    return (
      <div
        style={{
          position: "absolute",
          left: x + moveX,
          top: y + moveY,
          width: size,
          height: size,
          background: color,
          borderRadius: `${morph1}% ${morph2}% ${morph3}% ${morph4}%`,
          filter: "blur(100px)",
          opacity: 0.85,
          transform: `scale(${scale})`,
          mixBlendMode: "normal",
        }}
      />
    );
  };
  
  // ===== 深层渐变背景 =====
  const GradientBackground: React.FC<{ frame: number }> = ({ frame }) => {
    const shift = Math.sin(frame * 0.005) * 20;
  
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 60% at ${50 + shift}% 30%, rgba(255,107,157,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 70% 80% at ${30 + shift * 0.5}% 70%, rgba(196,77,255,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 90% 70% at ${70 - shift * 0.3}% 50%, rgba(0,212,170,0.1) 0%, transparent 50%),
            linear-gradient(180deg, #f0f0f5 0%, #e8e8ed 50%, #e0e0e5 100%)
          `,
        }}
      />
    );
  };
  
  // ===== 玻璃折射层 =====
  const GlassRefraction: React.FC<{
    frame: number;
    width: number;
    height: number;
  }> = ({ frame, width, height }) => {
    const shimmer = Math.sin(frame * 0.04) * 0.3 + 0.7;
  
    return (
      <div
        style={{
          position: "absolute",
          width,
          height,
          borderRadius: 44,
          overflow: "hidden",
        }}
      >
        {/* 顶部高光 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: height * 0.5,
            background: `linear-gradient(180deg,
              rgba(255,255,255,${0.4 * shimmer}) 0%,
              rgba(255,255,255,0.1) 30%,
              transparent 100%
            )`,
            borderRadius: "44px 44px 50% 50%",
          }}
        />
        {/* 边缘光泽 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 44,
            boxShadow: `
              inset 0 1px 1px rgba(255,255,255,0.9),
              inset 0 -1px 1px rgba(0,0,0,0.05),
              inset 1px 0 1px rgba(255,255,255,0.5),
              inset -1px 0 1px rgba(255,255,255,0.5)
            `,
          }}
        />
      </div>
    );
  };
  
  // ===== 主毛玻璃卡片 =====
  const LiquidGlassCard: React.FC<{
    children: React.ReactNode;
    frame: number;
    delay: number;
  }> = ({ children, frame, delay }) => {
    const progress = spring({
      frame: frame - delay,
      fps: 30,
      config: { damping: 20, stiffness: 100 },
    });
  
    const breathe = 1 + Math.sin(frame * 0.025) * 0.008;
  
    return (
      <div
        style={{
          position: "relative",
          opacity: progress,
          transform: `scale(${progress * breathe}) translateY(${(1 - progress) * 20}px)`,
        }}
      >
        {/* 外层发光 */}
        <div
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: 46,
            background: "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.2))",
            filter: "blur(20px)",
            opacity: 0.5,
          }}
        />
  
        {/* 主卡片 */}
        <div
          style={{
            position: "relative",
            padding: "80px 60px",
            background: `
              linear-gradient(135deg,
                rgba(255,255,255,0.75) 0%,
                rgba(255,255,255,0.65) 50%,
                rgba(255,255,255,0.7) 100%
              )
            `,
            backdropFilter: "blur(80px) saturate(200%)",
            WebkitBackdropFilter: "blur(80px) saturate(200%)",
            borderRadius: 44,
            border: "1px solid rgba(255,255,255,0.8)",
            boxShadow: `
              0 25px 50px -12px rgba(0,0,0,0.08),
              0 12px 24px -8px rgba(0,0,0,0.04),
              0 0 0 1px rgba(255,255,255,0.5),
              inset 0 1px 2px rgba(255,255,255,1),
              inset 0 -1px 1px rgba(0,0,0,0.03)
            `,
          }}
        >
          {/* 折射效果层 */}
          <GlassRefraction frame={frame} width={920} height={700} />
          {children}
        </div>
      </div>
    );
  };
  
  // ===== 浮动装饰球 =====
  const FloatingSphere: React.FC<{
    frame: number;
    x: number;
    y: number;
    size: number;
    color: string;
    delay: number;
  }> = ({ frame, x, y, size, color, delay }) => {
    const progress = spring({
      frame: frame - delay,
      fps: 30,
      config: { damping: 15 },
    });
  
    const floatY = Math.sin(frame * 0.025 + delay) * 12;
    const floatX = Math.cos(frame * 0.018 + delay * 0.7) * 8;
  
    return (
      <div
        style={{
          position: "absolute",
          left: x + floatX,
          top: y + floatY,
          width: size,
          height: size,
          borderRadius: "50%",
          background: `
            radial-gradient(circle at 35% 35%,
              rgba(255,255,255,0.9) 0%,
              ${color} 40%,
              ${color}cc 100%
            )
          `,
          boxShadow: `
            0 8px 32px ${color}50,
            inset 0 -6px 12px rgba(0,0,0,0.15),
            inset 0 6px 12px rgba(255,255,255,0.9)
          `,
          opacity: progress * 0.9,
          transform: `scale(${progress})`,
        }}
      />
    );
  };
  
  // ===== 标签胶囊 =====
  const GlassPill: React.FC<{
    text: string;
    frame: number;
    delay: number;
  }> = ({ text, frame, delay }) => {
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
          padding: "12px 24px",
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(20px)",
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,0.8)",
          boxShadow: `
            0 4px 12px rgba(0,0,0,0.04),
            inset 0 1px 1px rgba(255,255,255,0.9)
          `,
          fontSize: 20,
          fontWeight: 600,
          color: colors.textSecondary,
          opacity: progress,
          transform: `translateY(${(1 - progress) * 10}px)`,
        }}
      >
        {text}
      </div>
    );
  };
  
  // ===== 单个幻灯片组件 =====
  export const LiquidSlide: React.FC<{
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
      config: { damping: 18, stiffness: 100 },
    });
  
    const subtitleProgress = spring({
      frame: frame - timing.subtitleStart,
      fps,
      config: { damping: 18, stiffness: 90 },
    });
  
    const pointProgresses = (points || []).map((_, i) =>
      spring({
        frame: frame - timing.pointsStart - i * timing.pointStagger,
        fps,
        config: { damping: 14, stiffness: 100 },
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
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* 渐变背景层 */}
        <GradientBackground frame={frame} />
  
        {/* 大尺寸液态 Blobs */}
        <MegaBlob
          frame={frame}
          x={-200}
          y={-100}
          size={700}
          color={colors.blob1}
          speedX={0.006}
          speedY={0.005}
          phase={0}
        />
        <MegaBlob
          frame={frame}
          x={600}
          y={0}
          size={800}
          color={colors.blob2}
          speedX={0.005}
          speedY={0.006}
          phase={2}
        />
        <MegaBlob
          frame={frame}
          x={100}
          y={600}
          size={750}
          color={colors.blob3}
          speedX={0.007}
          speedY={0.005}
          phase={4}
        />
        <MegaBlob
          frame={frame}
          x={550}
          y={900}
          size={650}
          color={colors.blob4}
          speedX={0.0055}
          speedY={0.0065}
          phase={1}
        />
        <MegaBlob
          frame={frame}
          x={-150}
          y={1200}
          size={600}
          color={colors.blob5}
          speedX={0.0065}
          speedY={0.0055}
          phase={3}
        />
        <MegaBlob
          frame={frame}
          x={650}
          y={1300}
          size={700}
          color={colors.blob6}
          speedX={0.005}
          speedY={0.007}
          phase={5}
        />
  
        {/* 浮动球体 */}
        <FloatingSphere frame={frame} x={80} y={280} size={28} color={colors.blob2} delay={8} />
        <FloatingSphere frame={frame} x={920} y={380} size={22} color={colors.blob3} delay={12} />
        <FloatingSphere frame={frame} x={100} y={750} size={24} color={colors.blob1} delay={10} />
        <FloatingSphere frame={frame} x={890} y={850} size={26} color={colors.blob5} delay={15} />
        <FloatingSphere frame={frame} x={70} y={1300} size={20} color={colors.blob4} delay={18} />
        <FloatingSphere frame={frame} x={940} y={1400} size={24} color={colors.blob6} delay={6} />
  
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
          {/* 顶部标签行 */}
          <div
            style={{
              position: "absolute",
              top: 55,
              left: 55,
              right: 55,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <GlassPill text="Liquid Glass" frame={frame} delay={5} />
              <GlassPill text="macOS Style" frame={frame} delay={10} />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                background: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(20px)",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.7)",
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 600, color: colors.text }}>
                {index + 1}
              </span>
              <span style={{ fontSize: 22, color: colors.muted }}>/</span>
              <span style={{ fontSize: 22, color: colors.muted }}>{totalSlides}</span>
            </div>
          </div>
  
          {/* 主玻璃卡片 */}
          <LiquidGlassCard frame={frame} delay={8}>
            <div
              style={{
                width: 920,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                zIndex: 2,
              }}
            >
              {/* 标题 */}
              <h1
                style={{
                  fontSize: 96,
                  fontWeight: 700,
                  color: colors.text,
                  margin: 0,
                  marginBottom: 16,
                  transform: `translateY(${interpolate(titleProgress, [0, 1], [25, 0])}px)`,
                  opacity: titleProgress,
                  letterSpacing: "-2px",
                }}
              >
                {title}
              </h1>
  
              {/* 彩虹渐变线 */}
              <div
                style={{
                  width: interpolate(titleProgress, [0, 1], [0, 100]),
                  height: 6,
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${colors.blob1}, ${colors.blob2}, ${colors.blob3}, ${colors.blob4}, ${colors.blob5})`,
                  marginBottom: 20,
                  boxShadow: `0 2px 12px ${colors.blob2}40`,
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
                    transform: `translateY(${interpolate(subtitleProgress, [0, 1], [18, 0])}px)`,
                    opacity: subtitleProgress,
                    fontWeight: 400,
                    letterSpacing: "-0.3px",
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
                    gap: 16,
                    width: "100%",
                  }}
                >
                  {points.map((point, i) => {
                    const progress = pointProgresses[i] || 0;
                    const accentColors = [colors.blob1, colors.blob2, colors.blob3, colors.blob4, colors.blob5, colors.blob6];
  
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 20,
                          padding: "24px 28px",
                          background: "rgba(255,255,255,0.5)",
                          backdropFilter: "blur(10px)",
                          borderRadius: 24,
                          border: "1px solid rgba(255,255,255,0.7)",
                          boxShadow: `
                            0 2px 8px rgba(0,0,0,0.03),
                            inset 0 1px 1px rgba(255,255,255,0.8)
                          `,
                          transform: `translateX(${interpolate(progress, [0, 1], [-35, 0])}px)`,
                          opacity: progress,
                        }}
                      >
                        {/* 渐变圆点 */}
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${accentColors[i % 6]}, ${accentColors[(i + 1) % 6]})`,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "white",
                            fontSize: 22,
                            fontWeight: 600,
                            boxShadow: `0 4px 16px ${accentColors[i % 6]}40`,
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </div>
                        {/* 文字 */}
                        <span
                          style={{
                            fontSize: 32,
                            color: colors.text,
                            fontWeight: 500,
                            letterSpacing: "-0.3px",
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
          </LiquidGlassCard>
  
          {/* 底部指示器 */}
          <div
            style={{
              position: "absolute",
              bottom: 55,
              display: "flex",
              gap: 10,
            }}
          >
            {[...Array(totalSlides)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === index ? 36 : 12,
                  height: 12,
                  borderRadius: 6,
                  background: i === index
                    ? `linear-gradient(90deg, ${colors.blob1}, ${colors.blob2})`
                    : "rgba(0,0,0,0.12)",
                  boxShadow: i === index ? `0 2px 8px ${colors.blob1}40` : "none",
                }}
              />
            ))}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  };