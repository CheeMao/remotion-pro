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
  bg: "#eef1f6",
  text: "#1d2738",
  muted: "#667085",
  softText: "#7b8797",
  white: "rgba(255,255,255,0.74)",
  whiteStrong: "rgba(255,255,255,0.9)",
  pink: "#ff71b3",
  purple: "#9d7bff",
  cyan: "#21d4d0",
  orange: "#ffbe73",
  shadow: "rgba(27, 39, 54, 0.12)",
};

const SoftBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const drift = Math.sin(frame * 0.01) * 4;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(circle at ${14 + drift}% ${12 + drift * 0.4}%,
            rgba(255, 113, 179, 0.38) 0%,
            rgba(255, 113, 179, 0.16) 22%,
            transparent 45%),
          radial-gradient(circle at ${86 - drift}% ${14 + drift * 0.5}%,
            rgba(157, 123, 255, 0.34) 0%,
            rgba(157, 123, 255, 0.14) 24%,
            transparent 46%),
          radial-gradient(circle at ${38 + drift * 0.5}% ${86 - drift}%,
            rgba(33, 212, 208, 0.22) 0%,
            rgba(33, 212, 208, 0.1) 20%,
            transparent 38%),
          radial-gradient(circle at ${88 - drift * 0.4}% ${78 + drift * 0.3}%,
            rgba(255, 190, 115, 0.26) 0%,
            rgba(255, 190, 115, 0.1) 20%,
            transparent 38%),
          linear-gradient(180deg, #f3f5fa 0%, #eef1f6 42%, #e9edf4 100%)
        `,
      }}
    />
  );
};

const MainCard: React.FC<{
  children: React.ReactNode;
  frame: number;
  delay: number;
}> = ({ children, frame, delay }) => {
  const progress = spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 18, stiffness: 90 },
  });

  return (
    <div
      style={{
        position: "relative",
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px) scale(${interpolate(progress, [0, 1], [0.985, 1])})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 34,
          background: "rgba(255,255,255,0.42)",
          filter: "blur(18px)",
          transform: "translateY(18px)",
        }}
      />
      <div
        style={{
          position: "relative",
          width: 910,
          minHeight: 920,
          padding: "42px 44px 40px",
          borderRadius: 34,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.66) 100%)",
          border: "1px solid rgba(255,255,255,0.82)",
          backdropFilter: "blur(30px) saturate(135%)",
          WebkitBackdropFilter: "blur(30px) saturate(135%)",
          boxShadow: `
            0 24px 70px rgba(21, 30, 44, 0.08),
            inset 0 1px 1px rgba(255,255,255,0.9)
          `,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.04))",
            pointerEvents: "none",
          }}
        />
        {children}
      </div>
    </div>
  );
};

const Pill: React.FC<{
  children: React.ReactNode;
  textColor?: string;
}> = ({ children, textColor = colors.softText }) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 42,
        padding: "0 18px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.46)",
        border: "1px solid rgba(255,255,255,0.72)",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.7)",
        fontSize: 18,
        fontWeight: 600,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: textColor,
      }}
    >
      {children}
    </div>
  );
};

export const LiquidSlide: React.FC<{
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
    config: { damping: 16, stiffness: 94 },
  });
  const subtitleProgress = spring({
    frame: frame - timing.subtitleStart,
    fps,
    config: { damping: 18, stiffness: 88 },
  });
  const itemProgresses = new Array(getKnowledgeLayoutItemCount(layout))
    .fill(null)
    .map((_, i) =>
      spring({
        frame: frame - timing.pointsStart - i * timing.pointStagger,
        fps,
        config: { damping: 16, stiffness: 96 },
      })
    );

  const exitOpacity = interpolate(
    frame,
    [timing.exitStart, timing.exitEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const gradientPairs: Array<[string, string]> = [
    [colors.pink, "#ffb0d4"],
    [colors.cyan, "#8ce9ea"],
    [colors.orange, "#ffd4a4"],
    [colors.purple, "#c9b6ff"],
    [colors.cyan, "#c7f6f5"],
    [colors.pink, "#ffd3e8"],
  ];

  const renderBaseRow = (
    label: string,
    text: string,
    itemIndex: number,
    compact = false
  ) => {
    const progress = itemProgresses[itemIndex] || 0;
    const [accentA, accentB] = gradientPairs[itemIndex % gradientPairs.length];

    return (
      <div
        key={`${label}-${text}-${itemIndex}`}
        style={{
          display: "flex",
          alignItems: compact ? "flex-start" : "center",
          gap: 18,
          padding: compact ? "22px 24px" : "20px 28px",
          background: "rgba(255,255,255,0.72)",
          border: "1px solid rgba(255,255,255,0.78)",
          borderRadius: 26,
          boxShadow: `0 18px 34px ${colors.shadow}`,
          transform: `translateX(${interpolate(progress, [0, 1], [-30, 0])}px)`,
          opacity: progress,
        }}
      >
        <div
          style={{
            minWidth: 50,
            height: 50,
            padding: "0 16px",
            borderRadius: 999,
            background: `linear-gradient(135deg, ${accentA}, ${accentB})`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: colors.text,
            fontSize: 16,
            fontWeight: 800,
            boxShadow: `0 10px 22px ${accentA}35`,
            flexShrink: 0,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: compact ? 26 : 32,
            fontWeight: 650,
            lineHeight: 1.32,
            letterSpacing: "-0.4px",
            color: colors.text,
          }}
        >
          {text}
        </div>
      </div>
    );
  };

  const renderList = (grid = false) => {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: grid ? "1fr 1fr" : "1fr",
          gap: 18,
          width: "100%",
        }}
      >
        {layout.points.map((point, itemIndex) =>
          renderBaseRow(String(itemIndex + 1).padStart(2, "0"), point, itemIndex, grid)
        )}
      </div>
    );
  };

  const renderCompare = () => {
    if (!layout.compare) {
      return renderList(false);
    }

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          width: "100%",
        }}
      >
        {[layout.compare.left, layout.compare.right].map((side, sideIndex) => {
          const progress = itemProgresses[sideIndex] || 0;
          const [accentA, accentB] = gradientPairs[sideIndex % gradientPairs.length];

          return (
            <div
              key={side.label}
              style={{
                padding: "24px 24px 26px",
                background: colors.whiteStrong,
                border: "1px solid rgba(255,255,255,0.82)",
                borderRadius: 28,
                boxShadow: `0 18px 34px ${colors.shadow}`,
                transform: `translateY(${interpolate(progress, [0, 1], [24, 0])}px)`,
                opacity: progress,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: 1.1,
                  textTransform: "uppercase",
                  color: colors.softText,
                }}
              >
                {side.label}
              </div>
              {side.value ? (
                <div
                  style={{
                    fontSize: 40,
                    lineHeight: 1,
                    fontWeight: 800,
                    color: colors.text,
                    marginTop: 12,
                  }}
                >
                  {side.value}
                </div>
              ) : null}
              <div
                style={{
                  width: 90,
                  height: 6,
                  borderRadius: 999,
                  margin: "16px 0 18px",
                  background: `linear-gradient(90deg, ${accentA}, ${accentB})`,
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {side.points.map((item, itemIndex) => (
                  <div key={`${side.label}-${itemIndex}`} style={{ display: "flex", gap: 12 }}>
                    <div
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: accentA,
                        marginTop: 11,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        fontSize: 24,
                        lineHeight: 1.42,
                        color: colors.text,
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
          const progress = itemProgresses[itemIndex] || 0;
          const [accentA, accentB] = gradientPairs[itemIndex % gradientPairs.length];

          return (
            <div
              key={`${item.label}-${itemIndex}`}
              style={{
                display: "grid",
                gridTemplateColumns: "86px 1fr",
                gap: 18,
                alignItems: "center",
                padding: "18px 22px",
                background: colors.whiteStrong,
                border: "1px solid rgba(255,255,255,0.82)",
                borderRadius: 26,
                boxShadow: `0 18px 34px ${colors.shadow}`,
                transform: `translateX(${interpolate(progress, [0, 1], [-24, 0])}px)`,
                opacity: progress,
              }}
            >
              <div
                style={{
                  height: 50,
                  borderRadius: 999,
                  background: `linear-gradient(135deg, ${accentA}, ${accentB})`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: colors.text,
                  fontSize: 16,
                  fontWeight: 800,
                }}
              >
                {item.label}
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: colors.text }}>
                  {item.title}
                </div>
                {item.description ? (
                  <div
                    style={{
                      fontSize: 21,
                      lineHeight: 1.42,
                      color: colors.muted,
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
            const progress = itemProgresses[statIndex] || 0;
            const [accentA, accentB] = gradientPairs[statIndex % gradientPairs.length];

            return (
              <div
                key={`${stat.label}-${statIndex}`}
                style={{
                  padding: "22px 20px",
                  background: colors.whiteStrong,
                  border: "1px solid rgba(255,255,255,0.82)",
                  borderRadius: 26,
                  boxShadow: `0 18px 34px ${colors.shadow}`,
                  transform: `translateY(${interpolate(progress, [0, 1], [22, 0])}px)`,
                  opacity: progress,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 6,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${accentA}, ${accentB})`,
                    marginBottom: 16,
                  }}
                />
                <div style={{ fontSize: 46, fontWeight: 800, color: colors.text }}>
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: colors.text,
                    marginTop: 10,
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
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {layout.points.slice(0, 2).map((point, itemIndex) =>
              renderBaseRow(String(itemIndex + 1).padStart(2, "0"), point, stats.length + itemIndex)
            )}
          </div>
        ) : null}
      </div>
    );
  };

  const renderQuote = () => {
    const progress = itemProgresses[0] || 0;

    return (
      <div
        style={{
          width: "100%",
          padding: "28px 30px",
          background: colors.whiteStrong,
          border: "1px solid rgba(255,255,255,0.82)",
          borderRadius: 28,
          boxShadow: `0 18px 34px ${colors.shadow}`,
          transform: `translateY(${interpolate(progress, [0, 1], [24, 0])}px)`,
          opacity: progress,
        }}
      >
        <div
          style={{
            fontSize: 46,
            lineHeight: 1.3,
            color: colors.text,
            fontWeight: 750,
            letterSpacing: "-0.8px",
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
              renderBaseRow(String(itemIndex + 1).padStart(2, "0"), point, itemIndex + 1)
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
        return renderList(true);
      case "hero":
      case "list":
      default:
        return renderList(false);
    }
  };

  return (
    <AbsoluteFill
      style={{
        background: colors.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', sans-serif",
        overflow: "hidden",
      }}
    >
      <SoftBackground frame={frame} />

      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "44px",
        }}
      >
        <MainCard frame={frame} delay={8}>
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Pill>{layout.badge || "Liquid Brief"}</Pill>
              <Pill textColor={colors.text}>
                {String(index + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
              </Pill>
            </div>

            <div
              style={{
                transform: `translateY(${interpolate(titleProgress, [0, 1], [24, 0])}px)`,
                opacity: titleProgress,
              }}
            >
              <div
                style={{
                  maxWidth: 760,
                  fontSize: 84,
                  fontWeight: 850,
                  lineHeight: 0.98,
                  letterSpacing: "-2.8px",
                  color: colors.text,
                }}
              >
                {layout.title}
              </div>
              <div
                style={{
                  width: interpolate(titleProgress, [0, 1], [0, 96]),
                  height: 6,
                  borderRadius: 999,
                  marginTop: 22,
                  background: `linear-gradient(90deg, ${colors.pink}, ${colors.cyan})`,
                }}
              />
            </div>

            {layout.subtitle ? (
              <div
                style={{
                  maxWidth: 720,
                  fontSize: 30,
                  lineHeight: 1.45,
                  color: colors.muted,
                  transform: `translateY(${interpolate(subtitleProgress, [0, 1], [18, 0])}px)`,
                  opacity: subtitleProgress,
                }}
              >
                {layout.subtitle}
              </div>
            ) : null}

            <div style={{ width: "100%" }}>{renderBody()}</div>
          </div>
        </MainCard>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
