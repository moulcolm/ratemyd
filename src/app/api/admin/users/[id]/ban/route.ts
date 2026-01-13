import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { banUserSchema } from '@/lib/validators';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const validationResult = banUserSchema.safeParse({ userId: id, ...body });
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { action, reason } = validationResult.data;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Prevent banning admins
    if (user.isAdmin && action === 'BAN') {
      return NextResponse.json(
        { error: 'Impossible de bannir un administrateur' },
        { status: 400 }
      );
    }

    if (action === 'BAN') {
      await prisma.$transaction([
        prisma.user.update({
          where: { id },
          data: {
            isBanned: true,
            banReason: reason,
            bannedAt: new Date(),
          },
        }),
        prisma.moderationLog.create({
          data: {
            adminId: admin.id,
            action: 'BAN_USER',
            note: `Utilisateur banni: ${user.username}. Raison: ${reason}`,
          },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.user.update({
          where: { id },
          data: {
            isBanned: false,
            banReason: null,
            bannedAt: null,
          },
        }),
        prisma.moderationLog.create({
          data: {
            adminId: admin.id,
            action: 'UNBAN_USER',
            note: `Utilisateur débanni: ${user.username}`,
          },
        }),
      ]);
    }

    return NextResponse.json({
      success: true,
      message: action === 'BAN' ? 'Utilisateur banni' : 'Utilisateur débanni',
    });
  } catch (error) {
    console.error('Ban user error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
