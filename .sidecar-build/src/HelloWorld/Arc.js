"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Arc = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const getCircumferenceOfArc = (rx, ry) => {
    return Math.PI * 2 * Math.sqrt((rx * rx + ry * ry) / 2);
};
const rx = 135;
const ry = 300;
const cx = 960;
const cy = 540;
const arcLength = getCircumferenceOfArc(rx, ry);
const strokeWidth = 30;
const Arc = ({ progress, rotation, rotateProgress, color1, color2 }) => {
    const { width, height } = (0, remotion_1.useVideoConfig)();
    // Each svg Id must be unique to not conflict with each other
    const [gradientId] = (0, react_1.useState)(() => String((0, remotion_1.random)(null)));
    return ((0, jsx_runtime_1.jsxs)("svg", { viewBox: `0 0 ${width} ${height}`, style: {
            position: "absolute",
            transform: `rotate(${rotation * rotateProgress}deg)`,
        }, children: [(0, jsx_runtime_1.jsx)("defs", { children: (0, jsx_runtime_1.jsxs)("linearGradient", { id: gradientId, x1: "0%", y1: "0%", x2: "0%", y2: "100%", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "0%", stopColor: color1 }), (0, jsx_runtime_1.jsx)("stop", { offset: "100%", stopColor: color2 })] }) }), (0, jsx_runtime_1.jsx)("ellipse", { cx: cx, cy: cy, rx: rx, ry: ry, fill: "none", stroke: `url(#${gradientId})`, strokeDasharray: arcLength, strokeDashoffset: arcLength - arcLength * progress, strokeLinecap: "round", strokeWidth: strokeWidth })] }));
};
exports.Arc = Arc;
