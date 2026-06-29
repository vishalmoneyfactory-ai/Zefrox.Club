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
        { error: 'KYC must be approved before uploading payment proof' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const paymentRequestId = formData.get('paymentRequestId') as string;
    const screenshot = formData.get('screenshot') as File | null;

    if (!paymentRequestId) {
      return NextResponse.json(
        { error: 'Payment request ID is required' },
        { status: 400 }
      );
    }

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

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: paymentRequestId },
    });

    if (!paymentRequest) {
      return NextResponse.json(
        { error: 'Payment request not found' },
        { status: 404 }
      );
    }

    if (paymentRequest.userId !== authUser.userId) {
      return NextResponse.json(
        { error: 'This payment request does not belong to you' },
        { status: 403 }
      );
    }

    if (paymentRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This payment request is no longer pending' },
        { status: 400 }
      );
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { paymentRequestId },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment proof already uploaded for this request' },
        { status: 400 }
      );
    }

    const arrayBuffer = await screenshot.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const screenshotUrl = await uploadToCloudinary(buffer, 'payment-proofs');

    const payment = await prisma.payment.create({
      data: {
        userId: authUser.userId,
        paymentRequestId,
        amount: paymentRequest.amount,
        screenshotUrl,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Upload proof error:', error);
    return NextResponse.json(
      { error: 'Failed to upload payment proof' },
      { status: 500 }
    );
  }
}
