import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CandidatesQueryDto } from './dto/candidates-query.dto';

interface CandidateRow {
  id: string;
  displayName: string | null;
  birthDate: Date | null;
  distanceM: number;
  photos: { url: string; order: number }[];
}

interface Cursor {
  distanceM: number;
  id: string;
}

function encodeCursor(distanceM: number, id: string): string {
  return Buffer.from(JSON.stringify({ distanceM, id })).toString('base64url');
}

function decodeCursor(cursor: string): Cursor {
  return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
}

function calcAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

@Injectable()
export class SwipesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCandidates(userId: string, dto: CandidatesQueryDto) {
    const { lat, lng, limit = 20, cursor } = dto;

    // 1. Upsert requester location (side-effect: keep location fresh for discovery)
    await this.prisma.$executeRaw`
      INSERT INTO "UserLocation" ("userId", lat, lng, location, "updatedAt")
      VALUES (${userId}, ${lat}, ${lng}, ST_MakePoint(${lng}, ${lat})::geography, NOW())
      ON CONFLICT ("userId") DO UPDATE
        SET lat = EXCLUDED.lat,
            lng = EXCLUDED.lng,
            location = EXCLUDED.location,
            "updatedAt" = NOW()
    `;

    // 2. Load requester preferences
    const prefs = await this.prisma.matchPreferences.findUnique({ where: { userId } });

    const maxDistanceM = (prefs?.maxDistanceKm ?? 50) * 1000;
    const ageMin = prefs?.ageMin ?? 18;
    const ageMax = prefs?.ageMax ?? 99;
    const lookingFor = prefs?.lookingFor ?? 'Everyone';

    // 3. Resolve cursor
    const parsed = cursor ? decodeCursor(cursor) : null;

    // 4. Raw geo query
    type RawRow = {
      id: string;
      displayName: string | null;
      birthDate: Date | null;
      dist_m: number;
    };

    const lookingForLower = lookingFor.toLowerCase();
    const genderFilter =
      lookingForLower === 'everyone'
        ? Prisma.sql``
        : Prisma.sql`AND LOWER(up.gender) = ${lookingForLower}`;

    const cursorFilter = parsed
      ? Prisma.sql`AND (
          ROUND(ST_Distance(ul.location, ST_MakePoint(${lng}, ${lat})::geography)) > ${parsed.distanceM}
          OR (
            ROUND(ST_Distance(ul.location, ST_MakePoint(${lng}, ${lat})::geography)) = ${parsed.distanceM}
            AND u.id > ${parsed.id}
          )
        )`
      : Prisma.sql``;

    const rows = await this.prisma.$queryRaw<RawRow[]>`
      SELECT
        u.id,
        up."displayName",
        up."birthDate",
        ROUND(ST_Distance(
          ul.location,
          ST_MakePoint(${lng}, ${lat})::geography
        ))::int AS dist_m
      FROM "User" u
      JOIN "UserProfile" up  ON up."userId" = u.id
      JOIN "UserLocation" ul ON ul."userId" = u.id
      WHERE u.id != ${userId}
        AND up."displayName" IS NOT NULL
        AND ul.location IS NOT NULL
        AND ST_DWithin(ul.location, ST_MakePoint(${lng}, ${lat})::geography, ${maxDistanceM})
        AND (
          up."birthDate" IS NOT NULL
          AND DATE_PART('year', AGE(up."birthDate")) BETWEEN ${ageMin} AND ${ageMax}
        )
        ${genderFilter}
        AND NOT EXISTS (
          SELECT 1 FROM "Swipe" s
          WHERE s."fromUserId" = ${userId} AND s."toUserId" = u.id
        )
        ${cursorFilter}
      ORDER BY dist_m ASC, u.id ASC
      LIMIT ${limit + 1}
    `;

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;

    // 5. Batch-load photos
    const ids = page.map((r) => r.id);
    const photos =
      ids.length > 0
        ? await this.prisma.userPhoto.findMany({
            where: { userId: { in: ids } },
            orderBy: { order: 'asc' },
            select: { userId: true, url: true, order: true },
          })
        : [];

    const photoMap = new Map<string, { url: string; order: number }[]>();
    for (const p of photos) {
      if (!photoMap.has(p.userId)) photoMap.set(p.userId, []);
      photoMap.get(p.userId)!.push({ url: p.url, order: p.order });
    }

    // 6. Shape response
    const data = page.map((r) => ({
      id: r.id,
      displayName: r.displayName,
      age: r.birthDate ? calcAge(new Date(r.birthDate)) : null,
      distanceKm: Math.round(Number(r.dist_m) / 100) / 10,
      photos: photoMap.get(r.id) ?? [],
    }));

    const lastRow = page.at(-1);
    const nextCursor =
      hasMore && lastRow ? encodeCursor(Number(lastRow.dist_m), lastRow.id) : null;

    return { data, nextCursor };
  }
}
