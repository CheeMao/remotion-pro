import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";

const colors = {
  bg1: "#667eea",
  bg2: "#764ba2",
  bg3: "#f093fb",
  accent1: "#4facfe",
  accent2: "#00f2fe",
  accent3: "#fa709a",
  accent4: "#fee140",
  text: "#ffffff",
  muted: "rgba(255, 255, 255, 0.78)",
};

const GradientBg: React.FC<{ frame: number }> = ({ frame }) => {
  const drift = frame * 0.16;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(circle at ${30 + Math.sin(drift * 0.01) * 18}% ${18 + Math.cos(drift * 0.01) * 14}%, rgba(240,147,251,0.42) 0%, transparent 48%),
          radial-gradient(circle at ${72 + Math.cos(drift * 0.012) * 20}% ${78 + Math.sin(drift * 0.01) * 15}%, rgba(79,172,254,0.42) 0%, transparent 48%),
          radial-gradient(circle at ${52 + Math.sin(drift * 0.008) * 22}% ${46 + Math.cos(drift * 0.008) * 20}%, rgba(250,112,154,0.28) 0%, transparent 44%),
          linear-gradient(135deg, ${colors.bg1} 0%, ${colors.bg2} 50%, ${colors.bg3} 100%)
        `,
      }}
    />
  );
};

const Orb: React.FC<{ frame: number; x: number; y: number; size: number; color: string; delay: number }> = ({
  frame,
  x,
  y,
  size,
  color,
  delay,
}) => {
  const progress = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 15 },
  });

  return (
    <div
      style={{
        position: "absolute",
        left: x + Math.sin(frame * 0.01 + delay) * 50,
        top: y + Math.cos(frame * 0.012 + delay) * 34,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${color})`,
        filter: "blur(44px)",
        opacity: progress * 0.52,
      }}
    />
  );
};

const GlassCard: React.FC<{ children: React.ReactNode; frame: number; delay: number }> = ({
  children,
  frame,
  delay,
}) => {
  const progress = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 18, stiffness: 84 },
  });

  return (
    <div
      style={{
        position: "relative",
        opacity: progress,
        transform: `scale(${0.97 + progress * 0.03}) translateY(${(1 - progress) * 28}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -24,
          borderRadius: 54,
          background: "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04))",
          filter: "blur(36px)",
        }}
      />
      <div
        style={{
          position: "relative",
          borderRadius: 42,
          padding: "42px 40px 38px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.12) 48%, rgba(255,255,255,0.22) 100%)",
          backdropFilter: "blur(52px)",
          WebkitBackdropFilter: "blur(52px)",
          border: "1px solid rgba(255,255,255,0.34)",
          boxShadow:
            "0 30px 60px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.44), inset 0 -1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

type PointLayout = "stack" | "grid" | "rows";

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
  const variant = index % 3;
  const hasPoints = Boolean(points && points.length > 0);

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

  const exitOpacity = interpolate(
    frame,
    [timing.exitStart, timing.exitEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const orbList = [
    { x: 80, y: 180, size: 320, color: colors.accent1, delay: 4 },
    { x: 720, y: 110, size: 360, color: colors.accent3, delay: 10 },
    { x: 40, y: 930, size: 280, color: colors.accent2, delay: 16 },
    { x: 780, y: 860, size: 320, color: colors.accent4, delay: 22 },
  ];

  const pointPalette = [colors.accent1, colors.accent2, colors.accent3, colors.accent4];

  const renderPoints = (layout: PointLayout) => {
    if (!hasPoints) {
      return null;
    }

    if (layout === "grid") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {points!.map((point, i) => {
            const progress = pointProgresses[i] || 0;
            const pointColor = pointPalette[i % pointPalette.length];
            return (
              <div
                key={i}
                style={{
                  padding: "20px 22px",
                  borderRadius: 24,
                  background: "rgba(255,255,255,0.14)",
                  backdropFilter: "blur(18px)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)",
                  opacity: progress,
                  transform: `translateY(${interpolate(progress, [0, 1], [36, 0])}px)`,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 68,
                    height: 44,
                    padding: "0 14px",
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${pointColor}, ${pointColor}cc)`,
                    boxShadow: `0 12px 24px ${pointColor}36`,
                    color: colors.text,
                    fontSize: 16,
                    fontWeight: 800,
                    marginBottom: 14,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ fontSize: 28, lineHeight: 1.42, color: colors.text, fontWeight: 620 }}>
                  {point}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (layout === "rows") {
      return (
        <div style={{ display: "grid", gap: 14 }}>
          {points!.map((point, i) => {
            const progress = pointProgresses[i] || 0;
            const pointColor = pointPalette[i % pointPalette.length];
            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "92px 1fr 84px",
                  gap: 16,
                  alignItems: "center",
                  padding: "16px 18px",
                  borderRadius: 24,
                  background: "rgba(255,255,255,0.14)",
                  backdropFilter: "blur(18px)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)",
                  opacity: progress,
                  transform: `translateX(${interpolate(progress, [0, 1], [48, 0])}px)`,
                }}
              >
                <div
                  style={{
                    height: 58,
                    borderRadius: 18,
                    background: `linear-gradient(135deg, ${pointColor}, ${pointColor}cc)`,
                    boxShadow: `0 12px 24px ${pointColor}36`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.text,
                    fontSize: 20,
                    fontWeight: 800,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ fontSize: 29, lineHeight: 1.42, color: colors.text, fontWeight: 620 }}>
                  {point}
                </div>
                <div
                  style={{
                    justifySelf: "end",
                    width: 60,
                    height: 10,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${pointColor}, ${pointColor}80)`,
                    boxShadow: `0 8px 18px ${pointColor}36`,
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
          const pointColor = pointPalette[i % pointPalette.length];
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "72px 1fr",
                gap: 18,
                alignItems: "center",
                padding: "20px 22px",
                borderRadius: 24,
                background: "rgba(255,255,255,0.14)",
                backdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.22)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)",
                opacity: progress,
                transform: `translateX(${interpolate(progress, [0, 1], [-48, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 58,
                  borderRadius: 18,
                  background: `linear-gradient(135deg, ${pointColor}, ${pointColor}cc)`,
                  boxShadow: `0 12px 24px ${pointColor}36`,
                }}
              />
              <div style={{ fontSize: 31, lineHeight: 1.42, color: colors.text, fontWeight: 620 }}>
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
        background: `linear-gradient(135deg, ${colors.bg1}, ${colors.bg2})`,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', sans-serif",
        overflow: "hidden",
      }}
    >
      <GradientBg frame={frame} />
      {orbList.map((orb, i) => (
        <Orb key={i} frame={frame} {...orb} />
      ))}

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
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 50,
            right: 50,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 20px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.14)",
              backdropFilter: "blur(22px)",
              border: "1px solid rgba(255,255,255,0.28)",
              color: colors.text,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.14em",
            }}
          >
            FROSTED
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 18px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.14)",
              backdropFilter: "blur(22px)",
              border: "1px solid rgba(255,255,255,0.28)",
              color: colors.text,
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span style={{ color: colors.muted }}>/</span>
            <span style={{ color: colors.muted }}>{String(totalSlides).padStart(2, "0")}</span>
          </div>
        </div>

        <GlassCard frame={frame} delay={8}>
          <div style={{ width: 880, display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: variant === 2 ? "210px 1fr 118px" : "1fr 118px",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 24,
              }}
            >
              {variant === 2 ? (
                <div
                  style={{
                    borderRadius: 28,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)",
                    padding: "18px 16px",
                    display: "grid",
                    gap: 12,
                  }}
                >
                  {["MIST", "LAYER", "LIGHT"].map((label, i) => (
                    <div
                      key={label}
                      style={{
                        height: i === 1 ? 66 : 48,
                        borderRadius: 18,
                        background: "rgba(255,255,255,0.14)",
                        border: "1px solid rgba(255,255,255,0.22)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: [colors.accent1, colors.accent2, colors.accent3][i],
                        fontSize: 16,
                        fontWeight: 800,
                        letterSpacing: "0.12em",
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              ) : null}

              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 88,
                    lineHeight: 1.02,
                    fontWeight: 820,
                    color: colors.text,
                    opacity: titleProgress,
                    transform: `translateY(${interpolate(titleProgress, [0, 1], [34, 0])}px)`,
                    letterSpacing: "-0.05em",
                    textShadow: "0 2px 18px rgba(0,0,0,0.14)",
                    maxWidth: 620,
                  }}
                >
                  {title}
                </h1>

                {variant === 1 ? (
                  <div
                    style={{
                      marginTop: 18,
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    {[colors.accent1, colors.accent2, colors.accent3].map((color, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "12px 18px",
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.14)",
                          border: "1px solid rgba(255,255,255,0.24)",
                          color,
                          fontSize: 15,
                          fontWeight: 800,
                          letterSpacing: "0.12em",
                        }}
                      >
                        {i === 0 ? "AIR" : i === 1 ? "SOFT" : "GLOW"}
                      </div>
                    ))}
                  </div>
                ) : null}

                <div
                  style={{
                    width: interpolate(titleProgress, [0, 1], [0, 150]),
                    height: 5,
                    borderRadius: 999,
                    marginTop: 20,
                    background: `linear-gradient(90deg, ${colors.accent1}, ${colors.accent2}, ${colors.accent3})`,
                    boxShadow: "0 6px 16px rgba(255,255,255,0.22)",
                  }}
                />
              </div>
              <div
                style={{
                  width: 118,
                  height: 118,
                  borderRadius: 32,
                  background: "rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.34)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.46), 0 12px 26px rgba(0,0,0,0.12)",
                }}
              />
            </div>

            {subtitle ? (
              <p
                style={{
                  margin: "24px 0 34px",
                  fontSize: 34,
                  lineHeight: 1.5,
                  color: colors.muted,
                  maxWidth: 700,
                  opacity: subtitleProgress,
                  transform: `translateY(${interpolate(subtitleProgress, [0, 1], [18, 0])}px)`,
                }}
              >
                {subtitle}
              </p>
            ) : null}

            {renderPoints(variant === 1 ? "grid" : variant === 2 ? "rows" : "stack")}
          </div>
        </GlassCard>

        <div style={{ position: "absolute", bottom: 48, display: "flex", gap: 10 }}>
          {[...Array(totalSlides)].map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 44 : 12,
                height: 12,
                borderRadius: 999,
                background:
                  i === index
                    ? `linear-gradient(90deg, ${colors.accent1}, ${colors.accent2})`
                    : "rgba(255,255,255,0.24)",
                boxShadow: i === index ? "0 6px 18px rgba(255,255,255,0.22)" : "none",
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
