-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "gstNumber" TEXT,
    "type" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LEAD',
    "followUpDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "follow_up_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "follow_up_notes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unitPrice" REAL NOT NULL,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "minStockAlertQty" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "quantityChanged" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "stock_movements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sales_challans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challanNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sales_challans_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sales_challans_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "challan_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challanId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceSnapshot" REAL NOT NULL,
    CONSTRAINT "challan_items_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "sales_challans" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "challan_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "sales_challans_challanNumber_key" ON "sales_challans"("challanNumber");
