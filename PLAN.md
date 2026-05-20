# PLAN.md — Dating App Backend (NestJS)

> Tài liệu nguồn cho BE team & AI agent. Mỗi task ở mục cuối được thực thi tuần tự bằng `.harness/init.sh <task-id> "<title>"`.
> Frontend plan: `/Users/chubo/Work/dating/Plan.md`

---

## 1. Bối cảnh & mục tiêu

Build REST + WebSocket backend cho dating app mobile (Expo/React Native). Frontend đã có mock data; BE cung cấp API thật để swap vào ở bước cuối (`DAT-012`).

App không có login truyền thống — auth qua **số điện thoại** (nhập SĐT → tạo tài khoản ngay, không OTP lúc đăng ký). Onboarding 10 bước (step 0 = phone → steps 1–9 = profile). FE giữ data local từ step 1–8, gửi 1 PATCH duy nhất ở step 9.

---

## 2. Stack

| Layer | Công nghệ | Lý do |
|---|---|---|
| Framework | NestJS + TypeScript | Modular, decorator-based, production-ready |
| ORM | Prisma | TypeScript-first, type-safe, migration CLI |
| Database | PostgreSQL + PostGIS | Geo-query cho distance matching |
| Cache / Queue | Redis + BullMQ | Session token, match cache, job queue |
| Auth | Phone number + JWT (access + refresh) | Không password, không OTP lúc đăng ký, UX mượt |
| SMS service | Twilio (dev: console log) | Gửi OTP verify SĐT trong Profile |
| File storage | AWS S3 | Photo upload cho profile |
| Real-time | Socket.io (`@nestjs/websockets`) | Chat, typing indicator, read receipts |
| Package manager | Bun | Đồng bộ với FE |
| Dev infra | Docker Compose | postgres + redis + pgadmin, 1 lệnh `docker compose up` |
| Test | Jest + Supertest | Unit + e2e |

---

## 3. Auth Flow

### Đăng ký / Đăng nhập (không OTP, không friction)
```
1. FE POST /auth/phone { phoneCode, phoneNumber }
   — phoneCode: "84" (không có +), phoneNumber: "901234567"
2. BE upsert User theo (phoneCode + phoneNumber) duy nhất
3. BE trả:
   - accessToken  (JWT, TTL 15 phút)
   - refreshToken (JWT, TTL 30 ngày, lưu DB)
   - isNewUser: boolean  — FE dùng để quyết định vào onboarding hay main app
4. FE lưu cả 2 token, tự gọi POST /auth/refresh khi access hết hạn
```

**Returning user**: token hết hạn → gọi lại `POST /auth/phone` với cùng SĐT → nhận JWT mới, không mất data.

### Onboarding (chạy sau đăng ký)
```
Step 0  → /auth/phone đã xử lý ở trên, trả JWT + isNewUser=true → FE bắt đầu onboarding
Step 1–8 → FE giữ data local (không gọi API)
Step 9  → FE gọi PATCH /users/me { displayName, birthDate, gender, ... tất cả fields }
          BE lưu 1 lần, set onboardingStep=9, completed=true
```

### Phone Verification (tùy chọn, trong Profile)
```
1. User vào Profile → "Xác thực số điện thoại"
2. POST /users/me/phone/verify/send  → BE gửi OTP 6 số qua SMS (Twilio)
3. POST /users/me/phone/verify/confirm { otp }  → BE verify → set phoneVerified=true
```

**Dev mode**: Không cấu hình Twilio → OTP in ra `console.log` thay vì gửi SMS thật.

---

## 4. Database Schema (Prisma)

```prisma
model User {
  id            String   @id @default(cuid())
  phoneCode     String                        // "84" (không có +)
  phoneNumber   String                        // "901234567"
  phoneVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  profile       UserProfile?
  preferences   MatchPreferences?
  photos        UserPhoto[]
  interests     UserInterest[]
  location      UserLocation?
  refreshTokens RefreshToken[]
  swipesGiven   Swipe[]  @relation("SwipeFrom")
  swipesReceived Swipe[] @relation("SwipeTo")
  matchesAs1    Match[]  @relation("MatchUser1")
  matchesAs2    Match[]  @relation("MatchUser2")
  messages      Message[]

  @@unique([phoneCode, phoneNumber])
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
| POST | `/auth/phone` | `{ phoneCode, phoneNumber }` → upsert user → trả JWT pair + `isNewUser` |
| POST | `/auth/refresh` | `{ refreshToken }` → trả access token mới |
| POST | `/auth/logout` | `{ refreshToken }` → revoke |

### Onboarding
> FE giữ data local qua các bước, chỉ gọi API ở bước cuối.

| Method | Path | Mô tả |
|---|---|---|
| PATCH | `/users/me/onboarding` | Gửi toàn bộ profile 1 lần sau step 9: `{ displayName, birthDate, gender, lookingFor, ageMin, ageMax, interests, photoUrls, maxDistanceKm, relationshipType }` → set `completed=true` |
| GET | `/users/me/onboarding` | Trả `{ completed, onboardingStep }` để resume sau crash |

### Media
| Method | Path | Mô tả |
|---|---|---|
| POST | `/media/upload` | Multipart upload → S3 → trả `{ url }` |
| DELETE | `/media/:id` | Xoá ảnh |

### Users
| Method | Path | Mô tả |
|---|---|---|
| GET | `/users/me` | Full profile (bao gồm `phoneVerified`) |
| PATCH | `/users/me` | Cập nhật profile fields sau onboarding |
| PATCH | `/users/me/location` | `{ lat, lng }` |
| POST | `/users/me/phone/verify/send` | Gửi OTP SMS tới SĐT của user (DAT-011) |
| POST | `/users/me/phone/verify/confirm` | `{ otp }` → set `phoneVerified=true` (DAT-011) |

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
| 2 | `DAT-003` | **Auth module**: POST `/auth/otp/send`, POST `/auth/otp/verify`, POST `/auth/refresh`, POST `/auth/logout`. OTP lưu Redis TTL 5 phút, refresh token lưu DB. Định danh theo SĐT (E.164) | Unit test PASS, OTP hết hạn/sai reject 401 |
| 3 | `DAT-004` | **Prisma schema**: Toàn bộ models + migration + seed 20 mock users. User có `phone` (unique), `phoneVerified`, email optional | `prisma migrate dev` PASS, seed chạy, 20 users trong DB |
| 4 | `DAT-005` | **Onboarding API**: POST `/onboarding/step/0` (phone) + step 1–9. Step 9 → `completed = true`. GET `/onboarding/status` | 10 step call đúng, profile complete sau step 9, resume sau crash |
| 5 | `DAT-006` | **Media module**: POST `/media/upload` multipart → S3 → trả URL. Validate MIME type (image/*) + size ≤ 10MB | Ảnh lên S3, URL trả đúng, file quá size reject 400 |
| 6 | `DAT-007` | **Matching module**: GET `/matching/candidates` — filter gender + age + PostGIS distance + relationship type + ≥1 interest chung, cursor pagination, loại đã swipe | Filter đúng với mock data; PostGIS `ST_DWithin` query chạy |
| 7 | `DAT-008` | **Swipe module**: POST `/swipes`. Mutual LIKE → tạo Match + Conversation tự động. GET `/swipes/liked-me`, `/swipes/liked-by-me` | Mutual like test PASS, match row tạo đúng |
| 8 | `DAT-009` | **Chat REST**: GET `/conversations`, GET `/conversations/:id/messages` (cursor), POST `/conversations/:id/messages` | REST flow đúng, pagination cursor hoạt động |
| 9 | `DAT-010` | **Chat WebSocket**: Socket.io gateway — join_room, send_message, typing_start/stop, mark_read. Status DELIVERED → READ sync DB | WS events fire, status cập nhật DB, test với wscat |
| 10 | `DAT-011` | **Profile edit + phone verify**: PATCH `/users/me`, PATCH `/users/me/location`. Phone verify flow: POST `/users/me/phone/verify/send` + confirm → `phoneVerified=true` | PATCH persist đúng, verify flow set flag, guard bảo vệ |
| 11 | `DAT-012` | **Wire FE ↔ BE**: Cập nhật FE `src/api/axios/config.ts` baseURL → local BE, test full flow: phone OTP → onboarding → swipe → match → chat | Full flow chạy trên simulator với BE local |

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
