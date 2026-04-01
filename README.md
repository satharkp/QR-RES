# 🌟 QR Restaurant Management System

A comprehensive, multi-tenant digital dining and restaurant management platform. Built to provide a premium, seamless experience for customers, waitstaff, kitchen, and administration.

## 🚀 Features

### 🍽 For Customers (Public Menu)
- **Digital QR Menu:** Instant access to the menu via table-specific QR codes.
- **Dynamic Cart & Checkout:** Easy item selection, portion variants, and special instructions.
- **Payment Options:** Support for both secure Online Payments (via Razorpay) and Cash payments.
- **Order Tracking:** Real-time visibility into order status ("Preparing," "Ready") directly on the menu page.
- **Waiter Call System:** Request assistance from the assigned waiter instantly.
- **Post-Meal Ratings:** Frictionless feedback system for restaurant improvement.

### 🧑‍🍳 For Waitstaff
- **Waiter Dashboard:** Tablet/Mobile responsive command center.
- **Table Assignments:** View only assigned tables and their active orders.
- **Live Notifications:** Real-time alerts for "Customer Calls" and new "Cash Orders" (via Socket.io).
- **Order Placement:** Waiters can place orders on behalf of walk-in or cash-paying clients.

### 🔪 For Kitchen
- **Kitchen Display System (KDS):** Interactive, real-time board for incoming orders.
- **Live Lifecycle Management:** Move orders through "Fire! (Start Prep)" to "Order Ready" status.
- **TV Model Mode:** High-contrast, scalable display mode optimized for kitchen screens.
- **Inventory Toggles:** Mark items "Out of Stock" to instantly hide them from the public menu.

### 💼 For Restaurant Admins (Dashboard)
- **Full Operational Control:** Real-time metrics, platform revenue, and order tracking.
- **Menu Management:** Create and edit items, set portion sizes, upload mouth-watering images (optimized & stored securely).
- **Floor Plan Management:** Map out tables and generate unique, stylized QR codes for each.
- **Staff Control:** Register waitstaff, assign specific tables to ensure load balance, and manage permissions.
- **Cashier Terminal:** Track and clear pending cash orders. 
- **Brand Identity Customization:** Modify logos, global fonts, currency configurations, and platform colors.

### 🛡 For Super Admins
- **Multi-Tenant System:** Initialize new sub-restaurants effortlessly on the network.
- **System Records & Audits:** Monitor aggregated analytics across all instances.
- **Node Initialization:** Generate instance administration credentials and domain configurations.

## 🛠 Tech Stack

### Backend API
- **Node.js** & **Express:** Core server infrastructure.
- **MongoDB** (with **Mongoose**): Robust NoSQL database schemas.
- **Socket.io:** Emitting real-time events for synchronization between customers, waiters, and KDS.
- **JWT & bcryptjs:** Secure role-based authentication vectors.
- **Razorpay:** Transaction gateway integration.
- **Cloudinary:** Remote asset repository for menu items.

### Frontend
- **React.js (Vite):** Lightning-fast modern frontend framework.
- **Tailwind CSS:** Fully custom, utility-first stylistic approach utilizing a dynamic "Greenleaf" theme token system.
- **React Router:** Multi-layered application routing with Protected Guards.
- **Lucide React:** Sleek icon library.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Razorpay API Keys (for testing online orders)
- Cloudinary Credentials (for image uploads)

### 1. Backend Setup
1. Clone the repository and navigate to the project root:
   ```bash
   cd qr-restaurant-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root based on `.env.example` (ensure `MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, etc., are correctly configured).
4. Boot the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate into the frontend bundle folder:
   ```bash
   cd qr-menu-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `qr-menu-frontend` mapping to your localized backend:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## 📸 Architectural Flow
The system operates securely on a multi-token architecture:
*   **Public Access:** No auth required; context is derived from the table-specific QR URL payload.
*   **Session Management:** `Customer`, `Waiter`, `Kitchen`, `Admin`, and `SuperAdmin` possess isolated routing bounds dictated by injected JWT signatures.

## 🤝 Code Quality & Best Practices
- Strict usage of modern ES6+ capabilities.
- Fully sanitized payloads, centralized configuration patterns.
- Comprehensive ESLint validations ensuring pristine React hook purity and exhaustive dependencies.

---
*Curated with elegance. Designed for high-volume service environments.*
