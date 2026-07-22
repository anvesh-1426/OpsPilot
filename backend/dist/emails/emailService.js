"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const logger_1 = require("../config/logger");
exports.emailService = {
    sendPasswordResetEmail: async (toEmail, resetToken) => {
        const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
        logger_1.logger.info(`📧 [EmailService] Password reset link generated for ${toEmail}: ${resetUrl}`);
        return { success: true, resetUrl };
    },
    sendInvoiceEmail: async (toEmail, invoiceNumber, amount) => {
        logger_1.logger.info(`📧 [EmailService] Sent invoice ${invoiceNumber} ($${amount}) to ${toEmail}`);
        return { success: true };
    },
    sendLowStockAlert: async (adminEmail, sku, qtyRemaining) => {
        logger_1.logger.info(`📧 [EmailService] Sent low stock alert for ${sku} (${qtyRemaining} left) to ${adminEmail}`);
        return { success: true };
    },
};
//# sourceMappingURL=emailService.js.map