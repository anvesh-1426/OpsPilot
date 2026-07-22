"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.me = exports.logout = exports.refresh = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const config_1 = require("../config");
const prisma_1 = __importDefault(require("../config/prisma"));
const errorHandler_1 = require("../middlewares/errorHandler");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const generateTokens = (user) => {
    const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, config_1.config.jwt.refreshSecret, { expiresIn: config_1.config.jwt.refreshExpiresIn });
    return { accessToken, refreshToken };
};
const login = async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || !user.isActive) {
            return next(new errorHandler_1.AppError('Invalid credentials.', 401));
        }
        const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValid) {
            return next(new errorHandler_1.AppError('Invalid credentials.', 401));
        }
        const { accessToken, refreshToken } = generateTokens(user);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { refreshToken, lastLogin: new Date() },
        });
        return res.json({
            success: true,
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                },
            },
        });
    }
    catch (err) {
        return next(err);
    }
};
exports.login = login;
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return next(new errorHandler_1.AppError('Refresh token required.', 400));
        const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.config.jwt.refreshSecret);
        const user = await prisma_1.default.user.findUnique({ where: { id: decoded.id } });
        if (!user || user.refreshToken !== refreshToken) {
            return next(new errorHandler_1.AppError('Invalid refresh token.', 401));
        }
        const tokens = generateTokens(user);
        await prisma_1.default.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });
        return res.json({ success: true, data: tokens });
    }
    catch {
        return next(new errorHandler_1.AppError('Invalid refresh token.', 401));
    }
};
exports.refresh = refresh;
const logout = async (req, res, next) => {
    try {
        if (req.user) {
            await prisma_1.default.user.update({ where: { id: req.user.id }, data: { refreshToken: null } });
        }
        return res.json({ success: true, message: 'Logged out successfully.' });
    }
    catch (err) {
        return next(err);
    }
};
exports.logout = logout;
const me = async (req, res, next) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, role: true, avatar: true, phone: true, createdAt: true, lastLogin: true },
        });
        return res.json({ success: true, data: user });
    }
    catch (err) {
        return next(err);
    }
};
exports.me = me;
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { id: req.user.id } });
        if (!user)
            return next(new errorHandler_1.AppError('User not found.', 404));
        const isValid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!isValid)
            return next(new errorHandler_1.AppError('Current password is incorrect.', 400));
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma_1.default.user.update({ where: { id: user.id }, data: { passwordHash } });
        return res.json({ success: true, message: 'Password changed successfully.' });
    }
    catch (err) {
        return next(err);
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=authController.js.map