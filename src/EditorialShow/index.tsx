import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { EditorialSlide } from "./EditorialSlide";
import { getSlideTiming, getStaticAssetPath, useContentJson } from "../hooks/useContentJson";
import { getTemplateContentPath } from "../project-content";

const defaultSlides = [
  {
    title: "把横屏内容做成有版面感的叙事视频",
    subtitle: "更适合观点表达、案例拆解、品牌故事和内容型表达",
    type: "hero" as const,
    data: {
      badge: "editorial landscape",
      cta: "Frame the next story",
      items: ["标题版面", "证据段落", "收束页"],
    },
  },
  {
    title: "横屏的价值不是更大，而是更会留白",
    subtitle: "当信息不再一列往下堆，叙事就有了真正的呼吸感",
    type: "steps" as const,
    data: {
      steps: [
        { title: "先立主标题", description: "让这一页先有清楚的中心句" },
        { title: "再摆证据区", description: "把数字、案例、旁证放进第二阅读层" },
        { title: "最后做收束", description: "让用户看完知道观点落在哪里" },
      ],
    },
  },
  {
    title: "不是所有信息都要同时最大声",
    subtitle: "真正舒服的横屏视频，会让重点先被看见，再被理解",
    type: "quote" as const,
    data: {
      quote: "真正舒服的横屏视频，会让重点先被看见，再被理解。",
      author: "EditorialShow",
      items: ["留白", "版面", "节奏"],
    },
  },
  {
    title: "让下一条内容更像作品，而不是素材拼接",
    subtitle: "给横屏一个更有气质的讲述方式",
    type: "cta" as const,
    data: {
      cta: "用 EditorialShow 讲一个完整故事",
      items: ["案例拆解", "品牌故事", "观点视频"],
    },
  },
];

const DEFAULT_SLIDE_DURATION = 150;
const CONTENT_PATH = getTemplateContentPath("EditorialShow");

export const EditorialShow: React.FC = () => {
  const { fps } = useVideoConfig();
  const { slides, soundtrackPath } = useContentJson(defaultSlides, {
    expectedTemplate: "EditorialShow",
    contentPath: CONTENT_PATH,
  });
  const soundtrackSrc = getStaticAssetPath(soundtrackPath);

  return (
    <AbsoluteFill style={{ background: "#f2ece2" }}>
      {soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
      {slides.map((slide, index) => {
        const { from, duration } = getSlideTiming(slides, index, fps, DEFAULT_SLIDE_DURATION);

        return (
          <Sequence key={index} from={from} durationInFrames={duration}>
            <EditorialSlide
              title={slide.title || ""}
              subtitle={slide.subtitle}
              points={(slide as { points?: string[] }).points}
              type={(slide as { type?: string }).type as React.ComponentProps<typeof EditorialSlide>["type"]}
              data={(slide as { data?: Record<string, unknown> }).data}
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
