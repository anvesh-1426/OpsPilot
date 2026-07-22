export declare const workflowEngine: {
    /**
     * Complete Interconnected Sales Order Approval Workflow:
     * Order Approved -> Auto Decrease Inventory -> Auto Create Warehouse Packing/Dispatch Request -> Auto Generate Invoice -> Auto Accounts Payment -> Update Analytics
     */
    processOrderApproval: (orderId: string, approvedById: string) => Promise<{
        order: {
            id: string;
            orderNumber: string;
            customerId: string;
            status: string;
            subtotal: number;
            taxAmount: number;
            discountAmount: number;
            total: number;
            notes: string | null;
            shippingAddress: string | null;
            createdById: string;
            expectedAt: Date | null;
            deliveredAt: Date | null;
            version: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
        challan: {
            id: string;
            challanNumber: string;
            orderId: string;
            warehouseId: string;
            dispatchedAt: Date;
            vehicleNo: string | null;
            driverName: string | null;
            status: string;
            createdAt: Date;
        };
        invoice: {
            id: string;
            invoiceNumber: string;
            orderId: string;
            customerId: string;
            subtotal: number;
            taxAmount: number;
            discountAmount: number;
            total: number;
            status: string;
            dueDate: Date | null;
            paidAt: Date | null;
            notes: string | null;
            version: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
        payment: {
            id: string;
            invoiceId: string;
            amount: number;
            method: string;
            reference: string | null;
            paidAt: Date;
        };
    }>;
    /**
     * Purchase Order Workflow State Machine:
     * Draft -> Pending Approval -> Approved -> Ordered -> Received -> Inventory Auto-Updated
     */
    processPurchaseWorkflow: (poId: string, nextStatus: string, userId: string) => Promise<{
        id: string;
        poNumber: string;
        supplierId: string;
        warehouseId: string;
        total: number;
        status: string;
        createdAt: Date;
    } | {
        id: string;
        grnNumber: string;
        purchaseOrderId: string;
        warehouseId: string;
        receivedAt: Date;
        receivedBy: string;
        notes: string | null;
    }>;
};
//# sourceMappingURL=workflowEngine.d.ts.map