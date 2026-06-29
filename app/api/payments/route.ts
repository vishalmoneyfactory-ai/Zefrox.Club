import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request);

    if (authUser.role === 'ADMIN') {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const userId = searchParams.get('userId');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const search = searchParams.get('search');

      const where: Record<string, unknown> = {};

      if (status) {
        where.status = status;
      }
      if (userId) {
        where.userId = userId;
      }
      if (startDate || endDate) {
        where.submittedAt = {};
        if (startDate) {
          (where.submittedAt as Record<string, unknown>).gte = new Date(
            startDate
          );
        }
        if (endDate) {
          (where.submittedAt as Record<string, unknown>).lte = new Date(
            endDate
          );
        }
      }
      if (search) {
        where.user = {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        };
      }

      const payments = await prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          paymentRequest: true,
        },
        orderBy: { submittedAt: 'desc' },
      });

      return NextResponse.json(payments);
    }

    const payments = await prisma.payment.findMany({
      where: { userId: authUser.userId },
      include: {
        paymentRequest: true,
      },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Get payments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
