# PRD — CronJob Supabase Keep-Alive Manager (Open Source)

**Product:** CronJob Supabase Keep-Alive Manager
**Author:** PM / Development Team
**Date:** 2026-08-10
**Version:** v2.1 (Decisions Applied)
**Status:** Approved — Ready for Implementation

---

## Executive Summary

CronJob Supabase Keep-Alive Manager adalah **aplikasi open-source** berbentuk **Admin Panel PWA** (Progressive Web App) cross-platform yang dirancang untuk mencegah auto-pause pada akun Supabase Free Tier. Aplikasi ini dibangun sebagai **monorepo** yang menggabungkan:

- **Landing Page** — halaman publik untuk menjelaskan produk
- **Login/Register** — autentikasi user via Better Auth + JWT
- **Admin Panel** — dashboard untuk mengelola 10+ akun Supabase per user

Semua data (konfigurasi, activity logs, user data) disimpan di **Supabase PostgreSQL** sehingga bisa diakses dari device manapun setelah login. Proyek ini bersifat **open source** sehingga siapapun bisa menggunakan dan berkontribusi.

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [User Personas](#2-user-personas)
3. [Scope Definition](#3-scope-definition)
4. [Monorepo Project Structure](#4-monorepo-project-structure)
5. [Tech Stack & Architecture](#5-tech-stack--architecture)
6. [Database Schema Design (Supabase PostgreSQL + Prisma)](#6-database-schema-design-supabase-postgresql--prisma)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [API Design (Backend Express.js)](#8-api-design-backend-expressjs)
9. [Feature Breakdown & User Stories](#9-feature-breakdown--user-stories)
10. [UI/UX Design Specifications](#10-uiux-design-specifications)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Security Considerations](#12-security-considerations)
13. [QA Strategy & Test Plan](#13-qa-strategy--test-plan)
14. [Roadmap & Timeline](#14-roadmap--timeline)
15. [Risks & Mitigation](#15-risks--mitigation)
16. [Success Metrics](#16-success-metrics)
17. [Open Questions](#17-open-questions)

---

## 1. Problem Statement

### Background
Supabase Free Tier memiliki kebijakan **auto-pause** yang menghentikan akses database PostgreSQL dan Bucket Storage jika tidak ada interaksi selama **7 hari berturut-turut**. Hal ini menyebabkan:

- Koneksi database terputus total
- Bucket storage tidak bisa diakses
- Aplikasi yang bergantung pada Supabase menjadi tidak berfungsi
- Proses reaktivasi membutuhkan waktu dan upaya manual

### Pain Point
Developer/tim yang mengelola **banyak akun Supabase** (10+) kesulitan untuk:
- Mengingat dan melakukan interaksi manual ke setiap akun secara berkala
- Mengelola konfigurasi koneksi yang berbeda-beda per akun
- Memantau status aktif/inaktif setiap akun Supabase
- Tidak ada tool terpusat yang bisa diakses dari mana saja (multi-device)

### Solusi
Membangun aplikasi **open-source CronJob Keep-Alive Manager** sebagai Admin Panel PWA dengan:
1. **Autentikasi user** — setiap user punya akun sendiri (login/register)
2. Menyimpan konfigurasi multi-akun Supabase **di server** (Supabase PostgreSQL) — bisa diakses dari device manapun
3. Membuat tabel `cronjob_keepalive` di setiap database Supabase target secara otomatis
4. Melakukan operasi CRUD (insert & delete) secara manual oleh user untuk menjaga aktivitas
5. **Open source** — siapapun bisa deploy sendiri atau berkontribusi

### Perubahan dari v1.0
| Aspek | v1.0 (Client-Side) | v2.0 (Monorepo + Backend) |
|-------|--------------------|-----------------------------|
| Arsitektur | Client-side only, no backend | Monorepo: Next.js Frontend + Express.js Backend |
| Data Storage | IndexedDB (lokal per device) | Supabase PostgreSQL (server-side, multi-device) |
| Autentikasi | Tidak ada | Better Auth + JWT (Login/Register) |
| Target User | Personal tool (1 user) | Open source, multi-user |
| Halaman | 4 halaman tool | Landing Page + Auth + Admin Panel |
| Akses Config | Hanya di 1 device | Dari device manapun setelah login |

---

## 2. User Personas

### Persona 1: Developer Indie
| Attribute | Detail |
|-----------|--------|
| **Nama** | Andi (Developer Freelance) |
| **Usia** | 22-35 tahun |
| **Goal** | Menjaga 5-15 project Supabase Free Tier tetap aktif dari HP/laptop manapun |
| **Pain** | Lupa melakukan interaksi, harus buka Supabase dashboard satu-satu |
| **Tech Savvy** | Tinggi — familiar dengan Supabase, API keys, connection strings |
| **Kebutuhan** | Login sekali, manage semua akun dari 1 dashboard |

### Persona 2: Tim Development Kecil
| Attribute | Detail |
|-----------|--------|
| **Nama** | Tim Startup (3-5 orang) |
| **Goal** | Mengelola multiple Supabase instances untuk staging/development |
| **Pain** | Tidak ada orang yang dedicated untuk monitor status Supabase |
| **Tech Savvy** | Menengah-Tinggi |
| **Kebutuhan** | Self-hosted tool yang bisa di-deploy sendiri |

### Persona 3: Open Source Contributor
| Attribute | Detail |
|-----------|--------|
| **Nama** | Open Source Developer |
| **Goal** | Berkontribusi pada tool yang bermanfaat bagi komunitas |
| **Pain** | Banyak tool serupa tapi tidak open source / terlalu kompleks |
| **Tech Savvy** | Tinggi |
| **Kebutuhan** | Codebase yang clean, well-documented, mudah di-setup |

---

## 3. Scope Definition

### In Scope (MVP - v1.0 Release)

| # | Feature | Priority | Area |
|---|---------|----------|------|
| 1 | **Landing Page** — halaman publik penjelasan produk | **P0** | Frontend |
| 2 | **Register/Login** — Better Auth + JWT | **P0** | Full-stack |
| 3 | **Admin Panel Dashboard** — overview status akun Supabase | **P0** | Full-stack |
| 4 | **Config Manager** — CRUD konfigurasi Supabase (10+ akun) | **P0** | Full-stack |
| 5 | **Table Generator** — auto-generate tabel `cronjob_keepalive` | **P0** | Full-stack |
| 6 | **CronJob Manager** — manual CRUD keep-alive data | **P0** | Full-stack |
| 7 | **Activity Logs** — riwayat semua interaksi | **P1** | Full-stack |
| 8 | **Connection Health Check** — test koneksi ke Supabase | **P1** | Full-stack |
| 9 | **PWA Installable** — web + mobile | **P0** | Frontend |
| 10 | **Dark/Light Mode** | **P1** | Frontend |
| 11 | **Responsive Design** — mobile-first | **P0** | Frontend |
| 12 | **Backend API** — Express.js REST API | **P0** | Backend |
| 13 | **Database Schema** — Prisma ORM + Supabase PostgreSQL | **P0** | Backend |
| 14 | **Protected Routes** — Auth Guard frontend + backend | **P0** | Full-stack |
| 15 | **Env File Uploader** — upload .env, parse to JSON, preview, save to DB | **P1** | Full-stack |
| 16 | **GitHub Repo Links** — simpan max 2 link repo project | **P1** | Full-stack |

### Out of Scope (Future Versions)

| # | Feature | Version |
|---|---------|---------|
| 1 | Automated CronJob scheduler (auto insert/delete setiap X hari) | v2.0 |
| 2 | Push notification reminder | v2.0 |
| 3 | Team/Organization management (shared configs) | v2.0 |
| 4 | Supabase Bucket Storage keep-alive | v2.0 |
| 5 | API monitoring dashboard (response time, uptime) | v3.0 |
| 6 | Webhook integration untuk alert | v3.0 |
| 7 | Admin role (super admin untuk manage users) | v2.0 |
| 8 | OAuth (Google, GitHub login) | v2.0 |
| 9 | Docker compose untuk self-hosting | v1.1 |
| 10 | Config encryption at rest | v1.1 |

---

## 4. Monorepo Project Structure (Turborepo + Vercel)

> **DECISION:** Menggunakan **Turborepo** sebagai monorepo tool karena native support di Vercel (Vercel yang mengembangkan Turborepo), caching yang cepat, dan parallel task execution.

```
CrownJobExpiredSupbase/
├── README.md                          # Project documentation (open source)
├── LICENSE                            # MIT License
├── PRD.md                             # This document
├── .gitignore
├── .env.example                       # Environment variables template
├── package.json                       # Root package.json (workspaces)
├── turbo.json                         # Turborepo configuration
├── vercel.json                        # Vercel monorepo deployment config
│
├── apps/
│   ├── web/                           # Next.js 15 (App Router) + PWA
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   ├── public/
│   │   │   ├── manifest.json          # PWA manifest
│   │   │   ├── sw.js                  # Service worker
│   │   │   ├── icons/                 # PWA icons (192x192, 512x512)
│   │   │   └── images/                # Landing page assets
│   │   ├── src/
│   │   │   ├── app/                   # App Router pages
│   │   │   │   ├── layout.tsx         # Root layout
│   │   │   │   ├── page.tsx           # Landing Page (public)
│   │   │   │   ├── (auth)/            # Auth group
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   └── register/page.tsx
│   │   │   │   └── (admin)/           # Protected admin group
│   │   │   │       ├── layout.tsx     # Admin layout (sidebar + auth guard)
│   │   │   │       ├── dashboard/page.tsx
│   │   │   │       ├── config/page.tsx
│   │   │   │       ├── cronjob/page.tsx
│   │   │   │       └── logs/page.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/                # Shadcn UI components
│   │   │   │   ├── layout/            # Sidebar, Navbar, BottomNav
│   │   │   │   ├── landing/           # Landing page sections
│   │   │   │   ├── auth/              # Login/Register forms
│   │   │   │   ├── dashboard/         # Dashboard cards/widgets
│   │   │   │   ├── config/            # Config CRUD components
│   │   │   │   ├── cronjob/           # CronJob table & forms
│   │   │   │   └── shared/            # Shared components (toast, loading)
│   │   │   ├── lib/
│   │   │   │   ├── api.ts             # Axios/Fetch API client (Result Pattern)
│   │   │   │   ├── auth.ts            # Better Auth client
│   │   │   │   ├── utils.ts           # Utility functions
│   │   │   │   └── validations.ts     # Zod schemas
│   │   │   ├── stores/
│   │   │   │   ├── useAuthStore.ts     # Auth state (Zustand)
│   │   │   │   ├── useConfigStore.ts   # Config state
│   │   │   │   ├── useTableStore.ts    # Table data state
│   │   │   │   └── useUIStore.ts       # Theme, sidebar state
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts         # Auth hook
│   │   │   │   ├── useConfigs.ts      # Config CRUD hook
│   │   │   │   └── useSupabaseOps.ts   # Supabase operation hook
│   │   │   └── styles/
│   │   │       └── globals.css        # Global styles + Tailwind
│   │   └── .env.local                 # Frontend env (API URL, etc.)
│   │
│   └── api/                           # Express.js Backend (Vercel Serverless)
│       ├── package.json
│       ├── tsconfig.json
│       ├── vercel.json                # Vercel serverless config
│       ├── api/
│       │   └── index.ts               # Vercel serverless entry point
│       ├── prisma/
│       │   ├── schema.prisma          # Database schema
│       │   └── migrations/            # Prisma migrations
│       ├── src/
│       │   ├── app.ts                 # Express app setup (exported for serverless)
│       │   ├── config/
│       │   │   ├── env.ts             # Environment variables
│       │   │   ├── cors.ts            # CORS configuration
│       │   │   └── database.ts        # Prisma client singleton
│       │   ├── routes/
│       │   │   ├── index.ts           # Route aggregator
│       │   │   ├── auth.routes.ts     # Auth routes (/api/v1/auth/*)
│       │   │   ├── config.routes.ts   # Config CRUD (/api/v1/configs/*)
│       │   │   ├── cronjob.routes.ts  # CronJob ops (/api/v1/cronjob/*)
│       │   │   ├── logs.routes.ts     # Activity logs (/api/v1/logs/*)
│       │   │   └── health.routes.ts   # Health check (/api/v1/health/*)
│       │   ├── controllers/
│       │   │   ├── auth.controller.ts
│       │   │   ├── config.controller.ts
│       │   │   ├── cronjob.controller.ts
│       │   │   ├── logs.controller.ts
│       │   │   └── health.controller.ts
│       │   ├── services/
│       │   │   ├── auth.service.ts
│       │   │   ├── config.service.ts       # Config CRUD + email limit validation
│       │   │   ├── cronjob.service.ts      # Supabase interaction + auto table check
│       │   │   ├── supabase-client.service.ts  # Dynamic Supabase client factory
│       │   │   └── logs.service.ts
│       │   ├── middlewares/
│       │   │   ├── auth.middleware.ts      # JWT verification guard
│       │   │   ├── error.middleware.ts     # Global error handler
│       │   │   ├── validation.middleware.ts # Zod request validation
│       │   │   └── rateLimit.middleware.ts # Rate limiting
│       │   ├── utils/
│       │   │   ├── result.ts              # Result Pattern
│       │   │   ├── exceptions.ts          # Custom Domain Exceptions
│       │   │   ├── logger.ts              # Structured logging (Pino)
│       │   │   └── encryption.ts          # API key encryption/decryption
│       │   └── types/
│       │       ├── auth.types.ts
│       │       ├── config.types.ts
│       │       └── cronjob.types.ts
│       └── .env                       # Backend env (DB URL, JWT secret, etc.)
│
└── packages/
    └── shared/                        # Shared utilities
        ├── package.json
        ├── tsconfig.json
        ├── src/
        │   ├── types/                 # Shared TypeScript types
        │   │   ├── config.ts
        │   │   ├── cronjob.ts
        │   │   └── api-response.ts
        │   ├── validations/           # Shared Zod schemas
        │   │   ├── config.schema.ts
        │   │   └── cronjob.schema.ts
        │   └── constants/
        │       └── limits.ts          # Business rule constants
        └── index.ts                   # Package exports
```

### 4.1 Turborepo Configuration (`turbo.json`)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "db:generate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    }
  }
}
```

### 4.2 Vercel Deployment Strategy

Kedua apps di-deploy ke **Vercel Free Tier** sebagai project terpisah dalam 1 repo (`AhmadArifff/CrownJobExpiredSupabase`):

| App | Vercel Project Name | Root Directory | Framework Preset | Production Domain |
|-----|---------------------|----------------|------------------|-------------------|
| `apps/api` (Backend) | `crownjob-dev` | `apps/api` | Other / Express | `https://crownjob-dev.vercel.app` |
| `apps/web` (Frontend) | `cronjob-web` | `apps/web` | Next.js | `https://cronjob-web.vercel.app` |

---

#### 4.2.1 Konfigurasi Project 1: Backend (`apps/api`)

- **Vercel Team / Scope**: Personal / Team
- **Project Name**: `crownjob-dev`
- **Framework Preset**: `Other` (atau `Express`)
- **Root Directory**: `apps/api`
- **Include source files outside Root Directory**: **Checked (ON)** *(Wajib agar dependencies `@cronjob/shared` terbaca)*
- **Build & Output Settings**:
  - **Build Command**: `npm run build` *(atau `turbo run build`)*
  - **Output Directory**: *Kosongkan (Default / N/A)*
  - **Install Command**: `npm install --prefix=../..` *(atau `cd ../.. && npm install`)*
- **Environment Variables (`apps/api`)**:
  ```env
  DATABASE_URL="postgresql://postgres.msqdrtgbdrtobsvypozl:e5Yj.fF-y*FCL%2Fn@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
  DIRECT_URL="postgresql://postgres.msqdrtgbdrtobsvypozl:e5Yj.fF-y*FCL%2Fn@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
  ENCRYPTION_KEY="f192b3a4c5d6e7f8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e"
  BETTER_AUTH_SECRET="your-better-auth-secret-min-32-chars-long-123456789"
  BETTER_AUTH_URL="https://crownjob-dev.vercel.app"
  JWT_SECRET="your-jwt-secret-min-32-chars-long-123456789"
  NODE_ENV="production"
  FRONTEND_URL="https://cronjob-web.vercel.app"
  ```

---

#### 4.2.2 Konfigurasi Project 2: Frontend (`apps/web`)

- **Project Name**: `cronjob-web`
- **Framework Preset**: `Next.js`
- **Root Directory**: `apps/web`
- **Include source files outside Root Directory**: **Checked (ON)**
- **Build Command**: `next build` *(Default)*
- **Output Directory**: `.next` *(Default)*
- **Install Command**: `npm install --prefix=../..`
- **Environment Variables (`apps/web`)**:
  ```env
  NEXT_PUBLIC_API_URL="https://crownjob-dev.vercel.app/api"
  BETTER_AUTH_SECRET="your-better-auth-secret-min-32-chars-long-123456789"
  NEXT_PUBLIC_BETTER_AUTH_URL="https://cronjob-web.vercel.app"
  ```

---

#### 4.2.3 Serverless Function Handler (`apps/api/vercel.json`)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/src/server.ts"
    }
  ]
}
```

---

## 5. Tech Stack & Architecture

### 5.1 Tech Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend Framework** | Next.js 15 (App Router) | SSR/SSG, PWA ready, modern React, route groups |
| **PWA** | @ducanh2912/next-pwa | Offline shell, installable, service worker |
| **Styling** | Tailwind CSS v4 | Utility-first, responsive, dark mode built-in |
| **UI Components** | Shadcn UI | Accessible, composable, customizable |
| **Animation** | Framer Motion + AnimeJS | Smooth transitions, micro-animations |
| **State Management** | Zustand | Lightweight, persisted auth/theme state |
| **Backend Framework** | Express.js (TypeScript) | Mature, wrapped as Vercel Serverless Function |
| **ORM** | Prisma ORM | Type-safe queries, migrations, PostgreSQL support |
| **Database** | Supabase PostgreSQL | Managed PostgreSQL, free tier, data stored in Supabase |
| **Authentication** | Better Auth + JWT | Token rotation, refresh tokens, RBAC ready |
| **Validation** | Zod | Shared between frontend & backend, TypeScript-native |
| **Logging** | Pino (JSON structured) | Fast, structured, correlation IDs |
| **API Client** | Axios | Interceptors for auth tokens, error handling |
| **Monorepo** | Turborepo | Native Vercel support, caching, parallel builds |
| **Deployment** | Vercel (Both Frontend + Backend) | Free tier, monorepo support, serverless functions |
| **Version Control** | GitHub (`dev` → `main`) | Standard branching, open source hosting |
| **License** | MIT | Open source friendly |

### 5.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            USER (Browser / PWA)                        │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Next.js 15 Frontend (PWA)                     │   │
│  │                                                                  │   │
│  │  ┌────────────┐  ┌───────────┐  ┌──────────────────────────┐    │   │
│  │  │ Landing    │  │ Auth      │  │ Admin Panel (Protected)  │    │   │
│  │  │ Page       │  │ Pages     │  │ ┌──────────┐ ┌────────┐ │    │   │
│  │  │ (public)   │  │ (login/   │  │ │Dashboard │ │Config  │ │    │   │
│  │  │            │  │  register)│  │ │          │ │Manager │ │    │   │
│  │  │            │  │           │  │ ├──────────┤ ├────────┤ │    │   │
│  │  │            │  │           │  │ │CronJob   │ │Activity│ │    │   │
│  │  │            │  │           │  │ │Manager   │ │Logs    │ │    │   │
│  │  └────────────┘  └───────────┘  │ └──────────┘ └────────┘ │    │   │
│  │                                  └──────────────────────────┘    │   │
│  │                                                                  │   │
│  │  ┌────────────┐  ┌───────────────┐  ┌──────────────────────┐    │   │
│  │  │ Zustand    │  │ API Client    │  │ Auth Client          │    │   │
│  │  │ Stores     │  │ (Axios +      │  │ (Better Auth)        │    │   │
│  │  │            │  │  Result Pat.) │  │                      │    │   │
│  │  └────────────┘  └───────┬───────┘  └──────────┬───────────┘    │   │
│  └──────────────────────────┼──────────────────────┼────────────────┘   │
│                              │                      │                    │
└──────────────────────────────┼──────────────────────┼────────────────────┘
                               │ HTTPS REST API       │
                               ▼                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      Express.js Backend (TypeScript)                    │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │                        Middleware Chain                            │   │
│  │  [CORS] → [Rate Limit] → [Auth Guard] → [Validation] → [Handler] │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐    │
│  │   Controllers   │  │   Services     │  │   Supabase Client     │    │
│  │   (Route        │→│   (Business    │→│   Factory              │    │
│  │    Handlers)     │  │    Logic +     │  │   (per user config,   │    │
│  │                  │  │    Result Pat.)│  │    dynamic creation)  │    │
│  └────────────────┘  └───────┬────────┘  └───────────┬────────────┘    │
│                               │                       │                  │
│  ┌────────────────────────────┴───────────────────────┘                  │
│  │                                                                       │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐     │
│  │  │ Prisma ORM     │  │ Encryption     │  │ Structured Logging │     │
│  │  │ (DB Queries)   │  │ (API Key       │  │ (Pino + JSON)      │     │
│  │  │                │  │  Encrypt/Dec)  │  │                    │     │
│  │  └───────┬────────┘  └────────────────┘  └────────────────────┘     │
│  └──────────┼────────────────────────────────────────────────────────────┘
│             │                                                            │
└─────────────┼────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Supabase PostgreSQL (App Database)                │
│                                                                     │
│  ┌────────────┐  ┌──────────────────┐  ┌──────────────────────┐   │
│  │ users      │  │ supabase_configs │  │ activity_logs        │   │
│  │ (auth)     │  │ (encrypted keys) │  │ (CRUD history)       │   │
│  └────────────┘  └──────────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
              │
              │  (Dynamic connections per user config)
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   User's Supabase Accounts (Remote)                 │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Account #1   │  │ Account #2   │  │ Account #N   │             │
│  │ DB + Bucket  │  │ DB + Bucket  │  │ DB + Bucket  │             │
│  │              │  │              │  │              │             │
│  │ cronjob_     │  │ cronjob_     │  │ cronjob_     │             │
│  │ keepalive    │  │ keepalive    │  │ keepalive    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.3 Key Architecture Decisions (ADR)

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | **Turborepo Monorepo** (`apps/web` + `apps/api` + `packages/shared`) | Dipilih | Native Vercel support, shared packages, parallel builds, caching |
| 2 | **Server-side config storage** (Supabase PostgreSQL) | Dipilih | Multi-device access, user data persists across devices, backup |
| 3 | **Better Auth + JWT** | Dipilih | Mature auth library, token rotation, easy setup, RBAC ready |
| 4 | **Express.js on Vercel Serverless** | Dipilih | Express wrapped as `@vercel/node` serverless function, free deployment |
| 5 | **API key encryption at rest** (AES-256-GCM) | Dipilih | User's Supabase keys stored encrypted in DB, decrypted only when used |
| 6 | **Prisma ORM** | Dipilih | Type-safe, auto migrations, PostgreSQL native, great DX |
| 7 | **Per-user config isolation** | Dipilih | Each user only sees their own configs (row-level filtering via user_id) |
| 8 | **1 email = max 2 databases** | Dipilih | Business rule: Supabase Free Tier allows max 2 projects per email |
| 9 | **Unlimited configs per user** | Dipilih | No arbitrary limit; user bisa punya banyak akun email Supabase |
| 10 | **Auto table check on connection test** | Dipilih | Try connection → check table exists → auto-generate if missing |
| 11 | **Manual CRUD** (bukan auto-scheduler) | MVP | Auto-scheduler membutuhkan Vercel Cron (v2.0) |

---

## 6. Database Schema Design (Supabase PostgreSQL + Prisma)

### 6.0 Central Database Configuration

Aplikasi ini menggunakan Supabase PostgreSQL sebagai database sentral (menyimpan data User, Config, dan Log). Berikut adalah konfigurasi koneksinya menggunakan **Connection Transaction Pooler**:

- **Host**: `aws-0-ap-south-1.pooler.supabase.com`
- **Port**: `6543`
- **Database**: `postgres`
- **User**: `postgres.msqdrtgbdrtobsvypozl`
- **Password**: `e5Yj.fF-y*FCL/n`
- **Connection String**: 
  ```text
  postgresql://postgres.msqdrtgbdrtobsvypozl:e5Yj.fF-y*FCL/n@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
  ```

*(Opsional) Untuk mempermudah integrasi dengan AI Agent, jalankan: `npx skills add supabase/agent-skills`*

### 6.1 Entity Relationship Diagram

```
┌──────────────┐       ┌─────────────────────┐       ┌────────────────┐
│   users      │       │  supabase_configs    │       │ activity_logs  │
│──────────────│       │─────────────────────│       │────────────────│
│ id (PK)      │──┐    │ id (PK)             │──┐    │ id (PK)        │
│ email        │  │    │ user_id (FK)        │  │    │ user_id (FK)   │
│ name         │  └───▶│ account_email       │  │    │ config_id (FK) │
│ password_hash│       │ database_name       │  └───▶│ action         │
│ avatar_url   │       │ supabase_url        │       │ status         │
│ created_at   │       │ supabase_anon_key   │       │ message        │
│ updated_at   │       │ supabase_srk        │       │ metadata       │
└──────────────┘       │ is_table_generated  │       │ created_at     │
       │               │ last_interaction    │       └────────────────┘
       │               │ status              │
       │               │ created_at          │
       │               │ updated_at          │
       │               └─────────────────────┘
       │
       │               ┌─────────────────────┐
       └──────────────▶│ sessions            │
                       │─────────────────────│
                       │ id (PK)             │
                       │ user_id (FK)        │
                       │ token               │
                       │ refresh_token       │
                       │ expires_at          │
                       │ created_at          │
                       └─────────────────────┘
```

### 6.2 Prisma Schema (`backend/prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================
// AUTH TABLES (Better Auth managed)
// ============================================

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  passwordHash  String   @map("password_hash")
  avatarUrl     String?  @map("avatar_url")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  // Relations
  configs       SupabaseConfig[]
  activityLogs  ActivityLog[]
  sessions      Session[]

  @@map("users")
}

model Session {
  id           String   @id @default(cuid())
  userId       String   @map("user_id")
  token        String   @unique
  refreshToken String?  @unique @map("refresh_token")
  expiresAt    DateTime @map("expires_at")
  createdAt    DateTime @default(now()) @map("created_at")

  // Relations
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("sessions")
}

// ============================================
// APPLICATION TABLES
// ============================================

model SupabaseConfig {
  id                    String   @id @default(cuid())
  userId                String   @map("user_id")
  accountEmail          String   @map("account_email")
  databaseName          String   @map("database_name")
  supabaseUrl           String   @map("supabase_url")
  supabaseAnonKey       String   @map("supabase_anon_key")        // Encrypted
  supabaseServiceRoleKey String  @map("supabase_service_role_key") // Encrypted
  envDataFrontend       Json?    @map("env_data_frontend")        // Parsed JSON from Frontend .env
  envDataBackend        Json?    @map("env_data_backend")         // Parsed JSON from Backend .env
  githubRepoLinks       Json?    @map("github_repo_links")        // Array of URLs (max 2)
  isTableGenerated      Boolean  @default(false) @map("is_table_generated")
  lastInteraction       DateTime? @map("last_interaction")
  status                String   @default("unknown")              // active | inactive | error | unknown
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  // Relations
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  activityLogs          ActivityLog[]

  // Business Rule: 1 account_email can have max 2 configs (2 DB per Supabase email)
  @@unique([userId, accountEmail, databaseName])  // Prevent duplicate config
  @@index([userId])
  @@index([userId, accountEmail])                 // For email-based count queries
  @@map("supabase_configs")
}

model ActivityLog {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  configId  String?  @map("config_id")
  action    String                                                 // insert | delete | generate_table | health_check | bulk_delete
  status    String                                                 // success | failed
  message   String?
  metadata  Json?                                                  // Additional data (e.g., row count, error details)
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  config    SupabaseConfig? @relation(fields: [configId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([configId])
  @@index([createdAt])
  @@map("activity_logs")
}
```

### 6.3 Remote Schema (Supabase Target — Identical per Account)

#### Tabel: `cronjob_keepalive`

Tabel yang **identik** di setiap database Supabase yang dikelola user. Nama tabel dan kolom **harus sama** di semua akun.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `bigint` | PK, auto-increment | Unique row identifier |
| `ping_message` | `text` | NOT NULL | Pesan keep-alive (e.g., "keepalive-2026-08-10T10:00:00Z") |
| `created_by` | `text` | DEFAULT 'cronjob-manager' | Identifier sumber interaksi |
| `created_at` | `timestamptz` | DEFAULT now() | Timestamp insert |

#### SQL untuk Generate Tabel

```sql
CREATE TABLE IF NOT EXISTS cronjob_keepalive (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ping_message TEXT NOT NULL,
    created_by TEXT DEFAULT 'cronjob-manager',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Authentication & Authorization

### 7.1 Auth Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────────┐
│  User    │────▶│ Login Page   │────▶│ POST /api/   │────▶│ Better Auth│
│  Browser │     │ (Frontend)   │     │ v1/auth/login│     │ Service    │
└──────────┘     └──────────────┘     └──────┬───────┘     └──────┬─────┘
                                              │                    │
                                              │  Verify password   │
                                              │◀───────────────────┘
                                              │
                                              │  Generate JWT
                                              │  (access + refresh)
                                              │
                                              ▼
                                     ┌────────────────┐
                                     │ Set HttpOnly   │
                                     │ Secure Cookie  │
                                     │ (refresh_token)│
                                     │                │
                                     │ Return access  │
                                     │ token in body  │
                                     └────────────────┘
```

### 7.2 Auth Strategy

| Aspect | Implementation |
|--------|----------------|
| **Library** | Better Auth (server-side) |
| **Access Token** | JWT, 15 min expiry, stored in memory (Zustand) |
| **Refresh Token** | JWT, 7 day expiry, HttpOnly Secure cookie |
| **Token Rotation** | New refresh token issued on each refresh |
| **Password Hashing** | Argon2id (via Better Auth) |
| **Protected Routes** | Frontend: Auth Guard middleware in `(admin)/layout.tsx` |
| **Protected APIs** | Backend: `auth.middleware.ts` on all `/api/v1/*` except auth routes |

### 7.3 Route Protection Matrix

| Route | Auth Required | Role |
|-------|--------------|------|
| `/` (Landing Page) | No | Public |
| `/login` | No | Public |
| `/register` | No | Public |
| `/dashboard` | **Yes** | User |
| `/config` | **Yes** | User |
| `/cronjob` | **Yes** | User |
| `/logs` | **Yes** | User |
| `POST /api/v1/auth/*` | No | Public |
| `* /api/v1/configs/*` | **Yes** | User (own data only) |
| `* /api/v1/cronjob/*` | **Yes** | User (own configs only) |
| `* /api/v1/logs/*` | **Yes** | User (own logs only) |
| `GET /api/v1/health` | No | Public |

### 7.4 Data Isolation (Per-User)

Setiap query ke database **WAJIB** include `WHERE user_id = currentUser.id` untuk memastikan user hanya bisa akses data miliknya sendiri. Ini diimplementasikan di **Service Layer** (bukan controller).

```typescript
// Example: Config Service — Guard Clause + User Isolation
async getConfigs(userId: string): Promise<Result<SupabaseConfig[]>> {
  if (!userId) return Result.fail('User ID is required');

  const configs = await prisma.supabaseConfig.findMany({
    where: { userId }, // <-- User isolation
    orderBy: { createdAt: 'desc' },
  });

  return Result.ok(configs);
}
```

---

## 8. API Design (Backend Express.js on Vercel Serverless)

### 8.1 API Base URL

```
Development: http://localhost:4000/api
Production:  https://crownjob-dev.vercel.app/api
```

### 8.2 Standard Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "meta": {                    // Optional pagination
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid Supabase URL format",
    "details": [...]           // Optional field errors
  }
}
```

### 8.3 API Endpoints

#### Auth Routes (`/api/v1/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Register new user | No |
| `POST` | `/auth/login` | Login user, return tokens | No |
| `POST` | `/auth/logout` | Logout, invalidate tokens | Yes |
| `POST` | `/auth/refresh` | Refresh access token | Cookie |
| `GET` | `/auth/me` | Get current user profile | Yes |

#### Config Routes (`/api/v1/configs`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/configs` | List all configs (user's own, unlimited) | Yes |
| `GET` | `/configs/:id` | Get single config detail | Yes |
| `POST` | `/configs` | Create new config (validates max 2 DB per email) | Yes |
| `PUT` | `/configs/:id` | Update existing config | Yes |
| `DELETE` | `/configs/:id` | Delete config | Yes |
| `POST` | `/configs/:id/test-connection` | Test connection + auto-check/generate table | Yes |

#### CronJob Routes (`/api/v1/cronjob`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/cronjob/:configId/generate-table` | Create `cronjob_keepalive` table | Yes |
| `GET` | `/cronjob/:configId/data` | Load table data | Yes |
| `POST` | `/cronjob/:configId/ping` | Insert keep-alive row | Yes |
| `DELETE` | `/cronjob/:configId/data/:rowId` | Delete single row | Yes |
| `POST` | `/cronjob/:configId/data/bulk-delete` | Bulk delete rows | Yes |
| `POST` | `/cronjob/ping-all` | Ping all user's configs | Yes |

#### Activity Log Routes (`/api/v1/logs`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/logs` | List all activity logs (paginated) | Yes |
| `GET` | `/logs?configId=xxx` | Filter logs by config | Yes |
| `GET` | `/logs?action=insert` | Filter logs by action type | Yes |

#### Health Routes (`/api/v1/health`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/health` | Server health check | No |
| `GET` | `/health/db` | Database connection check | No |

### 8.4 Request Validation (Zod Schemas)

```typescript
// shared/validations/config.schema.ts
import { z } from 'zod';

export const createConfigSchema = z.object({
  accountEmail: z.string().email('Invalid email format'),
  databaseName: z.string().min(1, 'Database name is required').max(100),
  supabaseUrl: z
    .string()
    .url('Must be a valid URL')
    .regex(/^https:\/\/[a-z0-9]+\.supabase\.co$/, 'Must be a valid Supabase URL'),
  supabaseAnonKey: z
    .string()
    .min(1, 'Anon Key is required')
    .regex(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/, 'Invalid JWT format'),
  supabaseServiceRoleKey: z
    .string()
    .min(1, 'Service Role Key is required')
    .regex(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/, 'Invalid JWT format'),
  githubRepoLinks: z
    .array(z.string().url('Must be a valid URL'))
    .max(2, 'Maximum 2 repository links allowed')
    .optional(),
  envData: z.record(z.string()).optional(),
});

export const pingSchema = z.object({
  pingMessage: z.string().max(500).optional(),
});

export const bulkDeleteSchema = z.object({
  rowIds: z.array(z.number().int().positive()).min(1, 'At least one row ID required'),
});
```

---

## 9. Feature Breakdown & User Stories

### Epic 0: Landing Page (Public)

#### US-0.1: Landing Page
**As a** visitor,
**I want to** melihat penjelasan tentang CronJob Keep-Alive Manager,
**So that** saya bisa memahami fitur dan memutuskan untuk mendaftar.

**Acceptance Criteria:**
- **Given** visitor membuka URL root (`/`)
- **Then** ditampilkan halaman landing dengan:
  - Hero section: Judul, deskripsi singkat, CTA "Get Started" → `/register`
  - Features section: 3-4 fitur utama dengan icon
  - How It Works section: 3-step visual explanation
  - Open Source section: GitHub link, contribution guide
  - Footer: links, credits
- **And** halaman fully responsive (mobile-first)
- **And** halaman bisa diakses tanpa login

---

### Epic 1: Authentication (Login/Register)

#### US-1.1: Register Akun Baru
**As a** new user,
**I want to** mendaftarkan akun baru,
**So that** saya bisa menggunakan CronJob Manager.

**Acceptance Criteria:**
- **Given** user berada di halaman `/register`
- **When** user mengisi form: Name, Email, Password, Confirm Password
- **Then** akun dibuat di database
- **And** user otomatis login dan redirect ke `/dashboard`
- **And** toast "Account created successfully"

**Validation Rules:**
- Name: 2-50 chars
- Email: valid format, unique
- Password: min 8 chars, 1 uppercase, 1 number
- Confirm Password: harus sama dengan Password

#### US-1.2: Login
**As a** registered user,
**I want to** login ke akun saya,
**So that** saya bisa mengakses Admin Panel.

**Acceptance Criteria:**
- **Given** user berada di halaman `/login`
- **When** user mengisi Email + Password yang valid
- **Then** JWT access token di-set di Zustand store
- **And** refresh token di-set sebagai HttpOnly cookie
- **And** redirect ke `/dashboard`
- **And** jika credentials salah, tampilkan "Invalid email or password"

#### US-1.3: Logout
**As a** logged-in user,
**I want to** logout dari akun saya,
**So that** sesi saya aman.

**Acceptance Criteria:**
- **Given** user klik "Logout"
- **Then** session dihapus dari server
- **And** token dihapus dari Zustand + cookie
- **And** redirect ke `/login`

#### US-1.4: Protected Route Guard
**As the** system,
**I want to** memblokir akses ke Admin Panel jika belum login,
**So that** data user aman.

**Acceptance Criteria:**
- **Given** user belum login
- **When** user mengakses `/dashboard`, `/config`, `/cronjob`, `/logs`
- **Then** redirect ke `/login`
- **And** setelah login, redirect kembali ke halaman yang diminta

---

### Epic 2: Supabase Account Configuration Management

#### US-2.1: Tambah Konfigurasi Supabase Baru
**As a** logged-in user,
**I want to** menambahkan konfigurasi akun Supabase baru,
**So that** saya bisa mengelola akun tersebut dari dashboard.

**Acceptance Criteria:**
- **Given** user berada di halaman `/config`
- **When** user mengklik "Add New Config"
- **Then** form/modal muncul dengan field:
  - Account Email (text, required)
  - Database Name (text, required)
  - Supabase URL (text, required, format: `https://xxx.supabase.co`)
  - Supabase Anon Key (textarea, required, show/hide toggle)
  - Supabase Service Role Key (textarea, required, show/hide toggle)
- **And** setelah submit, POST `/api/v1/configs`
- **And** backend validates: max 2 databases per account email
  - Jika sudah 2 DB untuk email tersebut → error "Maximum 2 databases per Supabase email account"
- **And** API keys di-encrypt sebelum disimpan ke database
- **And** toast "Config saved successfully"
- **And** config baru muncul di list

#### US-2.2: Edit Konfigurasi Supabase
**As a** user,
**I want to** mengedit konfigurasi yang sudah disimpan,
**So that** saya bisa memperbarui keys yang berubah.

**Acceptance Criteria:**
- **Given** user melihat list konfigurasi
- **When** user klik "Edit" pada salah satu config
- **Then** form edit muncul dengan data pre-filled (keys masked)
- **And** user bisa mengubah field apapun
- **And** setelah save, PUT `/api/v1/configs/:id`
- **And** toast "Config updated"

#### US-2.3: Hapus Konfigurasi Supabase
**As a** user,
**I want to** menghapus konfigurasi yang tidak digunakan,
**So that** list tetap bersih.

**Acceptance Criteria:**
- **Given** user klik "Delete" pada config
- **Then** confirmation dialog muncul.
- **And** setelah confirm, proses hapus dijalankan (DELETE `/api/v1/configs/:id`).
- **And** tampilkan Toast "Config deleted" dengan tombol **"Undo"** (jika diklik dalam 5 detik, batalkan/restore data).
- **And** activity logs terkait tetap tersimpan (configId set null)

#### US-2.5: Associated App Website URL & Live Health Testing
**As a** user,
**I want to** memproses dan menyimpan URL website aplikasi yang terhubung ke database Supabase,
**So that** saya bisa membuka website langsung lewat link dan menguji status aksesibilitas websitenya.

**Acceptance Criteria:**
- **Given** user menambah/mengedit konfigurasi Supabase
- **When** input field `App Website URL` diisi (opsional)
- **Then** data disimpan di `websiteUrl` pada database
- **And** tampilkan link `Open Website ↗` yang dapat diklik untuk membuka website di tab baru
- **And** tampilkan tombol `Test Website Access` yang memanggil `POST /api/configs/:id/test-website` untuk menguji respon HTTP website secara live.

#### US-2.6: Global Light Mode & Dark Mode Theme Switcher
**As a** user,
**I want to** mengubah mode tampilan (Light / Dark mode) di seluruh halaman aplikasi (Landing Page, Login, Register, dan Admin Panel),
**So that** pengalaman penggunaan konsisten, nyaman di mata, dan fleksibel di setiap kondisi pencahayaan.

**Acceptance Criteria:**
- **Given** user berada di halaman publik (Landing Page, Login, Register) maupun Admin Panel
- **When** user menekan tombol `ThemeToggle` (ikon Matahari / Bulan) pada Navbar / Header
- **Then** tema aplikasi berganti antara Light Mode dan Dark Mode secara halus (*smooth transition*)
- **And** semua komponen (Navbar, Card, Text, Button, Table, Badge, Footer) menyesuaikan skema warna secara dinamis tanpa kontras yang buruk
- **And** pilihan tema tersimpan di *Local Storage* pengguna melalui `next-themes`.

#### US-2.7: Manage Frontend & Backend Environment Variables
**As a** user,
**I want to** mengelola environment variables (`.env`) untuk **Frontend** dan **Backend** secara terpisah,
**So that** sistem bisa menyimpan kedua env tersebut secara rapi dan saya bisa melakukan input via file maupun manual text.

**Acceptance Criteria (PM & QA):**
- **Given** user berada di form tambah/edit konfigurasi
- **When** user ingin menambahkan/mengedit environment variables
- **Then** (Frontend) menyediakan **2 bagian terpisah**: "Frontend Env" dan "Backend Env".
- **And** user bisa melakukan **Upload/Drag & Drop file `.env`** ATAU **input text/copy-paste secara manual** pada text-area yang disediakan.
- **And** (Frontend) mem-parsing input (baik dari file maupun text manual) menjadi key-value JSON dan menampilkan preview.
- **And** (Frontend) menyediakan fitur **Copy to Clipboard** pada saat mode Edit, sehingga user dapat menyalin semua env vars kembali ke format `KEY="VALUE"` dengan sekali klik.
- **And** (Backend) memvalidasi JSON payload dan menyimpannya di database (kolom `env_data_frontend` & `env_data_backend`).
- **QA Strategy:** 
  - Pastikan tombol Copy Env menghasilkan teks valid sesuai standar `.env`.
  - Parsing teks manual maupun file upload harus kebal terhadap syntax error (graceful error handling).
  - Pastikan perpindahan data JSON (frontend & backend) terisolasi dengan baik.

#### US-2.8: Tambah GitHub Repository Links
**As a** user,
**I want to** menyimpan link GitHub project (maksimal 2 link: Frontend & Backend),
**So that** saya bisa mengakses repositori terkait langsung dari dashboard.

**Acceptance Criteria (PM & QA):**
- **Given** user berada di form tambah/edit konfigurasi
- **When** user memasukkan URL repository GitHub (hingga 2 URL)
- **Then** (Backend) memvalidasi format URL agar dipastikan valid dan membatasi array max 2 elemen
- **And** (Frontend) menampilkan link tersebut di detail Config dengan UI icon GitHub yang user-friendly
- **QA Strategy:**
  - Test input lebih dari 2 URL (harus gagal validasi Zod).
  - Test payload link dengan script XSS untuk memastikan pencegahan vulnerability.

#### US-2.4: Lihat Daftar Konfigurasi (Data Isolation)
**As a** user,
**I want to** melihat HANYA konfigurasi Supabase yang saya buat sendiri,
**So that** saya bisa mengelola akun saya tanpa tercampur dengan data config milik user lain.

**Acceptance Criteria:**
- **Given** user membuka `/config`
- **Then** GET `/api/v1/configs` mengembalikan list konfigurasi **milik user yang sedang login saja** (User Data Isolation)
- **And** ditampilkan sebagai cards dengan: Email, DB Name, Status badge, Last Interaction, Actions
- **And** API keys **tidak** ditampilkan di list (hanya di detail/edit)
- **And** bisa di-search/filter
- **And** bisa di-sort (nama, status, last interaction)

---

### Epic 3: Connection Test + Auto Table Generation

#### US-3.1: Test Connection + Auto Table Check/Generate
**As a** user,
**I want to** melakukan test connection ke Supabase dan otomatis mengecek/membuat tabel,
**So that** saya tidak perlu manual generate tabel terpisah.

**Flow Diagram:**
```
User klik "Test Connection" / "Connect"
        │
        ▼
  ┌──────────────┐
  │ Try Connect  │──── GAGAL ───▶ Show error "Connection failed"
  │ to Supabase  │               status = 'error'
  └──────┬───────┘
         │ BERHASIL
         ▼
  ┌──────────────┐
  │ Check table  │──── ADA ────▶ status = 'active'
  │ cronjob_     │               is_table_generated = true
  │ keepalive    │               Show "Connected + Table ready"
  └──────┬───────┘
         │ TIDAK ADA
         ▼
  ┌──────────────┐
  │ Auto CREATE  │──── BERHASIL ──▶ is_table_generated = true
  │ TABLE        │                   status = 'active'
  └──────┬───────┘                   Show "Connected + Table created"
         │ GAGAL
         ▼
  Show "Connected but table creation failed"
  status = 'active', is_table_generated = false
```

**Acceptance Criteria:**
- **Given** user sudah menyimpan konfigurasi Supabase
- **When** user klik "Test Connection" (POST `/api/v1/configs/:id/test-connection`)
- **Then** backend melakukan 3 langkah secara sequential:
  1. **Try connect** — create Supabase client dengan decrypted keys, test query
  2. **Check table** — cek apakah tabel `cronjob_keepalive` sudah ada
  3. **Auto generate** — jika belum ada, CREATE TABLE otomatis
- **And** hasil ditampilkan:
  - Connection OK + Table exists → "Connected & Ready" (green)
  - Connection OK + Table created → "Connected & Table Generated" (green)
  - Connection OK + Table failed → "Connected, table creation failed" (yellow)
  - Connection failed → "Connection Failed: [error message]" (red)
- **And** `status` dan `is_table_generated` diupdate di database
- **And** activity log dicatat

#### US-3.2: Manual Generate Table (Fallback)
**As a** user,
**I want to** manual generate tabel jika auto-generate gagal,
**So that** saya bisa retry pembuatan tabel.

**Acceptance Criteria:**
- **Given** test connection berhasil tapi table generation gagal
- **When** user klik "Generate Table" button
- **Then** POST `/api/v1/cronjob/:configId/generate-table`
- **And** backend membuat tabel via Supabase client
- **And** jika berhasil → `is_table_generated = true`
- **And** activity log dicatat

#### US-3.3: Load Data Tabel
**As a** user,
**I want to** melihat data di tabel `cronjob_keepalive`,
**So that** saya bisa monitor keep-alive history.

**Acceptance Criteria:**
- **Given** user memilih config dan tabel sudah di-generate
- **When** load data via GET `/api/v1/cronjob/:configId/data`
- **Then** data ditampilkan dalam tabel: ID, Ping Message, Created By, Created At
- **And** sorted by `created_at` DESC
- **And** jika tabel belum ada → tombol "Test Connection" (will auto-generate)

---

### Epic 4: Manual CRUD Operations (Keep-Alive)

#### US-4.1: Insert Keep-Alive Ping (Manual)
**As a** user,
**I want to** mengirim ping keep-alive ke Supabase,
**So that** database tidak di-pause.

**Acceptance Criteria:**
- **Given** tabel sudah di-generate
- **When** user klik "Add Keep-Alive Ping" dan submit form
- **Then** POST `/api/v1/cronjob/:configId/ping`
- **And** backend memvalidasi **Rate Limiting** (Max 1 ping per 10 menit per config). Jika melanggar → 429 Too Many Requests (Anti-DDoS).
- **And** row di-insert ke `cronjob_keepalive` pada target Supabase
- **And** `last_interaction` dan `status` diupdate di config
- **And** activity log dicatat
- **And** toast "Keep-alive ping sent!" (Jika gagal, toast error menampilkan tombol **"Retry"**).
- **And** data tabel di-refresh

#### US-4.4: Auto-Ping via Vercel Cron (Automation)
**As a** user,
**I want to** sistem otomatis melakukan ping ke database saya tanpa saya harus login,
**So that** Supabase saya benar-benar dijaga secara otomatis (Set and Forget).

**Acceptance Criteria:**
- **Given** Vercel Cron di-setup pada project (via `vercel.json`).
- **Then** sistem memanggil endpoint `GET /api/v1/cronjob/auto-ping` secara otomatis setiap hari (misal jam 00:00).
- **And** endpoint ini mencari semua config dari semua user yang statusnya mendekati expired (`last_interaction` > 5 hari).
- **And** mengirimkan ping otomatis, lalu mencatat sukses/gagal di `ActivityLog`.

#### US-4.2: Delete Data Keep-Alive
**As a** user,
**I want to** menghapus row keep-alive,
**So that** tabel tetap bersih.

**Acceptance Criteria:**
- **Given** user melihat data tabel
- **When** user klik "Delete" pada row
- **Then** DELETE `/api/v1/cronjob/:configId/data/:rowId`
- **And** row dihapus dari target Supabase
- **And** activity log dicatat

#### US-4.3: Bulk Delete & Ping All
**As a** user,
**I want to** bulk delete data lama dan ping semua akun sekaligus,
**So that** management lebih efisien.

**Acceptance Criteria:**
- Bulk Delete: Select multiple rows → POST `/cronjob/:configId/data/bulk-delete`
- Ping All: POST `/api/v1/cronjob/ping-all` → ping semua configs yang `is_table_generated = true`

#### US-4.4: 7-Day Inactivity Warning & Table Row Countdown (Supabase Free Tier Rule)
**As a** user,
**I want to** melihat indikator limit 7 hari langsung pada data tabel (Remote Table Rows) dan kolom tersisa per row,
**So that** saya dapat memantau sisa masa proteksi secara real-time dan melihat limit otomatis menyesuaikan setiap kali ada ping baru.

**Acceptance Criteria:**
- **Given** user melihat halaman Cronjob (Remote Table Rows)
- **When** data tabel (`cronjob_keepalive`) di-load atau ditambahkan ping baru:
  - Backend/Frontend menghitung sisa waktu proteksi 7 hari berdasarkan timestamp ping terbaru (`tableData[0].createdAt` atau `lastInteraction`).
  - Tambahkan kolom khusus pada data tabel: **"Protection Limit / Sisa Waktu"** yang menampilkan status hitung mundur sisa hari (contoh: `7 days left (Active)`, `1 day left (Warning)`, `Expired`).
- **Then** jika ping terbaru berada pada hari ke-6 (tersisa 1 hari lagi), tampilkan warning badge merah & toast notification yang mencolok.
- **And** saat user menambahkan test ping baru (Insert Ping), data tabel di-refresh dan limit sisa waktu otomatis ter-reset kembali ke **7 hari** secara real-time.
- **And** berikan toast konfirmasi setelah ping (cronjob) sukses: `"Cronjob Confirmed: Ping successful! Your 7-day limit has been reset."`

---

### Epic 5: Dashboard & Monitoring

#### US-5.1: Dashboard Overview (Data Isolation)
**As a** user,
**I want to** melihat ringkasan status HANYA dari akun-akun Supabase milik saya sendiri,
**So that** saya tahu mana akun saya yang perlu di-ping tanpa terganggu data pengguna lain.

**Acceptance Criteria:**
- **Given** user membuka `/dashboard`
- **And** jika user belum memiliki konfigurasi (Config = 0) → Tampilkan **Empty State** (Ilustrasi UI menarik dengan tombol besar CTA "Welcome! Let's add your first Supabase Config").
- **Then** jika data ada, ditampilkan data yang **difilter secara ketat berdasarkan user yang sedang login**:
  - Overview cards: Total Accounts, Active, Warning (>5 days), Danger (>6 days)
  - Account cards sorted by urgency
  - Each card: DB Name, Status, Days since last ping, "Ping Now" button
- **And** "Ping All" button di header

#### US-5.2: Connection Health Check (with Auto Table Check)
**As a** user,
**I want to** test koneksi ke Supabase dan otomatis cek tabel,
**So that** saya tahu status lengkap (connection + table) dari dashboard.

**Acceptance Criteria:**
- **Given** user klik "Test Connection" pada dashboard card
- **Then** POST `/api/v1/configs/:id/test-connection`
- **And** backend runs: connect → check table → auto-generate if missing
- **And** result badge shows:
  - Connected + Table Ready → Green badge
  - Connected + Table Generated → Green badge + "New!" indicator
  - Connected + No Table → Yellow badge
  - Connection Failed → Red badge + error message
- **And** config status auto-updated

---

### Epic 6: Activity Logs

#### US-6.1: View Activity Logs
**As a** user,
**I want to** melihat riwayat semua operasi,
**So that** saya bisa track aktivitas keep-alive.

**Acceptance Criteria:**
- **Given** user membuka `/logs`
- **Then** GET `/api/v1/logs` (paginated)
- **And** ditampilkan: Timestamp, Account Name, Action, Status badge, Message
- **And** bisa filter by: Account, Action type, Status, Date range

---

### Epic 7: PWA & Cross-Platform

#### US-7.1: PWA Installation
Sama dengan v1.0 — installable, standalone mode, proper icons.

#### US-7.2: Offline Capability
- App shell cached via service worker
- Login state persisted in Zustand (rehydrate)
- CRUD operations disabled when offline → show "No internet connection"

---

## 10. UI/UX Design Specifications

### 10.1 Design System

| Token | Value | Notes |
|-------|-------|-------|
| **Primary** | `#6366F1` (Indigo 500) | Brand, buttons, active states |
| **Secondary** | `#8B5CF6` (Violet 500) | Accents, gradients |
| **Success** | `#22C55E` (Green 500) | Active status, success toast |
| **Warning** | `#F59E0B` (Amber 500) | Warning (>5 days) |
| **Danger** | `#EF4444` (Red 500) | Error, danger (>6 days) |
| **BG Dark** | `#0F172A` (Slate 900) | Dark mode background |
| **BG Light** | `#F8FAFC` (Slate 50) | Light mode background |
| **Surface Dark** | `#1E293B` (Slate 800) | Card dark |
| **Surface Light** | `#FFFFFF` | Card light |
| **Font Primary** | Inter (Google Fonts) | Body text |
| **Font Heading** | Outfit (Google Fonts) | Headings & titles |
| **Border Radius** | `12px` cards, `8px` inputs, `6px` buttons | Modern rounded |

### 10.2 Page Map

```
PUBLIC PAGES (No Auth):
├── / ........................ Landing Page
├── /login .................. Login Page
└── /register ............... Register Page

PROTECTED PAGES (Auth Required — Admin Panel):
├── /dashboard .............. Dashboard Overview
├── /config ................. Config Manager (CRUD)
├── /cronjob ................ CronJob Manager (Table Gen + CRUD)
└── /logs ................... Activity Logs
```

### 10.3 Layout Structure

```
LANDING PAGE LAYOUT:
┌────────────────────────────────┐
│  Navbar (Logo + Login/Register)│
├────────────────────────────────┤
│  Hero Section                  │
│  (Title + CTA)                 │
├────────────────────────────────┤
│  Features Section              │
├────────────────────────────────┤
│  How It Works Section          │
├────────────────────────────────┤
│  Open Source Section           │
├────────────────────────────────┤
│  Footer                       │
└────────────────────────────────┘

AUTH PAGES LAYOUT:
┌────────────────────────────────┐
│  Centered Card                 │
│  ┌──────────────────────────┐  │
│  │  Logo                    │  │
│  │  Form Fields             │  │
│  │  Submit Button            │  │
│  │  Link to Register/Login   │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘

ADMIN PANEL LAYOUT (Desktop):
┌──────┬─────────────────────────┐
│      │  Top Bar (User + Logout)│
│  S   ├─────────────────────────┤
│  i   │                         │
│  d   │  Page Content           │
│  e   │                         │
│  b   │                         │
│  a   │                         │
│  r   │                         │
└──────┴─────────────────────────┘

ADMIN PANEL LAYOUT (Mobile):
┌─────────────────────────────────┐
│  Top Bar (Menu + User)          │
├─────────────────────────────────┤
│                                 │
│  Page Content                   │
│                                 │
│                                 │
├─────────────────────────────────┤
│  Bottom Navigation              │
│  ┌─────┬─────┬─────┬─────┐     │
│  │Dash │Conf │Cron │Logs │     │
│  └─────┴─────┴─────┴─────┘     │
└─────────────────────────────────┘
```

### 10.4 Responsive Breakpoints

| Breakpoint | Device | Layout |
|------------|--------|--------|
| `< 640px` | Mobile | Bottom nav, single column, full-width cards |
| `640-1024px` | Tablet | Bottom nav, 2-column grid |
| `> 1024px` | Desktop | Sidebar nav, 3-column grid, wider tables |

### 10.5 Animation Specifications

| Element | Animation | Duration | Library |
|---------|-----------|----------|---------|
| Landing page scroll | Fade up on scroll | 600ms | Framer Motion |
| Page transitions | Fade + slide | 200ms | Framer Motion |
| Card hover | Scale 1.02 + shadow lift | 150ms | CSS/Framer Motion |
| Modal/Sheet | Fade + scale from center | 250ms | Framer Motion |
| Toast | Slide from top-right | 300ms | Framer Motion |
| Status pulse | Opacity 0.5-1 loop | 2000ms | CSS @keyframes |
| Login form | Shake on error | 300ms | Framer Motion |
| Ping success | Checkmark draw SVG | 500ms | AnimeJS |
| Sidebar collapse | Width transition | 200ms | CSS transition |
| Skeleton loading | Shimmer gradient | infinite | CSS @keyframes |

---

## 11. Non-Functional Requirements

### 11.1 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| **LCP** | < 2.5s | Lighthouse |
| **FID** | < 100ms | Lighthouse |
| **CLS** | < 0.1 | Lighthouse |
| **Bundle Size (JS)** | < 200KB gzipped | Build output |
| **Lighthouse Score** | >= 90 all categories | Lighthouse audit |
| **API Response (p95)** | < 200ms | Backend monitoring |
| **Time to Interactive** | < 3s | Lighthouse |

### 11.2 Reliability

| Requirement | Detail |
|-------------|--------|
| **Offline Mode** | App shell + cached auth state, CRUD disabled |
| **Error Recovery** | Retry mechanism on API calls, structured error feedback |
| **Graceful Degradation** | Supabase unreachable → error state without crash |
| **Session Persistence** | Refresh token rotation, seamless re-auth |

### 11.3 Compatibility

| Platform | Browser | Version |
|----------|---------|---------|
| Desktop | Chrome, Edge, Firefox, Safari | 90+ / 85+ / 15+ |
| Mobile | Chrome Android, Safari iOS, Samsung Internet | 90+ / 15+ |

### 11.4 Accessibility

| Requirement | Standard |
|-------------|----------|
| Color Contrast | WCAG AA (4.5:1 min) |
| Keyboard Nav | Full keyboard accessibility |
| Screen Reader | ARIA labels on all interactive elements |
| Touch Targets | Min 44x44px |
| Focus Indicators | Visible focus rings |

---

## 12. Security Considerations

### 12.1 Authentication Security

| Aspect | Implementation |
|--------|----------------|
| Password Storage | Argon2id hashing (via Better Auth) |
| JWT Access Token | 15 min expiry, stored in memory only |
| Refresh Token | 7 day expiry, HttpOnly + Secure + SameSite cookie |
| Token Rotation | New refresh token on each refresh |
| Brute Force Protection | Rate limiting on auth endpoints (5 attempts/min) |
| CSRF Protection | SameSite cookies + CSRF token |

### 12.2 API Key Protection

| Risk | Mitigation |
|------|------------|
| API keys stored in DB | **Encrypted at rest** using AES-256-GCM with server-side secret |
| Keys exposed in API response | Keys **never** returned in GET responses (only masked: `eyJ...XXX`) |
| Keys in transit | HTTPS only (TLS 1.3) |
| Server compromise | Encryption key from environment variable, not in codebase |

### 12.3 API Security

| Measure | Implementation |
|---------|----------------|
| CORS | Whitelist frontend origin only |
| Rate Limiting | 100 req/min per user, 5 req/min for auth endpoints |
| Input Validation | Zod schemas on all endpoints |
| SQL Injection | Prisma ORM (parameterized queries) |
| XSS | CSP headers, sanitize all inputs |
| IDOR Prevention | Every query scoped by `user_id` |

### 12.4 Input Validation

| Input | Validation |
|-------|------------|
| Supabase URL | `^https:\/\/[a-z0-9]+\.supabase\.co$` |
| Anon Key | JWT format (3 base64url segments) |
| Service Role Key | JWT format |
| Email | Standard email regex |
| Password | Min 8 chars, 1 uppercase, 1 number |
| Ping Message | Max 500 chars, sanitized |

---

## 13. QA Strategy & Test Plan

### 13.1 Testing Pyramid

```
           ┌──────────┐
           │   E2E    │  <- 8 critical flows (Playwright)
           │  Tests   │
          ┌┴──────────┴┐
          │ Integration │  <- API endpoints, DB queries, Supabase client
          │   Tests     │
         ┌┴────────────┴┐
         │   Unit Tests  │  <- Utils, validation, services, encryption
         │               │
         └───────────────┘
```

### 13.2 Test Cases by Feature

#### Auth Tests
| TC-ID | Test Case | Type | Priority |
|-------|-----------|------|----------|
| TC-A01 | Register with valid data → user created, auto-login | Integration | Critical |
| TC-A02 | Register with existing email → "Email already exists" | Integration | Critical |
| TC-A03 | Register with weak password → validation error | Unit | High |
| TC-A04 | Login with valid credentials → JWT returned | Integration | Critical |
| TC-A05 | Login with wrong password → "Invalid credentials" | Integration | Critical |
| TC-A06 | Access /dashboard without token → redirect to /login | E2E | Critical |
| TC-A07 | Token refresh → new access token | Integration | High |
| TC-A08 | Logout → session invalidated | Integration | High |

#### Config Management Tests
| TC-ID | Test Case | Type | Priority |
|-------|-----------|------|----------|
| TC-C01 | Add valid config → saved with encrypted keys | Integration | Critical |
| TC-C02 | Add config with invalid URL → validation error | Unit | High |
| TC-C03 | Edit config → updated, re-encrypted | Integration | High |
| TC-C04 | Delete config → removed, logs preserved | Integration | High |
| TC-C05 | User A cannot see User B's configs → 404 | Integration | Critical |
| TC-C06 | Add 15+ configs → all displayed, performant | Integration | Medium |
| TC-C07 | API keys not returned in GET list → masked | Integration | High |

#### CronJob Tests
| TC-ID | Test Case | Type | Priority |
|-------|-----------|------|----------|
| TC-R01 | Generate table → table created on remote Supabase | Integration | Critical |
| TC-R02 | Insert ping → row created, last_interaction updated | Integration | Critical |
| TC-R03 | Delete row → removed from remote | Integration | High |
| TC-R04 | Bulk delete → all selected rows removed | Integration | High |
| TC-R05 | Ping All → ping sent to all eligible configs | Integration | High |
| TC-R06 | Invalid Supabase credentials → error message, log recorded | Integration | High |
| TC-R07 | Load data from paused Supabase → meaningful error | Integration | Medium |

#### Security Tests
| TC-ID | Test Case | Type | Priority |
|-------|-----------|------|----------|
| TC-S01 | IDOR: User A tries to access User B config → 404 | Integration | Critical |
| TC-S02 | Expired JWT → 401 Unauthorized | Integration | Critical |
| TC-S03 | SQL injection in search → parameterized, no leak | Integration | Critical |
| TC-S04 | Rate limiting on login → blocked after 5 attempts | Integration | High |
| TC-S05 | XSS in ping message → sanitized | Integration | High |
| TC-S06 | Encrypted keys → cannot read from DB dump | Unit | Critical |

#### PWA Tests
| TC-ID | Test Case | Type | Priority |
|-------|-----------|------|----------|
| TC-P01 | App installable on Chrome | E2E | Critical |
| TC-P02 | Offline → app shell loads, CRUD disabled | E2E | High |
| TC-P03 | Manifest valid → correct name, icons, theme | Unit | Medium |

### 13.3 Quality Gates

| Gate | Threshold |
|------|-----------|
| Unit Test Coverage | >= 80% |
| TypeScript Strict | 0 errors |
| ESLint | 0 errors |
| Lighthouse PWA | >= 90 |
| Lighthouse Performance | >= 90 |
| Lighthouse Accessibility | >= 90 |
| Bundle Size (JS) | < 200KB gzipped |
| API Response p95 | < 200ms |
| 0 Critical/High security findings | Before release |
| 0 Critical bugs | Before release |

---

## 14. Roadmap & Timeline

### Phase 1: Foundation (Sprint 1 — Week 1-2)

| Task | Estimate | Deps |
|------|----------|------|
| Monorepo setup (Next.js + Express.js + shared) | 1 day | None |
| Prisma schema + initial migration | 0.5 day | Setup |
| Better Auth setup (backend + frontend) | 1 day | Prisma |
| Auth API endpoints (register, login, logout, refresh, me) | 1 day | Auth setup |
| Auth frontend (login + register pages) | 1 day | Auth API |
| Design system (Tailwind + Shadcn setup) | 0.5 day | Setup |
| Admin layout (sidebar + bottom nav + auth guard) | 1 day | Auth + Design |
| Dark/Light mode | 0.5 day | Design |
| PWA manifest + service worker | 0.5 day | Setup |
| Landing page | 1 day | Design |

**Sprint Goal:** Auth working (register/login/logout), admin layout with protected routes, landing page, PWA installable.

### Phase 2: Core Features (Sprint 2 — Week 3-4)

| Task | Estimate | Deps |
|------|----------|------|
| Config API (CRUD endpoints + encryption) | 1.5 days | Auth |
| Config frontend (form + list + validation) | 1.5 days | Config API |
| Supabase Client Factory service | 0.5 day | Config |
| Table Generation API + frontend | 0.5 day | Supabase factory |
| CronJob API (ping, load data, delete) | 1 day | Supabase factory |
| CronJob frontend (table view + CRUD form) | 1 day | CronJob API |
| Connection Health Check | 0.5 day | Supabase factory |
| Ping All feature | 0.5 day | CronJob API |
| Activity Log API + frontend | 1 day | All above |

**Sprint Goal:** Full config CRUD, table generation, manual ping working, activity logs.

### Phase 3: Dashboard, Polish & Testing (Sprint 3 — Week 5-6)

| Task | Estimate | Deps |
|------|----------|------|
| Dashboard page (overview cards + status) | 1 day | Core features |
| Animations & micro-interactions | 1 day | All pages |
| Error boundaries + loading states | 0.5 day | All pages |
| Offline mode handling | 0.5 day | Service worker |
| Global error handler (backend) | 0.5 day | Backend |
| Rate limiting middleware | 0.5 day | Backend |
| Testing (unit + integration + E2E) | 2 days | All features |
| Bug fixes & polish | 1 day | Testing |
| README.md + contributing guide | 0.5 day | All |
| .env.example + setup docs | 0.5 day | All |

**Sprint Goal:** Production-ready, tested, documented open-source release.

### Milestone Summary

```
Week 1-2  ======== Foundation (Auth + Layout + Landing + PWA)
Week 3-4  ======== Core Features (Config + CronJob + Supabase Integration)
Week 5-6  ======== Dashboard + Polish + Testing + Docs
                   |
              v1.0 Open Source Launch
```

---

## 15. Risks & Mitigation

| # | Risk | Prob. | Impact | Mitigation |
|---|------|-------|--------|------------|
| 1 | **Supabase rate limiting** | Medium | High | Rate limit ping operations client-side, backend-side |
| 2 | **API keys compromised** (server breach) | Low | Critical | AES-256-GCM encryption, env-based master key, audit logs |
| 3 | **Better Auth breaking changes** | Low | Medium | Pin version, test on upgrade |
| 4 | **Supabase SDK changes** | Low | Medium | Pin SDK version, monitor changelog |
| 5 | **PWA limitations on iOS** | High | Medium | Document limitations, encourage Chrome usage |
| 6 | **RLS blocking operations** | Medium | High | Use `service_role_key` (bypasses RLS), document this |
| 7 | **Supabase already paused** | Medium | Medium | Clear error + link to unpause in Supabase Dashboard |
| 8 | **Self-hosting complexity** | Medium | Medium | Docker Compose setup (v1.1), detailed setup docs |
| 9 | **IDOR vulnerability** | Low | Critical | User isolation in every service method, integration tests |
| 10 | **Open source abuse** (spam accounts) | Medium | Medium | Rate limiting, optional CAPTCHA (v1.1) |

---

## 16. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Accounts per user** | Unlimited (validated max 2 DB per email) | Feature testing |
| **Ping success rate** | 99%+ (online) | Activity logs |
| **Zero auto-pause** | 0 paused accounts for active users | User reporting |
| **Auth security** | 0 unauthorized access | Security tests |
| **API response** | p95 < 500ms (serverless cold start factored) | Vercel metrics |
| **Lighthouse PWA** | >= 90 | Lighthouse audit |
| **LCP** | < 2.5s | Lighthouse |
| **GitHub stars** | 50+ within 3 months | GitHub Analytics |
| **Contributors** | 3+ within 6 months | GitHub |
| **User satisfaction** | Ping in < 3 clicks from dashboard | UX testing |
| **Vercel deployment** | Both apps deploy successfully on free tier | Deployment test |

---

## 17. Resolved Decisions (Previously Open Questions)

> All questions have been resolved. Implementation can proceed.

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | **Supabase table generation method?** | **Supabase JS Client** (`@supabase/supabase-js`) — try connection → check table → auto-generate | Data disimpan di Supabase. Alur: connect → check → auto-create jika belum ada |
| 2 | **API key encryption algorithm?** | **AES-256-GCM** | Industry standard, authenticated encryption, built-in Node.js crypto |
| 3 | **Deploy backend di mana?** | **Vercel** (Express wrapped as Serverless Function) | Semua di Vercel free tier, monorepo native support |
| 4 | **Batas max configs per user?** | **Unlimited** (tapi max 2 database per 1 email Supabase) | User bisa punya banyak email. 1 email Supabase = max 2 DB projects |
| 5 | **Perlu CAPTCHA di register?** | **No** (rate limiting only for MVP) | Rate limit 5 req/min pada auth endpoints cukup untuk MVP |
| 6 | **Monorepo tool?** | **Turborepo** | Native Vercel support, caching, parallel tasks. User sudah pernah pakai |
| 7 | **Config export/import feature?** | **v1.1** (not MVP) | Focus on core features first |

### Business Rule: 1 Email = Max 2 Databases

```typescript
// Backend validation di config.service.ts
async createConfig(userId: string, data: CreateConfigInput): Promise<Result<SupabaseConfig>> {
  // Guard: Check max 2 DB per email
  const existingCount = await prisma.supabaseConfig.count({
    where: {
      userId,
      accountEmail: data.accountEmail,
    },
  });

  if (existingCount >= 2) {
    return Result.fail(
      'Maximum 2 databases per Supabase email account. ' +
      'Supabase Free Tier only allows 2 projects per email.',
      'MAX_DB_PER_EMAIL'
    );
  }

  // ... proceed to create
}
```

---

## Environment Variables Template (`.env.example`)

### Backend (`apps/api/.env`)

```env
# ===========================================
# APP DATABASE (Supabase PostgreSQL — your own instance)
# ===========================================
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

# ===========================================
# AUTHENTICATION (Better Auth)
# ===========================================
BETTER_AUTH_SECRET=your-auth-secret-min-32-chars
BETTER_AUTH_URL=http://localhost:3001

# ===========================================
# JWT
# ===========================================
JWT_ACCESS_SECRET=your-jwt-access-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ===========================================
# ENCRYPTION (for Supabase API keys — AES-256-GCM)
# ===========================================
ENCRYPTION_KEY=your-32-byte-hex-encryption-key

# ===========================================
# SERVER
# ===========================================
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### Frontend (`apps/web/.env.local`)

```env
# ===========================================
# FRONTEND
# ===========================================
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=CronJob Keep-Alive Manager
```

---

## Appendix

### A. Supabase Client Factory Pattern (Backend)

```typescript
// backend/src/services/supabase-client.service.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { decrypt } from '../utils/encryption';

export function createSupabaseClientFromConfig(config: {
  supabaseUrl: string;
  supabaseServiceRoleKey: string; // encrypted
}): SupabaseClient {
  const decryptedKey = decrypt(config.supabaseServiceRoleKey);

  return createClient(config.supabaseUrl, decryptedKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
```

### B. Result Pattern (Backend)

```typescript
// backend/src/utils/result.ts
export class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly data?: T,
    public readonly error?: string,
    public readonly code?: string,
  ) {}

  static ok<T>(data: T): Result<T> {
    return new Result(true, data);
  }

  static fail<T>(error: string, code?: string): Result<T> {
    return new Result(false, undefined, error, code);
  }
}
```

### C. Guard Clause Example (Controller)

```typescript
// backend/src/controllers/config.controller.ts
async createConfig(req: AuthRequest, res: Response) {
  // Guard: User must be authenticated
  if (!req.user?.id) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  // Guard: Validate request body
  const validation = createConfigSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: validation.error.issues },
    });
  }

  // Business logic via service (Result Pattern)
  const result = await configService.createConfig(req.user.id, validation.data);

  if (!result.isSuccess) {
    return res.status(400).json({ success: false, error: { message: result.error } });
  }

  return res.status(201).json({ success: true, data: result.data, message: 'Config created' });
}
```

### D. Connection Test + Auto Table Check Service

```typescript
// apps/api/src/services/cronjob.service.ts
async testConnectionAndCheckTable(config: SupabaseConfig): Promise<Result<ConnectionTestResult>> {
  // Step 1: Try to connect
  const client = createSupabaseClientFromConfig(config);
  
  try {
    // Simple query to test connection
    const { error: connError } = await client
      .from('cronjob_keepalive')
      .select('id')
      .limit(1);

    // If table doesn't exist, the error code will indicate that
    if (connError && connError.code === '42P01') {
      // Table does not exist — auto-generate
      const { error: createError } = await client.rpc('exec_sql', {
        query: `CREATE TABLE IF NOT EXISTS cronjob_keepalive (
          id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          ping_message TEXT NOT NULL,
          created_by TEXT DEFAULT 'cronjob-manager',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );`
      });

      if (createError) {
        // Connected but table creation failed
        return Result.ok({
          connected: true,
          tableExists: false,
          tableCreated: false,
          error: createError.message,
        });
      }

      return Result.ok({
        connected: true,
        tableExists: true,
        tableCreated: true, // newly created
      });
    }

    if (connError) {
      return Result.fail(`Connection failed: ${connError.message}`);
    }

    // Connection OK + Table already exists
    return Result.ok({
      connected: true,
      tableExists: true,
      tableCreated: false, // already existed
    });

  } catch (err) {
    return Result.fail(`Connection failed: ${err.message}`);
  }
}
```

---

### Clarification on Supabase Config Business Rules & Validation
Terdapat miskonsepsi mengenai batasan "Maksimal 2 Config". Aturan yang benar adalah:
- **Bukan per user sistem**: Seorang user di sistem (admin) dapat memiliki konfigurasi Supabase tanpa batas *secara keseluruhan*.
- **Tetapi per Akun/Email Supabase**: Batasan maksimal 2 konfigurasi diberlakukan HANYA untuk satu entitas `accountEmail` (Email akun Supabase) yang sama.
- Validasi ini harus diterapkan pada API (saat `POST /api/configs`) dengan melakukan pengecekan `COUNT()` berdasarkan `userId` DAN `accountEmail`, bukan hanya `userId`. Hal ini memastikan bahwa satu akun email Supabase (yang biasanya dibatasi 2 project di Free Tier) tidak dapat di-input lebih dari 2 kali.

---

### Architectural Note: Supabase IPv6 Direct Connection Deprecation
**Issue:** `ENOTFOUND` during `Generate Table` / Remote SQL Execution.
**Context:** Supabase deprecated IPv4 support for direct database connections (`db.[project-ref].supabase.co`). Koneksi langsung via node-postgres (pg) menggunakan port 5432 akan gagal pada lingkungan jaringan (seperti beberapa ISP lokal atau VM) yang tidak mendukung IPv6, karena DNS gagal melakukan resolve (ENOTFOUND).
**Namun,** aksi `Test Connection` / `Ping` tetap berhasil karena menggunakan REST API (`https://[ref].supabase.co`) yang di-routing melalui Cloudflare (mendukung IPv4).
**Solution Applied:** Entitas `SupabaseConfig` telah diperbarui dengan field tambahan `poolerUrl` (Connection Pooler URL). Pooler Supabase (mis. `aws-0-[region].pooler.supabase.com`) masih mendukung IPv4. Jika user mengalami `ENOTFOUND` saat menekan tombol "Generate Table", user diinstruksikan untuk memasukkan Connection Pooler URL di form konfigurasi. Sistem backend secara otomatis akan mendeteksi `poolerUrl` (jika ada) untuk mengubah jalur koneksi DDL dan eksekusi skrip migrasi, menjamin kompatibilitas penuh dengan jaringan IPv4.

---

*Document authored by PM Skill (v2.1 — Decisions Applied) — last updated 2026-08-10*
*Reviewed with QA, Frontend, and Backend skill guidelines*
*All open questions resolved. Ready for implementation.*
