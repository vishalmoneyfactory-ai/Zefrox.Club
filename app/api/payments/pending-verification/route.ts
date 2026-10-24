import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);

    const payments = await prisma.payment.findMany({
      where: { status: 'PROOF_UPLOADED' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            totalPaid: true,
          },
        },
        paymentRequest: true,
        account: true,
      },
      orderBy: { submittedAt: 'asc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Get pending verification error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending payments' },
      { status: 500 }
    );
  }
}
