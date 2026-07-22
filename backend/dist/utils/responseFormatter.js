"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = exports.sendResponse = void 0;
const sendResponse = (res, statusCode, success, message, data, pagination, meta, errors) => {
    const response = {
        success,
        message,
        ...(data !== undefined && { data }),
        ...(pagination && { pagination }),
        ...(meta && { meta }),
        ...(errors && { errors }),
    };
    return res.status(statusCode).json(response);
};
exports.sendResponse = sendResponse;
const sendSuccess = (res, message, data, statusCode = 200, pagination, meta) => {
    return (0, exports.sendResponse)(res, statusCode, true, message, data, pagination, meta);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 400, errors) => {
    return (0, exports.sendResponse)(res, statusCode, false, message, undefined, undefined, undefined, errors);
};
exports.sendError = sendError;
//# sourceMappingURL=responseFormatter.js.map