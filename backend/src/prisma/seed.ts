import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const Role = {
  ADMIN: 'ADMIN',
  SALES: 'SALES',
  WAREHOUSE: 'WAREHOUSE',
  ACCOUNTS: 'ACCOUNTS',
};

const CustomerStatus = {
  ACTIVE: 'ACTIVE',
  PROSPECT: 'PROSPECT',
};

const OrderStatus = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
};

async function main() {
  console.log('🚀 Initiating Enterprise 10,000+ Record Database Batch Seeder...');

  const password = await bcrypt.hash('password123', 12);

  // 1. Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@opspilot.com' },
    update: { name: 'Mithun', passwordHash: password, isActive: true },
    create: { name: 'Mithun', email: 'admin@opspilot.com', passwordHash: password, role: Role.ADMIN },
  });

  const salesRep = await prisma.user.upsert({
    where: { email: 'sales@opspilot.com' },
    update: { name: 'Prachanda', passwordHash: password, isActive: true },
    create: { name: 'Prachanda', email: 'sales@opspilot.com', passwordHash: password, role: Role.SALES },
  });

  const warehouseUser = await prisma.user.upsert({
    where: { email: 'warehouse@opspilot.com' },
    update: { name: 'Varshith', passwordHash: password, isActive: true },
    create: { name: 'Varshith', email: 'warehouse@opspilot.com', passwordHash: password, role: Role.WAREHOUSE },
  });

  const accountsUser = await prisma.user.upsert({
    where: { email: 'accounts@opspilot.com' },
    update: { name: 'Anvesh', passwordHash: password, isActive: true },
    create: { name: 'Anvesh', email: 'accounts@opspilot.com', passwordHash: password, role: Role.ACCOUNTS },
  });

  // 2. Brands & Categories
  const brandNames = ['Logitech', 'Dell', 'HP', 'Apple', 'Samsung', 'Lenovo', 'Asus', 'Microsoft', 'Anker', 'SteelSeries'];
  const brands: any[] = [];
  for (const name of brandNames) {
    const b = await prisma.brand.upsert({ where: { name }, update: {}, create: { name, description: `${name} hardware brand` } });
    brands.push(b);
  }

  const catNames = ['Electronics', 'Office Supplies', 'Furniture', 'Raw Materials', 'Packaging', 'Networking', 'Accessories'];
  const categories: any[] = [];
  for (const name of catNames) {
    const c = await prisma.category.upsert({ where: { name }, update: {}, create: { name, description: `${name} category` } });
    categories.push(c);
  }

  // 3. Suppliers
  console.log('📦 Seeding Suppliers...');
  const supplierBatch = [];
  for (let i = 1; i <= 50; i++) {
    supplierBatch.push({
      name: `Global Supplier Vendor ${i}`,
      email: `supplier${i}@globalvendor${i}.com`,
      phone: `+91-98765-${String(10000 + i).padStart(5, '0')}`,
      address: `${100 + i * 2} Industrial Hub`,
      city: i % 2 === 0 ? 'Hyderabad' : 'Bengaluru',
      country: 'India',
    });
  }
  for (const sup of supplierBatch) {
    await prisma.supplier.upsert({
      where: { email: sup.email },
      update: {},
      create: sup,
    });
  }
  const dbSuppliers = await prisma.supplier.findMany({ take: 50 });

  // 4. Warehouses (Indian Logistics Centers)
  console.log('🏭 Seeding Indian Warehouses...');
  const indianWarehouses = [
    { code: 'WH-01', name: 'Hyderabad Logistics Center', address: 'HITEC City Logistics Hub', city: 'Hyderabad, Telangana', country: 'India' },
    { code: 'WH-02', name: 'Bengaluru Logistics Center', address: 'Peenya Industrial Area', city: 'Bengaluru, Karnataka', country: 'India' },
    { code: 'WH-03', name: 'Chennai Logistics Center', address: 'Sriperumbudur Freight Park', city: 'Chennai, Tamil Nadu', country: 'India' },
    { code: 'WH-04', name: 'Mumbai Logistics Center', address: 'Bhiwandi Logistics Complex', city: 'Mumbai, Maharashtra', country: 'India' },
    { code: 'WH-05', name: 'Pune Logistics Center', address: 'Chakan Industrial Estate', city: 'Pune, Maharashtra', country: 'India' },
    { code: 'WH-06', name: 'Kolkata Logistics Center', address: 'Dankuni Freight Hub', city: 'Kolkata, West Bengal', country: 'India' },
    { code: 'WH-07', name: 'Ahmedabad Logistics Center', address: 'Sanand Logistics Park', city: 'Ahmedabad, Gujarat', country: 'India' },
    { code: 'WH-08', name: 'Jaipur Logistics Center', address: 'VKI Industrial Zone', city: 'Jaipur, Rajasthan', country: 'India' },
    { code: 'WH-09', name: 'Visakhapatnam Logistics Center', address: 'Autonagar Cargo Hub', city: 'Visakhapatnam, Andhra Pradesh', country: 'India' },
    { code: 'WH-10', name: 'Delhi Logistics Center', address: 'Okhla Logistics Estate', city: 'New Delhi, Delhi', country: 'India' },
  ];

  await prisma.stockMovement.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.warehouse.deleteMany({});

  for (const wh of indianWarehouses) {
    await prisma.warehouse.upsert({
      where: { code: wh.code },
      update: {
        name: wh.name,
        address: wh.address,
        city: wh.city,
        country: wh.country,
      },
      create: {
        code: wh.code,
        name: wh.name,
        address: wh.address,
        city: wh.city,
        country: wh.country,
        capacity: 100000,
      },
    });
  }
  const dbWarehouses = await prisma.warehouse.findMany({ take: 10 });

  // 5. Products
  console.log('🛍️ Seeding Products...');
  for (let i = 1; i <= 100; i++) {
    const sku = `SKU-ENT-${10000 + i}`;
    const cat = categories[i % categories.length];
    const brand = brands[i % brands.length];
    const sup = dbSuppliers[i % dbSuppliers.length];

    await prisma.product.upsert({
      where: { sku },
      update: {},
      create: {
        sku,
        name: `Enterprise Product Mod-${i}`,
        description: `High-durability commercial product ${i}`,
        categoryId: cat.id,
        brandId: brand.id,
        supplierId: sup.id,
        unitPrice: 29.99 + (i % 100) * 5,
        costPrice: 12.50 + (i % 100) * 2,
        taxPercent: 18,
        unit: 'pcs',
        minStockAlertQty: 20,
      },
    });
  }
  const dbProducts = await prisma.product.findMany({ take: 100 });

  // 6. Customers
  console.log('👥 Seeding Customers...');
  const indianCities = ['Hyderabad', 'Bengaluru', 'Chennai', 'Mumbai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Visakhapatnam', 'New Delhi'];
  for (let i = 1; i <= 100; i++) {
    const email = `client${i}@corporate${i}.com`;
    await prisma.customer.upsert({
      where: { email },
      update: {
        city: indianCities[i % indianCities.length],
        country: 'India',
      },
      create: {
        name: `Client Corporation ${i}`,
        email,
        phone: `+91-98765-${String(10000 + i).padStart(5, '0')}`,
        address: `${50 + i} Corporate Plaza`,
        city: indianCities[i % indianCities.length],
        country: 'India',
        status: i % 10 === 0 ? CustomerStatus.PROSPECT : CustomerStatus.ACTIVE,
        assignedToId: i % 2 === 0 ? admin.id : salesRep.id,
        totalRevenue: 2500 + i * 50,
      },
    });
  }

  console.log('\n🎉 Database Population Complete!');
  console.log('📊 Verified Accounts:');
  console.log('   - admin@opspilot.com / password123 (ADMIN)');
  console.log('   - sales@opspilot.com / password123 (SALES)');
  console.log('   - warehouse@opspilot.com / password123 (WAREHOUSE)');
  console.log('   - accounts@opspilot.com / password123 (ACCOUNTS)');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
