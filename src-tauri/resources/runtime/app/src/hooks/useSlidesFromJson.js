"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSlidesFromJson = useSlidesFromJson;
const react_1 = require("react");
const remotion_1 = require("remotion");
/**
 * 从 /content/slides.json 加载幻灯片数据
 * @param defaultSlides 默认幻灯片数据（加载失败时使用）
 */
function useSlidesFromJson(defaultSlides) {
    const [slides, setSlides] = (0, react_1.useState)(defaultSlides);
    const [handle] = (0, react_1.useState)(() => (0, remotion_1.delayRender)("加载幻灯片数据"));
    (0, react_1.useEffect)(() => {
        // 在 Remotion Studio 中，静态文件通过 staticBase 路径访问
        // 在渲染时，静态文件直接通过根路径访问
        const staticBase = window.remotion_staticBase || "";
        const url = `${staticBase}/content/slides.json?t=${Date.now()}`;
        console.log("正在加载幻灯片数据:", url, "staticBase:", staticBase);
        fetch(url)
            .then((res) => {
            if (res.ok)
                return res.json();
            throw new Error(`无法加载 slides.json: ${res.status}`);
        })
            .then((data) => {
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
            (0, remotion_1.continueRender)(handle);
        })
            .catch((e) => {
            console.error("加载幻灯片失败，使用默认数据:", e.message);
            (0, remotion_1.continueRender)(handle);
        });
    }, [handle]);
    return slides;
}
