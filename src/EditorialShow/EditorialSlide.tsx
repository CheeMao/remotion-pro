import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSafeAreaInsets } from "../layouts/safeArea";
import {
  getCta,
  getQuote,
  toChart,
  toCompare,
  toHighlights,
  toList,
  toStats,
  toSteps,
  toTimeline,
  type SlideType,
} from "../landscape/normalize";

// ===================================================================
// EDITORIAL — NYT Magazine × Kinfolk × Aesop
// 印刷质感 / 衬线大字 / 慢节奏 / 克制装饰
// ===================================================================

const EDITORIAL = {
  bg: "#f5efe3",
  paper: "#f0e9da",
  ink: "#1c1814",
  inkDim: "#65574a",
  inkFaint: "#9b8e7d",
  accent: "#b8442a", // terracotta
  gold: "#9b7c2e",
  rule: "rgba(28,24,20,0.18)",
  ruleFaint: "rgba(28,24,20,0.10)",
  serif:
    "'Newsreader', 'Source Serif Pro', Georgia, 'Times New Roman', 'Songti SC', serif",
  serifItalic:
    "'Newsreader', 'Source Serif Pro', Georgia, 'Times New Roman', serif",
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

// ===================================================================
// UTILS
// ===================================================================

const ease = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

const easeOut = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

// ===================================================================
// BACKGROUND (paper grain + subtle vignette)
// ===================================================================

const EditorialBg: React.FC = () => {
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: EDITORIAL.bg }} />
      {/* paper warmth */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 1600px 1200px at 50% 40%, rgba(255,251,242,0.4) 0%, transparent 65%), radial-gradient(ellipse 1100px 800px at 80% 90%, rgba(184,68,42,0.05) 0%, transparent 60%)",
        }}
      />
      {/* grain (dot pattern) */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(rgba(28,24,20,0.06) 1px, transparent 1px),
                            radial-gradient(rgba(28,24,20,0.04) 1px, transparent 1px)`,
          backgroundSize: "3px 3px, 7px 7px",
          backgroundPosition: "0 0, 1px 1px",
          opacity: 0.7,
        }}
      />
      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 1600px 1100px at 50% 50%, transparent 50%, rgba(28,24,20,0.10) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ===================================================================
// CHROME (chapter info, pagination, hairlines)
// ===================================================================

const EditorialChrome: React.FC<{
  frame: number;
  index: number;
  totalSlides: number;
  sectionLabel: string;
  children: React.ReactNode;
}> = ({ frame, index, totalSlides, sectionLabel, children }) => {
  const { width, height } = useVideoConfig();
  const safeArea = getSafeAreaInsets(width, height);
  const headerOpacity = ease(frame, 0, 22);
  const footerOpacity = ease(frame, 4, 26);
  const rulesGrow = easeOut(frame, 6, 36);

  return (
    <>
      {/* TOP HAIRLINE */}
      <div
        style={{
          position: "absolute",
          top: safeArea.headerTop + 28,
          left: safeArea.left,
          right: safeArea.right,
          height: 1,
          background: EDITORIAL.rule,
          transformOrigin: "left center",
          transform: `scaleX(${rulesGrow})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: safeArea.headerTop + 34,
          left: safeArea.left,
          right: safeArea.right,
          height: 1,
          background: EDITORIAL.rule,
          transformOrigin: "right center",
          transform: `scaleX(${rulesGrow})`,
          opacity: 0.5,
        }}
      />

      {/* TOP CHROME */}
      <div
        style={{
          position: "absolute",
          top: safeArea.headerTop - 6,
          left: safeArea.left,
          right: safeArea.right,
          display: "flex",
          alignItems: "center",
          opacity: headerOpacity,
          fontFamily: EDITORIAL.serifItalic,
          fontStyle: "italic",
          fontSize: 16,
          color: EDITORIAL.inkDim,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        <span>Chapter&nbsp;&nbsp;{ROMAN[Math.min(index, ROMAN.length - 1)]}</span>
        <span style={{ margin: "0 18px", color: EDITORIAL.accent }}>·</span>
        <span style={{ fontStyle: "normal", color: EDITORIAL.accent }}>
          {sectionLabel}
        </span>
        <span style={{ marginLeft: "auto", letterSpacing: "0.2em" }}>
          The Editorial Quarterly
        </span>
      </div>

      {/* CONTENT */}
      <div
        style={{
          position: "absolute",
          left: safeArea.left,
          right: safeArea.right,
          top: safeArea.top,
          bottom: safeArea.bottom,
          fontFamily: EDITORIAL.serif,
          color: EDITORIAL.ink,
        }}
      >
        {children}
      </div>

      {/* BOTTOM HAIRLINE */}
      <div
        style={{
          position: "absolute",
          bottom: safeArea.headerTop + 34,
          left: safeArea.left,
          right: safeArea.right,
          height: 1,
          background: EDITORIAL.rule,
          transformOrigin: "right center",
          transform: `scaleX(${rulesGrow})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: safeArea.headerTop + 28,
          left: safeArea.left,
          right: safeArea.right,
          height: 1,
          background: EDITORIAL.rule,
          transformOrigin: "left center",
          transform: `scaleX(${rulesGrow})`,
          opacity: 0.5,
        }}
      />

      {/* BOTTOM CHROME */}
      <div
        style={{
          position: "absolute",
          bottom: safeArea.headerTop - 10,
          left: safeArea.left,
          right: safeArea.right,
          display: "flex",
          alignItems: "center",
          opacity: footerOpacity,
          fontFamily: EDITORIAL.serifItalic,
          fontStyle: "italic",
          fontSize: 15,
          color: EDITORIAL.inkDim,
          letterSpacing: "0.14em",
        }}
      >
        <span style={{ textTransform: "uppercase" }}>
          A Quiet Publication on Slow Knowledge
        </span>
        <span style={{ marginLeft: "auto" }}>
          <span
            style={{
              fontStyle: "normal",
              fontFamily: EDITORIAL.serif,
              fontWeight: 700,
              fontSize: 18,
              color: EDITORIAL.ink,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          &nbsp;&nbsp;/&nbsp;&nbsp;
          <span
            style={{
              fontStyle: "normal",
              color: EDITORIAL.inkFaint,
            }}
          >
            {String(totalSlides).padStart(2, "0")}
          </span>
        </span>
      </div>
    </>
  );
};

// ===================================================================
// ATOMS
// ===================================================================

const SmallCapsLabel: React.FC<{
  text: string;
  frame: number;
  delay?: number;
  color?: string;
}> = ({ text, frame, delay = 0, color = EDITORIAL.accent }) => {
  const a = ease(frame, delay, delay + 22);
  return (
    <div
      style={{
        opacity: a,
        transform: `translateY(${(1 - a) * 8}px)`,
        fontFamily: EDITORIAL.serifItalic,
        fontSize: 17,
        color,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        fontStyle: "italic",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <span
        style={{
          width: 28,
          height: 1,
          background: color,
          display: "inline-block",
        }}
      />
      {text}
    </div>
  );
};

const SerifHeadline: React.FC<{
  text: string;
  frame: number;
  delay?: number;
  size?: number;
  color?: string;
  italic?: boolean;
  maxWidth?: number | string;
}> = ({
  text,
  frame,
  delay = 0,
  size = 84,
  color = EDITORIAL.ink,
  italic = false,
  maxWidth = 1500,
}) => {
  const a = ease(frame, delay, delay + 28);
  return (
    <div
      style={{
        fontFamily: italic ? EDITORIAL.serifItalic : EDITORIAL.serif,
        fontStyle: italic ? "italic" : "normal",
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: "-0.012em",
        color,
        opacity: a,
        transform: `translateY(${(1 - a) * 24}px)`,
        maxWidth,
      }}
    >
      {text}
    </div>
  );
};

const SerifBody: React.FC<{
  text: string;
  frame: number;
  delay?: number;
  size?: number;
  color?: string;
  italic?: boolean;
  maxWidth?: number | string;
}> = ({
  text,
  frame,
  delay = 0,
  size = 24,
  color = EDITORIAL.inkDim,
  italic = false,
  maxWidth = 980,
}) => {
  const a = ease(frame, delay, delay + 24);
  return (
    <div
      style={{
        fontFamily: italic ? EDITORIAL.serifItalic : EDITORIAL.serif,
        fontStyle: italic ? "italic" : "normal",
        fontWeight: italic ? 400 : 500,
        fontSize: size,
        lineHeight: 1.55,
        color,
        opacity: a,
        transform: `translateY(${(1 - a) * 14}px)`,
        maxWidth,
      }}
    >
      {text}
    </div>
  );
};

const Ornament: React.FC<{
  frame: number;
  delay?: number;
  width?: number;
}> = ({ frame, delay = 0, width = 60 }) => {
  const a = ease(frame, delay, delay + 22);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        opacity: a,
      }}
    >
      <div
        style={{
          width,
          height: 1,
          background: EDITORIAL.gold,
        }}
      />
      <div
        style={{
          width: 6,
          height: 6,
          background: EDITORIAL.gold,
          transform: "rotate(45deg)",
        }}
      />
      <div
        style={{
          width,
          height: 1,
          background: EDITORIAL.gold,
        }}
      />
    </div>
  );
};

// ===================================================================
// PROPS
// ===================================================================

interface Props {
  title?: string;
  subtitle?: string;
  points?: string[];
  type?: SlideType;
  data?: Record<string, unknown>;
  index: number;
  totalSlides: number;
  durationInFrames: number;
}

// ===================================================================
// MAIN
// ===================================================================

export const EditorialSlide: React.FC<Props> = ({
  title = "",
  subtitle,
  points,
  type = "default",
  data,
  index,
  totalSlides,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  void durationInFrames;

  // ----- HERO (drop cap + headline + deck) -----
  const renderHero = () => {
    const firstChar = title.charAt(0) || "·";
    const rest = title.slice(1);
    const cta = getCta(data);
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
        }}
      >
        <SmallCapsLabel text="A Reading In Six Movements" frame={frame} delay={20} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* Drop cap */}
          <div
            style={{
              fontFamily: EDITORIAL.serif,
              fontSize: 280,
              fontWeight: 900,
              lineHeight: 0.78,
              color: EDITORIAL.accent,
              opacity: ease(frame, 28, 60),
              transform: `scale(${0.85 + ease(frame, 28, 60) * 0.15}) translateY(-12px)`,
              transformOrigin: "left top",
            }}
          >
            {firstChar}
          </div>
          <SerifHeadline
            text={rest}
            frame={frame}
            delay={36}
            size={92}
            maxWidth={1200}
          />
        </div>

        {subtitle && (
          <div style={{ marginTop: 14, paddingLeft: 224 }}>
            <SerifBody
              text={subtitle}
              frame={frame}
              delay={56}
              size={28}
              italic
              maxWidth={1100}
              color={EDITORIAL.inkDim}
            />
          </div>
        )}

        {cta && (
          <div style={{ marginTop: 28, paddingLeft: 224 }}>
            <Ornament frame={frame} delay={70} />
            <div
              style={{
                marginTop: 16,
                fontFamily: EDITORIAL.serifItalic,
                fontStyle: "italic",
                fontSize: 19,
                color: EDITORIAL.accent,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                opacity: ease(frame, 76, 96),
              }}
            >
              ❦&nbsp;&nbsp;{cta}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ----- STATS (serif numerals + italic descriptions) -----
  const renderStats = () => {
    const stats = toStats(points, data).slice(0, 4);
    if (stats.length === 0) return renderDefault();
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <SmallCapsLabel text="Field Notes — In Numbers" frame={frame} delay={14} />
        <SerifHeadline text={title} frame={frame} delay={22} size={56} maxWidth={1500} />
        {subtitle && (
          <SerifBody text={subtitle} frame={frame} delay={36} size={22} italic />
        )}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
            gap: 36,
            alignItems: "center",
            marginTop: 24,
          }}
        >
          {stats.map((s, i) => {
            const d = 46 + i * 12;
            const a = ease(frame, d, d + 28);
            return (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  paddingLeft: i === 0 ? 0 : 32,
                  borderLeft:
                    i === 0 ? "none" : `1px solid ${EDITORIAL.ruleFaint}`,
                  opacity: a,
                  transform: `translateY(${(1 - a) * 18}px)`,
                }}
              >
                <div
                  style={{
                    fontFamily: EDITORIAL.serif,
                    fontSize: 130,
                    fontWeight: 900,
                    lineHeight: 0.92,
                    color: EDITORIAL.ink,
                    letterSpacing: "-0.03em",
                    display: "flex",
                    alignItems: "baseline",
                  }}
                >
                  {s.value || `${s.rawValue}${s.suffix}`}
                </div>
                <div
                  style={{
                    width: 40,
                    height: 1,
                    background: EDITORIAL.accent,
                    marginTop: 4,
                  }}
                />
                <div
                  style={{
                    fontFamily: EDITORIAL.serifItalic,
                    fontStyle: "italic",
                    fontSize: 22,
                    color: EDITORIAL.ink,
                    fontWeight: 600,
                    marginTop: 4,
                  }}
                >
                  {s.label}
                </div>
                {s.note && (
                  <div
                    style={{
                      fontSize: 14,
                      color: EDITORIAL.inkFaint,
                      fontFamily: EDITORIAL.serif,
                      letterSpacing: "0.05em",
                    }}
                  >
                    — {s.note}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ----- COMPARE (two-column magazine spread) -----
  const renderCompare = () => {
    const { left, right } = toCompare(points, data);
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <SmallCapsLabel text="A Tale of Two" frame={frame} delay={14} />
        <SerifHeadline text={title} frame={frame} delay={22} size={56} />
        {subtitle && (
          <SerifBody text={subtitle} frame={frame} delay={36} size={22} italic />
        )}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1px 1fr",
            gap: 0,
            alignItems: "stretch",
            marginTop: 28,
          }}
        >
          {/* LEFT */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
              padding: "20px 50px 20px 0",
              opacity: ease(frame, 44, 64),
              transform: `translateX(${(1 - ease(frame, 44, 64)) * -16}px)`,
            }}
          >
            <div
              style={{
                fontFamily: EDITORIAL.serifItalic,
                fontStyle: "italic",
                fontSize: 17,
                color: EDITORIAL.inkFaint,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              i.&nbsp;&nbsp;{left.label}
            </div>
            <div
              style={{
                fontFamily: EDITORIAL.serifItalic,
                fontStyle: "italic",
                fontSize: 70,
                fontWeight: 700,
                lineHeight: 1.06,
                color: EDITORIAL.ink,
                letterSpacing: "-0.012em",
              }}
            >
              {left.value}
            </div>
            {left.desc && (
              <div
                style={{
                  fontSize: 22,
                  color: EDITORIAL.inkDim,
                  lineHeight: 1.55,
                  fontFamily: EDITORIAL.serif,
                  fontWeight: 500,
                }}
              >
                {left.desc}
              </div>
            )}
          </div>

          {/* DIVIDER */}
          <div
            style={{
              background: EDITORIAL.rule,
              transformOrigin: "top",
              transform: `scaleY(${ease(frame, 40, 64)})`,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) rotate(45deg)",
                width: 10,
                height: 10,
                background: EDITORIAL.gold,
                opacity: ease(frame, 56, 76),
              }}
            />
          </div>

          {/* RIGHT */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
              padding: "20px 0 20px 50px",
              opacity: ease(frame, 50, 70),
              transform: `translateX(${(1 - ease(frame, 50, 70)) * 16}px)`,
            }}
          >
            <div
              style={{
                fontFamily: EDITORIAL.serif,
                fontSize: 17,
                color: EDITORIAL.accent,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              ii.&nbsp;&nbsp;{right.label}
            </div>
            <div
              style={{
                fontFamily: EDITORIAL.serif,
                fontSize: 70,
                fontWeight: 900,
                lineHeight: 1.06,
                color: EDITORIAL.ink,
                letterSpacing: "-0.018em",
              }}
            >
              {right.value}
            </div>
            {right.desc && (
              <div
                style={{
                  fontSize: 22,
                  color: EDITORIAL.inkDim,
                  lineHeight: 1.55,
                  fontFamily: EDITORIAL.serif,
                  fontWeight: 500,
                }}
              >
                {right.desc}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ----- CHART -----
  const renderChart = () => {
    const bars = toChart(points, data).slice(0, 6);
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <SmallCapsLabel text="Measured Findings" frame={frame} delay={14} />
        <SerifHeadline text={title} frame={frame} delay={22} size={56} />
        {subtitle && (
          <SerifBody text={subtitle} frame={frame} delay={36} size={22} italic />
        )}
        <div
          style={{
            flex: 1,
            display: "grid",
            gap: 24,
            alignContent: "center",
            marginTop: 24,
            paddingRight: 40,
          }}
        >
          {bars.map((b, i) => {
            const d = 46 + i * 12;
            const fillProgress = ease(frame, d, d + 36);
            const numProgress = ease(frame, d + 6, d + 38);
            const w = Math.max(0, Math.min(100, b.value));
            return (
              <div
                key={`${b.label}-${i}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "320px 1fr 130px",
                  gap: 28,
                  alignItems: "center",
                  opacity: ease(frame, d, d + 16),
                }}
              >
                <div
                  style={{
                    fontFamily: EDITORIAL.serif,
                    fontSize: 22,
                    color: EDITORIAL.ink,
                    fontWeight: 700,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}&nbsp;&nbsp;
                  <span style={{ fontStyle: "italic", fontWeight: 500 }}>
                    {b.label}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "rgba(28,24,20,0.08)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${w * fillProgress}%`,
                      background: EDITORIAL.accent,
                    }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: EDITORIAL.serif,
                    fontSize: 32,
                    fontWeight: 800,
                    color: EDITORIAL.ink,
                    textAlign: "right",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {Math.floor(w * numProgress)}
                  <span
                    style={{
                      fontSize: 18,
                      fontFamily: EDITORIAL.serifItalic,
                      fontStyle: "italic",
                      color: EDITORIAL.accent,
                      marginLeft: 2,
                    }}
                  >
                    %
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ----- STEPS (Roman numerals) -----
  const renderSteps = () => {
    const steps = toSteps(points, data).slice(0, 4);
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <SmallCapsLabel text="In Four Movements" frame={frame} delay={14} />
        <SerifHeadline text={title} frame={frame} delay={22} size={56} />
        {subtitle && (
          <SerifBody text={subtitle} frame={frame} delay={36} size={22} italic />
        )}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(steps.length, 4)}, 1fr)`,
            gap: 40,
            marginTop: 32,
            alignItems: "start",
          }}
        >
          {steps.map((step, i) => {
            const d = 46 + i * 14;
            const a = ease(frame, d, d + 28);
            return (
              <div
                key={`${step.title}-${i}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  opacity: a,
                  transform: `translateY(${(1 - a) * 22}px)`,
                  borderTop: `2px solid ${EDITORIAL.accent}`,
                  paddingTop: 22,
                }}
              >
                <div
                  style={{
                    fontFamily: EDITORIAL.serif,
                    fontSize: 60,
                    fontWeight: 900,
                    color: EDITORIAL.accent,
                    lineHeight: 1,
                  }}
                >
                  {ROMAN[i]}
                </div>
                <div
                  style={{
                    fontFamily: EDITORIAL.serif,
                    fontSize: 28,
                    fontWeight: 800,
                    color: EDITORIAL.ink,
                    lineHeight: 1.2,
                  }}
                >
                  {step.title}
                </div>
                {step.desc && (
                  <div
                    style={{
                      fontFamily: EDITORIAL.serifItalic,
                      fontStyle: "italic",
                      fontSize: 18,
                      color: EDITORIAL.inkDim,
                      lineHeight: 1.55,
                    }}
                  >
                    {step.desc}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ----- TIMELINE (vertical-leaning chronology) -----
  const renderTimeline = () => {
    const timeline = toTimeline(points, data).slice(0, 5);
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <SmallCapsLabel text="A Brief Chronology" frame={frame} delay={14} />
        <SerifHeadline text={title} frame={frame} delay={22} size={52} />
        {subtitle && (
          <SerifBody text={subtitle} frame={frame} delay={36} size={20} italic />
        )}
        <div
          style={{
            flex: 1,
            display: "grid",
            gap: 18,
            alignContent: "center",
            marginTop: 18,
            paddingRight: 40,
          }}
        >
          {timeline.map((t, i) => {
            const d = 44 + i * 12;
            const a = ease(frame, d, d + 26);
            return (
              <div
                key={`${t.year}-${i}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "150px 1fr",
                  gap: 36,
                  alignItems: "baseline",
                  paddingBottom: 16,
                  borderBottom:
                    i < timeline.length - 1
                      ? `1px solid ${EDITORIAL.ruleFaint}`
                      : "none",
                  opacity: a,
                  transform: `translateY(${(1 - a) * 14}px)`,
                }}
              >
                <div
                  style={{
                    fontFamily: EDITORIAL.serif,
                    fontSize: 38,
                    fontWeight: 800,
                    color: EDITORIAL.accent,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {t.year}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: EDITORIAL.ink,
                      lineHeight: 1.25,
                    }}
                  >
                    {t.title}
                  </div>
                  {t.desc && (
                    <div
                      style={{
                        fontFamily: EDITORIAL.serifItalic,
                        fontStyle: "italic",
                        fontSize: 18,
                        color: EDITORIAL.inkDim,
                        marginTop: 6,
                        lineHeight: 1.55,
                        maxWidth: 1100,
                      }}
                    >
                      {t.desc}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ----- LIST -----
  const renderList = () => {
    const items = toList(points, data).slice(0, 6);
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <SmallCapsLabel text="Notes & Findings" frame={frame} delay={14} />
        <SerifHeadline text={title} frame={frame} delay={22} size={58} />
        {subtitle && (
          <SerifBody text={subtitle} frame={frame} delay={36} size={22} italic />
        )}
        <div
          style={{
            flex: 1,
            display: "grid",
            gap: 16,
            alignContent: "center",
            marginTop: 24,
            maxWidth: 1500,
          }}
        >
          {items.map((item, i) => {
            const d = 46 + i * 12;
            const a = ease(frame, d, d + 26);
            return (
              <div
                key={`${item.title}-${i}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 1fr",
                  gap: 28,
                  alignItems: "baseline",
                  paddingBottom: 16,
                  borderBottom:
                    i < items.length - 1
                      ? `1px solid ${EDITORIAL.ruleFaint}`
                      : "none",
                  opacity: a,
                  transform: `translateY(${(1 - a) * 12}px)`,
                }}
              >
                <div
                  style={{
                    fontFamily: EDITORIAL.serif,
                    fontSize: 36,
                    fontWeight: 800,
                    color: EDITORIAL.accent,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: EDITORIAL.serif,
                      fontSize: 28,
                      fontWeight: 700,
                      color: EDITORIAL.ink,
                      lineHeight: 1.25,
                    }}
                  >
                    {item.title}
                  </div>
                  {item.desc && (
                    <div
                      style={{
                        fontFamily: EDITORIAL.serifItalic,
                        fontStyle: "italic",
                        fontSize: 19,
                        color: EDITORIAL.inkDim,
                        marginTop: 4,
                        lineHeight: 1.55,
                      }}
                    >
                      {item.desc}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDefault = () => renderList();

  // ----- HIGHLIGHT (pull-quote fragments) -----
  const renderHighlight = () => {
    const items = toHighlights(points, data).slice(0, 6);
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <SmallCapsLabel text="Annotations" frame={frame} delay={14} />
        <SerifHeadline text={title} frame={frame} delay={22} size={56} />
        {subtitle && (
          <SerifBody text={subtitle} frame={frame} delay={36} size={22} italic />
        )}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            justifyContent: "center",
            marginTop: 18,
          }}
        >
          {items.map((it, i) => {
            const d = 44 + i * 14;
            const a = ease(frame, d, d + 28);
            const isAccent = i % 2 === 0;
            return (
              <div
                key={`${it}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 22,
                  opacity: a,
                  transform: `translateX(${(1 - a) * (isAccent ? -16 : 16)}px)`,
                }}
              >
                <div
                  style={{
                    fontFamily: EDITORIAL.serifItalic,
                    fontStyle: "italic",
                    fontSize: 20,
                    color: EDITORIAL.gold,
                    width: 42,
                    flexShrink: 0,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div
                  style={{
                    fontFamily: isAccent
                      ? EDITORIAL.serif
                      : EDITORIAL.serifItalic,
                    fontStyle: isAccent ? "normal" : "italic",
                    fontSize: 36,
                    fontWeight: isAccent ? 800 : 600,
                    color: isAccent ? EDITORIAL.ink : EDITORIAL.accent,
                    lineHeight: 1.3,
                    maxWidth: 1500,
                  }}
                >
                  {it}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ----- QUOTE -----
  const renderQuote = () => {
    const { quote, author } = getQuote(data, title, subtitle);
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          paddingLeft: 60,
        }}
      >
        {/* Giant quotation mark */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: -10,
            fontSize: 380,
            fontFamily: EDITORIAL.serif,
            fontWeight: 900,
            color: EDITORIAL.accent,
            opacity: 0.16 * ease(frame, 6, 30),
            lineHeight: 0.7,
            pointerEvents: "none",
          }}
        >
          "
        </div>
        <SmallCapsLabel
          text="A Sentence Worth Keeping"
          frame={frame}
          delay={14}
        />
        <div
          style={{
            marginTop: 36,
            fontFamily: EDITORIAL.serifItalic,
            fontStyle: "italic",
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.18,
            letterSpacing: "-0.012em",
            color: EDITORIAL.ink,
            maxWidth: 1500,
            opacity: ease(frame, 24, 56),
            transform: `translateY(${(1 - ease(frame, 24, 56)) * 18}px)`,
          }}
        >
          {quote}
        </div>
        {author && (
          <div
            style={{
              marginTop: 40,
              display: "flex",
              alignItems: "center",
              gap: 18,
              opacity: ease(frame, 60, 80),
            }}
          >
            <div
              style={{
                width: 56,
                height: 1,
                background: EDITORIAL.accent,
              }}
            />
            <div
              style={{
                fontFamily: EDITORIAL.serif,
                fontSize: 22,
                color: EDITORIAL.ink,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {author}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ----- CTA -----
  const renderCta = () => {
    const cta = getCta(data) || "Read further";
    const tags = toHighlights(points, data).slice(0, 4);
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
        }}
      >
        <SmallCapsLabel text="Fin." frame={frame} delay={14} />
        <SerifHeadline text={title} frame={frame} delay={22} size={88} />
        {subtitle && (
          <SerifBody text={subtitle} frame={frame} delay={42} size={28} italic maxWidth={1300} />
        )}
        <div style={{ marginTop: 18 }}>
          <Ornament frame={frame} delay={60} width={80} />
        </div>
        <div
          style={{
            marginTop: 18,
            opacity: ease(frame, 66, 86),
            transform: `translateY(${(1 - ease(frame, 66, 86)) * 14}px)`,
          }}
        >
          <div
            style={{
              fontFamily: EDITORIAL.serifItalic,
              fontStyle: "italic",
              fontSize: 24,
              color: EDITORIAL.accent,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 16,
              borderBottom: `2px solid ${EDITORIAL.accent}`,
              paddingBottom: 8,
            }}
          >
            ❦&nbsp;&nbsp;{cta}
          </div>
        </div>
        {tags.length > 0 && (
          <div
            style={{
              marginTop: 26,
              display: "flex",
              gap: 22,
              opacity: ease(frame, 80, 100),
              fontFamily: EDITORIAL.serifItalic,
              fontStyle: "italic",
              fontSize: 17,
              color: EDITORIAL.inkFaint,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {tags.map((t, i) => (
              <span key={`${t}-${i}`}>
                {i > 0 && (
                  <span style={{ marginRight: 22, color: EDITORIAL.gold }}>·</span>
                )}
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ===== DISPATCH =====
  const renderBody = () => {
    switch (type) {
      case "hero":
        return renderHero();
      case "stats":
        return renderStats();
      case "compare":
        return renderCompare();
      case "chart":
        return renderChart();
      case "steps":
        return renderSteps();
      case "timeline":
        return renderTimeline();
      case "highlight":
        return renderHighlight();
      case "quote":
        return renderQuote();
      case "cta":
        return renderCta();
      case "list":
        return renderList();
      case "default":
      default:
        return renderDefault();
    }
  };

  const sectionLabel =
    type === "hero"
      ? "Opening"
      : type === "cta"
        ? "Coda"
        : type === "quote"
          ? "Marginalia"
          : type === "stats"
            ? "Findings"
            : type === "compare"
              ? "Counterpoint"
              : type === "timeline"
                ? "Chronology"
                : type === "steps"
                  ? "Movements"
                  : type === "chart"
                    ? "Measure"
                    : type === "highlight"
                      ? "Annotation"
                      : "Reading";

  return (
    <AbsoluteFill style={{ background: EDITORIAL.bg }}>
      <EditorialBg />
      <EditorialChrome
        frame={frame}
        index={index}
        totalSlides={totalSlides}
        sectionLabel={sectionLabel}
      >
        {renderBody()}
      </EditorialChrome>
    </AbsoluteFill>
  );
};
