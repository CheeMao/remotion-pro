import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";

export const Slide: React.FC<{
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

  const colors = {
    primary: "#00f0ff",
    secondary: "#7c3aed",
    accent: "#06ffa5",
    pink: "#ff2e97",
  };

  const glowMove = Math.sin(frame * 0.02) * 50;
  const titleProgress = spring({
    frame: frame - timing.titleStart,
    fps,
    config: { damping: 12, stiffness: 120 },
  });
  const titleY = interpolate(titleProgress, [0, 1], [80, 0]);
  const titleScale = interpolate(titleProgress, [0, 1], [0.94, 1]);

  const subtitleProgress = spring({
    frame: frame - timing.subtitleStart,
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const subtitleY = interpolate(subtitleProgress, [0, 1], [40, 0]);

  const lineProgress = spring({
    frame: frame - timing.lineStart,
    fps,
    config: { damping: 12 },
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

  const numberPulse = Math.sin(frame * 0.15) * 0.04 + 1;

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
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: `translateX(-50%) translateX(${glowMove}px)`,
          width: 900,
          height: 900,
          background: `radial-gradient(ellipse, ${colors.primary}18 0%, transparent 60%)`,
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
          background: `radial-gradient(ellipse, ${colors.pink}12 0%, transparent 60%)`,
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "-10%",
          width: 500,
          height: 500,
          background: `radial-gradient(ellipse, ${colors.secondary}14 0%, transparent 60%)`,
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${colors.primary}06 1px, transparent 1px),
            linear-gradient(90deg, ${colors.primary}06 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          opacity: 0.55,
        }}
      />

      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "88px 64px 118px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 900,
            maxWidth: "100%",
            minHeight: 1320,
            padding: "34px 42px 40px",
            borderRadius: 36,
            background: "linear-gradient(180deg, rgba(7,10,26,0.76), rgba(9,16,35,0.56))",
            border: `1px solid ${colors.primary}22`,
            boxShadow: "0 24px 70px rgba(0,0,0,0.32)",
            display: "flex",
            flexDirection: "column",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 34,
            }}
          >
            <div
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: `1px solid ${colors.primary}50`,
                background: "rgba(0, 240, 255, 0.08)",
                color: "rgba(255,255,255,0.82)",
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "0.8px",
              }}
            >
              SCENE
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  color: colors.primary,
                  textShadow: `0 0 24px ${colors.primary}70`,
                  transform: `scale(${numberPulse})`,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontSize: 20,
                  color: "rgba(255,255,255,0.42)",
                  fontWeight: 500,
                }}
              >
                / {String(totalSlides).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: subtitle ? 32 : 40 }}>
            <h1
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: "#ffffff",
                textAlign: "left",
                margin: 0,
                marginBottom: 18,
                transform: `translateY(${titleY}px) scale(${titleScale})`,
                opacity: titleProgress,
                textShadow: `
                  0 0 42px ${colors.primary}40,
                  0 4px 24px rgba(0,0,0,0.45)
                `,
                letterSpacing: "-1.5px",
                lineHeight: 1.08,
                maxWidth: 760,
              }}
            >
              {title}
            </h1>

            <div
              style={{
                width: interpolate(lineProgress, [0, 1], [0, 220]),
                height: 3,
                background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent}, transparent)`,
                borderRadius: 2,
                marginBottom: subtitle ? 18 : 0,
                boxShadow: `0 0 24px ${colors.primary}60`,
              }}
            />

            {subtitle && (
              <p
                style={{
                  fontSize: 30,
                  color: "rgba(255,255,255,0.82)",
                  textAlign: "left",
                  margin: 0,
                  transform: `translateY(${subtitleY}px)`,
                  opacity: subtitleProgress,
                  fontWeight: 400,
                  maxWidth: 740,
                  lineHeight: 1.4,
                  letterSpacing: "0.2px",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            {points && points.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 24,
                  width: "100%",
                }}
              >
                {points.map((point, i) => {
                  const progress = pointProgresses[i] || 0;
                  const pointX = interpolate(progress, [0, 1], [-100, 0]);
                  const pointGlow =
                    i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.accent : colors.pink;

                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 24,
                        transform: `translateX(${pointX}px)`,
                        opacity: progress,
                        padding: "22px 24px",
                        borderRadius: 24,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div
                        style={{
                          minWidth: 56,
                          height: 56,
                          borderRadius: 16,
                          background: `linear-gradient(135deg, ${pointGlow}28, ${pointGlow}10)`,
                          border: `1px solid ${pointGlow}66`,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: 24,
                          fontWeight: 700,
                          color: pointGlow,
                          boxShadow: `0 0 20px ${pointGlow}30`,
                        }}
                      >
                        {i + 1}
                      </div>
                      <span
                        style={{
                          fontSize: 31,
                          color: "#ffffff",
                          fontWeight: 500,
                          letterSpacing: "0.2px",
                          textShadow: "0 2px 16px rgba(0,0,0,0.35)",
                          lineHeight: 1.35,
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

          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            {[...Array(totalSlides)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === index ? 44 : 12,
                  height: 8,
                  borderRadius: 999,
                  background:
                    i === index
                      ? `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`
                      : "rgba(255,255,255,0.22)",
                  boxShadow: i === index ? `0 0 16px ${colors.primary}50` : "none",
                }}
              />
            ))}
          </div>
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          top: 30,
          left: 30,
          width: 60,
          height: 60,
          border: `2px solid ${colors.primary}32`,
          borderRight: "none",
          borderBottom: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 30,
          right: 30,
          width: 60,
          height: 60,
          border: `2px solid ${colors.accent}28`,
          borderLeft: "none",
          borderTop: "none",
        }}
      />
    </AbsoluteFill>
  );
};
