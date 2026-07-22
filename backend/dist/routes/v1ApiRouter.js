"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const crmRoutes_1 = __importDefault(require("./crmRoutes"));
const productRoutes_1 = __importDefault(require("./productRoutes"));
const salesRoutes_1 = __importDefault(require("./salesRoutes"));
const inventoryRoutes_1 = __importDefault(require("./inventoryRoutes"));
const accountsRoutes_1 = __importDefault(require("./accountsRoutes"));
const v1Router = (0, express_1.Router)();
// Versioned API v1 Router Mounts
v1Router.use('/auth', authRoutes_1.default);
v1Router.use('/crm', crmRoutes_1.default);
v1Router.use('/products', productRoutes_1.default);
v1Router.use('/sales', salesRoutes_1.default);
v1Router.use('/inventory', inventoryRoutes_1.default);
v1Router.use('/accounts', accountsRoutes_1.default);
exports.default = v1Router;
//# sourceMappingURL=v1ApiRouter.js.map