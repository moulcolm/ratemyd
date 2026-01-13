import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getRemainingVotes } from '@/lib/matchmaking';

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const remaining = await getRemainingVotes(user.id);

    return NextResponse.json({
      success: true,
      data: remaining,
    });
  } catch (error) {
    console.error('Get remaining votes error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
