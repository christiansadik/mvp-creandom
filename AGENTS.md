# AGENTS.md — mvp-creandom

Coding agent instructions for this repository.

---

## MVP Philosophy — MANDATORY

Questo è un MVP destinato a **demo per investitori e partner**, non a utenti reali in produzione.

**Principi obbligatori:**

- **Minimo overengineering.** Consegnare nel minor tempo possibile. Se una soluzione semplice funziona per la demo, usare quella.
- **Nessun utente reale.** L'MVP non verrà usato come beta pubblica. Non esistono dati utente da proteggere davvero.
- **Sicurezza come best practice architetturale**, non come requisito operativo. Implementare pattern corretti (es. non esporre `passwordHash`, usare HTTPS, JWT) per mostrare che il progetto sa come si fa — ma senza sistemi complessi di difesa (rate limiting distribuito, WAF, audit log, ecc.).
- **Posticipare a V2** tutto ciò che non è visibile nella demo: rate limiting distribuito (Upstash/Redis), HMAC token tra step signup, RBAC granulare, payment verification, GDPR compliance operativa.
- **Prima di implementare una feature di sicurezza o infrastruttura**, chiedersi: *"Questo è visibile o valutabile nella demo?"* Se no, non farlo.
- **Nessun debito tecnico nascosto.** Se si sceglie una soluzione semplificata, commentarla con `// MVP — migliorare in V2` per segnalare l'intento.

**Filtro decisionale per review esterne (es. Copilot, linting):**

| Categoria suggerimento | Azione |
|---|---|
| Bug funzionale visibile nella UI | Implementare subito |
| Problema di tipo / compilazione | Implementare subito |
| Sicurezza architetturale base (no password in chiaro, no leak di hash) | Implementare |
| Rate limiting distribuito, WAF, audit trail completo | Posticipare a V2 |
| Auth tra step signup (HMAC/JWT temporaneo) | Posticipare a V2 |
| Payment verification su piano | Posticipare a V2 |
| Ottimizzazioni bundle / devDeps | Solo se non rallenta lo sviluppo |

---

## Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Language:** TypeScript 5 (strict mode)
- **API:** tRPC 11 + TanStack Query 5
- **Auth:** NextAuth v4 (Credentials provider, JWT sessions)
- **ORM:** Prisma 7 + PostgreSQL (`pg` adapter)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Validation:** Zod v4
- **Icons:** lucide-react
- **Storage:** AWS S3

---

## Commands

```bash
# Development
npm run dev          # start dev server (Turbopack)

# Build
npm run build        # production build — run this to verify no errors

# Lint
npm run lint         # ESLint flat config

# Type check
npx tsc --noEmit    # run after every non-trivial change

# Database
npx prisma migrate dev      # create + apply migration (dev)
npx prisma migrate deploy   # apply migrations (production, no prompt)
npx prisma generate         # regenerate Prisma Client after schema changes
npx prisma db seed          # seed NdaClause default rows
npx prisma studio           # GUI database browser

# Docker (local DB)
docker compose up db -d     # start PostgreSQL only
docker compose up -d        # start full stack (app + DB)
docker compose down -v      # stop and wipe volumes
```

> No test framework. Do not add test scripts or files unless explicitly requested.

---

## Project Structure

```
src/
  app/
    (auth)/          # login, signup, profile-select routes
    (dashboard)/     # home, document/upload, nda/new routes
    api/
      auth/          # NextAuth handler
      trpc/          # tRPC handler
  components/
    auth/            # Multi-step signup components
    dashboard/       # FeedCard, FilterMenu
    ui/              # shadcn/ui primitives — do not edit lightly
    BrandLogo.tsx    # Gradient brand wordmark — reuse this, never inline the style
  lib/
    auth.ts          # NextAuth config (includes NEXTAUTH_SECRET guard)
    prisma.ts        # Prisma client singleton
    utils.ts         # cn() helper
    trpc/
      client.tsx     # TRPCProvider + QueryClient (staleTime: 60_000)
      context.ts     # Context, router, procedure exports
      router.ts      # Root appRouter
      routers/       # auth.ts, document.ts, nda.ts
  proxy.ts           # Route protection — Next.js 16 uses "proxy" not "middleware"
  types/
    next-auth.d.ts   # Session/JWT type augmentation
prisma/
  schema.prisma
  migrations/
prisma.config.ts     # Prisma 7 datasource (reads DATABASE_URL)
```

---

## TypeScript

- `strict: true` — no implicit `any`, no skipping null checks
- Use `import type { ... }` for type-only imports
- Use `@/` path alias for all internal imports — never relative paths (`../../`)
- `moduleResolution: bundler` — no CommonJS `require()`
- Augment NextAuth types in `src/types/next-auth.d.ts`, never inline
- Infer tRPC output types via `inferRouterOutputs<AppRouter>` from `@trpc/server` — do not duplicate type definitions manually

```ts
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/lib/trpc/router";

type DocItem = inferRouterOutputs<AppRouter>["document"]["list"][number];
```

---

## Code Style

### Components

```tsx
"use client"; // required at top for client components

import type { Foo } from "some-package";
import { bar } from "@/lib/utils";

interface Props {        // always interface, not type
  foo: string;
  bar?: number;
}

export function MyComponent({ foo, bar }: Props) { ... }  // named export
export default function Page() { ... }                     // default only for pages/layouts
```

- Class merging: always `cn()` from `@/lib/utils`
- shadcn variants: `cva` from `class-variance-authority`
- `asChild` pattern: `Slot.Root` from `radix-ui` (not `@radix-ui/react-slot`)
- Brand logo: use `<BrandLogo />` from `@/components/BrandLogo` — never inline the gradient style

### Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Components | PascalCase | `FeedCard`, `StepSignup` |
| Component files | PascalCase | `FeedCard.tsx` |
| Lib/util files | camelCase | `auth.ts`, `utils.ts` |
| Constants/maps | UPPER_SNAKE_CASE | `TYPE_LABELS`, `TYPE_COLORS` |
| DB/TS fields | camelCase | `ragioneSociale`, `codiceFiscale` |

> Domain model field names are in Italian — preserve this convention.
> All user-facing strings (labels, errors, placeholders) must be in Italian.

### Imports Order

1. React / Next.js internals
2. Third-party packages
3. Internal `@/` aliases (lib, components, types)
4. `import type` statements last

### State & Data Fetching

- Local UI state: `useState`
- Server data: tRPC hooks only — `trpc.x.y.useQuery(...)`, `trpc.x.y.useMutation(...)`
- Never import `prisma` directly in components or pages
- Mutation error handling: `onError: (e) => setError(e.message)`
- Loading: inline ternary render (no separate loading components)
- Never hardcode data that belongs in the DB — use a tRPC query instead

---

## tRPC Routers

- All routers in `src/lib/trpc/routers/`
- Input always validated with Zod
- Throw `TRPCError({ code, message })` — never plain `Error`
- `protectedProcedure` for authenticated endpoints; `publicProcedure` otherwise
- Access Prisma via `ctx.prisma` — never import the client directly in routers
- `protectedProcedure` narrows `ctx.session` to non-null — rely on it, no extra guards needed

```ts
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../context";

export const myRouter = router({
  getItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.prisma.item.findUnique({ where: { id: input.id } });
      if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Non trovato" });
      return item;
    }),
});
```

---

## Styling

- Dark-first: base palette `bg-black`, `text-white`, `zinc-*`
- Primary CTA: `bg-green-500` / `hover:bg-green-400`, text `text-black font-semibold`
- All classes via Tailwind — no CSS modules, no inline `style` props (exception: `BrandLogo` which owns its gradient)
- Standard input style: `bg-zinc-900 border-zinc-700`
- Standard card style: `rounded-2xl bg-zinc-900 border border-zinc-800`

---

## Prisma / Database

- Schema: `prisma/schema.prisma`
- Config: `prisma.config.ts` (Prisma 7 — `datasource.url` here, not in schema)
- Key models: `User`, `ProfileCreative`, `ProfileCompany`, `Document`, `NdaAgreement`, `NdaClause`, `NdaAgreementClause`
- Enums: `UserRole` (CREATIVE | COMPANY), `PlanType` (5 tiers), `DocumentType`, `NdaStatus` (DRAFT | SENT | ACCEPTED | REJECTED)
- IDs: CUID (`@default(cuid())`)
- Use cascade deletes (`onDelete: Cascade`) on all child relations
- After schema changes: `npx prisma migrate dev` → `npx prisma generate`

---

## Auth & Route Protection

- Provider: Credentials (email + password, bcrypt 12 rounds)
- Session strategy: JWT; shape augmented in `src/types/next-auth.d.ts`
- `NEXTAUTH_SECRET` must be set — the app throws at boot if missing
- `src/proxy.ts` protects `/home/**`, `/document/**`, `/nda/**` via `withAuth` — this is the Next.js 16 convention (not `middleware.ts`)
- Server-side: `getServerSession(authOptions)` from `next-auth`
- Client-side: `useSession()` from `next-auth/react`

---

## Key Constraints

- No auto-commit, no auto-push, no auto-test generation
- Do not modify `src/components/ui/` unless the task explicitly targets shadcn primitives
- Do not create new files if editing an existing one suffices
- Do not add npm dependencies without explicit user approval
- Run `npx tsc --noEmit` and `npm run build` after significant changes to confirm zero errors
