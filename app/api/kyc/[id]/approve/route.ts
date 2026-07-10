import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { sendKycApprovedEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(request);
    const { id } = params;

    await prisma.kyc.update({
      where: { id },
      data: {
        status: 'APPROVED',
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
          type: 'KYC_APPROVED',
          message:
            'Your KYC verification has been approved. You can now upload payment proofs.',
        },
      });

      await sendKycApprovedEmail(kyc.user.email, kyc.user.fullName);
    }

    return NextResponse.json({ message: 'KYC approved successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('KYC approve error:', error);
    return NextResponse.json(
      { error: 'Failed to approve KYC' },
      { status: 500 }
    );
  }
}
