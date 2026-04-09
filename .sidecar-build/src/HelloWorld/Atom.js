"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Atom = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const Atom = ({ scale, color1, color2 }) => {
    const config = (0, remotion_1.useVideoConfig)();
    // Each SVG ID must be unique to not conflict with each other
    const [gradientId] = (0, react_1.useState)(() => String((0, remotion_1.random)(null)));
    return ((0, jsx_runtime_1.jsxs)("svg", { viewBox: `0 0 ${config.width} ${config.height}`, style: {
            position: "absolute",
            transform: `scale(${scale})`,
        }, children: [(0, jsx_runtime_1.jsx)("defs", { children: (0, jsx_runtime_1.jsxs)("linearGradient", { id: gradientId, x1: "0%", y1: "0%", x2: "100%", y2: "0%", children: [(0, jsx_runtime_1.jsx)("stop", { offset: "0%", stopColor: color1 }), (0, jsx_runtime_1.jsx)("stop", { offset: "100%", stopColor: color2 })] }) }), (0, jsx_runtime_1.jsx)("circle", { r: 70, cx: config.width / 2, cy: config.height / 2, fill: `url(#${gradientId})` })] }));
};
exports.Atom = Atom;
