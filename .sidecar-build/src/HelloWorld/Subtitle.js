"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subtitle = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const constants_1 = require("./constants");
const subtitle = {
    fontFamily: constants_1.FONT_FAMILY,
    fontSize: 40,
    textAlign: "center",
    position: "absolute",
    bottom: 140,
    width: "100%",
};
const codeStyle = {
    color: constants_1.COLOR_1,
};
const Subtitle = () => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const opacity = (0, remotion_1.interpolate)(frame, [0, 30], [0, 1]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: { ...subtitle, opacity }, children: ["Edit ", (0, jsx_runtime_1.jsx)("code", { style: codeStyle, children: "src/Root.tsx" }), " and save to reload."] }));
};
exports.Subtitle = Subtitle;
