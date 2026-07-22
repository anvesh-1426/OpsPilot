"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const prisma_1 = __importDefault(require("../config/prisma"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Bulk CSV Data Import with preview validation
router.post('/import/preview', async (req, res, next) => {
    try {
        const { entity, rows } = req.body;
        if (!rows || !Array.isArray(rows)) {
            return res.status(400).json({ success: false, message: 'Invalid CSV rows' });
        }
        const preview = rows.slice(0, 5);
        const validRows = [];
        const errors = [];
        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            if (entity === 'products') {
                if (!r.sku || !r.name || !r.unitPrice) {
                    errors.push({ row: i + 1, message: 'Missing required SKU, Name, or Unit Price' });
                }
                else {
                    validRows.push(r);
                }
            }
            else if (entity === 'customers') {
                if (!r.name || !r.email) {
                    errors.push({ row: i + 1, message: 'Missing Name or Email' });
                }
                else {
                    validRows.push(r);
                }
            }
            else {
                validRows.push(r);
            }
        }
        return res.json({
            success: true,
            data: {
                totalRows: rows.length,
                validCount: validRows.length,
                errorCount: errors.length,
                preview,
                errors,
            },
        });
    }
    catch (err) {
        return next(err);
    }
});
router.post('/import/execute', async (req, res, next) => {
    try {
        const { entity, rows } = req.body;
        let imported = 0;
        if (entity === 'products') {
            for (const r of rows) {
                if (r.sku && r.name) {
                    await prisma_1.default.product.upsert({
                        where: { sku: r.sku },
                        update: { name: r.name, unitPrice: parseFloat(r.unitPrice || '10'), costPrice: parseFloat(r.costPrice || '5') },
                        create: { sku: r.sku, name: r.name, unitPrice: parseFloat(r.unitPrice || '10'), costPrice: parseFloat(r.costPrice || '5'), taxPercent: 18 },
                    });
                    imported++;
                }
            }
        }
        else if (entity === 'customers') {
            for (const r of rows) {
                if (r.email && r.name) {
                    await prisma_1.default.customer.upsert({
                        where: { email: r.email },
                        update: { name: r.name, phone: r.phone || '' },
                        create: { name: r.name, email: r.email, phone: r.phone || '', city: r.city || '', country: r.country || 'USA' },
                    });
                    imported++;
                }
            }
        }
        return res.json({ success: true, message: `Successfully imported ${imported} records.`, importedCount: imported });
    }
    catch (err) {
        return next(err);
    }
});
exports.default = router;
//# sourceMappingURL=importRoutes.js.map