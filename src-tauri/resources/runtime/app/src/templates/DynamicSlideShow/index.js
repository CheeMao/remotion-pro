"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicSlideShow = void 0;
exports.calculateTotalFrames = calculateTotalFrames;
const jsx_runtime_1 = require("react/jsx-runtime");
const SharedVideo_1 = require("../../renderers/SharedVideo");
const useContentJson_1 = require("../../hooks/useContentJson");
const DynamicSlideShow = ({ slides, defaultSlideDuration = 150, soundtrackPath, }) => {
    return ((0, jsx_runtime_1.jsx)(SharedVideo_1.SharedVideo, { slides: slides, template: "DynamicSlideShow", soundtrackPath: soundtrackPath, defaultSlideDuration: defaultSlideDuration }));
};
exports.DynamicSlideShow = DynamicSlideShow;
function calculateTotalFrames(slides, fps, defaultSlideDuration = 150) {
    return slides.reduce((total, slide) => {
        return total + (0, useContentJson_1.getSlideDurationFrames)(slide, fps, defaultSlideDuration);
    }, 0);
}
