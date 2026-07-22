"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("./config");
const logger_1 = require("./config/logger");
const errorHandler_1 = require("./middlewares/errorHandler");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const crmRoutes_1 = __importDefault(require("./routes/crmRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const salesRoutes_1 = __importDefault(require("./routes/salesRoutes"));
const inventoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes"));
const accountsRoutes_1 = __importDefault(require("./routes/accountsRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
// Ensure log directory exists
const logsDir = path_1.default.join(__dirname, '..', 'logs');
if (!fs_1.default.existsSync(logsDir))
    fs_1.default.mkdirSync(logsDir, { recursive: true });
const app = (0, express_1.default)();
// ─── Security middleware ──────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.cors.origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
const authLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/auth/login', authLimiter);
// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// ─── Logging ──────────────────────────────────────────────────────────────────
app.use((0, morgan_1.default)(config_1.config.isDev ? 'dev' : 'combined'));
// ─── Static files ─────────────────────────────────────────────────────────────
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});
const purchaseRoutes_1 = __importDefault(require("./routes/purchaseRoutes"));
const workflowRoutes_1 = __importDefault(require("./routes/workflowRoutes"));
const aiFinanceRoutes_1 = __importDefault(require("./routes/aiFinanceRoutes"));
const importRoutes_1 = __importDefault(require("./routes/importRoutes"));
const swaggerRouter_1 = __importDefault(require("./swagger/swaggerRouter"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const monitoringRoutes_1 = __importDefault(require("./routes/monitoringRoutes"));
const v1ApiRouter_1 = __importDefault(require("./routes/v1ApiRouter"));
// ─── Health & Monitoring Endpoints ───────────────────────────────────────────
app.use('/', healthRoutes_1.default);
app.use('/api', monitoringRoutes_1.default);
// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', v1ApiRouter_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/crm', crmRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/sales', salesRoutes_1.default);
app.use('/api/inventory', inventoryRoutes_1.default);
app.use('/api/accounts', accountsRoutes_1.default);
app.use('/api/purchase', purchaseRoutes_1.default);
app.use('/api/workflow', workflowRoutes_1.default);
app.use('/api/ai-finance', aiFinanceRoutes_1.default);
app.use('/api/bulk', importRoutes_1.default);
app.use('/api', swaggerRouter_1.default);
app.use('/api', dashboardRoutes_1.default);
// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
// ─── Start server ─────────────────────────────────────────────────────────────
const server = app.listen(config_1.config.port, () => {
    logger_1.logger.info(`🚀 OpsPilot API running on port ${config_1.config.port} [${config_1.config.nodeEnv}]`);
});
// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = async () => {
    logger_1.logger.info('Shutting down server...');
    server.close(async () => {
        const { prisma } = await Promise.resolve().then(() => __importStar(require('./config/prisma')));
        await prisma.$disconnect();
        process.exit(0);
    });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
exports.default = app;
//# sourceMappingURL=index.js.map