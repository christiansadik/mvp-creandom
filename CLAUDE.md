# CLAUDE.md — AI Assistant Guide for mvp-creandom

## Project Overview

**creandom** is a creative document management platform (MVP for investor/partner demos) with timestamping, NDA agreements, and digital signatures for creative individuals and companies. All user-facing strings and Italian domain terminology are in Italian.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, shadcn/ui, Radix UI, lucide-react |
| API | tRPC 11 + TanStack Query 5 |
| Database | PostgreSQL 16 + Prisma 7 (PrismaPg adapter) |
| Auth | NextAuth v4 (JWT, Credentials provider, bcrypt 12 rounds) |
| Validation | Zod 4 |
| Storage | AWS S3 |
| Deployment | Vercel (production: master, preview: develop) |
| Secrets | Doppler (synced to Vercel via CI) |

## Development Commands

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint check
npx tsc --noEmit   # Type-check without building

npx prisma generate          # Regenerate Prisma Client after schema changes
npx prisma migrate dev       # Create and apply new migration (development)
npx prisma migrate deploy    # Apply pending migrations (production/CI)
npx prisma studio            # Open Prisma GUI
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Unauthenticated routes
│   │   ├── login/           # Login page
│   │   ├── signup/          # Multi-step registration flow
│   │   └── profile-select/  # Profile type selection (creative/company)
│   ├── (dashboard)/         # Protected routes (require auth)
│   │   ├── home/            # Document feed
│   │   ├── document/upload/ # Document upload
│   │   └── nda/new/         # Create NDA agreement
│   └── api/
│       ├── auth/[...nextauth]/  # NextAuth handler
│       └── trpc/[trpc]/         # tRPC handler
├── components/
│   ├── auth/                # Signup step components (StepSignup, StepOTP, etc.)
│   ├── dashboard/           # Feed and filter components
│   └── ui/                  # shadcn/ui primitives (do not modify directly)
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── prisma.ts            # Prisma Client singleton
│   ├── utils.ts             # cn() helper
│   ├── common-passwords.ts  # NIST password denylist
│   └── trpc/
│       ├── context.ts       # tRPC context (session + Prisma)
│       ├── router.ts        # Root appRouter
│       ├── client.tsx       # TRPCProvider + QueryClient
│       └── routers/
│           ├── auth.ts      # signup/login procedures
│           ├── document.ts  # document CRUD
│           └── nda.ts       # NDA CRUD
├── types/
│   └── next-auth.d.ts       # Session/JWT augmentation (role, plan)
└── proxy.ts                 # Route protection middleware (withAuth)
```

## Environment Variables

Required in `.env` (local) / Doppler (CI/preview/production):

```
DATABASE_URL=postgresql://user:password@host:5432/creandom
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=http://localhost:3000
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_S3_BUCKET=...
BYPASS_OTP=true           # Set to skip OTP verification in development
```

## TypeScript & Code Style

- **Strict mode** is enabled. No `any`, no `@ts-ignore` without justification.
- **Path alias:** Always use `@/` for imports from `src/`. Never use relative paths like `../../../`.
- **Type inference:** Prefer inferring from Prisma models and Zod schemas over writing manual types.
- **Naming:**
  - Components/files: PascalCase (e.g., `FeedCard.tsx`)
  - Utilities/lib files: camelCase (e.g., `trpc/router.ts`)
  - Constants: UPPER_SNAKE_CASE
  - Database fields: camelCase (Italian domain terms preserved, e.g., `codiceFiscale`, `ragioneSociale`)

## Component Guidelines

- **shadcn/ui components** in `src/components/ui/` are generated and should not be manually modified. Add new components with the shadcn CLI: `npx shadcn add <component>`.
- **New components** go in `src/components/` under the appropriate subdirectory (`auth/`, `dashboard/`, or top-level for shared).
- **No CSS modules, no inline styles** (exception: BrandLogo gradient). Use Tailwind exclusively.
- **Dark-first design:** Default background is `bg-black`/`bg-zinc-*`, text is `text-white`. Primary CTA color is `green-500`.
- **No new external UI libraries** without explicit approval.

## tRPC Patterns

All backend logic lives in tRPC routers. Follow this pattern:

```typescript
// src/lib/trpc/routers/example.ts
import { router, protectedProcedure, publicProcedure } from "../router";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const exampleRouter = router({
  doSomething: protectedProcedure  // or publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // ctx.session - current user session
      // ctx.prisma - Prisma client
      if (!someCondition) {
        throw new TRPCError({ code: "NOT_FOUND", message: "..." });
      }
      return ctx.prisma.model.create({ ... });
    }),
});
```

- Always validate all inputs with Zod.
- Use `protectedProcedure` for routes requiring authentication.
- Throw `TRPCError` with appropriate codes (`UNAUTHORIZED`, `NOT_FOUND`, `BAD_REQUEST`, `INTERNAL_SERVER_ERROR`).
- Register new routers in `src/lib/trpc/router.ts`.

## Database / Prisma Guidelines

- **Schema file:** `prisma/schema.prisma`
- **Never edit migration SQL directly.** Use `npx prisma migrate dev --name <description>` to generate migrations from schema changes.
- **After schema changes:** Run `npx prisma generate` to update the Prisma Client types.
- **Cascade deletes** are configured on User relations — deleting a user removes all related data.
- **Key models:** User, ProfileCreative, ProfileCompany, Document, NdaAgreement, NdaClause, NdaAgreementClause.
- **Enums:** `UserRole` (CREATIVE | COMPANY), `PlanType`, `DocumentType`, `NdaStatus`.

## Authentication & Route Protection

- **Auth config:** `src/lib/auth.ts` (NextAuth `authOptions`)
- **Middleware:** `src/proxy.ts` — protects `/home/*`, `/document/*`, `/nda/*` via `withAuth`.
- **Session type augmentation:** `src/types/next-auth.d.ts` adds `role` and `plan` to session/JWT.
- **Password hashing:** bcrypt with 12 rounds via `bcryptjs`.
- **OTP:** In-memory store (MVP only, not production-ready). Can be bypassed with `BYPASS_OTP=true`.

## CI/CD & Deployment

**Branches:**
- `master` → Production (Vercel production, auto-versioned releases)
- `develop` → Preview (Vercel preview, DB migrations auto-run)

**GitHub Actions workflows:**
- **ci.yml** — Runs on all branches: `prisma generate`, type-check, lint, build.
- **deploy-preview.yml** — Triggered on `develop`: migrates DB, syncs Doppler secrets to Vercel, deploys preview.
- **release.yml** — Triggered on `master`: auto-increments semver, generates Italian changelog, creates GitHub release, deploys to production.

**Required GitHub secret:** `DOPPLER_TOKEN` (for syncing secrets to Vercel in CI).

## Testing

**There is no test framework.** Do not add Jest, Vitest, or any test files unless explicitly requested.

Type safety is enforced via:
1. TypeScript strict mode (`npx tsc --noEmit` in CI)
2. ESLint (`npm run lint` in CI)
3. Zod runtime validation on all tRPC inputs

## MVP Constraints (Do Not Implement Without Approval)

These features are intentionally deferred to V2:

- Rate limiting / HMAC authentication
- Full RBAC (role-based access control)
- GDPR compliance / data export
- SPID / CIE authentication
- Real SMS OTP (currently in-memory)
- Payment integration

## Key Constraints for AI Assistants

1. **No auto-commit or auto-push.** Always describe changes before applying.
2. **Do not modify `src/components/ui/`** (shadcn/ui generated files).
3. **Do not add dependencies** without explicit user approval.
4. **Do not add UI components** that were not requested.
5. **Do not refactor or restructure** existing code unless asked.
6. **Preserve Italian** in all user-facing strings and domain field names.
7. **No test files** unless explicitly requested.
8. **Use `@/` path alias** consistently — never relative imports across directories.
9. **Dark-first Tailwind styling** — no light mode defaults.
10. **Always run `npx prisma generate`** after any schema change.

## Docker / Local Stack

```bash
docker compose up --build   # Start local stack (app + PostgreSQL 16)
docker compose down          # Stop services
docker compose down -v       # Stop and delete database volume
```

The `docker-compose.yml` starts PostgreSQL on port 5432 and the Next.js app on port 3000.
