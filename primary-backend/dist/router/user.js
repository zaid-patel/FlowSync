"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const types_1 = require("../types");
const db_1 = require("../db");
const middleware_1 = require("../middleware");
const config_1 = require("../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
// @ts-ignore
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const parsedData = types_1.signupSchema.safeParse(data);
    console.log(data.name);
    if (!parsedData.success) {
        console.log("unsafe");
        return res.status(411).json({
            message: "incorrect response"
        });
    }
    console.log(parsedData.data.email);
    const existingUser = yield db_1.prismaClient.user.findFirst({
        where: {
            email: parsedData.data.email,
        }
    });
    if (existingUser) {
        return res.status(411).json("user already exists with the username");
    }
    yield db_1.prismaClient.user.create({
        data: {
            email: parsedData.data.email,
            password: parsedData.data.password,
            name: parsedData.data.name,
        }
    });
    const user = yield db_1.prismaClient.user.findFirst({
        where: {
            email: parsedData.data.email,
        }
    });
    // if(us)
    res.json({
        user,
    });
    return;
}));
// @ts-ignore
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const parsedData = types_1.SigninSchema.safeParse(body);
    if (!parsedData.success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        });
    }
    const user = yield db_1.prismaClient.user.findFirst({
        where: {
            email: parsedData.data.email,
            password: parsedData.data.password
        }
    });
    if (!user) {
        return res.status(403).json({
            message: "Sorry credentials are incorrect"
        });
    }
    // sign the jwt
    const token = jsonwebtoken_1.default.sign({
        id: user.id
    }, config_1.JWT_PASSWORD);
    res.json({
        token: token,
    });
    return;
}));
// @ts-ignore
router.get("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const id = req.id;
    const user = yield db_1.prismaClient.user.findFirst({
        where: {
            id
        },
        select: {
            name: true,
            email: true
        }
    });
    res.json({
        user
    });
    return;
}));
exports.userRouter = router;
