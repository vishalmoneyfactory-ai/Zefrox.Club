import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);
    
    const body = await request.json();
    const updates = body.updates;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    await prisma.$transaction(
      updates.map((update: { accountId: string; newBalance: number }) => 
        prisma.tradingAccount.update({
          where: { id: update.accountId },
          data: { balance: update.newBalance },
        })
      )
    );

    return NextResponse.json({ message: 'Balances updated successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Failed to bulk update balances:', error);
    return NextResponse.json({ error: 'Failed to update balances' }, { status: 500 });
  }
}
