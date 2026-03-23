import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSlideMotionTiming } from "../templates/animationTiming";
import {
  getKnowledgeLayoutItemCount,
  resolveKnowledgeLayout,
} from "../templates/knowledgeLayouts";
import { ContentSlide } from "../templates/types";

const colors = {
  bg1: "#667eea",
  bg2: "#764ba2",
  bg3: "#f093fb",
  accent1: "#4facfe",
  accent2: "#00f2fe",
  accent3: "#fa709a",
  accent4: "#fee140",
  glass: "rgba(255, 255, 255, 0.18)",
  glassBorder: "rgba(255, 255, 255, 0.3)",
  text: "#ffffff",
  muted: "rgba(255, 255, 255, 0.75)",
};

const GradientBg: React.FC<{ frame: number }> = ({ frame }) => {
  const shift = frame * 0.15;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(circle at ${30 + Math.sin(shift * 0.01) * 20}% ${20 + Math.cos(shift * 0.01) * 15}%,
            rgba(240, 147, 251, 0.4) 0%, transparent 50%),
          radial-gradient(circle at ${70 + Math.cos(shift * 0.012) * 20}% ${80 + Math.sin(shift * 0.01) * 15}%,
            rgba(79, 172, 254, 0.4) 0%, transparent 50%),
          radial-gradient(circle at ${50 + Math.sin(shift * 0.008) * 25}% ${50 + Math.cos(shift * 0.008) * 25}%,
            rgba(250, 112, 154, 0.3) 0%, transparent 50%),
          linear-gradient(135deg, ${colors.bg1} 0%, ${colors.bg2} 50%, ${colors.bg3} 100%)
        `,
      }}
    />
  );
};

const LightOrb: React.FC<{
  frame: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  speed: number;
}> = ({ frame, x, y, size, color, delay, speed }) => {
  const progress = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 15 },
  });

  const floatX = Math.sin(frame * speed + delay) * 60;
  const floatY = Math.cos(frame * speed * 0.8 + delay) * 40;
  const scale = 1 + Math.sin(frame * speed * 1.2 + delay) * 0.15;

  return (
    <div
      style={{
        position: "absolute",
        left: x + floatX,
        top: y + floatY,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${color})`,
        filter: "blur(40px)",
        opacity: progress * 0.6,
        transform: `scale(${scale})`,
      }}
    />
  );
};

const GlassLayers: React.FC<{
  children: React.ReactNode;
  frame: number;
  delay: number;
}> = ({ children, frame, delay }) => {
  const progress = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 18, stiffness: 80 },
  });

  const breathe = 1 + Math.sin(frame * 0.02) * 0.005;

  return (
    <div
      style={{
        position: "relative",
        opacity: progress,
        transform: `scale(${progress * breathe}) translateY(${(1 - progress) * 30}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -30,
          borderRadius: 60,
          background: `linear-gradient(135deg, ${colors.accent1}40, ${colors.accent3}40)`,
          filter: "blur(60px)",
          opacity: 0.5,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: -8,
          borderRadius: 52,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      />

      <div
        style={{
          position: "relative",
          padding: "75px 60px",
          background: `
            linear-gradient(135deg,
              rgba(255,255,255,0.25) 0%,
              rgba(255,255,255,0.1) 50%,
              rgba(255,255,255,0.2) 100%
            )
          `,
          backdropFilter: "blur(60px)",
          WebkitBackdropFilter: "blur(60px)",
          borderRadius: 44,
          border: "1px solid rgba(255,255,255,0.35)",
          boxShadow: `
            0 30px 60px -15px rgba(0,0,0,0.2),
            0 0 0 1px rgba(255,255,255,0.1),
            inset 0 1px 1px rgba(255,255,255,0.5),
            inset 0 -1px 1px rgba(0,0,0,0.05)
          `,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 20,
            right: 20,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
          }}
        />

        {children}
      </div>
    </div>
  );
};

const GlassPill: React.FC<{
  text: string;
  frame: number;
  delay: number;
  color?: string;
}> = ({ text, frame, delay, color }) => {
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
        gap: 8,
        padding: "12px 24px",
        background: color ? `${color}30` : "rgba(255,255,255,0.15)",
        backdropFilter: "blur(20px)",
        borderRadius: 25,
        border: `1px solid ${color ? `${color}50` : "rgba(255,255,255,0.25)"}`,
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.3)",
        fontSize: 20,
        fontWeight: 600,
        color: colors.text,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 15}px)`,
      }}
    >
      {text}
    </div>
  );
};

const GlassIcon: React.FC<{
  frame: number;
  color: string;
  label: string;
}> = ({ frame, color, label }) => {
  const pulse = 1 + Math.sin(frame * 0.08) * 0.08;

  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 18,
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        boxShadow: `
          0 8px 25px ${color}50,
          inset 0 2px 4px rgba(255,255,255,0.4),
          inset 0 -2px 4px rgba(0,0,0,0.1)
        `,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontSize: 24,
        fontWeight: 700,
        transform: `scale(${pulse})`,
      }}
    >
      {label}
    </div>
  );
};

export const FrostedSlide: React.FC<{
  title: string;
  subtitle?: string;
  points?: string[];
  type?: ContentSlide["type"];
  data?: Record<string, unknown>;
  index: number;
  totalSlides: number;
  durationInFrames: number;
}> = ({
  title,
  subtitle,
  points,
  type,
  data,
  index,
  totalSlides,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const layout = resolveKnowledgeLayout(
    { title, subtitle, points, type, data },
    index
  );
  const timing = getSlideMotionTiming(
    durationInFrames,
    getKnowledgeLayoutItemCount(layout)
  );

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

  const pointProgresses = new Array(getKnowledgeLayoutItemCount(layout))
    .fill(null)
    .map((_, i) =>
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

  const accentColors = [
    colors.accent1,
    colors.accent2,
    colors.accent3,
    colors.accent4,
  ];

  const orbs = [
    { x: 100, y: 200, size: 300, color: colors.accent1, delay: 5, speed: 0.008 },
    { x: 700, y: 100, size: 350, color: colors.accent3, delay: 10, speed: 0.006 },
    { x: 50, y: 900, size: 280, color: colors.accent2, delay: 15, speed: 0.007 },
    { x: 800, y: 800, size: 320, color: colors.accent4, delay: 20, speed: 0.0065 },
    { x: 150, y: 1400, size: 260, color: colors.accent1, delay: 25, speed: 0.0075 },
    { x: 750, y: 1500, size: 300, color: colors.accent3, delay: 30, speed: 0.0055 },
  ];

  const renderListRow = (label: string, text: string, itemIndex: number) => {
    const progress = pointProgresses[itemIndex] || 0;
    const accent = accentColors[itemIndex % accentColors.length];

    return (
      <div
        key={`${label}-${text}-${itemIndex}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "22px 28px",
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(15px)",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: `
            0 4px 15px rgba(0,0,0,0.08),
            inset 0 1px 1px rgba(255,255,255,0.3)
          `,
          transform: `translateX(${interpolate(progress, [0, 1], [-50, 0])}px)`,
          opacity: progress,
        }}
      >
        <GlassIcon frame={frame} color={accent} label={label} />
        <span
          style={{
            fontSize: 32,
            color: colors.text,
            fontWeight: 600,
            textShadow: "0 1px 8px rgba(0,0,0,0.1)",
            lineHeight: 1.35,
          }}
        >
          {text}
        </span>
      </div>
    );
  };

  const renderCompare = () => {
    if (!layout.compare) {
      return null;
    }

    const sides = [layout.compare.left, layout.compare.right];

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          width: "100%",
        }}
      >
        {sides.map((side, sideIndex) => {
          const progress = pointProgresses[sideIndex] || 0;
          const accent = accentColors[sideIndex % accentColors.length];

          return (
            <div
              key={side.label}
              style={{
                padding: "24px 24px 26px",
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(15px)",
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: `
                  0 4px 15px rgba(0,0,0,0.08),
                  inset 0 1px 1px rgba(255,255,255,0.3)
                `,
                transform: `translateY(${interpolate(progress, [0, 1], [26, 0])}px)`,
                opacity: progress,
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  color: colors.muted,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 10,
                }}
              >
                {side.label}
              </div>
              {side.value ? (
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 800,
                    color: colors.text,
                    marginBottom: 12,
                  }}
                >
                  {side.value}
                </div>
              ) : null}
              <div
                style={{
                  width: 90,
                  height: 5,
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${accent}, rgba(255,255,255,0.9))`,
                  marginBottom: 16,
                  boxShadow: "0 4px 15px rgba(255,255,255,0.25)",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {side.points.map((item, itemIndex) => (
                  <div
                    key={`${side.label}-${itemIndex}`}
                    style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                  >
                    <div
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: accent,
                        marginTop: 11,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        fontSize: 23,
                        color: colors.text,
                        lineHeight: 1.42,
                      }}
                    >
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTimeline = () => {
    const items = layout.timeline || [];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        {items.map((item, itemIndex) => {
          const progress = pointProgresses[itemIndex] || 0;
          const accent = accentColors[itemIndex % accentColors.length];

          return (
            <div
              key={`${item.label}-${itemIndex}`}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr",
                gap: 18,
                alignItems: "center",
                padding: "20px 24px",
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(15px)",
                borderRadius: 24,
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: `
                  0 4px 15px rgba(0,0,0,0.08),
                  inset 0 1px 1px rgba(255,255,255,0.3)
                `,
                transform: `translateX(${interpolate(progress, [0, 1], [-50, 0])}px)`,
                opacity: progress,
              }}
            >
              <GlassIcon frame={frame} color={accent} label={item.label} />
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: colors.text }}>
                  {item.title}
                </div>
                {item.description ? (
                  <div
                    style={{
                      fontSize: 22,
                      color: colors.muted,
                      lineHeight: 1.42,
                      marginTop: 8,
                    }}
                  >
                    {item.description}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStats = () => {
    const stats = layout.stats || [];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {stats.slice(0, 3).map((stat, statIndex) => {
            const progress = pointProgresses[statIndex] || 0;
            const accent = accentColors[statIndex % accentColors.length];

            return (
              <div
                key={`${stat.label}-${statIndex}`}
                style={{
                  padding: "24px 22px",
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(15px)",
                  borderRadius: 24,
                  border: "1px solid rgba(255,255,255,0.2)",
                  boxShadow: `
                    0 4px 15px rgba(0,0,0,0.08),
                    inset 0 1px 1px rgba(255,255,255,0.3)
                  `,
                  transform: `translateY(${interpolate(progress, [0, 1], [24, 0])}px)`,
                  opacity: progress,
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    color: colors.text,
                    textShadow: `0 2px 12px ${accent}40`,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: colors.text,
                    marginTop: 12,
                  }}
                >
                  {stat.label}
                </div>
                {stat.note ? (
                  <div
                    style={{
                      fontSize: 18,
                      lineHeight: 1.42,
                      color: colors.muted,
                      marginTop: 10,
                    }}
                  >
                    {stat.note}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        {layout.points.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {layout.points.slice(0, 2).map((point, itemIndex) =>
              renderListRow(String(itemIndex + 1), point, stats.length + itemIndex)
            )}
          </div>
        ) : null}
      </div>
    );
  };

  const renderQuote = () => {
    const progress = pointProgresses[0] || 0;

    return (
      <div
        style={{
          width: "100%",
          padding: "28px 30px",
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(15px)",
          borderRadius: 26,
          border: "1px solid rgba(255,255,255,0.22)",
          boxShadow: `
            0 4px 15px rgba(0,0,0,0.08),
            inset 0 1px 1px rgba(255,255,255,0.3)
          `,
          transform: `translateY(${interpolate(progress, [0, 1], [24, 0])}px)`,
          opacity: progress,
        }}
      >
        <div
          style={{
            fontSize: 46,
            lineHeight: 1.3,
            color: colors.text,
            fontWeight: 700,
            textShadow: "0 2px 20px rgba(0,0,0,0.12)",
          }}
        >
          "{layout.quote?.text || layout.title}"
        </div>
        {layout.quote?.author ? (
          <div style={{ fontSize: 22, color: colors.muted, marginTop: 14 }}>
            {layout.quote.author}
          </div>
        ) : null}
        {layout.points.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 22 }}>
            {layout.points.map((point, itemIndex) =>
              renderListRow(String(itemIndex + 1), point, itemIndex + 1)
            )}
          </div>
        ) : null}
      </div>
    );
  };

  const renderBody = () => {
    switch (layout.mode) {
      case "compare":
        return renderCompare();
      case "timeline":
        return renderTimeline();
      case "stats":
        return renderStats();
      case "quote":
        return renderQuote();
      case "cards":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, width: "100%" }}>
            {layout.points.map((point, itemIndex) =>
              renderListRow(String(itemIndex + 1), point, itemIndex)
            )}
          </div>
        );
      case "hero":
      case "list":
      default:
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%" }}>
            {layout.points.map((point, itemIndex) =>
              renderListRow(String(itemIndex + 1), point, itemIndex)
            )}
          </div>
        );
    }
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

      {orbs.map((orb, i) => (
        <LightOrb
          key={i}
          frame={frame}
          x={orb.x}
          y={orb.y}
          size={orb.size}
          color={orb.color}
          delay={orb.delay}
          speed={orb.speed}
        />
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
            top: 50,
            left: 50,
            right: 50,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            <GlassPill text="Frosted Glass" frame={frame} delay={5} />
            <GlassPill text="Blur Effect" frame={frame} delay={10} color={colors.accent2} />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 24px",
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(20px)",
              borderRadius: 25,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <span style={{ fontSize: 26, fontWeight: 700, color: colors.text }}>{index + 1}</span>
            <span style={{ fontSize: 26, color: colors.muted }}>|</span>
            <span style={{ fontSize: 26, color: colors.muted }}>{totalSlides}</span>
          </div>
        </div>

        <GlassLayers frame={frame} delay={8}>
          <div
            style={{
              width: 880,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h1
              style={{
                fontSize: 90,
                fontWeight: 800,
                color: colors.text,
                margin: 0,
                marginBottom: 14,
                transform: `translateY(${interpolate(titleProgress, [0, 1], [30, 0])}px)`,
                opacity: titleProgress,
                textShadow: "0 2px 20px rgba(0,0,0,0.15)",
                letterSpacing: "-2px",
              }}
            >
              {layout.title}
            </h1>

            <div
              style={{
                width: interpolate(titleProgress, [0, 1], [0, 120]),
                height: 5,
                borderRadius: 3,
                background: `linear-gradient(90deg, ${colors.accent1}, ${colors.accent2}, ${colors.accent3}, ${colors.accent4})`,
                marginBottom: 20,
                boxShadow: "0 4px 15px rgba(255,255,255,0.3)",
              }}
            />

            {layout.subtitle && (
              <p
                style={{
                  fontSize: 36,
                  color: colors.muted,
                  margin: 0,
                  marginBottom: 44,
                  transform: `translateY(${interpolate(subtitleProgress, [0, 1], [20, 0])}px)`,
                  opacity: subtitleProgress,
                  fontWeight: 400,
                  textShadow: "0 1px 10px rgba(0,0,0,0.1)",
                  maxWidth: 760,
                  lineHeight: 1.35,
                  textAlign: "center",
                }}
              >
                {layout.subtitle}
              </p>
            )}

            {renderBody()}
          </div>
        </GlassLayers>

        <div
          style={{
            position: "absolute",
            bottom: 50,
            display: "flex",
            gap: 10,
          }}
        >
          {[...Array(totalSlides)].map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 40 : 12,
                height: 12,
                borderRadius: 6,
                background:
                  i === index
                    ? `linear-gradient(90deg, ${colors.accent1}, ${colors.accent2})`
                    : "rgba(255,255,255,0.25)",
                boxShadow: i === index ? "0 4px 15px rgba(255,255,255,0.3)" : "none",
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
