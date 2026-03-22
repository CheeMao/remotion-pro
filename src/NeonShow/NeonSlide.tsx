import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";

// 赛博朋克配色
const colors = {
  bg: "#0a0010",
  neonPink: "#ff2d95",
  neonBlue: "#00f0ff",
  neonPurple: "#bf00ff",
  neonGreen: "#39ff14",
  neonOrange: "#ff6600",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.7)",
};

// ===== 故障效果文字 =====
const GlitchText: React.FC<{
  text: string;
  style?: React.CSSProperties;
}> = ({ text, style }) => {
  const frame = useCurrentFrame();
  const glitchActive = frame % 60 < 6;

  const offset1 = glitchActive ? Math.sin(frame * 0.8) * 4 : 0;
  const offset2 = glitchActive ? Math.cos(frame * 0.8) * 3 : 0;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* 底层 - 蓝色偏移 */}
      <div
        style={{
          ...style,
          position: "absolute",
          color: colors.neonBlue,
          transform: `translate(${offset1}px, 0)`,
          opacity: glitchActive ? 0.8 : 0,
        }}
      >
        {text}
      </div>
      {/* 中层 - 粉色偏移 */}
      <div
        style={{
          ...style,
          position: "absolute",
          color: colors.neonPink,
          transform: `translate(${offset2}px, 0)`,
          opacity: glitchActive ? 0.8 : 0,
        }}
      >
        {text}
      </div>
      {/* 主文字 */}
      <div style={style}>{text}</div>
    </div>
  );
};

// ===== 霓虹灯管边框 =====
const NeonFrame: React.FC<{
  frame: number;
}> = ({ frame }) => {
  const flicker = 0.95 + Math.sin(frame * 0.15) * 0.05;

  return (
    <>
      {/* 顶部灯管 */}
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 30,
          right: 30,
          height: 4,
          background: colors.neonPink,
          boxShadow: `
            0 0 10px ${colors.neonPink},
            0 0 20px ${colors.neonPink},
            0 0 40px ${colors.neonPink},
            0 0 80px ${colors.neonPink}80
          `,
          opacity: flicker,
          borderRadius: 2,
        }}
      />
      {/* 底部灯管 */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: 30,
          right: 30,
          height: 4,
          background: colors.neonBlue,
          boxShadow: `
            0 0 10px ${colors.neonBlue},
            0 0 20px ${colors.neonBlue},
            0 0 40px ${colors.neonBlue},
            0 0 80px ${colors.neonBlue}80
          `,
          opacity: flicker * 0.9,
          borderRadius: 2,
        }}
      />
      {/* 左侧灯管 */}
      <div
        style={{
          position: "absolute",
          left: 30,
          top: 30,
          bottom: 30,
          width: 4,
          background: colors.neonPurple,
          boxShadow: `
            0 0 10px ${colors.neonPurple},
            0 0 20px ${colors.neonPurple},
            0 0 40px ${colors.neonPurple}80
          `,
          opacity: flicker * 0.95,
          borderRadius: 2,
        }}
      />
      {/* 右侧灯管 */}
      <div
        style={{
          position: "absolute",
          right: 30,
          top: 30,
          bottom: 30,
          width: 4,
          background: colors.neonGreen,
          boxShadow: `
            0 0 10px ${colors.neonGreen},
            0 0 20px ${colors.neonGreen},
            0 0 40px ${colors.neonGreen}80
          `,
          opacity: flicker * 0.85,
          borderRadius: 2,
        }}
      />
      {/* 角落装饰 */}
      {[
        { top: 20, left: 20 },
        { top: 20, right: 20 },
        { bottom: 20, left: 20 },
        { bottom: 20, right: 20 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            width: 30,
            height: 30,
            border: `3px solid ${[colors.neonPink, colors.neonBlue, colors.neonPurple, colors.neonGreen][i]}`,
            boxShadow: `0 0 15px ${[colors.neonPink, colors.neonBlue, colors.neonPurple, colors.neonGreen][i]}`,
            opacity: flicker,
          }}
        />
      ))}
    </>
  );
};

// ===== 扫描线效果 =====
const ScanLines: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.1) 2px,
          rgba(0,0,0,0.1) 4px
        )`,
        pointerEvents: "none",
      }}
    />
  );
};

// ===== 水平扫描线 =====
const HScanLine: React.FC<{ frame: number }> = ({ frame }) => {
  const y = (frame * 12) % 1920;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: y,
        width: "100%",
        height: 3,
        background: `linear-gradient(90deg, transparent, ${colors.neonBlue}, ${colors.neonPink}, transparent)`,
        boxShadow: `0 0 20px ${colors.neonBlue}, 0 0 40px ${colors.neonPink}`,
        opacity: 0.4,
      }}
    />
  );
};

// ===== 城市天际线 =====
const CitySkyline: React.FC<{ frame: number }> = ({ frame }) => {
  const buildings = [];
  for (let i = 0; i < 20; i++) {
    const width = 40 + random(`b${i}`) * 60;
    const height = 150 + random(`h${i}`) * 400;
    const x = i * 55;
    const windows = [];

    // 窗户
    for (let w = 0; w < Math.floor(height / 30); w++) {
      for (let w2 = 0; w2 < 2; w2++) {
        const lit = random(`w${i}${w}${w2}`) > 0.3;
        if (lit) {
          windows.push(
            <div
              key={`${i}-${w}-${w2}`}
              style={{
                position: "absolute",
                left: 8 + w2 * 18,
                top: 10 + w * 25,
                width: 10,
                height: 15,
                background: random(`wc${i}${w}${w2}`) > 0.5
                  ? `${colors.neonPink}60`
                  : `${colors.neonBlue}60`,
                opacity: 0.6 + Math.sin(frame * 0.1 + i + w) * 0.2,
              }}
            />
          );
        }
      }
    }

    buildings.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          bottom: 0,
          width,
          height,
          background: `linear-gradient(180deg, #1a0a25, #0a0010)`,
          border: `1px solid ${colors.neonPurple}20`,
        }}
      >
        {windows}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 500,
        opacity: 0.4,
        overflow: "hidden",
      }}
    >
      {buildings}
    </div>
  );
};

// ===== 浮动霓虹符号 =====
const FloatingSymbols: React.FC<{ frame: number }> = ({ frame }) => {
  const symbols = ["◆", "◇", "○", "□", "△", "☆", "〒", "目", "品"];
  const items = [];

  for (let i = 0; i < 12; i++) {
    const x = random(`sx${i}`) * 1000;
    const y = random(`sy${i}`) * 1800;
    const size = 16 + random(`ss${i}`) * 24;
    const colorSet = [colors.neonPink, colors.neonBlue, colors.neonPurple, colors.neonGreen];
    const color = colorSet[Math.floor(random(`sc${i}`) * 4)];
    const floatY = Math.sin(frame * 0.02 + i) * 20;
    const floatX = Math.cos(frame * 0.015 + i) * 10;

    items.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: x + floatX,
          top: y + floatY,
          fontSize: size,
          color,
          textShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
          opacity: 0.3 + Math.sin(frame * 0.05 + i) * 0.15,
        }}
      >
        {symbols[Math.floor(random(`sm${i}`) * symbols.length)]}
      </div>
    );
  }

  return <>{items}</>;
};

// ===== 单个幻灯片组件 =====
export const NeonSlide: React.FC<{
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

  return (
    <AbsoluteFill
      style={{
        background: colors.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Orbitron', 'PingFang SC', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 网格背景 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${colors.neonPink}08 1px, transparent 1px),
            linear-gradient(90deg, ${colors.neonBlue}08 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          perspective: 500,
        }}
      />

      {/* 城市天际线 */}
      <CitySkyline frame={frame} />

      {/* 浮动符号 */}
      <FloatingSymbols frame={frame} />

      {/* 扫描线 */}
      <ScanLines />
      <HScanLine frame={frame} />

      {/* 霓虹灯管边框 */}
      <NeonFrame frame={frame} />

      {/* 主内容区 */}
      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "80px 60px",
          zIndex: 10,
        }}
      >
        {/* 页码装饰 */}
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 60,
            display: "flex",
            alignItems: "center",
            gap: 15,
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: colors.neonPink,
              textShadow: `0 0 10px ${colors.neonPink}, 0 0 20px ${colors.neonPink}`,
              fontWeight: 700,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </div>
          <div
            style={{
              width: 40,
              height: 2,
              background: colors.neonBlue,
              boxShadow: `0 0 10px ${colors.neonBlue}`,
            }}
          />
          <div
            style={{
              fontSize: 28,
              color: colors.neonBlue,
              textShadow: `0 0 10px ${colors.neonBlue}`,
              fontWeight: 300,
            }}
          >
            {String(totalSlides).padStart(2, "0")}
          </div>
        </div>

        {/* 日文装饰 */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 60,
            fontSize: 16,
            color: colors.neonPurple,
            textShadow: `0 0 10px ${colors.neonPurple}`,
            letterSpacing: 4,
            opacity: 0.6,
            writingMode: "vertical-rl",
          }}
        >
          ネオン・シティ
        </div>

        {/* 标题 - 带故障效果 */}
        <div style={{ marginBottom: 20 }}>
          <GlitchText
            text={title}
            style={{
              fontSize: 76,
              fontWeight: 900,
              color: colors.text,
              textAlign: "center",
              letterSpacing: 4,
              textShadow: `
                0 0 10px ${colors.neonPink},
                0 0 20px ${colors.neonPink},
                0 0 40px ${colors.neonPink}80
              `,
              transform: `translateY(${interpolate(titleProgress, [0, 1], [60, 0])}px)`,
              opacity: titleProgress,
            }}
          />
        </div>

        {/* 霓虹分割线 */}
        <div
          style={{
            width: interpolate(titleProgress, [0, 1], [0, 300]),
            height: 3,
            background: `linear-gradient(90deg, ${colors.neonPink}, ${colors.neonBlue}, ${colors.neonPurple})`,
            boxShadow: `
              0 0 10px ${colors.neonPink},
              0 0 20px ${colors.neonBlue}
            `,
            marginBottom: 24,
          }}
        />

        {/* 副标题 */}
        {subtitle && (
          <p
            style={{
              fontSize: 34,
              color: colors.muted,
              textAlign: "center",
              margin: 0,
              marginBottom: 50,
              transform: `translateY(${interpolate(subtitleProgress, [0, 1], [30, 0])}px)`,
              opacity: subtitleProgress,
              letterSpacing: 2,
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
              maxWidth: 800,
            }}
          >
            {points.map((point, i) => {
              const progress = pointProgresses[i] || 0;
              const pointColors = [colors.neonPink, colors.neonBlue, colors.neonPurple, colors.neonGreen];
              const pointColor = pointColors[i % pointColors.length];

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    padding: "20px 28px",
                    background: `${pointColor}10`,
                    borderLeft: `4px solid ${pointColor}`,
                    boxShadow: `0 0 20px ${pointColor}20`,
                    transform: `translateX(${interpolate(progress, [0, 1], [-80, 0])}px)`,
                    opacity: progress,
                  }}
                >
                  {/* 序号 */}
                  <div
                    style={{
                      minWidth: 44,
                      height: 44,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: 20,
                      fontWeight: 700,
                      color: pointColor,
                      textShadow: `0 0 10px ${pointColor}`,
                      border: `2px solid ${pointColor}`,
                      boxShadow: `0 0 15px ${pointColor}60`,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  {/* 文字 */}
                  <span
                    style={{
                      fontSize: 28,
                      color: colors.text,
                      fontWeight: 500,
                      letterSpacing: 1,
                    }}
                  >
                    {point}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* 底部进度条 */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 60,
            right: 60,
            height: 4,
            background: `${colors.neonPurple}20`,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${((index + 1) / totalSlides) * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${colors.neonPink}, ${colors.neonBlue})`,
              boxShadow: `0 0 10px ${colors.neonBlue}`,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
