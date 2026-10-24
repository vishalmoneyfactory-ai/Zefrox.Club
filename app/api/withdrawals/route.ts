import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, requireAuth } from '@/lib/auth';
import { notifyAdmins } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { accountId, amount, method, bankAccount, bankName, ifscCode, upiId } = body;

    if (!accountId || !amount || !method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (amount < 100) {
      return NextResponse.json({ error: 'Minimum withdrawal amount is ₹100' }, { status: 400 });
    }

    const account = await prisma.tradingAccount.findUnique({
      where: { id: accountId },
    });

    if (!account || account.userId !== authUser.userId) {
      return NextResponse.json({ error: 'Account not found or unauthorized' }, { status: 404 });
    }

    if (account.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: authUser.userId,
        accountId: account.id,
        amount,
        method,
        bankAccount,
        bankName,
        ifscCode,
        upiId,
        status: 'PENDING',
      },
    });

    const user = await prisma.user.findUnique({ where: { id: authUser.userId } });
    await notifyAdmins('NEW_WITHDRAWAL', `New withdrawal request of ₹${amount} from ${user?.fullName || 'a user'}`);

    return NextResponse.json(withdrawal, { status: 201 });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request);

    if (authUser.role === 'ADMIN') {
      const withdrawals = await prisma.withdrawal.findMany({
        include: {
          user: {
            select: { fullName: true, email: true },
          },
          account: {
            select: { mt5Id: true, type: true, plan: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(withdrawals);
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    const userWhere: Record<string, unknown> = { userId: authUser.userId };
    if (accountId) {
      userWhere.accountId = accountId;
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: userWhere,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(withdrawals);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Fetch withdrawals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
