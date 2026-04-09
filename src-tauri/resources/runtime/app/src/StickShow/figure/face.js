"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Face = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const jitter_1 = require("./jitter");
// 表情子组件 — 渲染眼睛、嘴巴、眉毛
const Face = ({ cx, cy, scale, expression, frame, color = '#1c1814', strokeWidth = 4, }) => {
    const s = scale;
    const j = (val, seed) => val + (0, jitter_1.jitter)(frame, seed, 0.6);
    // 眨眼：每 90 帧眨一次，持续 4 帧
    const blink = frame % 90 < 4;
    const eyeY = -8 * s;
    const mouthY = 16 * s;
    const renderEyes = () => {
        if (blink && expression !== 'surprise' && expression !== 'wow') {
            return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("line", { x1: j(cx - 14 * s, 60), y1: j(cy + eyeY, 61), x2: j(cx - 6 * s, 62), y2: j(cy + eyeY, 63), stroke: color, strokeWidth: strokeWidth * 0.85, strokeLinecap: "round" }), (0, jsx_runtime_1.jsx)("line", { x1: j(cx + 6 * s, 64), y1: j(cy + eyeY, 65), x2: j(cx + 14 * s, 66), y2: j(cy + eyeY, 67), stroke: color, strokeWidth: strokeWidth * 0.85, strokeLinecap: "round" })] }));
        }
        if (expression === 'surprise' || expression === 'wow') {
            return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: j(cx - 11 * s, 60), cy: j(cy + eyeY, 61), r: 6 * s, fill: "white", stroke: color, strokeWidth: strokeWidth * 0.7 }), (0, jsx_runtime_1.jsx)("circle", { cx: j(cx - 11 * s, 62), cy: j(cy + eyeY, 63), r: 3 * s, fill: color }), (0, jsx_runtime_1.jsx)("circle", { cx: j(cx + 11 * s, 64), cy: j(cy + eyeY, 65), r: 6 * s, fill: "white", stroke: color, strokeWidth: strokeWidth * 0.7 }), (0, jsx_runtime_1.jsx)("circle", { cx: j(cx + 11 * s, 66), cy: j(cy + eyeY, 67), r: 3 * s, fill: color })] }));
        }
        if (expression === 'think') {
            return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: j(cx - 11 * s, 60), cy: j(cy + eyeY, 61), r: 3 * s, fill: color }), (0, jsx_runtime_1.jsx)("path", { d: `M ${j(cx + 5 * s, 62)} ${j(cy + eyeY, 63)} Q ${j(cx + 11 * s, 64)} ${j(cy + eyeY - 4 * s, 65)} ${j(cx + 17 * s, 66)} ${j(cy + eyeY, 67)}`, fill: "none", stroke: color, strokeWidth: strokeWidth * 0.85, strokeLinecap: "round" })] }));
        }
        // happy / point / neutral - 圆点眼
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: j(cx - 11 * s, 60), cy: j(cy + eyeY, 61), r: 3.2 * s, fill: color }), (0, jsx_runtime_1.jsx)("circle", { cx: j(cx + 11 * s, 62), cy: j(cy + eyeY, 63), r: 3.2 * s, fill: color })] }));
    };
    const renderMouth = () => {
        if (expression === 'happy') {
            return ((0, jsx_runtime_1.jsx)("path", { d: `M ${j(cx - 12 * s, 70)} ${j(cy + mouthY - 2 * s, 71)} Q ${j(cx, 72)} ${j(cy + mouthY + 10 * s, 73)} ${j(cx + 12 * s, 74)} ${j(cy + mouthY - 2 * s, 75)}`, stroke: color, strokeWidth: strokeWidth * 0.9, fill: "none", strokeLinecap: "round" }));
        }
        if (expression === 'surprise' || expression === 'wow') {
            return ((0, jsx_runtime_1.jsx)("ellipse", { cx: j(cx, 70), cy: j(cy + mouthY + 2 * s, 71), rx: 6 * s, ry: 9 * s, fill: color }));
        }
        if (expression === 'think') {
            return ((0, jsx_runtime_1.jsx)("line", { x1: j(cx - 6 * s, 70), y1: j(cy + mouthY, 71), x2: j(cx + 8 * s, 72), y2: j(cy + mouthY - 3 * s, 73), stroke: color, strokeWidth: strokeWidth * 0.85, strokeLinecap: "round" }));
        }
        if (expression === 'sad') {
            return ((0, jsx_runtime_1.jsx)("path", { d: `M ${j(cx - 10 * s, 70)} ${j(cy + mouthY + 4 * s, 71)} Q ${j(cx, 72)} ${j(cy + mouthY - 4 * s, 73)} ${j(cx + 10 * s, 74)} ${j(cy + mouthY + 4 * s, 75)}`, stroke: color, strokeWidth: strokeWidth * 0.85, fill: "none", strokeLinecap: "round" }));
        }
        // neutral / point — 一条直线
        return ((0, jsx_runtime_1.jsx)("line", { x1: j(cx - 8 * s, 70), y1: j(cy + mouthY, 71), x2: j(cx + 8 * s, 72), y2: j(cy + mouthY, 73), stroke: color, strokeWidth: strokeWidth * 0.85, strokeLinecap: "round" }));
    };
    // 惊讶时加眉毛上扬
    const renderBrows = () => {
        if (expression === 'surprise' || expression === 'wow') {
            return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("line", { x1: j(cx - 18 * s, 80), y1: j(cy + eyeY - 16 * s, 81), x2: j(cx - 4 * s, 82), y2: j(cy + eyeY - 20 * s, 83), stroke: color, strokeWidth: strokeWidth * 0.8, strokeLinecap: "round" }), (0, jsx_runtime_1.jsx)("line", { x1: j(cx + 4 * s, 84), y1: j(cy + eyeY - 20 * s, 85), x2: j(cx + 18 * s, 86), y2: j(cy + eyeY - 16 * s, 87), stroke: color, strokeWidth: strokeWidth * 0.8, strokeLinecap: "round" })] }));
        }
        return null;
    };
    return ((0, jsx_runtime_1.jsxs)("g", { children: [renderBrows(), renderEyes(), renderMouth()] }));
};
exports.Face = Face;
