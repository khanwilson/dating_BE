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
| `auth` | Done | OTP phone login, JWT access + refresh tokens, Redis OTP/token storage |
| `users` | Done | Profile read/update |
| `swipes` | Done | Geo-based candidate discovery with cursor pagination |
| `onboarding` | Skeleton | User setup flow |
| `media` | Skeleton | S3 photo uploads |
| `matching` | Skeleton | Match algorithm |
| `chat` | Skeleton | Real-time chat (Socket.io ready) |

### Auth flow (OTP 2-step)

- `POST /api/auth/phone-otp/register` — create new user by phone → `409 PHONE_ALREADY_REGISTERED` if exists → returns `{ accessToken, refreshToken }`
- `POST /api/auth/phone-otp/request` — request OTP for existing user → `404 PHONE_NOT_REGISTERED` if not found → returns `{ message }`
- `POST /api/auth/phone-otp/confirm` — verify OTP → returns `{ accessToken, refreshToken, isNewUser }`
- `POST /api/auth/refresh` — rotate access token using refresh token
- `POST /api/auth/logout` — revoke refresh token
- All protected routes use `JwtAuthGuard` + `@CurrentUser()` decorator (extracts `{ userId }` object)
- **Dev OTP**: `000000` always accepted when `NODE_ENV !== production`
- OTP stored in Redis with 5-minute TTL, key: `otp:{phoneCode}:{phoneNumber}`
- Access token: 7d (`JWT_ACCESS_EXPIRES_IN`), Refresh token: 30d (`JWT_REFRESH_EXPIRES_IN`)

### Swipes / Candidates

- `GET /api/swipes/candidates?lat=&lng=&limit=&cursor=` — returns nearby users sorted by distance
- Side-effect: upserts requester's location on every call
- Filters: `displayName IS NOT NULL`, distance ≤ `maxDistanceKm`, age range, gender (`lookingFor`), excludes already-swiped
- Cursor pagination: base64url-encoded `{ distanceM, id }`
- PostGIS column `location geography(Point,4326)` on `UserLocation` is **NOT in Prisma schema** — managed via raw SQL. It gets dropped on `prisma db push` and must be re-added:
  ```sql
  ALTER TABLE "UserLocation" ADD COLUMN IF NOT EXISTS location geography(Point, 4326);
  CREATE INDEX IF NOT EXISTS idx_userlocation_location ON "UserLocation" USING GIST(location);
  UPDATE "UserLocation" SET location = ST_MakePoint(lng, lat)::geography WHERE location IS NULL;
  ```

### Database models (prisma/schema.prisma)

- `User` — phone-based identity (`phoneCode` + `phoneNumber` unique)
- `UserProfile` — displayName, birthDate, gender, zodiac, bio (no `completed` or `onboardingStep`)
- `MatchPreferences` — lookingFor, ageMin/ageMax, maxDistanceKm, relationshipType (`ShortTerm | LongTerm | Friends`)
- `UserPhoto` — ordered photo URLs
- `UserInterest` — quiz responses (questionId + selectedOptions[])
- `UserLocation` — lat/lng + PostGIS geography column (managed outside schema)
- `RefreshToken` — refresh token storage with expiry
- `Swipe` — fromUserId/toUserId/action (`LIKE | PASS | SUPERLIKE`), unique per pair

### Data conventions

- `gender` and `lookingFor` stored as **lowercase** strings (`male`, `female`, `everyone`)
- Seed data in `api/seed-data.ts` — 30 users (15 HCM, 15 Hanoi)
- Seed endpoint: `POST /seed` (blocked in production)

### Shared utilities (`api/common/`)

- `@CurrentUser()` — parameter decorator, extracts `userId` from `req.user`
- `JwtAuthGuard` — standard guard wrapping `AuthGuard('jwt')`

### External services

- **Redis** — global module (`api/redis/redis.module.ts`), inject with `@Inject('REDIS_CLIENT')`
- **Email** — Resend (env: `RESEND_API_KEY`)
- **Storage** — AWS S3 (env: `AWS_*`)
- **Swagger** — auto-generated at `/api/docs`
