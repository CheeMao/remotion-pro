"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logo = exports.myCompSchema2 = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const zod_types_1 = require("@remotion/zod-types");
const remotion_1 = require("remotion");
const zod_1 = require("zod");
const Arc_1 = require("./Arc");
const Atom_1 = require("./Atom");
exports.myCompSchema2 = zod_1.z.object({
    logoColor1: (0, zod_types_1.zColor)(),
    logoColor2: (0, zod_types_1.zColor)(),
});
const Logo = ({ logoColor1: color1, logoColor2: color2, }) => {
    const videoConfig = (0, remotion_1.useVideoConfig)();
    const frame = (0, remotion_1.useCurrentFrame)();
    const development = (0, remotion_1.spring)({
        config: {
            damping: 100,
            mass: 0.5,
        },
        fps: videoConfig.fps,
        frame,
    });
    const rotationDevelopment = (0, remotion_1.spring)({
        config: {
            damping: 100,
            mass: 0.5,
        },
        fps: videoConfig.fps,
        frame,
    });
    const scale = (0, remotion_1.spring)({
        frame,
        config: {
            mass: 0.5,
        },
        fps: videoConfig.fps,
    });
    const logoRotation = (0, remotion_1.interpolate)(frame, [0, videoConfig.durationInFrames], [0, 360]);
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
            transform: `scale(${scale}) rotate(${logoRotation}deg)`,
        }, children: [(0, jsx_runtime_1.jsx)(Arc_1.Arc, { rotateProgress: rotationDevelopment, progress: development, rotation: 30, color1: color1, color2: color2 }), (0, jsx_runtime_1.jsx)(Arc_1.Arc, { rotateProgress: rotationDevelopment, rotation: 90, progress: development, color1: color1, color2: color2 }), (0, jsx_runtime_1.jsx)(Arc_1.Arc, { rotateProgress: rotationDevelopment, rotation: -30, progress: development, color1: color1, color2: color2 }), (0, jsx_runtime_1.jsx)(Atom_1.Atom, { scale: rotationDevelopment, color1: color1, color2: color2 })] }));
};
exports.Logo = Logo;
