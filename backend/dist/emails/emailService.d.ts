export declare const emailService: {
    sendPasswordResetEmail: (toEmail: string, resetToken: string) => Promise<{
        success: boolean;
        resetUrl: string;
    }>;
    sendInvoiceEmail: (toEmail: string, invoiceNumber: string, amount: number) => Promise<{
        success: boolean;
    }>;
    sendLowStockAlert: (adminEmail: string, sku: string, qtyRemaining: number) => Promise<{
        success: boolean;
    }>;
};
//# sourceMappingURL=emailService.d.ts.map