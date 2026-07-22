"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const index_1 = require("./index");
const { combine, timestamp, errors, json, colorize, simple } = winston_1.default.format;
exports.logger = winston_1.default.createLogger({
    level: index_1.config.isDev ? 'debug' : 'info',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), json()),
    transports: [
        new winston_1.default.transports.Console({
            format: index_1.config.isDev
                ? combine(colorize(), simple())
                : combine(timestamp(), json()),
        }),
        new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'logs/combined.log' }),
    ],
});
//# sourceMappingURL=logger.js.map