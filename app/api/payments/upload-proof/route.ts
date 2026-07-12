import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { notifyAdmins } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

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
    const accountId = formData.get('accountId') as string;
    const amountStr = formData.get('amount') as string;
    const screenshot = formData.get('screenshot') as File | null;
    const upiApp = formData.get('upiApp') as string | null;

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }
    if (!amountStr || isNaN(Number(amountStr)) || Number(amountStr) <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }
    if (!screenshot) {
      return NextResponse.json({ error: 'Screenshot is required' }, { status: 400 });
    }

    const amount = Number(amountStr);
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(screenshot.type)) {
      return NextResponse.json({ error: 'Only JPG, JPEG, and PNG files are allowed' }, { status: 400 });
    }
    if (screenshot.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    const account = await prisma.tradingAccount.findUnique({
      where: { id: accountId },
    });

    if (!account || account.userId !== authUser.userId) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const arrayBuffer = await screenshot.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const screenshotUrl = await uploadToCloudinary(buffer, 'payment-proofs');

    // Create a PaymentRequest and Payment simultaneously since user is initiating
    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        userId: authUser.userId,
        accountId: account.id,
        amount,
        status: 'PENDING',
      },
    });

    const payment = await prisma.payment.create({
      data: {
        userId: authUser.userId,
        accountId: account.id,
        paymentRequestId: paymentRequest.id,
        amount,
        screenshotUrl,
        upiApp,
        status: 'PROOF_UPLOADED',
      },
    });

    const user = await prisma.user.findUnique({ where: { id: authUser.userId } });
    await notifyAdmins('NEW_DEPOSIT', `New deposit proof of ₹${amount} uploaded by ${user?.fullName || 'a user'}`);

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Upload proof error:', error);
    return NextResponse.json(
      { error: 'Failed to upload payment proof' },
      { status: 500 }
    );
  }
}
