# creandom

Piattaforma di gestione documenti creativi con timestamp, NDA e firma digitale.

---

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript 5**
- **tRPC 11** + **TanStack Query 5**
- **NextAuth v4** (JWT, Credentials)
- **Prisma 7** + **PostgreSQL**
- **Tailwind CSS v4** + **shadcn/ui**
- **AWS S3** (document storage)

---

## Prerequisiti

- Node.js ≥ 20
- npm ≥ 10
- PostgreSQL 16 (locale o remoto) — oppure Docker

---

## Setup rapido

### 1. Clona e installa dipendenze

```bash
git clone <repo-url>
cd mvp-creandom
npm install
```

### 2. Configura le variabili d'ambiente

```bash
cp .env.example .env
```

Apri `.env` e compila tutti i valori:

```env
# PostgreSQL
DATABASE_URL="postgresql://postgres:<PASSWORD>@<HOST>:5432/creandom?schema=public"

# NextAuth — genera il secret con:
# openssl rand -base64 32
NEXTAUTH_SECRET="<secret>"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3
AWS_ACCESS_KEY_ID="<key-id>"
AWS_SECRET_ACCESS_KEY="<secret-key>"
AWS_REGION="eu-south-1"
AWS_S3_BUCKET="<bucket-name>"
```

### 3. Avvia il database (Docker)

Se non hai PostgreSQL installato localmente:

```bash
docker compose up db -d
```

Questo avvia PostgreSQL 16 su `localhost:5432` con le credenziali `postgres/postgres` e database `creandom`.

### 4. Migra il database

```bash
npx prisma migrate dev
```

In produzione (senza prompt interattivo):

```bash
npx prisma migrate deploy
```

### 5. Seed — clausole NDA di default

```bash
npx prisma db seed
```

> Il seed popola la tabella `NdaClause` con le clausole base necessarie al form di creazione NDA.  
> Assicurati che `prisma/seed.ts` esista prima di eseguire questo comando (vedi [issue #1](https://github.com/christiansadik/ip-platform/issues/1)).

### 6. Genera il client Prisma

```bash
npx prisma generate
```

### 7. Avvia il dev server

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

---

## Comandi utili

| Comando | Descrizione |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Build produzione |
| `npm run lint` | ESLint |
| `npx prisma migrate dev` | Crea e applica nuova migration |
| `npx prisma migrate deploy` | Applica migrations in produzione |
| `npx prisma generate` | Rigenera Prisma Client |
| `npx prisma db seed` | Popola dati iniziali (clausole NDA) |
| `npx prisma studio` | GUI database browser |
| `docker compose up db -d` | Avvia solo PostgreSQL in background |
| `docker compose up -d` | Avvia app + DB containerizzati |
| `docker compose down` | Ferma i container |
| `docker compose down -v` | Ferma i container e cancella i volumi |

---

## Deploy Docker (full stack)

```bash
docker compose up -d
```

Avvia PostgreSQL + app Next.js su `http://localhost:3000`.  
Le variabili `AWS_*` e `NEXTAUTH_SECRET` vengono lette dal `.env` locale.

---

## Struttura progetto

```
src/
  app/
    (auth)/          # login, signup, profile-select
    (dashboard)/     # home, document/upload, nda/new
    api/
      auth/          # NextAuth handler
      trpc/          # tRPC handler
  components/
    auth/            # Step signup
    dashboard/       # FeedCard, FilterMenu
    ui/              # shadcn/ui primitives
    BrandLogo.tsx
  lib/
    auth.ts          # NextAuth config
    prisma.ts        # Prisma client singleton
    trpc/
      client.tsx     # TRPCProvider
      context.ts     # Context, router, procedures
      router.ts      # Root appRouter
      routers/       # auth.ts, document.ts, nda.ts
  proxy.ts           # Route protection (Next.js 16)
prisma/
  schema.prisma
  migrations/
prisma.config.ts     # Prisma 7 datasource config
```

---

## Note

- **OTP:** in questa versione MVP il flusso OTP è simulato in memoria. Integrare un provider SMS (es. Twilio) prima del go-live.
- **S3:** l'upload documenti richiede bucket S3 configurato con le policy corrette (`s3:PutObject`, `s3:GetObject`).
- **SPID/CIE:** i bottoni di login sono presenti ma disabilitati — richiede integrazione con provider AgID.
