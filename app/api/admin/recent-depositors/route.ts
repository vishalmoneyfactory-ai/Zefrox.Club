import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const usersWithRecentDeposits = await prisma.user.findMany({
      where: {
        payments: {
          some: {
            status: 'APPROVED',
            reviewedAt: { gte: sevenDaysAgo },
          },
        },
      },
      include: {
        tradingAccounts: true,
        payments: {
          where: {
            status: 'APPROVED',
            reviewedAt: { gte: sevenDaysAgo },
          },
          orderBy: {
            reviewedAt: 'desc',
          },
        },
      },
    });

    const data = usersWithRecentDeposits.map(user => {
      const recentDepositTotal = user.payments.reduce((sum, p) => sum + p.amount, 0);
      const latestDepositDate = user.payments[0]?.reviewedAt || user.payments[0]?.submittedAt;

      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        recentDepositTotal,
        latestDepositDate,
        accounts: user.tradingAccounts.map(acc => ({
          id: acc.id,
          mt5Id: acc.mt5Id,
          type: acc.type,
          balance: acc.balance,
        })),
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Failed to fetch recent depositors:', error);
    return NextResponse.json({ error: 'Failed to fetch recent depositors' }, { status: 500 });
  }
}
