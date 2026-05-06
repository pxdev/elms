# ELMS — Education Learning Management System

A Nuxt 4 fullstack starter with Nuxt UI, Prisma (SQLite), and nuxt-auth-utils.

## Features

- **Authentication** — Email/password login, Google OAuth, email verification, password reset
- **Role-based access** — Admin, Teacher, Student roles
- **Course management** — Courses with multiple pricing variants
- **Enrollments** — Students can enroll in courses
- **Payments** — Lemon Squeezy checkout integration
- **Admin dashboard** — Manage courses, variants, and enrollments
- **i18n** — English and Arabic localization
- **Validation** — Shared Zod schemas for client and server

## Tech Stack

- [Nuxt 4](https://nuxt.com) + [Nitro](https://nitro.unjs.io)
- [Nuxt UI](https://ui.nuxt.com)
- [Prisma 7](https://prisma.io) + better-sqlite3
- [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils)
- [Zod](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)

## Setup

```bash
npm install
```

Generate the Prisma client:

```bash
npx prisma generate
```

## Development

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3009`.

## Database

Run migrations:

```bash
npx prisma migrate dev
```

Seed demo data (accounts + courses):

```bash
npx prisma db seed
```

## Demo Accounts

Run `npx prisma db seed` to create these accounts:

| Role    | Email                     | Password     |
|---------|---------------------------|--------------|
| Admin   | `admin@elms.local`        | `admin123`   |
| Teacher | `teacher1@elms.local`     | `teacher123` |
| Teacher | `teacher2@elms.local`     | `teacher123` |
| Student | `student1@elms.local`     | `student123` |
| Student | `student2@elms.local`     | `student123` |
| Student | `student3@elms.local`     | `student123` |

## Production

Build the application:

```bash
npm run build
```

Preview locally:

```bash
npm run preview
```

## License

[MIT](./LICENSE)
