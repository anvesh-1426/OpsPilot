"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const coreRepositories_1 = require("../repositories/coreRepositories");
const errorHandler_1 = require("../middlewares/errorHandler");
exports.authService = {
    login: async ({ email, password }) => {
        const user = await coreRepositories_1.userRepository.findByEmail(email);
        if (!user || !user.isActive)
            throw new errorHandler_1.AppError('Invalid credentials.', 401);
        const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValid)
            throw new errorHandler_1.AppError('Invalid credentials.', 401);
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, config_1.config.jwt.refreshSecret, { expiresIn: config_1.config.jwt.refreshExpiresIn });
        await coreRepositories_1.userRepository.updateRefreshToken(user.id, refreshToken);
        return {
            accessToken,
            refreshToken,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
        };
    },
    refresh: async (refreshToken) => {
        if (!refreshToken)
            throw new errorHandler_1.AppError('Refresh token required.', 400);
        const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.config.jwt.refreshSecret);
        const user = await coreRepositories_1.userRepository.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken)
            throw new errorHandler_1.AppError('Invalid refresh token.', 401);
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
        const newRefresh = jsonwebtoken_1.default.sign({ id: user.id }, config_1.config.jwt.refreshSecret, { expiresIn: config_1.config.jwt.refreshExpiresIn });
        await coreRepositories_1.userRepository.updateRefreshToken(user.id, newRefresh);
        return { accessToken, refreshToken: newRefresh };
    },
    logout: async (userId) => {
        await coreRepositories_1.userRepository.updateRefreshToken(userId, null);
    },
    getUserProfile: async (userId) => {
        const user = await coreRepositories_1.userRepository.findById(userId);
        if (!user)
            throw new errorHandler_1.AppError('User not found.', 404);
        const { passwordHash, refreshToken, ...profile } = user;
        return profile;
    },
};
//# sourceMappingURL=authService.js.map