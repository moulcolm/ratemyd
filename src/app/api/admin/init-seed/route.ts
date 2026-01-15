import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, SubscriptionTier } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ENDPOINT TEMPORAIRE - À SUPPRIMER APRÈS UTILISATION
// Cet endpoint n'est pas protégé pour permettre le seed initial

export async function POST(req: NextRequest) {
  try {
    // Vérifier si des utilisateurs existent déjà
    const existingUsers = await prisma.user.count();

    if (existingUsers > 0) {
      return NextResponse.json(
        { error: 'Database already seeded. Users exist. Delete this endpoint for security.' },
        { status: 403 }
      );
    }

    console.log('🌱 Starting initial seed...');

    // Create achievements
    const achievements = [
      { code: 'first_vote', name: 'Premier vote', description: 'Votez pour la première fois', category: 'votes' },
      { code: 'voter_100', name: 'Voteur assidu', description: 'Votez 100 fois', category: 'votes' },
      { code: 'voter_1000', name: 'Voteur expert', description: 'Votez 1000 fois', category: 'votes' },
      { code: 'first_photo', name: 'Première photo', description: 'Uploadez votre première photo', category: 'photos' },
      { code: 'collector_5', name: 'Collectionneur', description: 'Ayez 5 photos approuvées', category: 'photos' },
      { code: 'first_win', name: 'Première victoire', description: 'Gagnez votre premier duel', category: 'wins' },
      { code: 'winner_100', name: 'Conquérant', description: 'Gagnez 100 duels', category: 'wins' },
      { code: 'winner_500', name: 'Champion', description: 'Gagnez 500 duels', category: 'wins' },
      { code: 'legend_1500', name: 'Légende', description: 'Atteignez 1500 ELO', category: 'elo' },
      { code: 'verified', name: 'Vérifié', description: 'Faites vérifier une photo', category: 'verification' },
      { code: 'premium', name: 'Premium', description: 'Souscrivez à Premium', category: 'subscription' },
      { code: 'vip', name: 'VIP', description: 'Souscrivez à VIP', category: 'subscription' },
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
        subscriptionTier: SubscriptionTier.VIP,
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
        subscriptionTier: SubscriptionTier.FREE,
      },
    });

    const testUser2 = await prisma.user.upsert({
      where: { email: 'user2@test.com' },
      update: {},
      create: {
        email: 'user2@test.com',
        username: 'premium_user',
        hashedPassword: testPassword,
        dateOfBirth: new Date('1992-08-20'),
        subscriptionTier: SubscriptionTier.PREMIUM,
      },
    });

    const testUser3 = await prisma.user.upsert({
      where: { email: 'user3@test.com' },
      update: {},
      create: {
        email: 'user3@test.com',
        username: 'vip_user',
        hashedPassword: testPassword,
        dateOfBirth: new Date('1988-12-10'),
        subscriptionTier: SubscriptionTier.VIP,
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
        totalPremium: 1,
        totalVip: 2,
      },
    });
    console.log('✅ Global stats initialized');

    console.log('🎉 Initial seed completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully. IMPORTANT: Delete this endpoint immediately for security!',
      warning: 'DELETE /api/admin/init-seed/route.ts NOW',
      users: [
        { email: 'admin@ratemyd.com', password: 'admin123456', tier: 'VIP', isAdmin: true },
        { email: 'user1@test.com', password: 'test123456', tier: 'FREE' },
        { email: 'user2@test.com', password: 'test123456', tier: 'PREMIUM' },
        { email: 'user3@test.com', password: 'test123456', tier: 'VIP' },
      ],
    });
  } catch (error) {
    console.error('❌ Seed error:', error);
    return NextResponse.json(
      { error: 'Seed failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
