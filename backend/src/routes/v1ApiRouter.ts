import { Router } from 'express';
import authRoutes from './authRoutes';
import crmRoutes from './crmRoutes';
import productRoutes from './productRoutes';
import salesRoutes from './salesRoutes';
import inventoryRoutes from './inventoryRoutes';
import accountsRoutes from './accountsRoutes';

const v1Router = Router();

// Versioned API v1 Router Mounts
v1Router.use('/auth', authRoutes);
v1Router.use('/crm', crmRoutes);
v1Router.use('/products', productRoutes);
v1Router.use('/sales', salesRoutes);
v1Router.use('/inventory', inventoryRoutes);
v1Router.use('/accounts', accountsRoutes);

export default v1Router;
