import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";

const colors = {
  ink: "#17181c",
  muted: "#5f6470",
  blob1: "#ff7ca8",
  blob2: "#7b7dff",
  blob3: "#1ed7b2",
  blob4: "#ffb366",
};

export const LiquidWideSlide: React.FC<{
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
    config: { damping: 16, stiffness: 90 },
  });
  const subtitleProgress = spring({
    frame: frame - timing.subtitleStart,
    fps,
    config: { damping: 16, stiffness: 88 },
  });
  const pointProgresses = (points || []).map((_, i) =>
    spring({
      frame: frame - timing.pointsStart - i * timing.pointStagger,
      fps,
      config: { damping: 14, stiffness: 92 },
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
          "linear-gradient(180deg, #f4f5f8 0%, #e9ecf2 48%, #dde2ea 100%)",
        fontFamily: "'SF Pro Display', 'PingFang SC', sans-serif",
        overflow: "hidden",
      }}
    >
      {[
        { left: -120, top: -80, size: 480, color: colors.blob1 },
        { left: 1420, top: -60, size: 420, color: colors.blob2 },
        { left: 1240, top: 720, size: 520, color: colors.blob3 },
        { left: 120, top: 760, size: 420, color: colors.blob4 },
      ].map((blob, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: blob.left + Math.sin(frame * 0.01 + i) * 28,
            top: blob.top + Math.cos(frame * 0.012 + i) * 24,
            width: blob.size,
            height: blob.size,
            borderRadius: `${42 + i * 8}% ${58 - i * 6}% ${48 + i * 5}% ${52 - i * 7}%`,
            background: blob.color,
            filter: "blur(90px)",
            opacity: 0.34,
          }}
        />
      ))}

      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          padding: "56px 72px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 26,
          }}
        >
          <div
            style={{
              padding: "12px 18px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.54)",
              backdropFilter: "blur(22px)",
              border: "1px solid rgba(255,255,255,0.68)",
              color: colors.ink,
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "0.16em",
            }}
          >
            LIQUID WIDE
          </div>
          <div
            style={{
              padding: "12px 18px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.48)",
              backdropFilter: "blur(22px)",
              border: "1px solid rgba(255,255,255,0.72)",
              color: colors.muted,
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {String(index + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1.08fr 0.92fr",
            gap: 26,
          }}
        >
          <div
            style={{
              borderRadius: 40,
              background: "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.38))",
              backdropFilter: "blur(52px)",
              border: "1px solid rgba(255,255,255,0.68)",
              boxShadow:
                "0 28px 60px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.92)",
              padding: "42px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  gap: 10,
                  marginBottom: 22,
                }}
              >
                {[colors.blob1, colors.blob2, colors.blob3].map((color, i) => (
                  <div
                    key={i}
                    style={{
                      width: i === 1 ? 68 : 32,
                      height: 16,
                      borderRadius: 999,
                      background: color,
                      opacity: 0.8,
                    }}
                  />
                ))}
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 90,
                  lineHeight: 1.02,
                  letterSpacing: "-0.055em",
                  color: colors.ink,
                  fontWeight: 860,
                  opacity: titleProgress,
                  transform: `translateY(${interpolate(titleProgress, [0, 1], [40, 0])}px)`,
                }}
              >
                {title}
              </h1>
              {subtitle ? (
                <p
                  style={{
                    margin: "24px 0 0",
                    fontSize: 31,
                    lineHeight: 1.52,
                    color: colors.muted,
                    maxWidth: 700,
                    opacity: subtitleProgress,
                    transform: `translateY(${interpolate(subtitleProgress, [0, 1], [22, 0])}px)`,
                  }}
                >
                  {subtitle}
                </p>
              ) : null}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
                marginTop: 24,
              }}
            >
              {["Flow", "Depth", "Motion"].map((label, i) => (
                <div
                  key={label}
                  style={{
                    borderRadius: 24,
                    padding: "18px 18px",
                    background: "rgba(255,255,255,0.46)",
                    border: "1px solid rgba(255,255,255,0.68)",
                    color: [colors.blob1, colors.blob2, colors.blob3][i],
                    fontSize: 20,
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            {(points || []).map((point, i) => {
              const progress = pointProgresses[i] || 0;
              const color = [colors.blob1, colors.blob2, colors.blob3, colors.blob4][i % 4];
              return (
                <div
                  key={i}
                  style={{
                    borderRadius: 30,
                    padding: "22px 22px",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.4))",
                    backdropFilter: "blur(40px)",
                    border: `1px solid ${color}36`,
                    boxShadow: "0 24px 40px rgba(0,0,0,0.06)",
                    opacity: progress,
                    transform: `translateX(${interpolate(progress, [0, 1], [52, 0])}px)`,
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
                      borderRadius: 999,
                      background: `${color}24`,
                      color,
                      fontSize: 16,
                      fontWeight: 900,
                      marginBottom: 14,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: 30, lineHeight: 1.44, color: colors.ink, fontWeight: 560 }}>
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
