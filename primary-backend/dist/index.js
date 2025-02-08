"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_js_1 = require("./router/user.js");
const zap_js_1 = require("./router/zap.js");
const cors_1 = __importDefault(require("cors"));
const trigger_js_1 = require("./router/trigger.js");
const action_js_1 = require("./router/action.js");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/v1/user", user_js_1.userRouter);
app.use("/api/v1/zap", zap_js_1.zapRouter);
app.use("/api/v1/trigger", trigger_js_1.triggerRouter);
app.use("/api/v1/actions", action_js_1.actionRouter);
app.listen(3000, () => {
    console.log("server is running on port 3000");
});
