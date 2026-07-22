import { logger } from '../config/logger';

export interface ApprovalRequest {
  type: 'PURCHASE' | 'EXPENSE' | 'DISCOUNT_OVERRIDE' | 'PRICE_OVERRIDE';
  requestedBy: string;
  amount: number;
  details: Record<string, any>;
}

export const approvalEngine = {
  /**
   * Evaluate whether approval is automatically required or approved
   */
  processApproval: (request: ApprovalRequest): { approved: boolean; requiresManagerApproval: boolean; reason: string } => {
    logger.info(`📋 [ApprovalEngine] Evaluating ${request.type} approval request for $${request.amount}`);

    if (request.type === 'DISCOUNT_OVERRIDE' && request.amount > 15) {
      return { approved: false, requiresManagerApproval: true, reason: 'Discount override > 15% requires Manager approval' };
    }

    if (request.type === 'PURCHASE' && request.amount > 50_000) {
      return { approved: false, requiresManagerApproval: true, reason: 'Purchase order > $50,000 requires Executive approval' };
    }

    return { approved: true, requiresManagerApproval: false, reason: 'Auto-approved within policy limits' };
  },
};
