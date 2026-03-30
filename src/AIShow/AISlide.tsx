import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Orbitron";
import { getSlideMotionTiming } from "../templates/animationTiming";

loadFont();

const colors = {
  bg: "#07111f",
  bg2: "#0b1830",
  panel: "rgba(9, 18, 34, 0.84)",
  panelSoft: "rgba(14, 28, 50, 0.76)",
  line: "rgba(84, 181, 255, 0.18)",
  primary: "#4fd1ff",
  secondary: "#7c8cff",
  accent: "#19e6b3",
  warm: "#ffb86b",
  text: "#f3f9ff",
  muted: "rgba(211, 226, 244, 0.68)",
};

const GridGlow: React.FC<{ frame: number }> = ({ frame }) => {
  const drift = frame * 0.32;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(79,209,255,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(79,209,255,0.06) 1px, transparent 1px)
        `,
        backgroundSize: "64px 64px",
        backgroundPosition: `${-drift}px ${-drift * 0.7}px`,
      }}
    />
  );
};

const LightBeam: React.FC<{ frame: number; top: number; width: number; color: string }> = ({
  frame,
  top,
  width,
  color,
}) => {
  const progress = 0.6 + Math.sin(frame * 0.03 + top * 0.01) * 0.18;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: -120,
        width,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: progress,
        transform: `translateX(${frame * 1.6}px)`,
        boxShadow: `0 0 16px ${color}`,
      }}
    />
  );
};

const OrbitalNode: React.FC<{ frame: number; compact?: boolean }> = ({ frame, compact }) => {
  const rotate = frame * 0.42;
  const size = compact ? 132 : 176;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `1px solid ${colors.line}`,
          boxShadow: `0 0 22px ${colors.primary}12`,
          transform: `rotate(${rotate}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: compact ? 16 : 20,
          borderRadius: "50%",
          border: `1px solid ${colors.secondary}4d`,
          transform: `rotate(${-rotate * 1.2}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: compact ? 84 : 108,
          height: compact ? 84 : 108,
          borderRadius: 28,
          background: `linear-gradient(145deg, ${colors.primary}, ${colors.secondary})`,
          boxShadow: `0 20px 48px rgba(79,209,255,0.24), 0 0 28px ${colors.secondary}22`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: compact ? 18 : 20,
          height: compact ? 18 : 20,
          borderRadius: "50%",
          background: colors.accent,
          top: compact ? 8 : 10,
          left: "50%",
          marginLeft: compact ? -9 : -10,
          boxShadow: `0 0 16px ${colors.accent}`,
        }}
      />
    </div>
  );
};

type PointLayout = "list" | "matrix" | "rail";

export const AISlide: React.FC<{
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
      config: { damping: 13, stiffness: 96 },
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

    if (layout === "matrix") {
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginTop: 12,
          }}
        >
          {points!.map((point, i) => {
            const progress = pointProgresses[i] || 0;
            const color = [colors.primary, colors.secondary, colors.accent, colors.warm][i % 4];

            return (
              <div
                key={i}
                style={{
                  borderRadius: 26,
                  padding: "20px 20px 22px",
                  background: "rgba(12, 26, 48, 0.72)",
                  border: `1px solid ${color}26`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 36px rgba(0,0,0,0.16)`,
                  opacity: progress,
                  transform: `translateY(${interpolate(progress, [0, 1], [42, 0])}px)`,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 72,
                    height: 42,
                    padding: "0 16px",
                    borderRadius: 999,
                    background: `${color}16`,
                    border: `1px solid ${color}28`,
                    color,
                    fontSize: 15,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    marginBottom: 14,
                  }}
                >
                  MOD {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ fontSize: 26, lineHeight: 1.42, color: colors.text, fontWeight: 520 }}>
                  {point}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (layout === "rail") {
      return (
        <div style={{ display: "grid", gap: 14, marginTop: 8 }}>
          {points!.map((point, i) => {
            const progress = pointProgresses[i] || 0;
            const color = [colors.primary, colors.secondary, colors.accent, colors.warm][i % 4];

            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "106px 1fr 72px",
                  gap: 16,
                  alignItems: "center",
                  borderRadius: 24,
                  padding: "14px 16px",
                  background: "rgba(12, 26, 48, 0.74)",
                  border: `1px solid ${color}22`,
                  opacity: progress,
                  transform: `translateX(${interpolate(progress, [0, 1], [52, 0])}px)`,
                }}
              >
                <div
                  style={{
                    height: 56,
                    borderRadius: 18,
                    background: `${color}14`,
                    border: `1px solid ${color}28`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color,
                    fontSize: 18,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ fontSize: 28, lineHeight: 1.4, color: colors.text, fontWeight: 520 }}>
                  {point}
                </div>
                <div
                  style={{
                    justifySelf: "end",
                    width: 54,
                    height: 8,
                    borderRadius: 999,
                    background: color,
                    boxShadow: `0 0 16px ${color}66`,
                  }}
                />
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div style={{ display: "grid", gap: 16, marginTop: 8 }}>
        {points!.map((point, i) => {
          const progress = pointProgresses[i] || 0;
          const color = [colors.primary, colors.secondary, colors.accent, colors.warm][i % 4];

          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "86px 1fr",
                gap: 18,
                alignItems: "center",
                borderRadius: 24,
                padding: "16px 18px",
                background: "rgba(12, 26, 48, 0.74)",
                border: `1px solid ${color}20`,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                opacity: progress,
                transform: `translateX(${interpolate(progress, [0, 1], [-54, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 86,
                  height: 62,
                  borderRadius: 20,
                  background: `linear-gradient(135deg, ${color}26, ${color}10)`,
                  border: `1px solid ${color}28`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: color,
                  fontSize: 20,
                  fontWeight: 900,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ fontSize: 28, lineHeight: 1.42, color: colors.text, fontWeight: 520 }}>
                {point}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const titleShift = interpolate(titleProgress, [0, 1], [40, 0]);
  const subtitleShift = interpolate(subtitleProgress, [0, 1], [20, 0]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.bg} 0%, ${colors.bg2} 100%)`,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: '"Orbitron", "PingFang SC", "Microsoft YaHei", sans-serif',
        overflow: "hidden",
      }}
    >
      <GridGlow frame={frame} />
      <LightBeam frame={frame} top={240} width={460} color={colors.primary} />
      <LightBeam frame={frame} top={880} width={520} color={colors.secondary} />
      <LightBeam frame={frame} top={1450} width={420} color={colors.accent} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 16% 18%, rgba(79,209,255,0.16) 0%, transparent 28%), radial-gradient(circle at 84% 18%, rgba(124,140,255,0.14) 0%, transparent 28%), radial-gradient(circle at 50% 78%, rgba(25,230,179,0.10) 0%, transparent 30%)",
        }}
      />

      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: "90%",
            maxWidth: 950,
            minHeight: 1260,
            borderRadius: 36,
            padding: variant === 1 ? "28px 28px 34px" : "30px 30px 34px",
            background: colors.panel,
            backdropFilter: "blur(22px)",
            border: `1px solid ${colors.line}`,
            boxShadow:
              "0 34px 90px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 40px rgba(79,209,255,0.06)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 26,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${colors.line}`,
                  color: colors.text,
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                }}
              >
                AI SHOW
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[colors.primary, colors.secondary, colors.accent].map((color, i) => (
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: color,
                      boxShadow: `0 0 10px ${color}`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 18px",
                borderRadius: 18,
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${colors.line}`,
                color: colors.muted,
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              <span style={{ color: colors.primary }}>{String(index + 1).padStart(2, "0")}</span>
              <span>/</span>
              <span>{String(totalSlides).padStart(2, "0")}</span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                variant === 0 ? "1.04fr 220px" : variant === 1 ? "1fr" : "228px 1fr",
              gap: 22,
              alignItems: "start",
            }}
          >
            {variant === 2 ? (
              <div
                style={{
                  minHeight: 320,
                  borderRadius: 28,
                  background: colors.panelSoft,
                  border: `1px solid ${colors.line}`,
                  padding: "18px 18px 20px",
                  display: "grid",
                  gap: 14,
                }}
              >
                {[
                  { label: "INPUT", color: colors.primary },
                  { label: "REASON", color: colors.secondary },
                  { label: "RESULT", color: colors.accent },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    style={{
                      height: i === 1 ? 92 : 60,
                      borderRadius: 20,
                      background: `${item.color}10`,
                      border: `1px solid ${item.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: item.color,
                      fontSize: 16,
                      fontWeight: 900,
                      letterSpacing: "0.14em",
                    }}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            ) : null}

            <div>
              <div
                style={{
                  display: variant === 1 ? "flex" : "block",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 24,
                }}
              >
                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 72,
                      lineHeight: 1.03,
                      fontWeight: 800,
                      color: colors.text,
                      letterSpacing: "-0.04em",
                      maxWidth: variant === 1 ? 560 : 620,
                      opacity: titleProgress,
                      transform: `translateY(${titleShift}px)`,
                    }}
                  >
                    {title}
                  </h1>

                  {variant === 1 ? (
                    <div
                      style={{
                        marginTop: 20,
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      {[
                        { label: "ANALYZE", color: colors.primary },
                        { label: "STRUCTURE", color: colors.secondary },
                        { label: "GENERATE", color: colors.accent },
                      ].map((tag) => (
                        <div
                          key={tag.label}
                          style={{
                            padding: "12px 16px",
                            borderRadius: 999,
                            background: `${tag.color}10`,
                            border: `1px solid ${tag.color}22`,
                            color: tag.color,
                            fontSize: 14,
                            fontWeight: 800,
                            letterSpacing: "0.12em",
                          }}
                        >
                          {tag.label}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                {variant === 1 ? <OrbitalNode frame={frame} compact /> : null}
              </div>

              <div
                style={{
                  width: interpolate(titleProgress, [0, 1], [0, 210]),
                  height: 4,
                  borderRadius: 999,
                  marginTop: 22,
                  background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, ${colors.accent})`,
                  boxShadow: `0 0 16px ${colors.primary}44`,
                }}
              />

              {subtitle ? (
                <p
                  style={{
                    margin: "22px 0 0",
                    fontSize: 28,
                    lineHeight: 1.5,
                    color: colors.muted,
                    maxWidth: 690,
                    opacity: subtitleProgress,
                    transform: `translateY(${subtitleShift}px)`,
                  }}
                >
                  {subtitle}
                </p>
              ) : null}
            </div>

            {variant === 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <OrbitalNode frame={frame} />
              </div>
            ) : null}
          </div>

          <div
            style={{
              marginTop: 28,
              padding: variant === 1 ? "20px" : "0",
              borderRadius: variant === 1 ? 28 : 0,
              background: variant === 1 ? colors.panelSoft : "transparent",
              border: variant === 1 ? `1px solid ${colors.line}` : "none",
            }}
          >
            {renderPoints(variant === 0 ? "list" : variant === 1 ? "matrix" : "rail")}
          </div>
        </div>

        <div style={{ marginTop: 28, display: "flex", gap: 10 }}>
          {[...Array(totalSlides)].map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 54 : 12,
                height: 12,
                borderRadius: 999,
                background:
                  i === index
                    ? `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`
                    : `${colors.primary}20`,
                boxShadow: i === index ? `0 0 18px ${colors.primary}36` : "none",
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
