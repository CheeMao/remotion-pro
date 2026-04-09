"use strict";
// This is your entry file! Refer to it when you render:
// npx remotion render <entry-file> HelloWorld out/video.mp4
Object.defineProperty(exports, "__esModule", { value: true });
const remotion_1 = require("remotion");
const Root_1 = require("./Root");
(0, remotion_1.registerRoot)(Root_1.RemotionRoot);
