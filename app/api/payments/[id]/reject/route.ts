import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { sendPaymentRejectedEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request);
    const { id } = await params;
    const { reason } = await request.json();

    if (!reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    await prisma.payment.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: payment.userId,
        type: 'PAYMENT_REJECTED',
        message: `Your payment of ₹${payment.amount} has been rejected. Reason: ${reason}`,
      },
    });

    await sendPaymentRejectedEmail(
      payment.user.email,
      payment.user.fullName,
      payment.amount,
      reason
    );

    return NextResponse.json({ message: 'Payment rejected successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Reject payment error:', error);
    return NextResponse.json(
      { error: 'Failed to reject payment' },
      { status: 500 }
    );
  }
}
