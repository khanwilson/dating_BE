export interface UserSeed {
  phone: { code: string; number: string };
  profile: {
    displayName: string;
    birthDate: string; // YYYY-MM-DD
    zodiac: string;
    gender: 'male' | 'female' | 'nonbinary' | 'prefernottosay';
    bio: string;
  };
  preferences: {
    lookingFor: 'male' | 'female' | 'everyone';
    ageMin: number;
    ageMax: number;
    maxDistanceKm: number;
    relationshipType: 'ShortTerm' | 'LongTerm' | 'Friends';
  };
  photos: string[];
  interests: { questionId: string; selectedOptions: string[] }[];
  location: { lat: number; lng: number };
}

// ─── Seed users ────────────────────────────────────────────────────────────────
// HCM: Q.1 → Bình Dương border  |  HN: Duy Tân, Mỹ Đình, Cầu Giấy
// Photos dùng picsum.photos — ổn định, không cần auth.
// ────────────────────────────────────────────────────────────────────────────────

export const SEED_USERS: UserSeed[] = [
  {
    phone: { code: '84', number: '911000001' },
    profile: {
      displayName: 'Linh',
      birthDate: '1998-03-15',
      zodiac: 'Pisces',
      gender: 'female',
      bio: 'Thích cà phê sáng, đọc sách và đi dạo cuối tuần ☕',
    },
    preferences: {
      lookingFor: 'male',
      ageMin: 22,
      ageMax: 32,
      maxDistanceKm: 20,
      relationshipType: 'LongTerm',
    },
    photos: [
      'https://picsum.photos/seed/linh1/400/600',
      'https://picsum.photos/seed/linh2/400/600',
    ],
    interests: [
      { questionId: 'q_hobby', selectedOptions: ['reading', 'coffee'] },
      { questionId: 'q_pet', selectedOptions: ['cat'] },
    ],
    location: { lat: 10.7751, lng: 106.7006 }, // Q.1
  },
  {
    phone: { code: '84', number: '911000002' },
    profile: {
      displayName: 'Minh',
      birthDate: '1996-07-22',
      zodiac: 'Cancer',
      gender: 'male',
      bio: 'Dev ban ngày, gamer ban đêm. Tìm người cùng ăn phở sáng Chủ Nhật 🍜',
    },
    preferences: {
      lookingFor: 'female',
      ageMin: 20,
      ageMax: 30,
      maxDistanceKm: 30,
      relationshipType: 'LongTerm',
    },
    photos: [
      'https://picsum.photos/seed/minh1/400/600',
      'https://picsum.photos/seed/minh2/400/600',
    ],
    interests: [
      { questionId: 'q_hobby', selectedOptions: ['gaming', 'cooking'] },
      { questionId: 'q_pet', selectedOptions: ['dog'] },
    ],
    location: { lat: 10.7838, lng: 106.6862 }, // Q.3
  },
  {
    phone: { code: '84', number: '911000003' },
    profile: {
      displayName: 'Trang',
      birthDate: '2000-11-05',
      zodiac: 'Scorpio',
      gender: 'female',
      bio: 'Sinh viên năm 4. Thích chụp ảnh và khám phá quán ăn mới 📸',
    },
    preferences: {
      lookingFor: 'male',
      ageMin: 21,
      ageMax: 28,
      maxDistanceKm: 15,
      relationshipType: 'ShortTerm',
    },
    photos: [
      'https://picsum.photos/seed/trang1/400/600',
      'https://picsum.photos/seed/trang2/400/600',
      'https://picsum.photos/seed/trang3/400/600',
    ],
    interests: [
      { questionId: 'q_hobby', selectedOptions: ['photography', 'foodie'] },
      { questionId: 'q_music', selectedOptions: ['vpop', 'kpop'] },
    ],
    location: { lat: 10.7338, lng: 106.7074 }, // Q.7 Phú Mỹ Hưng
  },
  {
    phone: { code: '84', number: '911000004' },
    profile: {
      displayName: 'Khoa',
      birthDate: '1995-01-30',
      zodiac: 'Aquarius',
      gender: 'male',
      bio: 'Gym 5 buổi/tuần. Thích hiking và xem phim tài liệu 🏋️',
    },
    preferences: {
      lookingFor: 'female',
      ageMin: 22,
      ageMax: 30,
      maxDistanceKm: 25,
      relationshipType: 'LongTerm',
    },
    photos: [
      'https://picsum.photos/seed/khoa1/400/600',
    ],
    interests: [
      { questionId: 'q_hobby', selectedOptions: ['gym', 'hiking'] },
      { questionId: 'q_pet', selectedOptions: ['none'] },
    ],
    location: { lat: 10.8080, lng: 106.7106 }, // Bình Thạnh
  },
  {
    phone: { code: '84', number: '911000005' },
    profile: {
      displayName: 'Mai',
      birthDate: '1999-06-18',
      zodiac: 'Gemini',
      gender: 'female',
      bio: 'Marketing executive. Mê du lịch, đã đi 12 tỉnh thành ✈️',
    },
    preferences: {
      lookingFor: 'male',
      ageMin: 24,
      ageMax: 34,
      maxDistanceKm: 40,
      relationshipType: 'LongTerm',
    },
    photos: [
      'https://picsum.photos/seed/mai1/400/600',
      'https://picsum.photos/seed/mai2/400/600',
    ],
    interests: [
      { questionId: 'q_hobby', selectedOptions: ['travel', 'coffee'] },
      { questionId: 'q_music', selectedOptions: ['indie', 'acoustic'] },
    ],
    location: { lat: 10.8531, lng: 106.7599 }, // Thủ Đức
  },
  {
    phone: { code: '84', number: '911000006' },
    profile: {
      displayName: 'Hùng',
      birthDate: '1994-09-12',
      zodiac: 'Virgo',
      gender: 'male',
      bio: 'Kiến trúc sư. Cuối tuần đạp xe hoặc vẽ tranh 🎨',
    },
    preferences: {
      lookingFor: 'female',
      ageMin: 22,
      ageMax: 32,
      maxDistanceKm: 20,
      relationshipType: 'LongTerm',
    },
    photos: [
      'https://picsum.photos/seed/hung1/400/600',
      'https://picsum.photos/seed/hung2/400/600',
    ],
    interests: [
      { questionId: 'q_hobby', selectedOptions: ['cycling', 'art'] },
      { questionId: 'q_pet', selectedOptions: ['cat'] },
    ],
    location: { lat: 10.7965, lng: 106.7314 }, // Q.2 / Thủ Thiêm
  },
  {
    phone: { code: '84', number: '911000007' },
    profile: {
      displayName: 'Ngân',
      birthDate: '2001-02-14',
      zodiac: 'Aquarius',
      gender: 'female',
      bio: 'Đang học thạc sĩ tâm lý học. Thích nhạc acoustic và yoga 🧘',
    },
    preferences: {
      lookingFor: 'male',
      ageMin: 22,
      ageMax: 30,
      maxDistanceKm: 20,
      relationshipType: 'Friends',
    },
    photos: [
      'https://picsum.photos/seed/ngan1/400/600',
      'https://picsum.photos/seed/ngan2/400/600',
      'https://picsum.photos/seed/ngan3/400/600',
    ],
    interests: [
      { questionId: 'q_hobby', selectedOptions: ['yoga', 'reading'] },
      { questionId: 'q_music', selectedOptions: ['acoustic', 'classical'] },
    ],
    location: { lat: 10.8385, lng: 106.6654 }, // Gò Vấp
  },
  {
    phone: { code: '84', number: '911000008' },
    profile: {
      displayName: 'Tuấn',
      birthDate: '1997-04-25',
      zodiac: 'Taurus',
      gender: 'male',
      bio: 'Đầu bếp tại nhà hàng Pháp. Thích nấu ăn cho người khác thưởng thức 🍳',
    },
    preferences: {
      lookingFor: 'everyone',
      ageMin: 20,
      ageMax: 35,
      maxDistanceKm: 50,
      relationshipType: 'Friends',
    },
    photos: [
      'https://picsum.photos/seed/tuan1/400/600',
    ],
    interests: [
      { questionId: 'q_hobby', selectedOptions: ['cooking', 'foodie'] },
      { questionId: 'q_pet', selectedOptions: ['dog', 'cat'] },
    ],
    location: { lat: 10.7574, lng: 106.7029 }, // Q.4
  },
  {
    phone: { code: '84', number: '911000009' },
    profile: {
      displayName: 'Hà',
      birthDate: '1998-08-08',
      zodiac: 'Leo',
      gender: 'female',
      bio: 'Giáo viên tiếng Anh. Thích boardgame, escape room và phim kinh dị 🎲',
    },
    preferences: {
      lookingFor: 'male',
      ageMin: 24,
      ageMax: 33,
      maxDistanceKm: 25,
      relationshipType: 'LongTerm',
    },
    photos: [
      'https://picsum.photos/seed/ha1/400/600',
      'https://picsum.photos/seed/ha2/400/600',
    ],
    interests: [
      { questionId: 'q_hobby', selectedOptions: ['boardgame', 'movies'] },
      { questionId: 'q_music', selectedOptions: ['vpop', 'r&b'] },
    ],
    location: { lat: 10.7992, lng: 106.6521 }, // Tân Bình
  },
  {
    phone: { code: '84', number: '911000010' },
    profile: {
      displayName: 'Phúc',
      birthDate: '1993-12-03',
      zodiac: 'Sagittarius',
      gender: 'male',
      bio: 'Startup founder. Hay uống cà phê muộn và nghe podcast 🎧',
    },
    preferences: {
      lookingFor: 'female',
      ageMin: 23,
      ageMax: 32,
      maxDistanceKm: 35,
      relationshipType: 'LongTerm',
    },
    photos: [
      'https://picsum.photos/seed/phuc1/400/600',
      'https://picsum.photos/seed/phuc2/400/600',
    ],
    interests: [
      { questionId: 'q_hobby', selectedOptions: ['coffee', 'reading'] },
      { questionId: 'q_pet', selectedOptions: ['none'] },
    ],
    location: { lat: 10.7737, lng: 106.6643 }, // Q.10
  },
  {
    phone: { code: '84', number: '911000011' },
    profile: {
      displayName: 'Quỳnh',
      birthDate: '2000-05-20',
      zodiac: 'Taurus',
      gender: 'female',
      bio: 'Nghiện thể thao. Chạy bộ mỗi sáng, bơi cuối tuần 🏊',
    },
    preferences: {
      lookingFor: 'male',
      ageMin: 22,
      ageMax: 30,
      maxDistanceKm: 20,
      relationshipType: 'ShortTerm',
    },
    photos: [
      'https://picsum.photos/seed/quynh1/400/600',
      'https://picsum.photos/seed/quynh2/400/600',
    ],
    interests: [
      { questionId: 'q_hobby', selectedOptions: ['running', 'swimming'] },
      { questionId: 'q_music', selectedOptions: ['edm', 'pop'] },
    ],
    location: { lat: 10.7620, lng: 106.6820 }, // Q.5
  },
  {
    phone: { code: '84', number: '911000012' },
    profile: {
      displayName: 'Đức',
      birthDate: '1996-10-10',
      zodiac: 'Libra',
      gender: 'male',
      bio: 'Nhiếp ảnh gia tự do. Đi nhiều nơi, gặp nhiều người 📷',
    },
    preferences: {
      lookingFor: 'female',
      ageMin: 21,
      ageMax: 30,
      maxDistanceKm: 50,
      relationshipType: 'Friends',
    },
    photos: [
      'https://picsum.photos/seed/duc1/400/600',
      'https://picsum.photos/seed/duc2/400/600',
      'https://picsum.photos/seed/duc3/400/600',
    ],
    interests: [
      { questionId: 'q_hobby', selectedOptions: ['photography', 'travel'] },
      { questionId: 'q_pet', selectedOptions: ['dog'] },
    ],
    location: { lat: 10.8200, lng: 106.7400 }, // Bình Dương border
  },
  {
    phone: { code: '84', number: '911000013' },
    profile: {
      displayName: 'Yến',
      birthDate: '1999-09-09',
      zodiac: 'Virgo',
      gender: 'female',
      bio: 'UX designer. Hay vẽ nguệch ngoạc và nghe nhạc indie 🎵',
    },
    preferences: {
      lookingFor: 'male',
      ageMin: 23,
      ageMax: 32,
      maxDistanceKm: 25,
      relationshipType: 'LongTerm',
    },
    photos: [
      'https://picsum.photos/seed/yen1/400/600',
      'https://picsum.photos/seed/yen2/400/600',
    ],
    interests: [
      { questionId: 'q_hobby', selectedOptions: ['art', 'music'] },
      { questionId: 'q_music', selectedOptions: ['indie', 'acoustic'] },
    ],
    location: { lat: 10.7900, lng: 106.6700 }, // Q.Phú Nhuận
  },
  {
    phone: { code: '84', number: '911000014' },
    profile: {
      displayName: 'Bảo',
      birthDate: '1997-02-28',
      zodiac: 'Pisces',
      gender: 'male',
      bio: 'Bác sĩ nội trú. Cần người cùng xem phim lúc 12 giờ đêm 🏥',
    },
    preferences: {
      lookingFor: 'female',
      ageMin: 22,
      ageMax: 31,
      maxDistanceKm: 15,
      relationshipType: 'LongTerm',
    },
    photos: [
      'https://picsum.photos/seed/bao1/400/600',
    ],
    interests: [
      { questionId: 'q_hobby', selectedOptions: ['movies', 'reading'] },
      { questionId: 'q_pet', selectedOptions: ['cat'] },
    ],
    location: { lat: 10.7700, lng: 106.6600 }, // Q.11
  },
  {
    phone: { code: '84', number: '911000015' },
    profile: {
      displayName: 'Thảo',
      birthDate: '2001-07-07',
      zodiac: 'Cancer',
      gender: 'female',
      bio: 'Content creator. Cuộc sống = cà phê + nắng + cây xanh 🌿',
    },
    preferences: {
      lookingFor: 'male',
      ageMin: 22,
      ageMax: 30,
      maxDistanceKm: 30,
      relationshipType: 'ShortTerm',
    },
    photos: [
      'https://picsum.photos/seed/thao1/400/600',
      'https://picsum.photos/seed/thao2/400/600',
      'https://picsum.photos/seed/thao3/400/600',
    ],
    interests: [
      { questionId: 'q_hobby', selectedOptions: ['coffee', 'photography'] },
      { questionId: 'q_music', selectedOptions: ['vpop', 'kpop'] },
    ],
    location: { lat: 10.7850, lng: 106.6950 }, // Q.Bình Thạnh gần cầu Sài Gòn
  },

  // ── Hà Nội — Duy Tân / Mỹ Đình / Cầu Giấy ─────────────────────────────────
  {
    phone: { code: '84', number: '912000001' },
    profile: {
      displayName: 'Hương',
      birthDate: '1999-03-22',
      zodiac: 'Aries',
      gender: 'female',
      bio: 'Dân Cầu Giấy chính hiệu. Mê trà sữa, xem phim và đạp xe ven hồ 🚴',
    },
    preferences: { lookingFor: 'male', ageMin: 22, ageMax: 32, maxDistanceKm: 15, relationshipType: 'LongTerm' },
    photos: ['https://picsum.photos/seed/huong1/400/600', 'https://picsum.photos/seed/huong2/400/600'],
    interests: [{ questionId: 'q_hobby', selectedOptions: ['cycling', 'movies'] }, { questionId: 'q_music', selectedOptions: ['vpop', 'kpop'] }],
    location: { lat: 21.0338, lng: 105.7922 }, // Cầu Giấy
  },
  {
    phone: { code: '84', number: '912000002' },
    profile: {
      displayName: 'Việt',
      birthDate: '1996-11-15',
      zodiac: 'Scorpio',
      gender: 'male',
      bio: 'Kỹ sư phần mềm tại Duy Tân. Hay uống cà phê ở vỉa hè và đọc tech blog ☕',
    },
    preferences: { lookingFor: 'female', ageMin: 22, ageMax: 30, maxDistanceKm: 20, relationshipType: 'LongTerm' },
    photos: ['https://picsum.photos/seed/viet1/400/600', 'https://picsum.photos/seed/viet2/400/600'],
    interests: [{ questionId: 'q_hobby', selectedOptions: ['coffee', 'reading'] }, { questionId: 'q_pet', selectedOptions: ['cat'] }],
    location: { lat: 21.0285, lng: 105.7837 }, // Duy Tân
  },
  {
    phone: { code: '84', number: '912000003' },
    profile: {
      displayName: 'Phương',
      birthDate: '2001-06-10',
      zodiac: 'Gemini',
      gender: 'female',
      bio: 'Sinh viên ngoại thương. Cuối tuần hay ra Mỹ Đình xem bóng đá 🏟️',
    },
    preferences: { lookingFor: 'male', ageMin: 21, ageMax: 28, maxDistanceKm: 10, relationshipType: 'ShortTerm' },
    photos: ['https://picsum.photos/seed/phuong1/400/600', 'https://picsum.photos/seed/phuong2/400/600', 'https://picsum.photos/seed/phuong3/400/600'],
    interests: [{ questionId: 'q_hobby', selectedOptions: ['football', 'travel'] }, { questionId: 'q_music', selectedOptions: ['vpop', 'r&b'] }],
    location: { lat: 21.0240, lng: 105.7840 }, // Mỹ Đình
  },
  {
    phone: { code: '84', number: '912000004' },
    profile: {
      displayName: 'Trung',
      birthDate: '1995-08-30',
      zodiac: 'Virgo',
      gender: 'male',
      bio: 'Product manager. Hay loanh quanh quán cà phê Nghĩa Tân cuối tuần 📱',
    },
    preferences: { lookingFor: 'female', ageMin: 23, ageMax: 31, maxDistanceKm: 20, relationshipType: 'LongTerm' },
    photos: ['https://picsum.photos/seed/trung1/400/600'],
    interests: [{ questionId: 'q_hobby', selectedOptions: ['coffee', 'boardgame'] }, { questionId: 'q_pet', selectedOptions: ['dog'] }],
    location: { lat: 21.0413, lng: 105.7901 }, // Nghĩa Tân
  },
  {
    phone: { code: '84', number: '912000005' },
    profile: {
      displayName: 'Lan',
      birthDate: '1998-12-25',
      zodiac: 'Capricorn',
      gender: 'female',
      bio: 'Làm marketing tại Mai Dịch. Ghiền chạy bộ sáng sớm quanh công viên 🌅',
    },
    preferences: { lookingFor: 'male', ageMin: 24, ageMax: 33, maxDistanceKm: 15, relationshipType: 'LongTerm' },
    photos: ['https://picsum.photos/seed/lan1/400/600', 'https://picsum.photos/seed/lan2/400/600'],
    interests: [{ questionId: 'q_hobby', selectedOptions: ['running', 'coffee'] }, { questionId: 'q_music', selectedOptions: ['acoustic', 'indie'] }],
    location: { lat: 21.0445, lng: 105.7783 }, // Mai Dịch
  },
  {
    phone: { code: '84', number: '912000006' },
    profile: {
      displayName: 'Nam',
      birthDate: '1994-04-14',
      zodiac: 'Aries',
      gender: 'male',
      bio: 'Kiến trúc sư. Hay chụp ảnh đường phố Hà Nội lúc sáng sớm 🏙️',
    },
    preferences: { lookingFor: 'female', ageMin: 22, ageMax: 30, maxDistanceKm: 25, relationshipType: 'Friends' },
    photos: ['https://picsum.photos/seed/nam1/400/600', 'https://picsum.photos/seed/nam2/400/600'],
    interests: [{ questionId: 'q_hobby', selectedOptions: ['photography', 'art'] }, { questionId: 'q_pet', selectedOptions: ['cat'] }],
    location: { lat: 21.0374, lng: 105.7857 }, // Dịch Vọng
  },
  {
    phone: { code: '84', number: '912000007' },
    profile: {
      displayName: 'Thùy',
      birthDate: '2000-09-18',
      zodiac: 'Virgo',
      gender: 'female',
      bio: 'Designer freelance. Nghe nhạc indie và vẽ watercolor khi rảnh 🎨',
    },
    preferences: { lookingFor: 'male', ageMin: 22, ageMax: 30, maxDistanceKm: 20, relationshipType: 'LongTerm' },
    photos: ['https://picsum.photos/seed/thuy1/400/600', 'https://picsum.photos/seed/thuy2/400/600'],
    interests: [{ questionId: 'q_hobby', selectedOptions: ['art', 'music'] }, { questionId: 'q_music', selectedOptions: ['indie', 'acoustic'] }],
    location: { lat: 21.0210, lng: 105.7790 }, // Mỹ Đình 2
  },
  {
    phone: { code: '84', number: '912000008' },
    profile: {
      displayName: 'Quân',
      birthDate: '1997-07-07',
      zodiac: 'Cancer',
      gender: 'male',
      bio: 'Trainer gym tại Cầu Giấy. Thích nấu ăn healthy và xem MMA 💪',
    },
    preferences: { lookingFor: 'female', ageMin: 21, ageMax: 30, maxDistanceKm: 15, relationshipType: 'ShortTerm' },
    photos: ['https://picsum.photos/seed/quan1/400/600', 'https://picsum.photos/seed/quan2/400/600'],
    interests: [{ questionId: 'q_hobby', selectedOptions: ['gym', 'cooking'] }, { questionId: 'q_pet', selectedOptions: ['dog'] }],
    location: { lat: 21.0398, lng: 105.7933 }, // Quan Hoa
  },
  {
    phone: { code: '84', number: '912000009' },
    profile: {
      displayName: 'Nhung',
      birthDate: '1999-01-31',
      zodiac: 'Aquarius',
      gender: 'female',
      bio: 'HR tại công ty công nghệ phố Duy Tân. Mê đọc sách và leo núi 🏔️',
    },
    preferences: { lookingFor: 'male', ageMin: 24, ageMax: 32, maxDistanceKm: 20, relationshipType: 'LongTerm' },
    photos: ['https://picsum.photos/seed/nhung1/400/600', 'https://picsum.photos/seed/nhung2/400/600', 'https://picsum.photos/seed/nhung3/400/600'],
    interests: [{ questionId: 'q_hobby', selectedOptions: ['hiking', 'reading'] }, { questionId: 'q_pet', selectedOptions: ['none'] }],
    location: { lat: 21.0302, lng: 105.7852 }, // Duy Tân / Trần Thái Tông
  },
  {
    phone: { code: '84', number: '912000010' },
    profile: {
      displayName: 'Hải',
      birthDate: '1993-05-05',
      zodiac: 'Taurus',
      gender: 'male',
      bio: 'Founder startup EdTech. Hay ngồi làm việc ở cà phê Cầu Giấy cả ngày 💻',
    },
    preferences: { lookingFor: 'female', ageMin: 23, ageMax: 32, maxDistanceKm: 30, relationshipType: 'LongTerm' },
    photos: ['https://picsum.photos/seed/hai1/400/600', 'https://picsum.photos/seed/hai2/400/600'],
    interests: [{ questionId: 'q_hobby', selectedOptions: ['coffee', 'travel'] }, { questionId: 'q_pet', selectedOptions: ['cat'] }],
    location: { lat: 21.0352, lng: 105.7910 }, // Cầu Giấy gần ĐHQG
  },
  {
    phone: { code: '84', number: '912000011' },
    profile: {
      displayName: 'Vy',
      birthDate: '2001-11-20',
      zodiac: 'Scorpio',
      gender: 'female',
      bio: 'Sinh viên ĐHBK Hà Nội. Nghiện gaming và cosplay vào cuối tuần 🎮',
    },
    preferences: { lookingFor: 'male', ageMin: 20, ageMax: 27, maxDistanceKm: 10, relationshipType: 'Friends' },
    photos: ['https://picsum.photos/seed/vy1/400/600'],
    interests: [{ questionId: 'q_hobby', selectedOptions: ['gaming', 'art'] }, { questionId: 'q_music', selectedOptions: ['edm', 'kpop'] }],
    location: { lat: 21.0480, lng: 105.7820 }, // Cổ Nhuế
  },
  {
    phone: { code: '84', number: '912000012' },
    profile: {
      displayName: 'Tùng',
      birthDate: '1996-02-14',
      zodiac: 'Aquarius',
      gender: 'male',
      bio: 'Bác sĩ tại BV Đại học Y. Thích bơi lội và chơi guitar acoustic 🎸',
    },
    preferences: { lookingFor: 'female', ageMin: 23, ageMax: 31, maxDistanceKm: 20, relationshipType: 'LongTerm' },
    photos: ['https://picsum.photos/seed/tung1/400/600', 'https://picsum.photos/seed/tung2/400/600'],
    interests: [{ questionId: 'q_hobby', selectedOptions: ['swimming', 'music'] }, { questionId: 'q_music', selectedOptions: ['acoustic', 'indie'] }],
    location: { lat: 21.0175, lng: 105.7755 }, // Mỹ Đình / Hà Đình
  },
  {
    phone: { code: '84', number: '912000013' },
    profile: {
      displayName: 'Châu',
      birthDate: '1998-10-10',
      zodiac: 'Libra',
      gender: 'female',
      bio: 'Content writer. Viết blog du lịch và thích khám phá quán ăn ngõ nhỏ Hà Nội 🍜',
    },
    preferences: { lookingFor: 'male', ageMin: 23, ageMax: 32, maxDistanceKm: 20, relationshipType: 'LongTerm' },
    photos: ['https://picsum.photos/seed/chau1/400/600', 'https://picsum.photos/seed/chau2/400/600'],
    interests: [{ questionId: 'q_hobby', selectedOptions: ['travel', 'foodie'] }, { questionId: 'q_music', selectedOptions: ['vpop', 'acoustic'] }],
    location: { lat: 21.0264, lng: 105.7961 }, // Láng Hạ / Cầu Giấy border
  },
  {
    phone: { code: '84', number: '912000014' },
    profile: {
      displayName: 'Dũng',
      birthDate: '1995-06-20',
      zodiac: 'Gemini',
      gender: 'male',
      bio: 'Data engineer. Thích đạp xe Hồ Tây sáng Chủ Nhật và uống bia hơi vỉa hè 🚴',
    },
    preferences: { lookingFor: 'female', ageMin: 22, ageMax: 30, maxDistanceKm: 25, relationshipType: 'ShortTerm' },
    photos: ['https://picsum.photos/seed/dung1/400/600', 'https://picsum.photos/seed/dung2/400/600'],
    interests: [{ questionId: 'q_hobby', selectedOptions: ['cycling', 'foodie'] }, { questionId: 'q_pet', selectedOptions: ['none'] }],
    location: { lat: 21.0430, lng: 105.7870 }, // Nghĩa Đô
  },
  {
    phone: { code: '84', number: '912000015' },
    profile: {
      displayName: 'Liên',
      birthDate: '2000-04-04',
      zodiac: 'Aries',
      gender: 'female',
      bio: 'Giáo viên yoga tại Mỹ Đình. Sống chậm, ăn sạch, ngủ đủ giấc 🧘',
    },
    preferences: { lookingFor: 'male', ageMin: 23, ageMax: 32, maxDistanceKm: 15, relationshipType: 'LongTerm' },
    photos: ['https://picsum.photos/seed/lien1/400/600', 'https://picsum.photos/seed/lien2/400/600'],
    interests: [{ questionId: 'q_hobby', selectedOptions: ['yoga', 'cooking'] }, { questionId: 'q_music', selectedOptions: ['acoustic', 'classical'] }],
    location: { lat: 21.0195, lng: 105.7810 }, // Mỹ Đình / Phạm Hùng
  },
];
