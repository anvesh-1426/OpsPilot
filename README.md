# 🚀 OpsPilot — Enterprise SaaS Commercial ERP Platform

OpsPilot is a commercial-grade, multi-tenant enterprise ERP & CRM platform designed with clean architecture, real-time analytics, automated workflow execution, and multi-location Indian logistics management.

---

## 📁 Repository Directory Structure

```text
fundsroom/
├── backend/                  # Node.js + Express + TypeScript + Prisma ORM Backend API
│   ├── src/
│   │   ├── config/           # Logger, Environment & Prisma Client
│   │   ├── controllers/      # CRM, Sales, Inventory, Accounts & Admin Controllers
│   │   ├── middlewares/      # JWT Authentication, RBAC Authorization, Error Handler
│   │   ├── routes/           # REST Endpoint Route Definitions
│   │   └── prisma/           # Database Seeder (seed.ts) & Migration Utilities
│   ├── prisma/
│   │   └── schema.prisma     # SQLite Enterprise Data Models
│   └── package.json
│
├── frontend/                 # React 19 + TypeScript + Vite + Tailwind CSS Frontend UI
│   ├── src/
│   │   ├── components/       # Reusable Layout, Navbar, Sidebar & Design System Primitives
│   │   ├── context/          # Auth & Theme Context Providers
│   │   ├── lib/              # API Client (Axios) & Indian Rupee (₹) Utilities
│   │   └── pages/            # Dashboard, CRM, Sales, Challans, Warehouse & Reports
│   └── package.json
│
├── .git/                     # Git Version Control Repository
├── vercel.json               # Vercel Deployment Configuration for Frontend
├── render.yaml               # Render Blueprint Deployment for Backend API
├── docker-compose.yml        # Docker Multi-Container Configuration
└── README.md                 # Project Overview & Deployment Guide
```

---

## 🛠 Tech Stack

### **Frontend (`/frontend`)**
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Vanilla CSS Glassmorphism
- **Icons & Visuals**: Lucide React Icons
- **State & Query**: React Query (`@tanstack/react-query`), Context API
- **Charts**: Recharts (Dynamic Indian Rupee ₹ Y-axis scaling: K, L, Cr)
- **Routing**: React Router v6

### **Backend (`/backend`)**
- **Runtime**: Node.js + Express (TypeScript)
- **ORM & Database**: Prisma ORM v5 + SQLite (`dev.db`)
- **Security & Auth**: JWT Tokens, Bcrypt (12 salt rounds), Helmet, Express Rate Limit
- **Architecture**: Controller Layer → Service Layer → Repository Layer → Prisma ORM

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Admin** | `admin@opspilot.com` | `password123` | Full System Access |
| **Sales** | `sales@opspilot.com` | `password123` | CRM, Sales Orders, Challans, Quotes |
| **Warehouse** | `warehouse@opspilot.com` | `password123` | Multi-Warehouse Stock & Receiving |
| **Accounts** | `accounts@opspilot.com` | `password123` | Invoices, Financial Ledger & Expenses |

---

## 🚀 Quickstart & Local Setup

### 1. Install Dependencies
```bash
# Install root, backend, and frontend packages
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Database Generation & Seeding
```bash
cd backend
npx prisma generate
npx prisma db push
npx tsc
node dist/prisma/seed.js
```

### 3. Start Development Servers
```bash
# Terminal 1: Run Backend API (Port 5000)
npm run dev --prefix backend

# Terminal 2: Run Frontend Portal (Port 5173)
npm run dev --prefix frontend
```

---

## ☁️ Production Deployment

### **Deploying Frontend to Vercel (`vercel.json`)**
1. Connect your repository to [Vercel](https://vercel.com).
2. Set Root Directory to `./` (uses `vercel.json` rewrite configuration).
3. Set Environment Variable: `VITE_API_URL=https://your-backend-api.onrender.com/api`.

### **Deploying Backend to Render (`render.yaml`)**
1. Import repository into [Render](https://render.com) using **New Web Service / Blueprint**.
2. Render detects `render.yaml` automatically.
3. Build Command: `cd backend && npm install && npx prisma generate && npx prisma db push && npm run build`
4. Start Command: `node backend/dist/index.js`
