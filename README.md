# KeepAlive Admin (Supabase CronJob Manager)

![KeepAlive Admin UI](https://img.shields.io/badge/UI-Modern_Glassmorphism-blue?style=for-the-badge)
![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-ef4444?style=for-the-badge&logo=turborepo)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Express](https://img.shields.io/badge/Express.js-API-gray?style=for-the-badge&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?style=for-the-badge&logo=prisma)

**KeepAlive Admin** is a robust monorepo solution designed to manage and monitor Supabase database configurations. Its primary goal is to prevent Supabase Free Tier projects from being paused due to inactivity (7-day limit) by automatically executing scheduled keep-alive queries (cron jobs) against a dedicated `cronjob_keepalive` table.

## 🚀 Key Features

- **Automated Keep-Alive Pings:** Integrated with Vercel Cron to automatically ping your Supabase databases to prevent pausing.
- **Auto-Generation of Target Tables:** Connects directly to your target Supabase databases to automatically create the required `cronjob_keepalive` schema.
- **IPv4 Connection Pooler Support:** Bypasses Supabase's recent IPv6-only direct connection deprecation (`ENOTFOUND` errors) by supporting Connection Pooler URLs (e.g., AWS Poolers on port 6543) for DDL migrations.
- **Enterprise-Grade Security:** Service Role Keys are encrypted using AES-256 before being stored in the database. Passwords are never saved in plain text.
- **Free-Tier Policy Enforcer:** Validates that a maximum of 2 database configurations are permitted per Supabase account email.
- **Website Health Checks:** Allows users to link the associated frontend application URL and test its accessibility directly from the dashboard.
- **Modern UI/UX:** Built with Tailwind CSS featuring dynamic dark mode, glassmorphism panels, skeleton loaders, and responsive data tables.

---

## 🏗 Architecture & Tech Stack

This project uses [Turborepo](https://turbo.build/) to manage a modern full-stack TypeScript monorepo structure.

### Apps and Packages
- `apps/web`: The Frontend application built with **Next.js (App Router)**, **Tailwind CSS**, and **Zustand**.
- `apps/api`: The Backend API built with **Express.js**, **Prisma ORM**, and **node-postgres (pg)**.
- `packages/shared`: A shared TypeScript package containing **Zod schemas**, Data Transfer Objects (DTOs), and utility functions used by both frontend and backend.

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v10.x recommended)
- A local or remote PostgreSQL database for the API (`apps/api`) to store configurations.

---

## 🛠 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AhmadArifff/CrownJobExpiredSupabase.git
   cd CrownJobExpiredSupabase
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root of `apps/api` (and/or copy `.env.example` if available). At a minimum, you'll need:
   ```env
   # apps/api/.env
   DATABASE_URL="postgresql://user:password@localhost:5432/keepalive_db"
   JWT_SECRET="your_super_secret_jwt_key"
   ENCRYPTION_KEY="your_32_byte_aes_encryption_key"
   PORT=4000

   # apps/web/.env.local
   NEXT_PUBLIC_API_URL="http://localhost:4000/api"
   ```

4. **Initialize Database:**
   Push the Prisma schema to your API database:
   ```bash
   cd apps/api
   npx prisma db push
   ```

5. **Start the Development Server:**
   From the root of the project, run:
   ```bash
   npm run dev
   ```
   This will start both the Next.js frontend (typically on `http://localhost:3000`) and the Express API (on `http://localhost:4000`) concurrently.

---

## 💡 Usage Guide

### 1. Adding a Supabase Configuration
- Navigate to the **Supabase Configs** menu in the dashboard.
- Click **Add New Config**.
- Enter your Supabase Project Name, Account Email, Supabase URL, Anon Key, and Service Role Key.
- **Crucial Step:** Enter your Database Password. This is required for the system to automatically generate the `cronjob_keepalive` table.

### 2. Handling `ENOTFOUND` Errors (IPv6 Issues)
Supabase has deprecated direct database connections (`db.[ref].supabase.co`) over IPv4. If you encounter an `ENOTFOUND` error when testing or auto-generating the table:
1. Go to your Supabase Dashboard → Settings → Database → **Connection Pooler**.
2. Copy the Connection Pooler URL (e.g., `aws-1-ap-southeast-1.pooler.supabase.com`).
3. Paste it into the **Connection Pooler URL** field in the KeepAlive Admin edit form.
4. Test the connection again. The system will seamlessly route the DDL migration through the IPv4 pooler.

### 3. Monitoring Logs
- Navigate to the **Activity Logs** page to see real-time updates of all keep-alive queries, table generations, and health checks.
- The **Keep-Alive Data** page displays real-time execution statistics for each tracked database.

---

## 🛡 Security Notes
- **Never expose your `ENCRYPTION_KEY`.** It is used to securely encrypt all Supabase Service Role keys at rest.
- Ensure that the backend API is properly secured and that CORS is restricted to your specific Next.js frontend origin in production environments.

---

## 📝 Scripts

From the root directory, you can run the following Turborepo commands:
- `npm run dev`: Starts all applications in development mode.
- `npm run build`: Builds all apps and packages for production.
- `npm run lint`: Runs ESLint across all workspaces.
- `npm run type-check`: Validates TypeScript typings across the monorepo.

---

*Authored by the Google DeepMind Agentic IDE Team (Antigravity).*
