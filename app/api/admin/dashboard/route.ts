import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);

    const now = new Date();
    const todayStart = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0,
        0
      )
    );
    const todayEnd = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        23,
        59,
        59,
        999
      )
    );

    const [
      totalUsers,
      totalRegularUsers,
      pendingKyc,
      pendingPayments,
      approvedPayments,
      todayApprovedPayments,
      allApprovedPayments,
      pendingRequestsAmount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.kyc.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'PROOF_UPLOADED' } }),
      prisma.payment.count({ where: { status: 'APPROVED' } }),
      prisma.payment.aggregate({
        where: {
          status: 'APPROVED',
          reviewedAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true },
      }),
      prisma.paymentRequest.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      }),
    ]);

    const paidTodayUsers = await prisma.user.findMany({
      where: {
        role: 'USER',
        payments: {
          some: {
            status: 'APPROVED',
            reviewedAt: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        totalPaid: true,
      },
    });

    const notPaidTodayUsers = await prisma.user.findMany({
      where: {
        role: 'USER',
        payments: {
          none: {
            status: 'APPROVED',
            reviewedAt: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        totalPaid: true,
      },
    });

    return NextResponse.json({
      totalUsers,
      totalRegularUsers,
      pendingKyc,
      pendingPayments,
      approvedPayments,
      todayApprovedAmount: todayApprovedPayments._sum.amount || 0,
      totalApprovedAmount: allApprovedPayments._sum.amount || 0,
      pendingRequestsAmount: pendingRequestsAmount._sum.amount || 0,
      paidTodayUsers,
      notPaidTodayUsers,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
