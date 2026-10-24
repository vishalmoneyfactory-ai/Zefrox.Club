import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { sendKycRejectedEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(request);
    const { id } = params;
    const { reason } = await request.json();

    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    await prisma.kyc.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedAt: new Date(),
      },
    });

    const kyc = await prisma.kyc.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (kyc) {
      await prisma.notification.create({
        data: {
          userId: kyc.userId,
          type: 'KYC_REJECTED',
          message: `Your KYC verification has been rejected. Reason: ${reason}`,
        },
      });

      await sendKycRejectedEmail(kyc.user.email, kyc.user.fullName, reason);
    }

    return NextResponse.json({ message: 'KYC rejected successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('KYC reject error:', error);
    return NextResponse.json(
      { error: 'Failed to reject KYC' },
      { status: 500 }
    );
  }
}
