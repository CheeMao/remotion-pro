import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";

const colors = {
  bg: "#0a0010",
  neonPink: "#ff2d95",
  neonBlue: "#00f0ff",
  neonPurple: "#bf00ff",
  neonGreen: "#39ff14",
  neonOrange: "#ff6600",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.72)",
};

const FloatingSymbols: React.FC<{ frame: number }> = ({ frame }) => {
  const symbols = ["+", "[]", "<>", "*", "//", "01", "><", "++"];
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => {
        const x = random(`sx${i}`) * 980;
        const y = random(`sy${i}`) * 1680;
        const size = 18 + random(`ss${i}`) * 24;
        const palette = [colors.neonPink, colors.neonBlue, colors.neonPurple, colors.neonGreen];
        const color = palette[Math.floor(random(`sc${i}`) * palette.length)];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(frame * 0.02 + i) * 14,
              top: y + Math.sin(frame * 0.025 + i) * 18,
              fontSize: size,
              color,
              textShadow: `0 0 12px ${color}, 0 0 22px ${color}`,
              opacity: 0.28 + Math.sin(frame * 0.04 + i) * 0.1,
            }}
          >
            {symbols[Math.floor(random(`sm${i}`) * symbols.length)]}
          </div>
        );
      })}
    </>
  );
};

const NeonFrame: React.FC<{ frame: number }> = ({ frame }) => {
  const flicker = 0.92 + Math.sin(frame * 0.14) * 0.05;
  const rails = [
    { top: 28, left: 28, right: 28, height: 4, color: colors.neonPink },
    { bottom: 28, left: 28, right: 28, height: 4, color: colors.neonBlue },
  ];

  return (
    <>
      {rails.map((rail, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...rail,
            background: rail.color,
            borderRadius: 999,
            opacity: flicker,
            boxShadow: `0 0 12px ${rail.color}, 0 0 34px ${rail.color}aa`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 28,
          bottom: 28,
          width: 4,
          borderRadius: 999,
          background: colors.neonPurple,
          opacity: flicker,
          boxShadow: `0 0 12px ${colors.neonPurple}, 0 0 30px ${colors.neonPurple}aa`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 28,
          top: 28,
          bottom: 28,
          width: 4,
          borderRadius: 999,
          background: colors.neonGreen,
          opacity: flicker,
          boxShadow: `0 0 12px ${colors.neonGreen}, 0 0 30px ${colors.neonGreen}aa`,
        }}
      />
    </>
  );
};

type PointLayout = "stack" | "grid" | "bands";

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
  const variant = index % 3;
  const hasPoints = Boolean(points && points.length > 0);

  const titleProgress = spring({
    frame: frame - timing.titleStart,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const subtitleProgress = spring({
    frame: frame - timing.subtitleStart,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const pointProgresses = (points || []).map((_, i) =>
    spring({
      frame: frame - timing.pointsStart - i * timing.pointStagger,
      fps,
      config: { damping: 10, stiffness: 100 },
    })
  );

  const exitOpacity = interpolate(
    frame,
    [timing.exitStart, timing.exitEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const renderPoints = (layout: PointLayout) => {
    if (!hasPoints) {
      return null;
    }

    if (layout === "grid") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {points!.map((point, i) => {
            const progress = pointProgresses[i] || 0;
            const palette = [colors.neonPink, colors.neonBlue, colors.neonPurple, colors.neonGreen, colors.neonOrange];
            const pointColor = palette[i % palette.length];

            return (
              <div
                key={i}
                style={{
                  padding: "18px 20px 20px",
                  background: `linear-gradient(135deg, ${pointColor}10, rgba(255,255,255,0.02))`,
                  border: `1px solid ${pointColor}32`,
                  borderRadius: 24,
                  boxShadow: `0 0 28px ${pointColor}18`,
                  opacity: progress,
                  transform: `translateY(${interpolate(progress, [0, 1], [46, 0])}px)`,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 72,
                    height: 42,
                    padding: "0 14px",
                    borderRadius: 16,
                    border: `2px solid ${pointColor}`,
                    color: pointColor,
                    fontSize: 16,
                    fontWeight: 900,
                    textShadow: `0 0 10px ${pointColor}`,
                    boxShadow: `0 0 16px ${pointColor}55`,
                    marginBottom: 14,
                  }}
                >
                  Z{String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ fontSize: 26, color: colors.text, lineHeight: 1.42, letterSpacing: "0.02em" }}>
                  {point}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (layout === "bands") {
      return (
        <div style={{ display: "grid", gap: 14 }}>
          {points!.map((point, i) => {
            const progress = pointProgresses[i] || 0;
            const palette = [colors.neonPink, colors.neonBlue, colors.neonPurple, colors.neonGreen, colors.neonOrange];
            const pointColor = palette[i % palette.length];

            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "110px 1fr 90px",
                  gap: 16,
                  alignItems: "center",
                  padding: "16px 18px",
                  background: `linear-gradient(90deg, ${pointColor}16, rgba(255,255,255,0.03), transparent)`,
                  border: `1px solid ${pointColor}2a`,
                  borderRadius: 24,
                  boxShadow: `0 0 28px ${pointColor}18`,
                  opacity: progress,
                  transform: `translateX(${interpolate(progress, [0, 1], [70, 0])}px)`,
                }}
              >
                <div
                  style={{
                    height: 54,
                    borderRadius: 18,
                    background: `${pointColor}10`,
                    border: `2px solid ${pointColor}`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: pointColor,
                    fontWeight: 900,
                    fontSize: 18,
                    textShadow: `0 0 10px ${pointColor}`,
                  }}
                >
                  CH-{String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ fontSize: 27, color: colors.text, lineHeight: 1.4, letterSpacing: "0.02em" }}>
                  {point}
                </div>
                <div
                  style={{
                    justifySelf: "end",
                    width: 66,
                    height: 8,
                    borderRadius: 999,
                    background: pointColor,
                    boxShadow: `0 0 12px ${pointColor}`,
                  }}
                />
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div style={{ display: "grid", gap: 16 }}>
        {points!.map((point, i) => {
          const progress = pointProgresses[i] || 0;
          const palette = [colors.neonPink, colors.neonBlue, colors.neonPurple, colors.neonGreen, colors.neonOrange];
          const pointColor = palette[i % palette.length];

          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "74px 1fr",
                gap: 16,
                alignItems: "center",
                padding: "18px 20px",
                background: `linear-gradient(135deg, ${pointColor}10, rgba(255,255,255,0.02))`,
                borderLeft: `4px solid ${pointColor}`,
                borderRadius: 22,
                boxShadow: `0 0 28px ${pointColor}18`,
                opacity: progress,
                transform: `translateX(${interpolate(progress, [0, 1], [-70, 0])}px)`,
              }}
            >
              <div
                style={{
                  height: 56,
                  borderRadius: 18,
                  border: `2px solid ${pointColor}`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: 20,
                  fontWeight: 900,
                  color: pointColor,
                  textShadow: `0 0 10px ${pointColor}`,
                  boxShadow: `0 0 16px ${pointColor}55`,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ fontSize: 28, color: colors.text, lineHeight: 1.42, letterSpacing: "0.02em" }}>
                {point}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${colors.neonPink}08 1px, transparent 1px),
            linear-gradient(90deg, ${colors.neonBlue}08 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 24%, rgba(255,45,149,0.2) 0%, transparent 30%), radial-gradient(circle at 80% 20%, rgba(0,240,255,0.18) 0%, transparent 26%), radial-gradient(circle at 54% 72%, rgba(191,0,255,0.18) 0%, transparent 28%)",
        }}
      />

      <FloatingSymbols frame={frame} />
      <NeonFrame frame={frame} />

      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "72px 58px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 56,
            left: 60,
            color: colors.neonPurple,
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "0.22em",
            textShadow: `0 0 12px ${colors.neonPurple}`,
          }}
        >
          NEON SIGNAL
        </div>
        <div
          style={{
            position: "absolute",
            top: 54,
            right: 60,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: colors.text,
          }}
        >
          <span style={{ fontSize: 28, color: colors.neonPink, textShadow: `0 0 12px ${colors.neonPink}` }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <div style={{ width: 38, height: 2, background: colors.neonBlue, boxShadow: `0 0 12px ${colors.neonBlue}` }} />
          <span style={{ fontSize: 28, color: colors.neonBlue, textShadow: `0 0 12px ${colors.neonBlue}` }}>
            {String(totalSlides).padStart(2, "0")}
          </span>
        </div>

        <div
          style={{
            width: variant === 2 ? "90%" : "88%",
            maxWidth: 920,
            padding: variant === 1 ? "46px 38px 40px" : "50px 42px 42px",
            borderRadius: 34,
            background: "linear-gradient(180deg, rgba(12,10,24,0.78) 0%, rgba(9,6,18,0.9) 100%)",
            border: `1px solid ${colors.neonBlue}22`,
            boxShadow: `0 0 0 1px rgba(255,255,255,0.03), 0 0 60px rgba(0,240,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 76,
              fontWeight: 900,
              color: colors.text,
              lineHeight: 1.02,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              textShadow: `0 0 12px ${colors.neonPink}, 0 0 26px ${colors.neonPink}66`,
              opacity: titleProgress,
              transform: `translateY(${interpolate(titleProgress, [0, 1], [54, 0])}px)`,
            }}
          >
            {title}
          </h1>

          {variant === 1 ? (
            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
                maxWidth: 620,
              }}
            >
              {[colors.neonPink, colors.neonBlue, colors.neonPurple].map((color, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 18,
                    border: `1px solid ${color}55`,
                    color,
                    fontSize: 15,
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    textAlign: "center",
                    boxShadow: `0 0 18px ${color}28 inset`,
                  }}
                >
                  {i === 0 ? "PULSE" : i === 1 ? "SIGNAL" : "WAVE"}
                </div>
              ))}
            </div>
          ) : null}

          <div
            style={{
              width: interpolate(titleProgress, [0, 1], [0, 280]),
              height: 3,
              marginTop: 20,
              borderRadius: 999,
              background: `linear-gradient(90deg, ${colors.neonPink}, ${colors.neonBlue}, ${colors.neonPurple})`,
              boxShadow: `0 0 14px ${colors.neonBlue}, 0 0 24px ${colors.neonPink}`,
            }}
          />

          {subtitle ? (
            <p
              style={{
                margin: "24px 0 34px",
                fontSize: 30,
                color: colors.muted,
                lineHeight: 1.48,
                maxWidth: 720,
                opacity: subtitleProgress,
                transform: `translateY(${interpolate(subtitleProgress, [0, 1], [22, 0])}px)`,
              }}
            >
              {subtitle}
            </p>
          ) : null}

          {renderPoints(variant === 1 ? "grid" : variant === 2 ? "bands" : "stack")}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 60,
            right: 60,
            height: 4,
            borderRadius: 999,
            background: `${colors.neonPurple}20`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${((index + 1) / totalSlides) * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${colors.neonPink}, ${colors.neonBlue})`,
              boxShadow: `0 0 14px ${colors.neonBlue}`,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
