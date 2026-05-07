# PLAN.md — Dating App Backend (NestJS)

> Tài liệu nguồn cho BE team & AI agent. Mỗi task ở mục cuối được thực thi tuần tự bằng `.harness/init.sh <task-id> "<title>"`.
> Frontend plan: `/Users/chubo/Work/dating/Plan.md`

---

## 1. Bối cảnh & mục tiêu

Build REST + WebSocket backend cho dating app mobile (Expo/React Native). Frontend đã có mock data; BE cung cấp API thật để swap vào ở bước cuối (`DAT-012`).

App không có login truyền thống — auth qua **Email Magic Link** (nhập email → nhận link → click → JWT). Onboarding 9 bước thay thế hoàn toàn signup form.

---

## 2. Stack

| Layer | Công nghệ | Lý do |
|---|---|---|
| Framework | NestJS + TypeScript | Modular, decorator-based, production-ready |
| ORM | Prisma | TypeScript-first, type-safe, migration CLI |
| Database | PostgreSQL + PostGIS | Geo-query cho distance matching |
| Cache / Queue | Redis + BullMQ | Session token, match cache, job queue |
| Auth | Email Magic Link + JWT (access + refresh) | Không password, UX mượt |
| Email service | Resend | API đơn giản, free 3k email/tháng |
| File storage | AWS S3 | Photo upload cho profile |
| Real-time | Socket.io (`@nestjs/websockets`) | Chat, typing indicator, read receipts |
| Package manager | Bun | Đồng bộ với FE |
| Dev infra | Docker Compose | postgres + redis + pgadmin, 1 lệnh `docker compose up` |
| Test | Jest + Supertest | Unit + e2e |

---

## 3. Auth Flow (Magic Link)

```
1. FE POST /auth/magic-link { email }
2. BE tạo UUID token (TTL 15 phút), lưu Redis key: magic:<token> = userId/email
3. BE gửi email qua Resend: link = https://app.com/auth/verify?token=<uuid>
4. User click link → FE gửi GET /auth/verify?token=<uuid>
5. BE verify token từ Redis → xoá token khỏi Redis
6. BE tạo/lấy user theo email → trả:
   - accessToken (JWT, TTL 15 phút)
   - refreshToken (JWT, TTL 30 ngày, lưu DB)
7. FE lưu cả 2 token, tự gọi POST /auth/refresh khi access hết hạn
```

**Lưu ý FE**: Cần thêm màn Email trước NameScreen (màn 0 của onboarding). Sau khi verify magic link → vào màn 1 như bình thường.

---

## 4. Database Schema (Prisma)

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  profile      UserProfile?
  preferences  MatchPreferences?
  photos       UserPhoto[]
  interests    UserInterest[]
  location     UserLocation?
  refreshTokens RefreshToken[]
  swipesGiven  Swipe[]  @relation("SwipeFrom")
  swipesReceived Swipe[] @relation("SwipeTo")
  matchesAs1   Match[]  @relation("MatchUser1")
  matchesAs2   Match[]  @relation("MatchUser2")
  messages     Message[]
}

model UserProfile {
  userId         String   @id
  displayName    String?
  birthDate      DateTime?
  zodiac         String?
  gender         String?   // Male | Female | NonBinary | PreferNotToSay
  bio            String?
  completed      Boolean  @default(false)
  onboardingStep Int      @default(0)
  user           User     @relation(fields: [userId], references: [id])
}

model MatchPreferences {
  userId           String  @id
  lookingFor       String?  // Male | Female | Everyone
  ageMin           Int?
  ageMax           Int?
  maxDistanceKm    Int?
  relationshipType String?  // ShortTerm | LongTerm | Friends
  user             User    @relation(fields: [userId], references: [id])
}

model UserPhoto {
  id     String @id @default(cuid())
  userId String
  url    String
  order  Int
  user   User   @relation(fields: [userId], references: [id])
}

model UserInterest {
  id              String   @id @default(cuid())
  userId          String
  questionId      String
  selectedOptions String[]
  user            User     @relation(fields: [userId], references: [id])
}

model UserLocation {
  userId    String   @id
  lat       Float
  lng       Float
  updatedAt DateTime @updatedAt
  // PostGIS point column thêm qua raw migration
  user      User     @relation(fields: [userId], references: [id])
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id])
}

model Swipe {
  id         String   @id @default(cuid())
  fromUserId String
  toUserId   String
  action     String   // LIKE | PASS | SUPERLIKE
  createdAt  DateTime @default(now())
  fromUser   User     @relation("SwipeFrom", fields: [fromUserId], references: [id])
  toUser     User     @relation("SwipeTo", fields: [toUserId], references: [id])

  @@unique([fromUserId, toUserId])
}

model Match {
  id           String       @id @default(cuid())
  userId1      String
  userId2      String
  createdAt    DateTime     @default(now())
  user1        User         @relation("MatchUser1", fields: [userId1], references: [id])
  user2        User         @relation("MatchUser2", fields: [userId2], references: [id])
  conversation Conversation?

  @@unique([userId1, userId2])
}

model Conversation {
  id            String    @id @default(cuid())
  matchId       String    @unique
  createdAt     DateTime  @default(now())
  lastMessageAt DateTime?
  match         Match     @relation(fields: [matchId], references: [id])
  messages      Message[]
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  senderId       String
  content        String
  status         String   @default("SENT") // SENDING | SENT | DELIVERED | READ
  createdAt      DateTime @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  sender         User     @relation(fields: [senderId], references: [id])
}
```

---

## 5. API Endpoints

### Auth
| Method | Path | Mô tả |
|---|---|---|
| POST | `/auth/magic-link` | Gửi magic link tới email |
| GET | `/auth/verify` | Verify token → trả JWT |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Revoke refresh token |

### Onboarding
| Method | Path | Mô tả |
|---|---|---|
| POST | `/onboarding/step/1` | displayName |
| POST | `/onboarding/step/2` | birthDate (zodiac tự tính BE) |
| POST | `/onboarding/step/3` | gender |
| POST | `/onboarding/step/4` | lookingFor |
| POST | `/onboarding/step/5` | ageMin, ageMax |
| POST | `/onboarding/step/6` | interests (array InterestAnswer) |
| POST | `/onboarding/step/7` | photos (trigger upload trước, truyền URLs) |
| POST | `/onboarding/step/8` | maxDistanceKm |
| POST | `/onboarding/step/9` | relationshipType → set completed = true |
| GET | `/onboarding/status` | Trả step hiện tại (resume sau crash) |

### Media
| Method | Path | Mô tả |
|---|---|---|
| POST | `/media/upload` | Multipart upload → S3 → trả `{ url }` |
| DELETE | `/media/:id` | Xoá ảnh |

### Users
| Method | Path | Mô tả |
|---|---|---|
| GET | `/users/me` | Full profile của user hiện tại |
| PATCH | `/users/me` | Cập nhật profile fields |
| PATCH | `/users/me/location` | Cập nhật vị trí `{ lat, lng }` |

### Matching
| Method | Path | Mô tả |
|---|---|---|
| GET | `/matching/candidates` | Danh sách ứng viên (filter + geo + pagination) |

Query params: `cursor`, `limit` (default 20). Filter tự động lấy từ `matchPreferences` của user.

Logic filter:
1. Gender phù hợp `lookingFor`
2. Tuổi trong `[ageMin, ageMax]`
3. Khoảng cách ≤ `maxDistanceKm` (PostGIS `ST_DWithin`)
4. Cùng `relationshipType`
5. Có ≥ 1 interest chung
6. Loại users đã swipe (LIKE hoặc PASS)

### Swipes
| Method | Path | Mô tả |
|---|---|---|
| POST | `/swipes` | `{ toUserId, action: LIKE/PASS/SUPERLIKE }` |
| GET | `/swipes/liked-me` | Danh sách người đã LIKE mình |
| GET | `/swipes/liked-by-me` | Danh sách người mình đã LIKE |

Khi cả 2 LIKE nhau → tự động tạo `Match` + `Conversation`.

### Matches
| Method | Path | Mô tả |
|---|---|---|
| GET | `/matches` | Danh sách matches của user hiện tại |

### Chat (REST)
| Method | Path | Mô tả |
|---|---|---|
| GET | `/conversations` | List conversations (avatar, tên, last message, unread) |
| GET | `/conversations/:id/messages` | Messages (cursor pagination) |
| POST | `/conversations/:id/messages` | Gửi message |

### Chat (WebSocket events)
| Event | Chiều | Payload |
|---|---|---|
| `join_room` | Client → Server | `{ conversationId }` |
| `send_message` | Client → Server | `{ conversationId, content }` |
| `new_message` | Server → Client | Message object |
| `typing_start` | Client → Server | `{ conversationId }` |
| `typing_stop` | Client → Server | `{ conversationId }` |
| `user_typing` | Server → Client | `{ userId, conversationId }` |
| `mark_read` | Client → Server | `{ conversationId, messageId }` |
| `message_read` | Server → Client | `{ conversationId, messageId }` |

---

## 6. Cấu trúc project

```
dating_BE/
├── api/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   └── strategies/jwt.strategy.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   ├── onboarding/
│   │   ├── onboarding.module.ts
│   │   ├── onboarding.controller.ts
│   │   ├── onboarding.service.ts
│   │   └── dto/
│   ├── media/
│   │   ├── media.module.ts
│   │   ├── media.controller.ts
│   │   └── s3.service.ts
│   ├── matching/
│   │   ├── matching.module.ts
│   │   ├── matching.controller.ts
│   │   └── matching.service.ts
│   ├── swipes/
│   │   ├── swipes.module.ts
│   │   ├── swipes.controller.ts
│   │   └── swipes.service.ts
│   ├── chat/
│   │   ├── chat.module.ts
│   │   ├── chat.controller.ts
│   │   ├── chat.service.ts
│   │   └── chat.gateway.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── common/
│   │   ├── guards/jwt-auth.guard.ts
│   │   ├── decorators/current-user.decorator.ts
│   │   ├── filters/http-exception.filter.ts
│   │   └── interceptors/response-transform.interceptor.ts
│   └── app.module.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── docker-compose.yml
├── .env.example
├── .env                    # gitignore
├── package.json
├── tsconfig.json
└── PLAN.md
```

---

## 7. Task split (tuần tự)

| # | Task ID | Tóm tắt | Acceptance |
|---|---|---|---|
| 1 | `DAT-002` | **Scaffold**: `nest new`, cấu trúc folder, Prisma init, Docker Compose (postgres + redis + pgadmin), `.env.example`, `GET /api/health` | `docker compose up` + `bun run start:dev` chạy, health 200 |
| 2 | `DAT-003` | **Auth module**: POST `/auth/magic-link`, GET `/auth/verify`, POST `/auth/refresh`, POST `/auth/logout`. Token lưu Redis, refresh token lưu DB | Unit test PASS, token hết hạn reject 401 |
| 3 | `DAT-004` | **Prisma schema**: Toàn bộ models + migration + seed 20 mock users (có location, interests, photos đủ để test matching) | `prisma migrate dev` PASS, seed chạy, 20 users trong DB |
| 4 | `DAT-005` | **Onboarding API**: POST `/onboarding/step/1..9` validate + persist từng bước. Step 9 → `completed = true`. GET `/onboarding/status` | 9 step call đúng, profile complete sau step 9, resume sau crash |
| 5 | `DAT-006` | **Media module**: POST `/media/upload` multipart → S3 → trả URL. Validate MIME type (image/*) + size ≤ 10MB | Ảnh lên S3, URL trả đúng, file quá size reject 400 |
| 6 | `DAT-007` | **Matching module**: GET `/matching/candidates` — filter gender + age + PostGIS distance + relationship type + ≥1 interest chung, cursor pagination, loại đã swipe | Filter đúng với mock data; PostGIS `ST_DWithin` query chạy |
| 7 | `DAT-008` | **Swipe module**: POST `/swipes`. Mutual LIKE → tạo Match + Conversation tự động. GET `/swipes/liked-me`, `/swipes/liked-by-me` | Mutual like test PASS, match row tạo đúng |
| 8 | `DAT-009` | **Chat REST**: GET `/conversations`, GET `/conversations/:id/messages` (cursor), POST `/conversations/:id/messages` | REST flow đúng, pagination cursor hoạt động |
| 9 | `DAT-010` | **Chat WebSocket**: Socket.io gateway — join_room, send_message, typing_start/stop, mark_read. Status DELIVERED → READ sync DB | WS events fire, status cập nhật DB, test với wscat |
| 10 | `DAT-011` | **Profile edit**: PATCH `/users/me` fields, PATCH `/users/me/location`, DELETE `/media/:id` (xoá ảnh S3 + DB) | PATCH persist đúng, guard bảo vệ, xoá ảnh S3 thật |
| 11 | `DAT-012` | **Wire FE ↔ BE**: Cập nhật FE `src/api/axios/config.ts` baseURL → local BE, test full flow onboarding → swipe → match → chat | Full flow chạy trên simulator với BE local |

---

## 8. Thứ tự phụ thuộc

```
DAT-002 (scaffold)
  └─ DAT-003 (auth)
       └─ DAT-004 (schema + seed)
            ├─ DAT-005 (onboarding)
            └─ DAT-006 (media)        ← song song với DAT-005
                 └─ DAT-007 (matching)
                      └─ DAT-008 (swipes)
                           ├─ DAT-009 (chat REST)
                           └─ DAT-010 (chat WS)   ← song song với DAT-009
                                └─ DAT-011 (profile edit)
                                     └─ DAT-012 (wire FE)
```

---

## 9. Rủi ro & quyết định để ngỏ

- **Realtime chat scaling**: v1 dùng Socket.io in-memory. Khi scale multi-instance cần Redis adapter (`@socket.io/redis-adapter`) — thêm sau DAT-010.
- **Image CDN**: v1 trả S3 URL trực tiếp. Production nên đặt CloudFront trước S3 để cache + giảm latency.
- **PostGIS migration**: Prisma chưa hỗ trợ PostGIS natively — dùng raw SQL migration để tạo `geography` column cho `UserLocation`. Cần chú ý không để `prisma migrate reset` xoá mất column này.
- **OTP / SMS**: v1 dùng Email Magic Link. Nếu sau này thêm Phone OTP (Twilio), thêm column `phone` vào `User` và tạo module riêng.
- **Push notifications**: Chưa trong scope 11 task. Khi thêm: dùng Firebase FCM, lưu `fcmToken` trong `User`, trigger khi có match mới hoặc message mới.
- **Paywall (tab Likes sub-tab 2)**: Visual only ở FE v1, không cần BE endpoint. Thêm sau khi integrate payment (RevenueCat / Stripe).

---

## 10. Cách chạy chuỗi task qua Outer Harness

```bash
# Bước 1: tạo task
bash .harness/init.sh DAT-002 "NestJS project scaffold with Docker Compose"

# Bước 2: điền spec.md (What / Why / Success criteria / Out of scope)
# Bước 3: điền plan.md
# Bước 4: ghi approval vào approvals.md
# Bước 5: implement
# Bước 6: chạy gate
bash .harness/gates/run-gates.sh
# Bước 7: fill ## Handoff ở cuối progress.md, set status = completed trong tasks/INDEX.md
```

Lặp lại cho 10 task còn lại theo đúng thứ tự.
