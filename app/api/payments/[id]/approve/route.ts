import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { sendPaymentApprovedEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request);
    const { id } = await params;

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

    await prisma.$transaction([
      prisma.payment.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
        },
      }),
      prisma.paymentRequest.update({
        where: { id: payment.paymentRequestId },
        data: { status: 'COMPLETED' },
      }),
      prisma.user.update({
        where: { id: payment.userId },
        data: {
          totalPaid: { increment: payment.amount },
        },
      }),
      prisma.notification.create({
        data: {
          userId: payment.userId,
          type: 'PAYMENT_APPROVED',
          message: `Your payment of ₹${payment.amount} has been approved.`,
        },
      }),
    ]);

    await sendPaymentApprovedEmail(
      payment.user.email,
      payment.user.fullName,
      payment.amount,
      payment.transactionId
    );

    return NextResponse.json({ message: 'Payment approved successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Approve payment error:', error);
    return NextResponse.json(
      { error: 'Failed to approve payment' },
      { status: 500 }
    );
  }
}
