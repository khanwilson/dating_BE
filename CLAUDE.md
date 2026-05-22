# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run start:dev      # Development with watch mode (recommended)
bun run build          # Compile to dist/
bun run start          # Run compiled dist/main (requires build first)
bun run start:prod     # node dist/main
bun run lint           # ESLint with zero warnings tolerance
bun run format         # Prettier
bun run test           # Jest unit tests
bun run test:e2e       # End-to-end tests
```

**Known build quirk:** `nest-cli.json` sets `deleteOutDir: true`, which deletes `dist/` before each build. With `incremental: true` in tsconfig, the `.tsbuildinfo` cache (stored at `dist/.tsbuildinfo`) gets deleted too — so the cache never goes stale. If a build silently produces no output, delete any stray `*.tsbuildinfo` files at the project root.

## Infrastructure

Start local services (PostgreSQL 15 + PostGIS, Redis 7, pgAdmin):

```bash
docker compose up -d
```

Copy `.env.example` to `.env` and adjust as needed. Default ports: app `4000`, PostgreSQL `5433`, Redis `6380`.

## Architecture

NestJS monorepo with source under `api/`. Prisma ORM targets PostgreSQL with PostGIS.

### Module layout

| Module | Status | Role |
|--------|--------|------|
| `auth` | Done | Phone-based login, JWT access + refresh tokens, Redis token revocation |
| `users` | Done | Profile read/update |
| `onboarding` | Skeleton | User setup flow |
| `media` | Skeleton | S3 photo uploads |
| `matching` | Skeleton | Match algorithm |
| `swipes` | Skeleton | Like/dislike interactions |
| `chat` | Skeleton | Real-time chat (Socket.io ready) |

### Auth flow

- `POST /api/auth/phone` — upsert user by phone → issue access token (15m) + refresh token (30d, stored in Redis)
- `POST /api/auth/refresh` — validate refresh token in Redis → issue new pair
- `POST /api/auth/logout` — delete refresh token from Redis
- All protected routes use `JwtAuthGuard` + `@CurrentUser()` decorator (extracts `userId`)

### Database models (prisma/schema.prisma)

- `User` — phone-based identity (`phoneCode` + `phoneNumber` unique)
- `UserProfile` — display name, birthDate, gender, zodiac, bio, onboarding flags
- `MatchPreferences` — lookingFor, ageMin/ageMax, maxDistanceKm, relationshipType (`ShortTerm | LongTerm | Friends`)
- `UserPhoto` — ordered photo URLs
- `UserInterest` — quiz responses (questionId + selectedOptions[])
- `UserLocation` — lat/lng coordinates
- `RefreshToken` — JWT refresh token storage (Redis is primary; this may be secondary)

### Shared utilities (`api/common/`)

- `@CurrentUser()` — parameter decorator, extracts `userId` from `req.user`
- `JwtAuthGuard` — standard guard wrapping `AuthGuard('jwt')`

### External services

- **Redis** — global module (`api/redis/redis.module.ts`), inject with `@Inject('REDIS_CLIENT')`
- **Email** — Resend (env: `RESEND_API_KEY`)
- **Storage** — AWS S3 (env: `AWS_*`)
- **Swagger** — auto-generated at `/api/docs`
