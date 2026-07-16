# Hired.

AI-powered tool that adapts a resume to a specific job posting and scores it against ATS filters. Built incrementally by release — this repo currently implements **Release 1**: auth, resume creation/upload, vacancy input, and a dashboard.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite (local dev)
- JWT sessions in httpOnly cookies, bcrypt password hashing
- AI integration (Anthropic Claude) is stubbed in `src/services/aiService.ts` — lands in Release 2+

## Getting started

```bash
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set `JWT_SECRET` and `DATABASE_URL` in `.env` (see `.env` for local defaults — replace `JWT_SECRET` before deploying anywhere real).
