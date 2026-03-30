import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { LiquidWideSlide } from "./LiquidWideSlide";
import {
  getSlideTiming,
  getStaticAssetPath,
  useContentJson,
} from "../hooks/useContentJson";
import { getTemplateContentPath } from "../project-content";

const defaultSlides = [
  {
    title: "Liquid Flow",
    subtitle: "液态玻璃在横屏里更适合做柔和、连续、带空间呼吸感的表达。",
    points: ["更适合发布会", "更适合讲解型内容", "更适合品牌叙事"],
  },
  {
    title: "Soft Movement",
    subtitle: "保留流体感，但把视觉重心拉回到内容本身。",
    points: ["左侧做叙事", "右侧做信息卡", "整体更高级更稳"],
  },
  {
    title: "Wider Canvas",
    subtitle: "横屏不是把竖屏拉宽，而是让层次、节奏、留白重新成立。",
    points: ["版面更舒展", "内容更完整", "镜头更自然"],
  },
];

const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = getTemplateContentPath("LiquidWideShow");

export const LiquidWideShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides, {
    expectedTemplate: "LiquidWideShow",
    contentPath: CONTENT_PATH,
  });
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: "#e9ecf2" }}>
      {soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(slides, index, fps, DEFAULT_SLIDE_DURATION);
        return (
          <Sequence key={index} from={from} durationInFrames={duration}>
            <LiquidWideSlide
              title={slide.title || `Slide ${index + 1}`}
              subtitle={slide.subtitle}
              points={slide.points}
              index={index}
              totalSlides={slides.length}
              durationInFrames={duration}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
