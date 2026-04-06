import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type SlideType =
  | "hero"
  | "default"
  | "list"
  | "steps"
  | "compare"
  | "stats"
  | "chart"
  | "timeline"
  | "highlight"
  | "quote"
  | "cta";

type GenericRecord = Record<string, unknown>;

type ListItem = { title: string; desc?: string };
type StatItem = { label: string; value: string; note?: string };
type ChartBar = { label: string; value: number };
type CompareItem = { label: string; value: string; desc?: string };
type TimelineItem = { year: string; title: string; desc?: string };
type StepItem = { title: string; desc?: string };

interface Props {
  title?: string;
  subtitle?: string;
  points?: string[];
  type?: SlideType;
  data?: GenericRecord;
  index: number;
  totalSlides: number;
  durationInFrames: number;
}

const c = {
  bg: "#f3f6fb",
  text: "#111827",
  muted: "#667085",
  panel: "rgba(255,255,255,0.78)",
  panelStrong: "rgba(255,255,255,0.88)",
  border: "rgba(15,23,42,0.08)",
  shadow: "rgba(15,23,42,0.08)",
  blue: "#0a84ff",
  cyan: "#58c4dc",
  purple: "#7c3aed",
  pink: "#f43f8f",
  green: "#10b981",
  red: "#ff5f57",
  yellow: "#febc2e",
  macGreen: "#28c840",
};

const accents = [c.blue, c.purple, c.cyan, c.pink, c.green];

const metricToNumber = (value?: string): number => {
  if (!value) return 0;
  const match = value.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const splitPoint = (point: string): ListItem => {
  const parts = point
    .split(/[:：-]\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length <= 1
    ? { title: point.trim() }
    : { title: parts[0], desc: parts.slice(1).join(" - ") };
};

const toList = (points?: string[], data?: GenericRecord): ListItem[] => {
  if (Array.isArray(data?.items)) {
    const normalized: ListItem[] = [];
    (data.items as unknown[]).forEach((item) => {
      if (typeof item === "string") {
        normalized.push(splitPoint(item));
        return;
      }
      if (!item || typeof item !== "object") return;
      const record = item as GenericRecord;
      const title =
        typeof record.text === "string"
          ? record.text
          : typeof record.title === "string"
            ? record.title
            : "";
      if (!title) return;
      normalized.push({
        title,
        desc:
          typeof record.desc === "string"
            ? record.desc
            : typeof record.description === "string"
              ? record.description
              : undefined,
      });
    });
    return normalized;
  }
  return (points || []).map(splitPoint);
};

const toStats = (points?: string[], data?: GenericRecord): StatItem[] => {
  if (Array.isArray(data?.stats)) {
    const normalized: StatItem[] = [];
    (data.stats as unknown[]).forEach((item) => {
      if (!item || typeof item !== "object") return;
      const record = item as GenericRecord;
      normalized.push({
        label:
          typeof record.label === "string"
            ? record.label
            : typeof record.title === "string"
              ? record.title
              : "Metric",
        value:
          typeof record.value === "number" || typeof record.value === "string"
            ? `${record.value}${typeof record.suffix === "string" ? record.suffix : ""}`
            : "0",
        note: typeof record.note === "string" ? record.note : undefined,
      });
    });
    return normalized;
  }
  return (points || []).map((point, index) => {
    const parsed = splitPoint(point);
    return { label: parsed.title || `Metric ${index + 1}`, value: parsed.desc || parsed.title };
  });
};

const toChart = (points?: string[], data?: GenericRecord): ChartBar[] => {
  if (Array.isArray(data?.bars)) {
    return (data.bars as unknown[])
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as GenericRecord;
        const raw = record.percent ?? record.value;
        const value = typeof raw === "number" ? raw : Number(raw || 0);
        if (typeof record.label !== "string" || Number.isNaN(value)) return null;
        return { label: record.label, value };
      })
      .filter((item): item is { label: string; value: number } => item !== null);
  }
  return (points || []).map((point, index) => {
    const parsed = splitPoint(point);
    return {
      label: parsed.title || `Bar ${index + 1}`,
      value: Number((parsed.desc || "0").replace(/[^\d.-]/g, "")) || 0,
    };
  });
};

const toCompare = (
  points?: string[],
  data?: GenericRecord,
): { left: CompareItem; right: CompareItem } => {
  const left = data?.left && typeof data.left === "object" ? (data.left as GenericRecord) : undefined;
  const right = data?.right && typeof data.right === "object" ? (data.right as GenericRecord) : undefined;
  if (left && right) {
    return {
      left: {
        label: typeof left.label === "string" ? left.label : "Before",
        value: typeof left.value === "string" ? left.value : typeof left.title === "string" ? left.title : "",
        desc: typeof left.desc === "string" ? left.desc : undefined,
      },
      right: {
        label: typeof right.label === "string" ? right.label : "After",
        value: typeof right.value === "string" ? right.value : typeof right.title === "string" ? right.title : "",
        desc: typeof right.desc === "string" ? right.desc : undefined,
      },
    };
  }
  const [l, r] = points || [];
  const leftPoint = splitPoint(l || "Before");
  const rightPoint = splitPoint(r || "After");
  return {
    left: { label: leftPoint.title, value: leftPoint.desc || leftPoint.title },
    right: { label: rightPoint.title, value: rightPoint.desc || rightPoint.title },
  };
};

const toTimeline = (points?: string[], data?: GenericRecord): TimelineItem[] => {
  if (Array.isArray(data?.timeline)) {
    const normalized: TimelineItem[] = [];
    (data.timeline as unknown[]).forEach((item) => {
      if (!item || typeof item !== "object") return;
      const record = item as GenericRecord;
      if (typeof record.title !== "string") return;
      normalized.push({
        year: typeof record.year === "string" ? record.year : "",
        title: record.title,
        desc: typeof record.description === "string" ? record.description : undefined,
      });
    });
    return normalized;
  }
  return (points || []).map((point, index) => {
    const parsed = splitPoint(point);
    return { year: String(index + 1).padStart(2, "0"), title: parsed.title, desc: parsed.desc };
  });
};

const toSteps = (points?: string[], data?: GenericRecord): StepItem[] => {
  if (Array.isArray(data?.steps)) {
    const normalized: StepItem[] = [];
    (data.steps as unknown[]).forEach((item) => {
      if (!item || typeof item !== "object") return;
      const record = item as GenericRecord;
      const stepTitle = typeof record.title === "string" ? record.title : "";
      if (!stepTitle) return;
      normalized.push({
        title: stepTitle,
        desc:
          typeof record.description === "string"
            ? record.description
            : typeof record.desc === "string"
              ? record.desc
              : undefined,
      });
    });
    return normalized;
  }
  return (points || []).map(splitPoint);
};

const WindowFrame: React.FC<{
  children: React.ReactNode;
  frame: number;
  index: number;
  totalSlides: number;
}> = ({ children, frame, index, totalSlides }) => {
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: { damping: 18, stiffness: 110 } });
  return (
    <div
      style={{
        width: 1560,
        minHeight: 850,
        borderRadius: 30,
        background: c.panel,
        border: `1px solid ${c.border}`,
        backdropFilter: "blur(24px) saturate(140%)",
        WebkitBackdropFilter: "blur(24px) saturate(140%)",
        boxShadow: `0 32px 80px ${c.shadow}, inset 0 1px 0 rgba(255,255,255,0.72)`,
        overflow: "hidden",
        transform: `translateY(${interpolate(progress, [0, 1], [24, 0])}px) scale(${interpolate(progress, [0, 1], [0.98, 1])})`,
        opacity: progress,
      }}
    >
      <div
        style={{
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          background: "rgba(255,255,255,0.58)",
          borderBottom: `1px solid ${c.border}`,
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          {[c.red, c.yellow, c.macGreen].map((color) => (
            <div
              key={color}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: color,
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.65)",
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 15, color: c.muted, fontWeight: 700 }}>
          {String(index + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
        </div>
      </div>
      <div style={{ padding: "42px 48px 50px" }}>{children}</div>
    </div>
  );
};

const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const drift = Math.sin(frame * 0.01) * 3;
  const orbX = Math.sin(frame * 0.012) * 40;
  const orbY = Math.cos(frame * 0.009) * 28;
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(88,196,220,0.18) 0%, transparent 28%), radial-gradient(circle at 84% 22%, rgba(124,58,237,0.16) 0%, transparent 24%), radial-gradient(circle at 30% 82%, rgba(244,63,143,0.14) 0%, transparent 24%), linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          left: 110 + orbX,
          top: 100 + orbY,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(10,132,255,0.16) 0%, rgba(10,132,255,0) 68%)",
          filter: "blur(18px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 480,
          height: 480,
          right: 120 - orbX * 0.6,
          bottom: 90 - orbY * 0.6,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, rgba(124,58,237,0) 66%)",
          filter: "blur(24px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.32) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.42,
          transform: `translate(${drift}px, ${drift * 0.5}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(148,163,184,0.08) 100%)",
        }}
      />
    </>
  );
};

const SectionHeader: React.FC<{
  title?: string;
  subtitle?: string;
  frame: number;
  compact?: boolean;
}> = ({ title, subtitle, frame, compact = false }) => {
  const { fps } = useVideoConfig();
  const titleIn = spring({ frame: frame - 2, fps, config: { damping: 18, stiffness: 120 } });
  const subIn = spring({ frame: frame - 10, fps, config: { damping: 18, stiffness: 110 } });
  return (
    <div style={{ marginBottom: compact ? 24 : 34 }}>
      {title ? (
        <h1
          style={{
            margin: 0,
            fontSize: compact ? 54 : 72,
            lineHeight: compact ? 1.02 : 0.98,
            letterSpacing: "-0.05em",
            fontWeight: 900,
            color: c.text,
            transform: `translateY(${interpolate(titleIn, [0, 1], [18, 0])}px)`,
            opacity: titleIn,
          }}
        >
          {title}
        </h1>
      ) : null}
      {subtitle ? (
        <p
          style={{
            margin: "16px 0 0",
            fontSize: compact ? 24 : 28,
            lineHeight: 1.5,
            color: c.muted,
            maxWidth: 920,
            transform: `translateY(${interpolate(subIn, [0, 1], [14, 0])}px)`,
            opacity: subIn,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};

const SoftCard: React.FC<{
  children: React.ReactNode;
  frame: number;
  delay?: number;
  accent?: string;
  style?: React.CSSProperties;
}> = ({ children, frame, delay = 0, accent = c.blue, style }) => {
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 110 } });
  return (
    <div
      style={{
        background: c.panelStrong,
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow: "0 18px 40px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.75)",
        position: "relative",
        overflow: "hidden",
        transform: `translateY(${interpolate(progress, [0, 1], [16, 0])}px) scale(${interpolate(progress, [0, 1], [0.985, 1])})`,
        opacity: progress,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${accent}12 0%, transparent 36%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
};

const Pill: React.FC<{
  text: string;
  accent?: string;
  frame: number;
  delay?: number;
}> = ({ text, accent = c.blue, frame, delay = 0 }) => {
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 115 } });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 18px",
        borderRadius: 999,
        border: `1px solid ${accent}25`,
        background: `${accent}14`,
        color: c.text,
        fontSize: 18,
        fontWeight: 700,
        transform: `translateY(${interpolate(progress, [0, 1], [12, 0])}px)`,
        opacity: progress,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: accent,
          boxShadow: `0 0 0 8px ${accent}16`,
        }}
      />
      {text}
    </div>
  );
};

const SignalMeter: React.FC<{
  items: Array<{ label: string; value: string }>;
  frame: number;
  delay?: number;
}> = ({ items, frame, delay = 0 }) => {
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 110 } });
  return (
    <div
      style={{
        display: "grid",
        gap: 14,
        transform: `translateY(${interpolate(progress, [0, 1], [12, 0])}px)`,
        opacity: progress,
      }}
    >
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <span style={{ fontSize: 15, color: c.muted, fontWeight: 700 }}>{item.label}</span>
            <span style={{ fontSize: 15, color: c.text, fontWeight: 800 }}>{item.value}</span>
          </div>
          <div
            style={{
              height: 10,
              borderRadius: 999,
              background: "rgba(148,163,184,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.max(20, 76 - index * 10)}%`,
                height: "100%",
                borderRadius: 999,
                background: `linear-gradient(90deg, ${accents[index % accents.length]} 0%, ${accents[(index + 1) % accents.length]} 100%)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export const MacSlide: React.FC<Props> = ({
  title,
  subtitle,
  points,
  type = "default",
  data,
  index,
  totalSlides,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slideDuration = Math.max(1, durationInFrames);
  const clampTiming = {
    extrapolateLeft: "clamp" as const,
    extrapolateRight: "clamp" as const,
  };
  const hookTakeover = interpolate(
    frame,
    [0, slideDuration * 0.12, slideDuration * 0.26],
    [1, 1, 0],
    clampTiming,
  );
  const revealProgress = interpolate(
    frame,
    [slideDuration * 0.1, slideDuration * 0.36],
    [0, 1],
    clampTiming,
  );
  const evidenceReveal = interpolate(
    frame,
    [slideDuration * 0.34, slideDuration * 0.6],
    [0, 1],
    clampTiming,
  );
  const endingPulse = spring({
    frame: frame - Math.max(0, slideDuration - 22),
    fps,
    config: { damping: 10, stiffness: 140 },
  });

  const items = toList(points, data).slice(0, 6);
  const stats = toStats(points, data).slice(0, 4);
  const bars = toChart(points, data).slice(0, 5);
  const compare = toCompare(points, data);
  const timeline = toTimeline(points, data).slice(0, 5);
  const steps = toSteps(points, data).slice(0, 4);
  const mainStat = stats[0];
  const winnerScoreLeft = metricToNumber(compare.left.value);
  const winnerScoreRight = metricToNumber(compare.right.value);
  const compareWinner =
    winnerScoreRight >= winnerScoreLeft
      ? { side: "right" as const, label: compare.right.label, value: compare.right.value }
      : { side: "left" as const, label: compare.left.label, value: compare.left.value };
  const activeItemIndex =
    items.length > 0
      ? Math.min(
          items.length - 1,
          Math.floor(
            interpolate(
              frame,
              [slideDuration * 0.28, slideDuration * 0.84],
              [0, items.length],
              clampTiming,
            ),
          ),
        )
      : 0;
  const heroBadge = typeof data?.badge === "string" ? data.badge : items[0]?.title || "macOS workflow";
  const heroCta =
    typeof data?.cta === "string"
      ? data.cta
      : typeof data?.button === "string"
        ? data.button
        : "Start the flow";
  const quoteText =
    typeof data?.quote === "string"
      ? data.quote
      : subtitle || title || "";
  const quoteAuthor = typeof data?.author === "string" ? data.author : undefined;
  const highlightItems = (() => {
    if (Array.isArray(data?.items)) {
      return (data.items as unknown[])
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") {
            const record = item as GenericRecord;
            if (typeof record.text === "string") return record.text;
            if (typeof record.title === "string") return record.title;
          }
          return undefined;
        })
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .slice(0, 8);
    }
    return (points || []).filter((item) => item.trim().length > 0).slice(0, 8);
  })();

  const renderHero = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.95fr", gap: 30, minHeight: 690, position: "relative" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          opacity: hookTakeover,
          transform: `scale(${interpolate(hookTakeover, [0, 1], [1.08, 1])})`,
          zIndex: 4,
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            padding: "30px 40px",
            borderRadius: 30,
            background: "rgba(255,255,255,0.78)",
            border: `1px solid ${c.border}`,
            boxShadow: "0 30px 70px rgba(15,23,42,0.12)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 78, lineHeight: 0.95, color: c.text, fontWeight: 900, letterSpacing: "-0.06em" }}>
            {title || "Mac workflow"}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: revealProgress,
          transform: `translateY(${interpolate(revealProgress, [0, 1], [20, 0])}px)`,
        }}
      >
        <div>
          <Pill text={heroBadge} frame={frame} />
          <SectionHeader title={title} subtitle={subtitle} frame={frame} />
        </div>
        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <Pill text={heroCta} accent={c.purple} frame={frame} delay={8} />
            {items.slice(0, 2).map((item, itemIndex) => (
              <Pill
                key={`${item.title}-${itemIndex}`}
                text={item.title}
                accent={accents[(itemIndex + 2) % accents.length]}
                frame={frame}
                delay={12 + itemIndex * 5}
              />
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateRows: "1.2fr 0.8fr",
          gap: 18,
          opacity: revealProgress,
          transform: `translateY(${interpolate(revealProgress, [0, 1], [28, 0])}px) scale(${interpolate(revealProgress, [0, 1], [0.98, 1])})`,
        }}
      >
        <SoftCard frame={frame} delay={8} accent={c.blue} style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 18 }}>
            <div>
              <div style={{ fontSize: 38, fontWeight: 800, color: c.text, lineHeight: 1.08 }}>
                {title || "Mac workflow"}
              </div>
              <div style={{ marginTop: 14, fontSize: 20, lineHeight: 1.6, color: c.muted }}>
                {subtitle || "Clean, calm, and product-like horizontal storytelling."}
              </div>
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              <SignalMeter items={stats.slice(0, 3)} frame={frame} delay={12} />
            </div>
          </div>
          <div
            style={{
              marginTop: 20,
              padding: "18px 20px",
              borderRadius: 20,
              background: "rgba(10,132,255,0.08)",
              border: "1px solid rgba(10,132,255,0.12)",
              opacity: evidenceReveal,
              transform: `translateY(${interpolate(evidenceReveal, [0, 1], [16, 0])}px)`,
            }}
          >
            <div style={{ fontSize: 24, lineHeight: 1.35, color: c.text, fontWeight: 800 }}>
              {items[0]?.title || title || "Lead with one result before explaining the workflow."}
            </div>
          </div>
        </SoftCard>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {items.slice(0, 3).map((item, itemIndex) => (
            <SoftCard
              key={`${item.title}-${itemIndex}`}
              frame={frame}
              delay={14 + itemIndex * 6}
              accent={accents[itemIndex % accents.length]}
              style={{ padding: 20 }}
            >
              <div style={{ fontSize: 14, color: c.muted, fontWeight: 700 }}>0{itemIndex + 1}</div>
              <div style={{ marginTop: 14, fontSize: 24, fontWeight: 800, color: c.text, lineHeight: 1.15 }}>
                {item.title}
              </div>
              {item.desc ? (
                <div style={{ marginTop: 10, fontSize: 17, color: c.muted, lineHeight: 1.55 }}>
                  {item.desc}
                </div>
              ) : null}
            </SoftCard>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDefault = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 24, minHeight: 690 }}>
      <div>
        <SectionHeader title={title} subtitle={subtitle} frame={frame} compact />
        <div style={{ display: "grid", gap: 16 }}>
          {items.map((item, itemIndex) => (
            <SoftCard
              key={`${item.title}-${itemIndex}`}
              frame={frame}
              delay={8 + itemIndex * 5}
              accent={accents[itemIndex % accents.length]}
              style={{
                padding: "20px 22px",
                marginLeft: itemIndex === activeItemIndex ? interpolate(evidenceReveal, [0, 1], [0, 14]) : 0,
                filter:
                  itemIndex === activeItemIndex
                    ? `brightness(${interpolate(evidenceReveal, [0, 1], [1, 1.04])})`
                    : `brightness(${interpolate(evidenceReveal, [0, 1], [1, 0.88])})`,
                boxShadow:
                  itemIndex === activeItemIndex
                    ? `0 28px 50px ${accents[itemIndex % accents.length]}18, inset 0 1px 0 rgba(255,255,255,0.75)`
                    : undefined,
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: 18, alignItems: "start" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    background: `${accents[itemIndex % accents.length]}16`,
                    color: accents[itemIndex % accents.length],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 24,
                  }}
                >
                  {String(itemIndex + 1).padStart(2, "0")}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: itemIndex === activeItemIndex ? 32 : 28,
                      lineHeight: 1.2,
                      color: c.text,
                      fontWeight: 800,
                    }}
                  >
                    {item.title}
                  </div>
                  {item.desc ? (
                    <div style={{ marginTop: 8, fontSize: 19, lineHeight: 1.6, color: c.muted }}>{item.desc}</div>
                  ) : null}
                </div>
              </div>
            </SoftCard>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
        <div
          style={{
            opacity: evidenceReveal,
            transform: `translateY(${interpolate(evidenceReveal, [0, 1], [30, 0])}px) scale(${interpolate(
              evidenceReveal,
              [0, 1],
              [0.96, 1],
            )})`,
          }}
        >
          <SoftCard frame={frame} delay={14} accent={c.cyan} style={{ padding: 22 }}>
            <div style={{ fontSize: 28, lineHeight: 1.22, color: c.text, fontWeight: 800 }}>
              {items[activeItemIndex]?.title || title || "Main takeaway"}
            </div>
            {items[activeItemIndex]?.desc ? (
              <div style={{ marginTop: 10, fontSize: 18, lineHeight: 1.6, color: c.muted }}>
                {items[activeItemIndex]?.desc}
              </div>
            ) : null}
            <div style={{ marginTop: 16 }}>
              <SignalMeter items={stats.slice(0, 3)} frame={frame} delay={18} />
            </div>
          </SoftCard>
        </div>
        <div
          style={{
            opacity: evidenceReveal,
            transform: `translateY(${interpolate(evidenceReveal, [0, 1], [36, 0])}px)`,
          }}
        >
          <SoftCard frame={frame} delay={22} accent={c.pink} style={{ padding: 22 }}>
            <div style={{ fontSize: 18, lineHeight: 1.7, color: c.muted }}>
              {subtitle || "Keep one main takeaway on screen and let narration carry the detail."}
            </div>
          </SoftCard>
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
    <div>
      <SectionHeader title={title} subtitle={subtitle} frame={frame} compact />
      {mainStat ? (
        <div
          style={{
            marginBottom: 18,
            transform: `scale(${interpolate(revealProgress, [0, 1], [0.96, 1])})`,
            transformOrigin: "center center",
          }}
        >
          <SoftCard frame={frame} delay={6} accent={c.blue} style={{ padding: "28px 30px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 24, alignItems: "center" }}>
              <div>
                <div
                  style={{
                    fontSize: 110,
                    lineHeight: 0.92,
                    color: c.text,
                    fontWeight: 900,
                    letterSpacing: "-0.08em",
                    transform: `scale(${interpolate(endingPulse, [0, 1], [1, 1.05])})`,
                    transformOrigin: "left center",
                  }}
                >
                  {mainStat.value}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 30, lineHeight: 1.2, color: c.text, fontWeight: 800 }}>{mainStat.label}</div>
                <div style={{ marginTop: 12, fontSize: 20, lineHeight: 1.65, color: c.muted }}>
                  {mainStat.note || subtitle || "Open with the number that feels like proof, then let the rest support it."}
                </div>
              </div>
            </div>
          </SoftCard>
        </div>
      ) : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.max(2, Math.min(3, Math.max(1, stats.length - (mainStat ? 1 : 0))))}, 1fr)`,
          gap: 18,
        }}
      >
        {stats.slice(mainStat ? 1 : 0).map((item, itemIndex) => (
          <SoftCard
            key={`${item.label}-${itemIndex}`}
            frame={frame}
            delay={12 + itemIndex * 5}
            accent={accents[itemIndex % accents.length]}
            style={{ padding: 24, minHeight: 220 }}
          >
            <div style={{ fontSize: 16, color: c.muted, fontWeight: 700 }}>{item.label}</div>
            <div style={{ marginTop: 18, fontSize: 54, lineHeight: 1, color: c.text, fontWeight: 900 }}>
              {item.value}
            </div>
            {item.note ? (
              <div style={{ marginTop: 18, fontSize: 18, lineHeight: 1.6, color: c.muted }}>{item.note}</div>
            ) : null}
          </SoftCard>
        ))}
      </div>
    </div>
  );

  const renderCompare = () => (
    <div>
      <SectionHeader title={title} subtitle={subtitle} frame={frame} compact />
      <div
        style={{
          marginBottom: 18,
          opacity: evidenceReveal,
          transform: `translateY(${interpolate(evidenceReveal, [0, 1], [20, 0])}px) scale(${interpolate(
            evidenceReveal,
            [0, 1],
            [0.98, 1],
          )})`,
        }}
      >
        <SoftCard frame={frame} delay={6} accent={compareWinner.side === "right" ? c.green : c.pink} style={{ padding: "18px 22px" }}>
          <div style={{ fontSize: 28, lineHeight: 1.2, color: c.text, fontWeight: 800 }}>
            {compareWinner.label} wins attention with {compareWinner.value}
          </div>
        </SoftCard>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 1fr", gap: 18, alignItems: "stretch" }}>
        <div
          style={{
            opacity:
              compareWinner.side === "left"
                ? 1
                : interpolate(evidenceReveal, [0, 1], [1, 0.68]),
            transform: `scale(${
              compareWinner.side === "left"
                ? interpolate(evidenceReveal, [0, 1], [1, 1.03])
                : interpolate(evidenceReveal, [0, 1], [1, 0.97])
            })`,
          }}
        >
          <SoftCard frame={frame} delay={8} accent={c.pink} style={{ padding: 28 }}>
            <div style={{ fontSize: 16, color: c.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {compare.left.label}
            </div>
            <div style={{ marginTop: 18, fontSize: 44, lineHeight: 1.06, color: c.text, fontWeight: 900 }}>
              {compare.left.value}
            </div>
            {compare.left.desc ? (
              <div style={{ marginTop: 16, fontSize: 20, color: c.muted, lineHeight: 1.6 }}>{compare.left.desc}</div>
            ) : null}
          </SoftCard>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "grid", gap: 14, justifyItems: "center" }}>
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.68)",
                border: `1px solid ${c.border}`,
                boxShadow: "0 18px 36px rgba(15,23,42,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: c.text,
                fontWeight: 900,
                fontSize: 30,
                letterSpacing: "-0.04em",
              }}
            >
              VS
            </div>
          </div>
        </div>
        <div
          style={{
            opacity:
              compareWinner.side === "right"
                ? 1
                : interpolate(evidenceReveal, [0, 1], [1, 0.68]),
            transform: `scale(${
              compareWinner.side === "right"
                ? interpolate(evidenceReveal, [0, 1], [1, 1.03])
                : interpolate(evidenceReveal, [0, 1], [1, 0.97])
            })`,
          }}
        >
          <SoftCard frame={frame} delay={14} accent={c.green} style={{ padding: 28 }}>
            <div style={{ fontSize: 16, color: c.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {compare.right.label}
            </div>
            <div style={{ marginTop: 18, fontSize: 44, lineHeight: 1.06, color: c.text, fontWeight: 900 }}>
              {compare.right.value}
            </div>
            {compare.right.desc ? (
              <div style={{ marginTop: 16, fontSize: 20, color: c.muted, lineHeight: 1.6 }}>{compare.right.desc}</div>
            ) : null}
          </SoftCard>
        </div>
      </div>
    </div>
  );

  const renderSteps = () => (
    <div>
      <SectionHeader title={title} subtitle={subtitle} frame={frame} compact />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(3, Math.min(4, items.length || 3))}, 1fr)`, gap: 18 }}>
        {steps.map((item, itemIndex) => (
          <SoftCard
            key={`${item.title}-${itemIndex}`}
            frame={frame}
            delay={8 + itemIndex * 5}
            accent={accents[itemIndex % accents.length]}
            style={{ padding: 24, minHeight: 260 }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                background: `${accents[itemIndex % accents.length]}16`,
                color: accents[itemIndex % accents.length],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 900,
              }}
            >
              {String(itemIndex + 1).padStart(2, "0")}
            </div>
            <div style={{ marginTop: 20, fontSize: 28, lineHeight: 1.2, color: c.text, fontWeight: 800 }}>{item.title}</div>
            {item.desc ? (
              <div style={{ marginTop: 12, fontSize: 18, lineHeight: 1.65, color: c.muted }}>{item.desc}</div>
            ) : null}
          </SoftCard>
        ))}
      </div>
    </div>
  );

  const renderChart = () => (
    <div>
      <SectionHeader title={title} subtitle={subtitle} frame={frame} compact />
      <SoftCard frame={frame} delay={8} accent={c.cyan} style={{ padding: 28 }}>
        <div style={{ display: "grid", gap: 20 }}>
          {bars.map((item, itemIndex) => (
            <div key={`${item.label}-${itemIndex}`} style={{ display: "grid", gridTemplateColumns: "220px 1fr 70px", gap: 16, alignItems: "center" }}>
              <div style={{ fontSize: 18, color: c.text, fontWeight: 700 }}>{item.label}</div>
              <div style={{ height: 18, borderRadius: 999, background: "rgba(148,163,184,0.16)", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${Math.max(6, Math.min(100, item.value))}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${accents[itemIndex % accents.length]} 0%, ${accents[(itemIndex + 1) % accents.length]} 100%)`,
                  }}
                />
              </div>
              <div style={{ fontSize: 18, color: c.muted, fontWeight: 800, textAlign: "right" }}>{item.value}%</div>
            </div>
          ))}
        </div>
      </SoftCard>
    </div>
  );

  const renderTimeline = () => (
    <div>
      <SectionHeader title={title} subtitle={subtitle} frame={frame} compact />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(3, Math.min(4, timeline.length))}, 1fr)`, gap: 18 }}>
        {timeline.map((item, itemIndex) => (
          <SoftCard
            key={`${item.year}-${item.title}-${itemIndex}`}
            frame={frame}
            delay={8 + itemIndex * 5}
            accent={accents[itemIndex % accents.length]}
            style={{ padding: 22, minHeight: 250 }}
          >
            <div style={{ fontSize: 16, color: accents[itemIndex % accents.length], fontWeight: 800 }}>{item.year}</div>
            <div style={{ marginTop: 16, fontSize: 28, lineHeight: 1.22, color: c.text, fontWeight: 800 }}>{item.title}</div>
            {item.desc ? (
              <div style={{ marginTop: 12, fontSize: 18, lineHeight: 1.65, color: c.muted }}>{item.desc}</div>
            ) : null}
          </SoftCard>
        ))}
      </div>
    </div>
  );

  const renderHighlight = () => (
    <div style={{ minHeight: 690, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <SectionHeader title={title} subtitle={subtitle} frame={frame} compact />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {highlightItems.map((item, itemIndex) => (
          <Pill
            key={`${item}-${itemIndex}`}
            text={item}
            accent={accents[itemIndex % accents.length]}
            frame={frame}
            delay={8 + itemIndex * 4}
          />
        ))}
      </div>
    </div>
  );

  const renderQuote = () => (
    <div style={{ minHeight: 690, display: "flex", alignItems: "center" }}>
      <SoftCard frame={frame} delay={8} accent={c.purple} style={{ padding: "42px 48px", width: "100%" }}>
        <div style={{ fontSize: 76, lineHeight: 0.8, color: c.blue, fontWeight: 800 }}>“</div>
        <div style={{ marginTop: 14, fontSize: 46, lineHeight: 1.22, color: c.text, fontWeight: 800, maxWidth: 1180 }}>
          {quoteText}
        </div>
        {quoteAuthor ? (
          <div style={{ marginTop: 22, fontSize: 22, color: c.muted, fontWeight: 700 }}>{quoteAuthor}</div>
        ) : null}
      </SoftCard>
    </div>
  );

  const renderCta = () => (
    <div style={{ minHeight: 690, display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 24, alignItems: "center" }}>
      <div>
        <SectionHeader title={title} subtitle={subtitle} frame={frame} />
        <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
          {highlightItems.slice(0, 3).map((item, itemIndex) => (
            <Pill key={`${item}-${itemIndex}`} text={item} accent={accents[itemIndex % accents.length]} frame={frame} delay={10 + itemIndex * 4} />
          ))}
        </div>
      </div>
      <SoftCard frame={frame} delay={12} accent={c.blue} style={{ padding: 28 }}>
        <div style={{ fontSize: 34, lineHeight: 1.15, color: c.text, fontWeight: 900 }}>
          {heroCta}
        </div>
        <div style={{ marginTop: 14, fontSize: 18, lineHeight: 1.65, color: c.muted }}>
          {subtitle || "Wrap the video with one clear action, one clear reason, and one calm confident finish."}
        </div>
        <div
          style={{
            marginTop: 28,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 24px",
            borderRadius: 999,
            background: "linear-gradient(90deg, #0a84ff 0%, #7c3aed 100%)",
            color: "white",
            fontSize: 20,
            fontWeight: 800,
            boxShadow: "0 18px 36px rgba(10,132,255,0.24)",
            transform: `scale(${interpolate(endingPulse, [0, 1], [1, 1.08])})`,
            transformOrigin: "left center",
          }}
        >
          {heroCta}
        </div>
        {highlightItems.length > 0 ? (
          <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {highlightItems.slice(0, 4).map((item, itemIndex) => (
              <div
                key={`${item}-tag-${itemIndex}`}
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  background: `${accents[itemIndex % accents.length]}12`,
                  border: `1px solid ${accents[itemIndex % accents.length]}22`,
                  color: c.text,
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        ) : null}
      </SoftCard>
    </div>
  );

  const renderBody = () => {
    switch (type) {
      case "hero":
        return renderHero();
      case "stats":
        return renderStats();
      case "compare":
        return renderCompare();
      case "steps":
        return renderSteps();
      case "chart":
        return renderChart();
      case "timeline":
        return renderTimeline();
      case "highlight":
        return renderHighlight();
      case "quote":
        return renderQuote();
      case "cta":
        return renderCta();
      case "list":
      case "default":
      default:
        return renderDefault();
    }
  };

  return (
    <AbsoluteFill style={{ fontFamily: "'SF Pro Display', 'PingFang SC', sans-serif", color: c.text }}>
      <Background frame={frame} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 42 }}>
        <WindowFrame frame={frame} index={index} totalSlides={totalSlides}>
          {renderBody()}
        </WindowFrame>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
