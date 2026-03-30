import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";

const colors = {
  bg: "#071120",
  primary: "#72d6ff",
  secondary: "#a67cff",
  accent: "#23d5ab",
  warm: "#ffb66d",
  text: "#f7fbff",
  muted: "rgba(227,238,248,0.72)",
};

export const GlassWideSlide: React.FC<{
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

  const titleProgress = spring({
    frame: frame - timing.titleStart,
    fps,
    config: { damping: 14, stiffness: 92 },
  });
  const subtitleProgress = spring({
    frame: frame - timing.subtitleStart,
    fps,
    config: { damping: 15, stiffness: 88 },
  });
  const pointProgresses = (points || []).map((_, i) =>
    spring({
      frame: frame - timing.pointsStart - i * timing.pointStagger,
      fps,
      config: { damping: 14, stiffness: 96 },
    })
  );

  const exitOpacity = interpolate(
    frame,
    [timing.exitStart, timing.exitEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 14% 20%, rgba(114,214,255,0.18) 0%, transparent 30%), radial-gradient(circle at 82% 18%, rgba(166,124,255,0.18) 0%, transparent 30%), linear-gradient(160deg, #06101d 0%, #0b1730 50%, #0b1f26 100%)",
        fontFamily: "'SF Pro Display', 'PingFang SC', sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -140,
          top: 720,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "rgba(114,214,255,0.18)",
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -120,
          top: -140,
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: "rgba(166,124,255,0.18)",
          filter: "blur(90px)",
        }}
      />

      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          padding: "56px 72px",
          display: "flex",
          flexDirection: "column",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <div
            style={{
              padding: "12px 20px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: colors.text,
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "0.16em",
            }}
          >
            GLASS WIDE
          </div>
          <div
            style={{
              padding: "12px 18px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: colors.muted,
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            <span style={{ color: colors.primary }}>{String(index + 1).padStart(2, "0")}</span>
            <span> / </span>
            <span>{String(totalSlides).padStart(2, "0")}</span>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            borderRadius: 42,
            background: "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))",
            backdropFilter: "blur(36px)",
            border: "1px solid rgba(255,255,255,0.28)",
            boxShadow:
              "0 30px 70px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.36)",
            padding: "42px 42px 34px",
            display: "grid",
            gridTemplateColumns: "0.95fr 1.05fr",
            gap: 28,
          }}
        >
          <div
            style={{
              borderRadius: 34,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.18)",
              padding: "30px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 28,
                  marginBottom: 24,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.36), rgba(255,255,255,0.12))",
                  border: "1px solid rgba(255,255,255,0.28)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
                }}
              />
              <h1
                style={{
                  margin: 0,
                  fontSize: 88,
                  lineHeight: 1.02,
                  letterSpacing: "-0.05em",
                  color: colors.text,
                  fontWeight: 860,
                  opacity: titleProgress,
                  transform: `translateY(${interpolate(titleProgress, [0, 1], [44, 0])}px)`,
                }}
              >
                {title}
              </h1>
              {subtitle ? (
                <p
                  style={{
                    margin: "22px 0 0",
                    fontSize: 30,
                    lineHeight: 1.5,
                    color: colors.muted,
                    maxWidth: 620,
                    opacity: subtitleProgress,
                    transform: `translateY(${interpolate(subtitleProgress, [0, 1], [24, 0])}px)`,
                  }}
                >
                  {subtitle}
                </p>
              ) : null}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              {[colors.primary, colors.secondary, colors.accent].map((color, i) => (
                <div
                  key={i}
                  style={{
                    width: i === 1 ? 120 : 72,
                    height: 12,
                    borderRadius: 999,
                    background: color,
                    opacity: 0.7,
                    boxShadow: `0 0 14px ${color}55`,
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            {(points || []).map((point, i) => {
              const progress = pointProgresses[i] || 0;
              const color = [colors.primary, colors.secondary, colors.accent, colors.warm][i % 4];
              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "96px 1fr",
                    gap: 16,
                    alignItems: "center",
                    borderRadius: 26,
                    padding: "18px 20px",
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid ${color}22`,
                    opacity: progress,
                    transform: `translateX(${interpolate(progress, [0, 1], [60, 0])}px)`,
                  }}
                >
                  <div
                    style={{
                      height: 64,
                      borderRadius: 20,
                      background: `${color}18`,
                      border: `1px solid ${color}26`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color,
                      fontSize: 22,
                      fontWeight: 900,
                      letterSpacing: "0.12em",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: 30, lineHeight: 1.42, color: colors.text, fontWeight: 520 }}>
                    {point}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
