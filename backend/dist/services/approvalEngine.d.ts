export interface ApprovalRequest {
    type: 'PURCHASE' | 'EXPENSE' | 'DISCOUNT_OVERRIDE' | 'PRICE_OVERRIDE';
    requestedBy: string;
    amount: number;
    details: Record<string, any>;
}
export declare const approvalEngine: {
    /**
     * Evaluate whether approval is automatically required or approved
     */
    processApproval: (request: ApprovalRequest) => {
        approved: boolean;
        requiresManagerApproval: boolean;
        reason: string;
    };
};
//# sourceMappingURL=approvalEngine.d.ts.map