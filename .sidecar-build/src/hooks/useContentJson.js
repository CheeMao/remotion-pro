"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaticAssetPath = exports.getSlideTiming = exports.getSlideDurationFrames = void 0;
exports.useContentJson = useContentJson;
const react_1 = require("react");
const remotion_1 = require("remotion");
const autoLayout_1 = require("../templates/autoLayout");
const project_content_1 = require("../project-content");
const json_repair_1 = require("../utils/json-repair");
function useContentJson(defaultSlides, options) {
    const [content, setContent] = (0, react_1.useState)({
        slides: (0, autoLayout_1.prepareSlidesForRender)(defaultSlides),
    });
    const [handle] = (0, react_1.useState)(() => (0, remotion_1.delayRender)('load content json'));
    (0, react_1.useEffect)(() => {
        const staticBase = window.remotion_staticBase || '';
        const requestedPath = (options === null || options === void 0 ? void 0 : options.contentPath)
            ? (0, project_content_1.toStaticContentPath)(options.contentPath)
            : 'content/slides.json';
        const url = `${staticBase}/${requestedPath}?t=${Date.now()}`;
        fetch(url)
            .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load content JSON: ${response.status}`);
            }
            return response.text();
        })
            .then((rawText) => {
            return (0, json_repair_1.parseJsonWithRepair)(rawText, url).data;
        })
            .then((data) => {
            var _a, _b, _c, _d, _e;
            const rawSlides = data.slides;
            const templateMatch = !(options === null || options === void 0 ? void 0 : options.expectedTemplate) || ((_a = data.meta) === null || _a === void 0 ? void 0 : _a.template) === options.expectedTemplate;
            const hasValidSlides = Array.isArray(rawSlides) &&
                rawSlides.length > 0 &&
                (!(options === null || options === void 0 ? void 0 : options.validateSlide) || rawSlides.every(options.validateSlide));
            const sourceSlides = templateMatch && hasValidSlides ? rawSlides : defaultSlides;
            const slides = (0, autoLayout_1.prepareSlidesForRender)(sourceSlides);
            setContent({
                meta: data.meta,
                slides,
                soundtrackPath: ((_b = data.meta) === null || _b === void 0 ? void 0 : _b.soundtrackPath) || ((_c = data.meta) === null || _c === void 0 ? void 0 : _c.soundtrack_path),
                soundtrackDuration: ((_d = data.meta) === null || _d === void 0 ? void 0 : _d.soundtrackDuration) || ((_e = data.meta) === null || _e === void 0 ? void 0 : _e.soundtrack_duration),
            });
            (0, remotion_1.continueRender)(handle);
        })
            .catch(() => {
            (0, remotion_1.continueRender)(handle);
        });
    }, [defaultSlides, handle, options]);
    return content;
}
const getSlideDurationFrames = (slide, fps, defaultSlideDuration) => {
    if (typeof slide.durationInFrames === 'number' && slide.durationInFrames > 0) {
        return slide.durationInFrames;
    }
    if (typeof slide.audioDuration === 'number' && slide.audioDuration > 0) {
        return Math.max(1, Math.ceil(slide.audioDuration * fps));
    }
    return defaultSlideDuration;
};
exports.getSlideDurationFrames = getSlideDurationFrames;
const getSlideTiming = (slides, index, fps, defaultSlideDuration) => {
    let from = 0;
    for (let i = 0; i < index; i++) {
        from += (0, exports.getSlideDurationFrames)(slides[i], fps, defaultSlideDuration);
    }
    return {
        from,
        duration: (0, exports.getSlideDurationFrames)(slides[index], fps, defaultSlideDuration),
    };
};
exports.getSlideTiming = getSlideTiming;
const getStaticAssetPath = (path) => {
    if (!path) {
        return undefined;
    }
    return path.replace(/^public\//, '');
};
exports.getStaticAssetPath = getStaticAssetPath;
