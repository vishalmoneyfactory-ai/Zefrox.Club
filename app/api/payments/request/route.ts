import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);

    const { userId, amount } = await request.json();

    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'User ID and amount are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        userId,
        amount,
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        type: 'PAYMENT_REQUEST',
        message: `Payment request of ₹${amount} has been created`,
      },
    });

    return NextResponse.json(paymentRequest, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Create payment request error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment request' },
      { status: 500 }
    );
  }
}
