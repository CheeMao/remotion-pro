import { useState, useEffect } from "react";
import { continueRender, delayRender } from "remotion";

export interface SlideData {
  title: string;
  subtitle: string;
  points: string[];
  narration?: string;
  audioPath?: string;
  audioDuration?: number;
  durationInFrames?: number;
}

interface SlidesJsonData {
  meta: {
    title: string;
    template: string;
    voice_id: string;
  };
  slides: Array<{
    title: string;
    subtitle: string;
    points: string[];
    narration: string;
    audioPath?: string;
    audioDuration?: number;
  }>;
}

/**
 * 从 /content/slides.json 加载幻灯片数据
 * @param defaultSlides 默认幻灯片数据（加载失败时使用）
 */
export function useSlidesFromJson(defaultSlides: SlideData[]): SlideData[] {
  const [slides, setSlides] = useState<SlideData[]>(defaultSlides);
  const [handle] = useState(() => delayRender("加载幻灯片数据"));

  useEffect(() => {
    // 在 Remotion Studio 中，静态文件通过 staticBase 路径访问
    // 在渲染时，静态文件直接通过根路径访问
    const staticBase =
      (window as { remotion_staticBase?: string }).remotion_staticBase || "";
    const url = `${staticBase}/content/slides.json?t=${Date.now()}`;
    console.log("正在加载幻灯片数据:", url, "staticBase:", staticBase);

    fetch(url)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(`无法加载 slides.json: ${res.status}`);
      })
      .then((data: SlidesJsonData) => {
        console.log("模板加载 slides.json 成功:", data);
        if (data.slides && Array.isArray(data.slides) && data.slides.length > 0) {
          const loadedSlides = data.slides.map((s) => ({
            title: s.title,
            subtitle: s.subtitle,
            points: s.points,
            narration: s.narration,
            audioPath: s.audioPath,
            audioDuration: s.audioDuration,
          }));
          console.log("解析后的幻灯片:", loadedSlides);
          setSlides(loadedSlides);
        }
        continueRender(handle);
      })
      .catch((e) => {
        console.error("加载幻灯片失败，使用默认数据:", e.message);
        continueRender(handle);
      });
  }, [handle]);

  return slides;
}
