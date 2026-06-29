import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request);

    const paymentRequests = await prisma.paymentRequest.findMany({
      where: {
        userId: authUser.userId,
        status: 'PENDING',
      },
      include: {
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(paymentRequests);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Get my requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment requests' },
      { status: 500 }
    );
  }
}
