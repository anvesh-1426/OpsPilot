import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config';
import prisma from '../config/prisma';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const generateTokens = (user: { id: string; email: string; role: string; name: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as any
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn } as any
  );
  return { accessToken, refreshToken };
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return next(new AppError('Invalid credentials.', 401));
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return next(new AppError('Invalid credentials.', 401));
    }

    const { accessToken, refreshToken } = generateTokens(user);

    await prisma.user.update({
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
  } catch (err) {
    return next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(new AppError('Refresh token required.', 400));

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.refreshToken !== refreshToken) {
      return next(new AppError('Invalid refresh token.', 401));
    }

    const tokens = generateTokens(user);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });

    return res.json({ success: true, data: tokens });
  } catch {
    return next(new AppError('Invalid refresh token.', 401));
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user) {
      await prisma.user.update({ where: { id: req.user.id }, data: { refreshToken: null } });
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    return next(err);
  }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, avatar: true, phone: true, createdAt: true, lastLogin: true },
    });
    return res.json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return next(new AppError('User not found.', 404));

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) return next(new AppError('Current password is incorrect.', 400));

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    return next(err);
  }
};
