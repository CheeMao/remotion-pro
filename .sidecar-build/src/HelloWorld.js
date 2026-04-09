"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloWorld = exports.myCompSchema = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const zod_types_1 = require("@remotion/zod-types");
const remotion_1 = require("remotion");
const zod_1 = require("zod");
const Logo_1 = require("./HelloWorld/Logo");
const Subtitle_1 = require("./HelloWorld/Subtitle");
const Title_1 = require("./HelloWorld/Title");
exports.myCompSchema = zod_1.z.object({
    titleText: zod_1.z.string(),
    titleColor: (0, zod_types_1.zColor)(),
    logoColor1: (0, zod_types_1.zColor)(),
    logoColor2: (0, zod_types_1.zColor)(),
});
const HelloWorld = ({ titleText: propOne, titleColor: propTwo, logoColor1, logoColor2, }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { durationInFrames, fps } = (0, remotion_1.useVideoConfig)();
    // Animate from 0 to 1 after 25 frames
    const logoTranslationProgress = (0, remotion_1.spring)({
        frame: frame - 25,
        fps,
        config: {
            damping: 100,
        },
    });
    // Move the logo up by 150 pixels once the transition starts
    const logoTranslation = (0, remotion_1.interpolate)(logoTranslationProgress, [0, 1], [0, -150]);
    // Fade out the animation at the end
    const opacity = (0, remotion_1.interpolate)(frame, [durationInFrames - 25, durationInFrames - 15], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });
    // A <AbsoluteFill> is just a absolutely positioned <div>!
    return ((0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: { backgroundColor: "white" }, children: (0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { opacity }, children: [(0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: { transform: `translateY(${logoTranslation}px)` }, children: (0, jsx_runtime_1.jsx)(Logo_1.Logo, { logoColor1: logoColor1, logoColor2: logoColor2 }) }), (0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: 35, children: (0, jsx_runtime_1.jsx)(Title_1.Title, { titleText: propOne, titleColor: propTwo }) }), (0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: 75, children: (0, jsx_runtime_1.jsx)(Subtitle_1.Subtitle, {}) })] }) }));
};
exports.HelloWorld = HelloWorld;
