"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const errorHandler_1 = require("./errorHandler");
const authenticate = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next(new errorHandler_1.AppError('No token provided.', 401));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        req.user = decoded;
        return next();
    }
    catch {
        return next(new errorHandler_1.AppError('Invalid or expired token.', 401));
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user)
            return next(new errorHandler_1.AppError('Not authenticated.', 401));
        if (!roles.includes(req.user.role)) {
            return next(new errorHandler_1.AppError('You do not have permission to perform this action.', 403));
        }
        return next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map