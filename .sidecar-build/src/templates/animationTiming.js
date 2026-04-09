"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSlideMotionTiming = void 0;
const clamp = (value, min, max) => {
    return Math.min(max, Math.max(min, value));
};
const getSlideMotionTiming = (durationInFrames, pointCount) => {
    const safeDuration = Math.max(45, durationInFrames);
    const entryWindow = clamp(Math.round(safeDuration * 0.22), 28, 72);
    const titleStart = clamp(Math.round(safeDuration * 0.04), 6, 18);
    const subtitleStart = titleStart + clamp(Math.round(entryWindow * 0.28), 8, 18);
    const lineStart = titleStart + clamp(Math.round(entryWindow * 0.44), 12, 24);
    const pointsStart = titleStart + clamp(Math.round(entryWindow * 0.58), 18, 32);
    const exitDuration = clamp(Math.round(safeDuration * 0.12), 12, 24);
    const remainingFrames = Math.max(18, safeDuration - pointsStart - exitDuration - 12);
    const pointStagger = pointCount <= 1
        ? 0
        : clamp(Math.floor(remainingFrames / (pointCount + 1)), 8, 24);
    const lastPointFrame = pointCount <= 1 ? pointsStart : pointsStart + pointStagger * (pointCount - 1);
    const exitStart = Math.max(safeDuration - exitDuration, lastPointFrame + 18);
    const exitEnd = Math.max(exitStart + 1, safeDuration - 1);
    return {
        titleStart,
        subtitleStart,
        lineStart,
        pointsStart,
        pointStagger,
        exitStart,
        exitEnd,
    };
};
exports.getSlideMotionTiming = getSlideMotionTiming;
