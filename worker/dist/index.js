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
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const kafkajs_1 = require("kafkajs");
const parser_1 = require("./parser");
const dotenv_1 = __importDefault(require("dotenv"));
const console_1 = require("console");
const email_1 = require("./email");
const notion_1 = require("./notion");
dotenv_1.default.config();
const prismaClient = new client_1.PrismaClient();
const topic_name = "zap-events";
const app = (0, express_1.default)();
const kafka = new kafkajs_1.Kafka({
    clientId: 'outbox-processor-2',
    brokers: ['localhost:9092']
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // /kafka setup  ___
        const consumer = kafka.consumer({
            groupId: "2",
        });
        yield consumer.connect();
        const producer = kafka.producer();
        yield producer.connect();
        yield consumer.subscribe({
            topic: topic_name,
            fromBeginning: true,
        });
        yield consumer.run({
            // autoCommit:false,  // by default dont commit as the worker might die before finishing the job
            eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ topic, partition, message }) {
                var _b, _c, _d, _e, _f, _g, _h;
                console.log({
                    topic,
                    message,
                    offset: message.offset,
                });
                if (!((_b = message.value) === null || _b === void 0 ? void 0 : _b.toString()))
                    return;
                // log(message.value);
                const parsedValue = JSON.parse((_c = message.value) === null || _c === void 0 ? void 0 : _c.toString());
                const zapRunId = parsedValue.zapRunId;
                const stage = parsedValue.stage;
                console.log(parsedValue);
                const zapRundetails = yield prismaClient.zapRun.findFirst({
                    where: {
                        id: zapRunId,
                    },
                    include: {
                        zap: {
                            include: {
                                actions: {
                                    include: {
                                        type: true,
                                    }
                                }
                            }
                        }
                    }
                });
                (0, console_1.log)(zapRundetails);
                const currentAction = zapRundetails === null || zapRundetails === void 0 ? void 0 : zapRundetails.zap.actions.find((x) => x.sortingOrder === stage);
                (0, console_1.log)(currentAction);
                if (!currentAction) {
                    console.log("no acton found");
                    return;
                }
                const zapRunMetadata = zapRundetails === null || zapRundetails === void 0 ? void 0 : zapRundetails.metadata;
                (0, console_1.log)(zapRunMetadata);
                if (currentAction.type.id === "email") {
                    // send email  
                    const body = (0, parser_1.parse)((_d = currentAction.metadata) === null || _d === void 0 ? void 0 : _d.body, zapRunMetadata);
                    const to = (0, parser_1.parse)((_e = currentAction.metadata) === null || _e === void 0 ? void 0 : _e.to, zapRunMetadata);
                    // const to=
                    console.log(`Sending out email to ${to} body is ${body}`);
                    yield (0, email_1.sendEmail)(to, body);
                }
                if (currentAction.type.id === "solana") {
                    // send sol
                    console.log("sol");
                }
                if (currentAction.type.id === "notion") {
                    // edit notion
                    console.log("notion");
                    // @ts-ignore
                    const pageId = currentAction.metadata.pageId.toString();
                    // get accesstoken from auth table on basis of userId and pageId (pageId from actions table)
                    const response = yield prismaClient.auth.findFirst({
                        where: {
                            pageId,
                        }
                    });
                    if (response === null || response === void 0 ? void 0 : response.token) {
                        //   text from parser
                        const text = (0, parser_1.parse)((_f = currentAction.metadata) === null || _f === void 0 ? void 0 : _f.body, zapRunMetadata);
                        // @ts-ignore
                        yield (0, notion_1.writeToNotion)({ notionId: pageId, accessToken: response.token, text, isDatabase: (_g = currentAction.metadata) === null || _g === void 0 ? void 0 : _g.isDatabase });
                    }
                }
                yield new Promise(r => setTimeout(r, 500));
                const lastStage = (((_h = zapRundetails === null || zapRundetails === void 0 ? void 0 : zapRundetails.zap.actions) === null || _h === void 0 ? void 0 : _h.length) || 1) - 1; // 1
                console.log(lastStage);
                console.log(stage);
                if (lastStage !== stage) {
                    console.log("not final stage");
                    yield producer.send({
                        topic: topic_name,
                        messages: [{
                                value: JSON.stringify({
                                    stage: stage + 1,
                                    zapRunId,
                                })
                            }]
                    });
                }
                yield consumer.commitOffsets([{
                        topic: topic_name,
                        partition: partition,
                        offset: (parseInt(message.offset) + 1).toString()
                    }]);
            }), // for each message perform this fn
        });
        ///** */
    });
}
main();
