import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

const USER_INCLUDE = {
  profile: true,
  preferences: true,
  photos: { orderBy: { order: 'asc' as const } },
  interests: true,
  location: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: USER_INCLUDE,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const { displayName, birthDate, zodiac, gender, bio, interests, photos, ...prefFields } = dto;

    const profileData = { displayName, birthDate: birthDate ? new Date(birthDate) : undefined, zodiac, gender, bio };
    const hasProfileData = Object.values(profileData).some((v) => v !== undefined);
    const hasPrefData = Object.values(prefFields).some((v) => v !== undefined);

    await this.prisma.$transaction(async (tx) => {
      if (hasProfileData) {
        await tx.userProfile.upsert({
          where: { userId },
          create: { userId, ...profileData },
          update: profileData,
        });
      }

      if (hasPrefData) {
        await tx.matchPreferences.upsert({
          where: { userId },
          create: { userId, ...prefFields },
          update: prefFields,
        });
      }

      if (interests !== undefined) {
        await tx.userInterest.deleteMany({ where: { userId } });
        if (interests.length > 0) {
          await tx.userInterest.createMany({
            data: interests.map(({ questionId, selectedOptions }) => ({ userId, questionId, selectedOptions })),
          });
        }
      }

      if (photos !== undefined) {
        await tx.userPhoto.deleteMany({ where: { userId } });
        if (photos.length > 0) {
          await tx.userPhoto.createMany({
            data: photos.map(({ url, order }) => ({ userId, url, order })),
          });
        }
      }
    });

    return this.getProfile(userId);
  }
}
