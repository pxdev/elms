# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ELMS is a fullstack Learning Management System built with Nuxt 4, Nuxt UI, Prisma 7 (SQLite via better-sqlite3), and nuxt-auth-utils. It supports email/password and Google OAuth authentication, role-based access (ADMIN, TEACHER, STUDENT), course management with Lemon Squeezy payments, teacher availability scheduling, and a blog system. The UI is bilingual (English/Arabic) with full RTL support.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on `localhost:3009` |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint (stylistic rules: no trailing commas, 1tbs braces) |
| `npm run typecheck` | Run `vue-tsc` type checking |
| `npx prisma migrate dev` | Run database migrations |
| `npx prisma db seed` | Seed demo accounts and courses |
| `npx prisma generate` | Regenerate Prisma client (output: `prisma/generated/client`) |

## Architecture

### Directory Structure

- `app/` — Nuxt app (pages, components, composables, layouts, middleware)
- `server/` — Nitro server (API routes, utilities)
- `shared/` — Zod schemas and auth type augmentations shared between client and server
- `prisma/` — Schema, migrations, seed script, and generated client
- `i18n/locales/` — `en.json` and `ar.json` translation files

### Authentication & Authorization

Auth is handled by `nuxt-auth-utils` (`useUserSession`, `setUserSession`, `requireUserSession`).

- **Global middleware** (`app/middleware/authorize.global.ts`): Reads `to.meta.authorize` to enforce auth/roles. If `authorize` is `true`, any logged-in user passes. If it's an array of roles (e.g., `['ADMIN']`), only those roles pass. Guest-only pages set `meta.guest: true`.
- **Page-level auth**: Use `definePageMeta({ authorize: ['ADMIN'] })` or `definePageMeta({ guest: true })`. Pages under `/admin`, `/teacher`, and `/dashboard` typically use `layout: 'dashboard'`.
- **Server-side role checks**: API routes use `requireRole(event, ['ADMIN'])` from `server/utils/roles.ts` instead of (or in addition to) page meta.
- **Auth types**: `shared/auth.d.ts` augments `#auth-utils` with `User` and `UserSession` interfaces. Keep this in sync with fields stored in the session (see `server/api/auth/login.post.ts`).

### Database & Prisma

- Prisma uses the `prisma-client` generator with output to `prisma/generated/client`.
- The adapter is `@prisma/adapter-better-sqlite3`; the DB path comes from `DATABASE_URL` (defaults to `file:./dev.db`).
- **Server access**: Import `prisma` from `server/utils/prisma.ts`. It uses a global singleton in development.
- **Key models**: `User`, `Course`, `CourseLesson`, `CourseMaterial`, `Enrollment`, `Session` (scheduled sessions), `TeacherAvailability`, `PromoCode`, `BlogPost`, `BlogCategory`, `BlogTag`, `VerificationToken`.
- **Enum `Role`**: `ADMIN`, `TEACHER`, `STUDENT`.

### Validation Pattern

All Zod schemas live in `shared/schemas.ts` and are imported by both client and server.

- **Server**: Use `parseBody(event, schema)` from `server/utils/validation.ts`. It returns `400` with detailed Zod issues on failure.
- **Client**: Use `useZodForm(schema)` from `app/composables/useZodForm.ts`. It returns an array of `{ name, message }` errors formatted with i18n translation keys under `errors.validation.*`.

### i18n

- Configured in `nuxt.config.ts` with `@nuxtjs/i18n`.
- **Strategy**: `prefix_and_default` — English routes work without `/en/`, Arabic routes use `/ar/`.
- **Detection**: Browser language is detected on first visit and stored in a cookie (`i18n_redirected`).
- **RTL**: `app.vue` sets `dir="rtl"` on `<html>` when locale is `ar`.
- All UI text should use `t('key')` from `useI18n()`. Add keys to both `i18n/locales/en.json` and `ar.json`.

### UI & Theming

- Uses **Nuxt UI v4** (Tailwind CSS v4 under the hood).
- Custom primary color named `main` is defined in `app/assets/css/main.css` via `@theme static` and mapped in `app.config.ts` as `primary: 'main'`.
- **Layouts**: `default.vue` (marketing/public pages with header/footer) and `dashboard.vue` (sidebar navigation for authenticated users).
- **Icons**: Lucide icons via `i-lucide-*` prefix.

### API Patterns

- API routes follow Nitro conventions: `server/api/<path>.<method>.ts`.
- Admin routes are prefixed with `/api/admin/*`, teacher routes with `/api/teacher/*`, student routes with `/api/student/*`.
- File uploads go to `server/api/upload.post.ts`.
- Webhooks: `server/api/webhooks/lemonsqueezy.post.ts` handles payment events.

### Environment Variables

Copy `.env.example` to `.env`. Required variables:

- `DATABASE_URL` — SQLite file path
- `NUXT_SESSION_PASSWORD` — >= 32 chars for session encryption
- `NUXT_OAUTH_GOOGLE_CLIENT_ID` / `NUXT_OAUTH_GOOGLE_CLIENT_SECRET` — Google OAuth
- `APP_URL` — Used in outbound email links
- `SMTP_*` — Leave `SMTP_HOST` blank in dev to log emails to console

### CI

`.github/workflows/ci.yml` runs `pnpm install`, `pnpm run lint`, and `pnpm run typecheck` on Node 22.
