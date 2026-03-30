import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";

const colors = {
  bg: "#e9eef4",
  ink: "#152033",
  muted: "#566479",
  panel: "#edf2f8",
  shadowDark: "#c4cad3",
  shadowLight: "#ffffff",
  accents: ["#5b6cff", "#8b5cf6", "#ef5da8", "#15b8a6", "#ff8f52"],
};

const raisedShadow = (size = 18) => ({
  boxShadow: `${size}px ${size}px ${size * 2.6}px ${colors.shadowDark}, -${size}px -${size}px ${size * 2.4}px ${colors.shadowLight}`,
});

const insetShadow = (size = 10) => ({
  boxShadow: `inset ${size}px ${size}px ${size * 1.8}px ${colors.shadowDark}, inset -${size}px -${size}px ${size * 1.8}px ${colors.shadowLight}`,
});

type PointLayout = "stack" | "pill" | "split";

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
  const accent = colors.accents[index % colors.accents.length];
  const variant = index % 3;
  const hasPoints = Boolean(points && points.length > 0);

  const titleProgress = spring({
    frame: frame - timing.titleStart,
    fps,
    config: { damping: 15, stiffness: 84 },
  });

  const subtitleProgress = spring({
    frame: frame - timing.subtitleStart,
    fps,
    config: { damping: 15, stiffness: 84 },
  });

  const pointProgresses = (points || []).map((_, i) =>
    spring({
      frame: frame - timing.pointsStart - i * timing.pointStagger,
      fps,
      config: { damping: 14, stiffness: 88 },
    })
  );

  const exitOpacity = interpolate(
    frame,
    [timing.exitStart, timing.exitEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const decorativePulse = 1 + Math.sin(frame * 0.035) * 0.03;
  const titleOffset = interpolate(titleProgress, [0, 1], [42, 0]);
  const subtitleOffset = interpolate(subtitleProgress, [0, 1], [18, 0]);

  const renderPoints = (layout: PointLayout) => {
    if (!hasPoints) {
      return (
        <div
          style={{
            minHeight: 320,
            borderRadius: 34,
            background: colors.panel,
            ...insetShadow(8),
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: "0.14em",
            color: accent,
          }}
        >
          SOFT DEPTH
        </div>
      );
    }

    return points!.map((point, i) => {
      const progress = pointProgresses[i] || 0;
      const pointAccent = colors.accents[(index + i) % colors.accents.length];

      if (layout === "pill") {
        return (
          <div
            key={i}
            style={{
              padding: "26px 28px",
              borderRadius: 32,
              background: colors.panel,
              boxShadow:
                i % 2 === 0
                  ? `18px 18px 38px ${colors.shadowDark}, -16px -16px 34px ${colors.shadowLight}`
                  : `14px 14px 30px ${colors.shadowDark}, -14px -14px 28px ${colors.shadowLight}`,
              opacity: progress,
              transform: `translateY(${interpolate(progress, [0, 1], [42, 0])}px)`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  background: colors.panel,
                  ...insetShadow(6),
                  fontSize: 18,
                  fontWeight: 900,
                  color: pointAccent,
                  letterSpacing: "0.14em",
                }}
              >
                STEP {String(i + 1).padStart(2, "0")}
              </div>
              <div
                style={{
                  width: 72,
                  height: 12,
                  borderRadius: 999,
                  background: colors.panel,
                  ...insetShadow(6),
                }}
              />
            </div>
            <div
              style={{
                fontSize: 29,
                lineHeight: 1.38,
                color: colors.ink,
                fontWeight: 680,
                letterSpacing: "-0.01em",
              }}
            >
              {point}
            </div>
          </div>
        );
      }

      if (layout === "split") {
        return (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "94px 1fr",
              gap: 18,
              alignItems: "stretch",
              padding: "14px",
              borderRadius: 30,
              background: colors.panel,
              boxShadow:
                i % 2 === 0
                  ? `18px 18px 38px ${colors.shadowDark}, -16px -16px 34px ${colors.shadowLight}`
                  : `14px 14px 30px ${colors.shadowDark}, -14px -14px 28px ${colors.shadowLight}`,
              opacity: progress,
              transform: `translateX(${interpolate(progress, [0, 1], [i % 2 === 0 ? -56 : 56, 0])}px)`,
            }}
          >
            <div
              style={{
                borderRadius: 22,
                background: colors.panel,
                ...insetShadow(6),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 6,
                color: pointAccent,
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 900 }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.2em" }}>
                NEU
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 29,
                lineHeight: 1.36,
                color: colors.ink,
                fontWeight: 650,
                letterSpacing: "-0.01em",
                paddingRight: 10,
              }}
            >
              {point}
            </div>
          </div>
        );
      }

      return (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: "24px 28px",
            borderRadius: 28,
            background: colors.panel,
            boxShadow:
              i % 2 === 0
                ? `18px 18px 38px ${colors.shadowDark}, -16px -16px 34px ${colors.shadowLight}`
                : `14px 14px 30px ${colors.shadowDark}, -14px -14px 28px ${colors.shadowLight}`,
            opacity: progress,
            transform: `translateX(${interpolate(progress, [0, 1], [i % 2 === 0 ? -56 : 56, 0])}px)`,
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              background: colors.panel,
              ...insetShadow(6),
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 24,
              fontWeight: 900,
              color: pointAccent,
              flexShrink: 0,
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.36,
              color: colors.ink,
              fontWeight: 650,
              letterSpacing: "-0.01em",
            }}
          >
            {point}
          </div>
        </div>
      );
    });
  };

  return (
    <AbsoluteFill
      style={{
        background: colors.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, 'PingFang SC', sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -160,
          right: -120,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: colors.panel,
          ...raisedShadow(20),
          transform: `scale(${decorativePulse})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -210,
          left: -120,
          width: 430,
          height: 430,
          borderRadius: "50%",
          background: colors.panel,
          ...raisedShadow(16),
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 260,
          left: 50,
          width: 180,
          height: 560,
          borderRadius: 42,
          background: colors.panel,
          ...insetShadow(10),
          opacity: 0.42,
        }}
      />

      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "58px 52px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 56,
            left: 60,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "18px 28px",
            borderRadius: 999,
            background: colors.panel,
            ...raisedShadow(10),
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 800, color: colors.muted, letterSpacing: "0.18em" }}>
            NEU
          </span>
          <span style={{ fontSize: 30, fontWeight: 900, color: accent }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span style={{ fontSize: 22, color: "#8a97aa", fontWeight: 600 }}>
            / {String(totalSlides).padStart(2, "0")}
          </span>
        </div>

        <div
          style={{
            width: variant === 1 ? "92%" : "90%",
            borderRadius: variant === 2 ? 40 : 46,
            background: colors.panel,
            ...raisedShadow(20),
            padding: variant === 2 ? "42px 40px 40px" : variant === 1 ? "44px 40px" : "48px 44px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                variant === 1
                  ? "1fr"
                  : hasPoints
                    ? variant === 2
                      ? "0.92fr 1.08fr"
                      : "1.02fr 0.98fr"
                    : "1fr",
              gap: variant === 1 ? 30 : 28,
              alignItems: "start",
            }}
          >
            <div
              style={
                variant === 1
                  ? {
                      display: "grid",
                      gridTemplateColumns: "1.08fr 0.92fr",
                      gap: 26,
                      alignItems: "start",
                    }
                  : undefined
              }
            >
              <div>
                <div
                  style={{
                    width: 92,
                    height: 92,
                    borderRadius: 28,
                    background: colors.panel,
                    ...raisedShadow(12),
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 28,
                    opacity: titleProgress,
                    transform: `scale(${titleProgress})`,
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 16,
                      background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                      boxShadow: `0 12px 22px ${accent}3f`,
                    }}
                  />
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: 82,
                    fontWeight: 900,
                    lineHeight: 1.02,
                    letterSpacing: "-0.055em",
                    color: colors.ink,
                    maxWidth: variant === 1 ? 440 : 420,
                    opacity: titleProgress,
                    transform: `translateY(${titleOffset}px)`,
                    textShadow: `0 2px 0 ${colors.shadowLight}, 0 -1px 0 ${colors.shadowDark}`,
                  }}
                >
                  {title}
                </h1>

                {subtitle ? (
                  <p
                    style={{
                      margin: "22px 0 28px",
                      fontSize: 34,
                      lineHeight: 1.45,
                      fontWeight: 600,
                      color: colors.muted,
                      maxWidth: variant === 1 ? 470 : 430,
                      opacity: subtitleProgress,
                      transform: `translateY(${subtitleOffset}px)`,
                    }}
                  >
                    {subtitle}
                  </p>
                ) : null}

                <div
                  style={{
                    width: 136,
                    height: 10,
                    borderRadius: 999,
                    background: colors.panel,
                    ...insetShadow(8),
                  }}
                />
              </div>

              {variant === 1 ? (
                <div
                  style={{
                    borderRadius: 34,
                    background: colors.panel,
                    ...insetShadow(10),
                    minHeight: 330,
                    padding: "26px 24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 22,
                    }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 800, color: colors.muted, letterSpacing: "0.18em" }}>
                      INTERFACE
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: accent }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div style={{ display: "grid", gap: 14 }}>
                    {[0, 1, 2].map((slot) => (
                      <div
                        key={slot}
                        style={{
                          height: slot === 1 ? 92 : 62,
                          borderRadius: 22,
                          background: colors.panel,
                          ...raisedShadow(8),
                          opacity: 0.88 - slot * 0.14,
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      marginTop: 18,
                      height: 14,
                      borderRadius: 999,
                      background: colors.panel,
                      ...insetShadow(6),
                    }}
                  />
                </div>
              ) : null}
            </div>

            {variant !== 1 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  minHeight: variant === 2 ? 460 : 420,
                  justifyContent: hasPoints ? "flex-start" : "center",
                }}
              >
                {renderPoints(variant === 2 ? "split" : "stack")}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 18 }}>{renderPoints("pill")}</div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 34, display: "flex", gap: 12 }}>
          {[...Array(totalSlides)].map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 56 : 18,
                height: 18,
                borderRadius: 999,
                background: colors.panel,
                ...raisedShadow(6),
                overflow: "hidden",
              }}
            >
              {i === index ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${accent}90, ${accent}45)`,
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
