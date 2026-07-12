import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(request);

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: params.id },
      include: { account: true }
    });

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    if (withdrawal.status !== 'PENDING') {
      return NextResponse.json({ error: 'Withdrawal is already processed' }, { status: 400 });
    }

    if (withdrawal.account.balance < withdrawal.amount) {
      return NextResponse.json({ error: 'User does not have sufficient balance for this withdrawal' }, { status: 400 });
    }

    // Process the withdrawal
    await prisma.$transaction([
      prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
        },
      }),
      prisma.tradingAccount.update({
        where: { id: withdrawal.accountId },
        data: {
          balance: { decrement: withdrawal.amount },
          equity: { decrement: withdrawal.amount },
          margin: { decrement: withdrawal.amount },
        },
      }),
      prisma.notification.create({
        data: {
          userId: withdrawal.userId,
          type: 'WITHDRAWAL_APPROVED',
          message: `Your withdrawal request of ₹${withdrawal.amount} has been approved`,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Approve withdrawal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
