"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("../config/logger");
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    // Prisma errors
    if (err.code === 'P2002') {
        return res.status(409).json({
            success: false,
            message: 'A record with this value already exists.',
        });
    }
    if (err.code === 'P2025') {
        return res.status(404).json({
            success: false,
            message: 'Record not found.',
        });
    }
    logger_1.logger.error('Unhandled error:', err);
    const message = process.env.NODE_ENV === 'production' ? 'Internal server error.' : (err.message || 'Internal server error.');
    return res.status(500).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
const notFound = (_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found.' });
};
exports.notFound = notFound;
//# sourceMappingURL=errorHandler.js.map