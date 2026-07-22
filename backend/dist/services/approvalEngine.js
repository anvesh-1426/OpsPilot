"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvalEngine = void 0;
const logger_1 = require("../config/logger");
exports.approvalEngine = {
    /**
     * Evaluate whether approval is automatically required or approved
     */
    processApproval: (request) => {
        logger_1.logger.info(`📋 [ApprovalEngine] Evaluating ${request.type} approval request for $${request.amount}`);
        if (request.type === 'DISCOUNT_OVERRIDE' && request.amount > 15) {
            return { approved: false, requiresManagerApproval: true, reason: 'Discount override > 15% requires Manager approval' };
        }
        if (request.type === 'PURCHASE' && request.amount > 50000) {
            return { approved: false, requiresManagerApproval: true, reason: 'Purchase order > $50,000 requires Executive approval' };
        }
        return { approved: true, requiresManagerApproval: false, reason: 'Auto-approved within policy limits' };
    },
};
//# sourceMappingURL=approvalEngine.js.map