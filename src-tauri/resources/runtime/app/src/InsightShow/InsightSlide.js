"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightSlide = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const MacSlide_1 = require("../MacShow/MacSlide");
const InsightSlide = (props) => {
    return (0, jsx_runtime_1.jsx)(MacSlide_1.MacSlide, { ...props, variant: "insight" });
};
exports.InsightSlide = InsightSlide;
