import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const authUser = requireAuth(request);

    const kyc = await prisma.kyc.findUnique({
      where: { userId: authUser.userId },
    });

    if (!kyc || kyc.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'KYC must be approved before making a payment' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const amountStr = formData.get('amount') as string;
    const screenshot = formData.get('screenshot') as File | null;
    
    if (!amountStr || isNaN(Number(amountStr)) || Number(amountStr) <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }
    const amount = Number(amountStr);

    if (!screenshot) {
      return NextResponse.json(
        { error: 'Screenshot is required' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(screenshot.type)) {
      return NextResponse.json(
        { error: 'Only JPG, JPEG, and PNG files are allowed' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (screenshot.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    const arrayBuffer = await screenshot.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const screenshotUrl = await uploadToCloudinary(buffer, 'payment-proofs');

    const result = await prisma.$transaction(async (tx) => {
      const paymentRequest = await tx.paymentRequest.create({
        data: {
          userId: authUser.userId,
          amount,
          status: 'COMPLETED',
        },
      });

      const payment = await tx.payment.create({
        data: {
          userId: authUser.userId,
          paymentRequestId: paymentRequest.id,
          amount,
          screenshotUrl,
          status: 'PROOF_UPLOADED',
        },
      });

      return payment;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Direct payment error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
