import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";

const colors = {
  bg: "#e8edf4",
  panel: "#edf2f8",
  ink: "#162033",
  muted: "#5d6b7f",
  shadowDark: "#c8ced8",
  shadowLight: "#ffffff",
  accents: ["#6b7cff", "#8b5cf6", "#14b8a6", "#ff8a57"],
};

const raised = (size = 16) => ({
  boxShadow: `${size}px ${size}px ${size * 2.2}px ${colors.shadowDark}, -${size}px -${size}px ${size * 2}px ${colors.shadowLight}`,
});

const inset = (size = 8) => ({
  boxShadow: `inset ${size}px ${size}px ${size * 1.8}px ${colors.shadowDark}, inset -${size}px -${size}px ${size * 1.8}px ${colors.shadowLight}`,
});

export const NeuWideSlide: React.FC<{
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
  const accent = colors.accents[index % colors.accents.length];

  const titleProgress = spring({
    frame: frame - timing.titleStart,
    fps,
    config: { damping: 15, stiffness: 90 },
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
        background: colors.bg,
        fontFamily: "system-ui, -apple-system, 'PingFang SC', sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -120,
          top: 720,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: colors.panel,
          ...raised(18),
          opacity: 0.85,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -140,
          top: -120,
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: colors.panel,
          ...raised(18),
          opacity: 0.82,
        }}
      />

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
            marginBottom: 30,
          }}
        >
          <div
            style={{
              padding: "14px 22px",
              borderRadius: 999,
              background: colors.panel,
              ...raised(8),
              color: colors.muted,
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "0.16em",
            }}
          >
            NEU WIDE
          </div>
          <div
            style={{
              padding: "14px 20px",
              borderRadius: 20,
              background: colors.panel,
              ...raised(8),
              color: colors.muted,
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            <span style={{ color: accent, fontWeight: 900 }}>{String(index + 1).padStart(2, "0")}</span>
            <span> / </span>
            <span>{String(totalSlides).padStart(2, "0")}</span>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            borderRadius: 42,
            background: colors.panel,
            ...raised(18),
            padding: "38px 38px 32px",
            display: "grid",
            gridTemplateColumns: "0.92fr 1.08fr",
            gap: 26,
          }}
        >
          <div
            style={{
              borderRadius: 34,
              background: colors.panel,
              ...inset(8),
              padding: "28px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  width: 98,
                  height: 98,
                  borderRadius: 28,
                  background: colors.panel,
                  ...raised(10),
                  marginBottom: 24,
                }}
              />
              <h1
                style={{
                  margin: 0,
                  fontSize: 86,
                  lineHeight: 1.02,
                  letterSpacing: "-0.055em",
                  color: colors.ink,
                  fontWeight: 900,
                  opacity: titleProgress,
                  transform: `translateY(${interpolate(titleProgress, [0, 1], [42, 0])}px)`,
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
                    opacity: subtitleProgress,
                    transform: `translateY(${interpolate(subtitleProgress, [0, 1], [20, 0])}px)`,
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
                gap: 12,
                marginTop: 24,
              }}
            >
              {[0, 1, 2].map((slot) => (
                <div
                  key={slot}
                  style={{
                    height: slot === 1 ? 74 : 56,
                    borderRadius: 20,
                    background: colors.panel,
                    ...(slot === 1 ? inset(6) : raised(6)),
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            {(points || []).map((point, i) => {
              const progress = pointProgresses[i] || 0;
              const pointAccent = colors.accents[(index + i) % colors.accents.length];
              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "104px 1fr",
                    gap: 18,
                    alignItems: "center",
                    padding: "16px",
                    borderRadius: 28,
                    background: colors.panel,
                    ...raised(10),
                    opacity: progress,
                    transform: `translateX(${interpolate(progress, [0, 1], [56, 0])}px)`,
                  }}
                >
                  <div
                    style={{
                      height: 72,
                      borderRadius: 22,
                      background: colors.panel,
                      ...inset(6),
                      color: pointAccent,
                      fontSize: 24,
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: 30, lineHeight: 1.42, color: colors.ink, fontWeight: 650 }}>
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
