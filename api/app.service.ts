import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { SEED_USERS } from './seed-data';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async seed() {
    await this.prisma.user.deleteMany();

    let created = 0;
    for (const seed of SEED_USERS) {
      const user = await this.prisma.user.create({
        data: {
          phoneCode: seed.phone.code,
          phoneNumber: seed.phone.number,
          profile: {
            create: {
              displayName: seed.profile.displayName,
              birthDate: new Date(seed.profile.birthDate),
              zodiac: seed.profile.zodiac,
              gender: seed.profile.gender,
              bio: seed.profile.bio,

            },
          },
          preferences: { create: seed.preferences },
          photos: {
            create: seed.photos.map((url, order) => ({ url, order })),
          },
          interests: { create: seed.interests },
        },
      });

      await this.prisma.$executeRaw`
        INSERT INTO "UserLocation" ("userId", lat, lng, location, "updatedAt")
        VALUES (
          ${user.id}, ${seed.location.lat}, ${seed.location.lng},
          ST_MakePoint(${seed.location.lng}, ${seed.location.lat})::geography,
          NOW()
        )
      `;

      created++;
    }

    return { seeded: created, total: SEED_USERS.length };
  }
}
