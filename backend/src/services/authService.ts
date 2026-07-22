import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { userRepository } from '../repositories/coreRepositories';
import { AppError } from '../middlewares/errorHandler';

export const authService = {
  login: async ({ email, password }: any) => {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.isActive) throw new AppError('Invalid credentials.', 401);

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new AppError('Invalid credentials.', 401);

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

    await userRepository.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    };
  },

  refresh: async (refreshToken: string) => {
    if (!refreshToken) throw new AppError('Refresh token required.', 400);
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { id: string };
    const user = await userRepository.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) throw new AppError('Invalid refresh token.', 401);

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as any
    );
    const newRefresh = jwt.sign(
      { id: user.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn } as any
    );

    await userRepository.updateRefreshToken(user.id, newRefresh);
    return { accessToken, refreshToken: newRefresh };
  },

  logout: async (userId: string) => {
    await userRepository.updateRefreshToken(userId, null);
  },

  getUserProfile: async (userId: string) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found.', 404);
    const { passwordHash, refreshToken, ...profile } = user;
    return profile;
  },
};
