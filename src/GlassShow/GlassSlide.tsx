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

// 单个幻灯片组件 - 毛玻璃风格
export const GlassSlide: React.FC<{
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

  // 配色
  const colors = {
    primary: "#8b5cf6",
    secondary: "#ec4899",
    accent: "#06b6d4",
    warm: "#f97316",
  };

  const pointColors = [
    colors.primary,
    colors.accent,
    colors.secondary,
    colors.warm,
  ];

  // 背景渐变动画
  const bgRotate = frame * 0.3;

  // 标题入场
  const titleProgress = spring({
    frame: frame - timing.titleStart,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const titleY = interpolate(titleProgress, [0, 1], [60, 0]);
  const titleBlur = interpolate(titleProgress, [0, 1], [10, 0]);

  // 副标题入场
  const subtitleProgress = spring({
    frame: frame - timing.subtitleStart,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const subtitleY = interpolate(subtitleProgress, [0, 1], [40, 0]);

  // 要点入场
  const pointProgresses = new Array(getKnowledgeLayoutItemCount(layout))
    .fill(null)
    .map((_, i) =>
      spring({
        frame: frame - timing.pointsStart - i * timing.pointStagger,
        fps,
        config: { damping: 10, stiffness: 100 },
      })
    );

  // 卡片浮动效果
  const cardFloat = Math.sin(frame * 0.03) * 8;

  // 淡出
  const exitOpacity = interpolate(
    frame,
    [timing.exitStart, timing.exitEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const renderListRow = (label: string, text: string, itemIndex: number) => {
    const progress = pointProgresses[itemIndex] || 0;
    const pointColor = pointColors[itemIndex % pointColors.length];

    return (
      <div
        key={`${label}-${text}-${itemIndex}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "24px 30px",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          borderRadius: 20,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          transform: `translateX(${interpolate(progress, [0, 1], [-50, 0])}px)`,
          opacity: progress,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${pointColor}, ${pointColor}cc)`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 22,
            fontWeight: 700,
            color: "white",
            boxShadow: `0 8px 20px ${pointColor}40`,
            flexShrink: 0,
          }}
        >
          {label}
        </div>
        <span
          style={{
            fontSize: 30,
            color: "rgba(255, 255, 255, 0.95)",
            fontWeight: 500,
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
          gap: 20,
          width: "100%",
          maxWidth: 780,
          marginTop: 10,
        }}
      >
        {sides.map((side, sideIndex) => {
          const progress = pointProgresses[sideIndex] || 0;
          const accent = pointColors[sideIndex % pointColors.length];

          return (
            <div
              key={side.label}
              style={{
                padding: "28px 26px",
                background: "rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(12px)",
                borderRadius: 24,
                border: "1px solid rgba(255, 255, 255, 0.14)",
                transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
                opacity: progress,
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.7)",
                  marginBottom: 10,
                }}
              >
                {side.label}
              </div>
              {side.value ? (
                <div
                  style={{
                    fontSize: 42,
                    fontWeight: 800,
                    color: "#ffffff",
                    marginBottom: 12,
                  }}
                >
                  {side.value}
                </div>
              ) : null}
              <div
                style={{
                  width: 88,
                  height: 4,
                  borderRadius: 999,
                  marginBottom: 18,
                  background: `linear-gradient(90deg, ${accent}, ${colors.accent})`,
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
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: accent,
                        marginTop: 12,
                        boxShadow: `0 0 24px ${accent}`,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        fontSize: 24,
                        color: "rgba(255,255,255,0.92)",
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          width: "100%",
          maxWidth: 760,
          marginTop: 8,
        }}
      >
        {items.map((item, itemIndex) => {
          const progress = pointProgresses[itemIndex] || 0;
          const accent = pointColors[itemIndex % pointColors.length];

          return (
            <div
              key={`${item.label}-${itemIndex}`}
              style={{
                display: "grid",
                gridTemplateColumns: "72px 1fr",
                gap: 18,
                alignItems: "center",
                padding: "20px 24px",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                borderRadius: 22,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transform: `translateX(${interpolate(progress, [0, 1], [-40, 0])}px)`,
                opacity: progress,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: 700,
                  boxShadow: `0 8px 20px ${accent}40`,
                }}
              >
                {item.label}
              </div>
              <div>
                <div
                  style={{ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.98)" }}
                >
                  {item.title}
                </div>
                {item.description ? (
                  <div
                    style={{
                      fontSize: 22,
                      color: "rgba(255,255,255,0.78)",
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          width: "100%",
          maxWidth: 780,
          marginTop: 10,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {stats.slice(0, 3).map((stat, statIndex) => {
            const progress = pointProgresses[statIndex] || 0;
            const accent = pointColors[statIndex % pointColors.length];

            return (
              <div
                key={`${stat.label}-${statIndex}`}
                style={{
                  padding: "24px 22px",
                  background: "rgba(255, 255, 255, 0.06)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 22,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transform: `translateY(${interpolate(progress, [0, 1], [24, 0])}px)`,
                  opacity: progress,
                }}
              >
                <div
                  style={{
                    fontSize: 46,
                    fontWeight: 800,
                    color: "#ffffff",
                    textShadow: `0 0 20px ${accent}30`,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.92)",
                    marginTop: 12,
                  }}
                >
                  {stat.label}
                </div>
                {stat.note ? (
                  <div
                    style={{
                      fontSize: 18,
                      color: "rgba(255,255,255,0.72)",
                      lineHeight: 1.4,
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
              renderListRow(`0${itemIndex + 1}`, point, stats.length + itemIndex)
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
          maxWidth: 780,
          marginTop: 12,
          padding: "32px 34px",
          background: "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(12px)",
          borderRadius: 24,
          border: "1px solid rgba(255, 255, 255, 0.14)",
          transform: `translateY(${interpolate(progress, [0, 1], [24, 0])}px)`,
          opacity: progress,
        }}
      >
        <div
          style={{
            fontSize: 46,
            color: "#ffffff",
            lineHeight: 1.35,
            fontWeight: 700,
          }}
        >
          "{layout.quote?.text || layout.title}"
        </div>
        {layout.quote?.author ? (
          <div
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.72)",
              marginTop: 14,
              marginBottom: 18,
            }}
          >
            {layout.quote.author}
          </div>
        ) : null}
        {layout.points.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
            {layout.points.map((point, itemIndex) =>
              renderListRow(
                String(itemIndex + 1).padStart(2, "0"),
                point,
                itemIndex + 1
              )
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
              width: "100%",
              maxWidth: 780,
              marginTop: 10,
            }}
          >
            {layout.points.map((point, itemIndex) =>
              renderListRow(String(itemIndex + 1), point, itemIndex)
            )}
          </div>
        );
      case "hero":
      case "list":
      default:
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              width: "100%",
              maxWidth: 750,
              marginTop: 10,
            }}
          >
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
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, 'PingFang SC', sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 1500,
          height: 1500,
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${bgRotate}deg)`,
          background: `conic-gradient(from 0deg, ${colors.primary}40, ${colors.secondary}40, ${colors.accent}40, ${colors.warm}40, ${colors.primary}40)`,
          filter: "blur(100px)",
          opacity: 0.6,
        }}
      />

      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2 + frame * 0.01;
        const radius = 350;
        const x = Math.cos(angle) * radius + 540;
        const y = Math.sin(angle) * radius + 960;
        const dotColors = [colors.primary, colors.secondary, colors.accent, colors.warm];

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: dotColors[i % 4],
              boxShadow: `0 0 40px ${dotColors[i % 4]}80`,
              opacity: 0.8,
            }}
          />
        );
      })}

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
            width: "92%",
            height: 900,
            padding: "60px 55px",
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
            borderRadius: 40,
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: `
              0 25px 50px rgba(0, 0, 0, 0.3),
              inset 0 1px 1px rgba(255, 255, 255, 0.1)
            `,
            transform: `translateY(${cardFloat}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -20,
              right: 40,
              padding: "12px 28px",
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              borderRadius: 30,
              fontSize: 22,
              fontWeight: 700,
              color: "white",
              boxShadow: `0 10px 40px ${colors.primary}50`,
            }}
          >
            {index + 1} / {totalSlides}
          </div>

          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#ffffff",
              textAlign: "center",
              margin: 0,
              marginBottom: 20,
              transform: `translateY(${titleY}px)`,
              opacity: titleProgress,
              filter: `blur(${titleBlur}px)`,
              textShadow: "0 4px 30px rgba(0,0,0,0.3)",
              letterSpacing: "-1px",
            }}
          >
            {layout.title}
          </h1>

          <div
            style={{
              width: interpolate(titleProgress, [0, 1], [0, 200]),
              height: 4,
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
              borderRadius: 2,
              marginBottom: 24,
            }}
          />

          {layout.subtitle && (
            <p
              style={{
                fontSize: 32,
                color: "rgba(255, 255, 255, 0.8)",
                textAlign: "center",
                margin: 0,
                marginBottom: 42,
                transform: `translateY(${subtitleY}px)`,
                opacity: subtitleProgress,
                fontWeight: 400,
                maxWidth: 760,
                lineHeight: 1.4,
              }}
            >
              {layout.subtitle}
            </p>
          )}

          {renderBody()}
        </div>

        <div
          style={{
            marginTop: 40,
            display: "flex",
            gap: 12,
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
                    ? `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`
                    : "rgba(255, 255, 255, 0.3)",
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
