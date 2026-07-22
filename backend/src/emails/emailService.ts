import { logger } from '../config/logger';

export const emailService = {
  sendPasswordResetEmail: async (toEmail: string, resetToken: string) => {
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    logger.info(`📧 [EmailService] Password reset link generated for ${toEmail}: ${resetUrl}`);
    return { success: true, resetUrl };
  },

  sendInvoiceEmail: async (toEmail: string, invoiceNumber: string, amount: number) => {
    logger.info(`📧 [EmailService] Sent invoice ${invoiceNumber} ($${amount}) to ${toEmail}`);
    return { success: true };
  },

  sendLowStockAlert: async (adminEmail: string, sku: string, qtyRemaining: number) => {
    logger.info(`📧 [EmailService] Sent low stock alert for ${sku} (${qtyRemaining} left) to ${adminEmail}`);
    return { success: true };
  },
};
