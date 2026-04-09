"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Title = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const constants_1 = require("./constants");
const title = {
    fontFamily: constants_1.FONT_FAMILY,
    fontWeight: "bold",
    fontSize: 100,
    textAlign: "center",
    position: "absolute",
    bottom: 160,
    width: "100%",
};
const word = {
    marginLeft: 10,
    marginRight: 10,
    display: "inline-block",
};
const Title = ({ titleText, titleColor }) => {
    const videoConfig = (0, remotion_1.useVideoConfig)();
    const frame = (0, remotion_1.useCurrentFrame)();
    const words = titleText.split(" ");
    return ((0, jsx_runtime_1.jsx)("h1", { style: title, children: words.map((t, i) => {
            const delay = i * 5;
            const scale = (0, remotion_1.spring)({
                fps: videoConfig.fps,
                frame: frame - delay,
                config: {
                    damping: 200,
                },
            });
            return ((0, jsx_runtime_1.jsx)("span", { style: {
                    ...word,
                    color: titleColor,
                    transform: `scale(${scale})`,
                }, children: t }, t));
        }) }));
};
exports.Title = Title;
