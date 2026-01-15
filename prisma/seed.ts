import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create achievements
  const achievements = [
    { code: 'first_vote', name: 'Premier vote', description: 'Votez pour la première fois', category: 'votes' },
    { code: 'voter_100', name: 'Voteur assidu', description: 'Votez 100 fois', category: 'votes' },
    { code: 'voter_1000', name: 'Voteur expert', description: 'Votez 1000 fois', category: 'votes' },
    { code: 'first_photo', name: 'Première photo', description: 'Uploadez votre première photo', category: 'photos' },
    { code: 'collector_4', name: 'Collectionneur', description: 'Ayez 4 photos approuvées', category: 'photos' },
    { code: 'first_win', name: 'Première victoire', description: 'Gagnez votre premier duel', category: 'wins' },
    { code: 'winner_100', name: 'Conquérant', description: 'Gagnez 100 duels', category: 'wins' },
    { code: 'winner_500', name: 'Champion', description: 'Gagnez 500 duels', category: 'wins' },
    { code: 'legend_1500', name: 'Légende', description: 'Atteignez 1500 ELO', category: 'elo' },
    { code: 'verified', name: 'Vérifié', description: 'Faites vérifier une photo', category: 'verification' },
    { code: 'grower', name: 'Grower', description: 'Ayez une photo repos et érection', category: 'photos' },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement,
    });
  }
  console.log('✅ Achievements created');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ratemyd.com' },
    update: {},
    create: {
      email: 'admin@ratemyd.com',
      username: 'admin',
      hashedPassword: adminPassword,
      dateOfBirth: new Date('1990-01-01'),
      isAdmin: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create test users
  const testPassword = await bcrypt.hash('test123456', 12);

  const testUser1 = await prisma.user.upsert({
    where: { email: 'user1@test.com' },
    update: {},
    create: {
      email: 'user1@test.com',
      username: 'testuser1',
      hashedPassword: testPassword,
      dateOfBirth: new Date('1995-05-15'),
    },
  });

  const testUser2 = await prisma.user.upsert({
    where: { email: 'user2@test.com' },
    update: {},
    create: {
      email: 'user2@test.com',
      username: 'testuser2',
      hashedPassword: testPassword,
      dateOfBirth: new Date('1992-08-20'),
    },
  });

  const testUser3 = await prisma.user.upsert({
    where: { email: 'user3@test.com' },
    update: {},
    create: {
      email: 'user3@test.com',
      username: 'testuser3',
      hashedPassword: testPassword,
      dateOfBirth: new Date('1988-12-10'),
    },
  });

  console.log('✅ Test users created');

  // Initialize global stats
  await prisma.globalStats.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      totalUsers: 4,
      totalPhotos: 0,
      totalVotes: 0,
    },
  });
  console.log('✅ Global stats initialized');

  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📧 Test accounts:');
  console.log('   Admin: admin@ratemyd.com / admin123456');
  console.log('   User1: user1@test.com / test123456');
  console.log('   User2: user2@test.com / test123456');
  console.log('   User3: user3@test.com / test123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
