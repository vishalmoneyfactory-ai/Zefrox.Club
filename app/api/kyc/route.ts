import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { notifyAdmins } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const authUser = requireAuth(request);

    const formData = await request.formData();
    const fullName = formData.get('fullName') as string;
    const address = (formData.get('address') as string) || '';
    const upiId = formData.get('upiId') as string;
    const bankAccount = (formData.get('bankAccount') as string) || '';
    const ifscCode = (formData.get('ifscCode') as string) || '';
    const aadhaarNumber = formData.get('aadhaarNumber') as string;
    const aadhaarPhoto = formData.get('aadhaarPhoto') as File | null;
    const selfie = formData.get('selfie') as File | null;

    if (!fullName || !upiId || !aadhaarNumber) {
      return NextResponse.json(
        { error: 'All required text fields must be provided' },
        { status: 400 }
      );
    }

    const existingKyc = await prisma.kyc.findUnique({
      where: { userId: authUser.userId },
    });

    if (!existingKyc && (!selfie || !aadhaarPhoto)) {
      return NextResponse.json(
        { error: 'Both Selfie and Aadhaar Photo are required for new submissions' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    
    let finalSelfieUrl = existingKyc?.selfieUrl || '';
    let finalAadhaarPhotoUrl = existingKyc?.aadhaarPhotoUrl || '';

    if (selfie) {
      if (!allowedTypes.includes(selfie.type)) {
        return NextResponse.json({ error: 'Invalid selfie file type' }, { status: 400 });
      }
      if (selfie.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Selfie must be under 5MB' }, { status: 400 });
      const selfieBuffer = Buffer.from(await selfie.arrayBuffer());
      finalSelfieUrl = await uploadToCloudinary(selfieBuffer, 'kyc');
    }

    if (aadhaarPhoto) {
      if (!allowedTypes.includes(aadhaarPhoto.type)) {
        return NextResponse.json({ error: 'Invalid Aadhaar photo file type' }, { status: 400 });
      }
      if (aadhaarPhoto.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Aadhaar photo must be under 5MB' }, { status: 400 });
      const aadhaarBuffer = Buffer.from(await aadhaarPhoto.arrayBuffer());
      finalAadhaarPhotoUrl = await uploadToCloudinary(aadhaarBuffer, 'kyc');
    }

    const kycData = {
      fullName,
      address,
      upiId,
      bankAccount,
      ifscCode,
      aadhaarNumber,
      aadhaarPhotoUrl: finalAadhaarPhotoUrl,
      selfieUrl: finalSelfieUrl,
      status: 'APPROVED' as const,
      rejectionReason: null,
      reviewedAt: new Date(),
    };

    if (existingKyc) {
      await prisma.kyc.update({
        where: { userId: authUser.userId },
        data: kycData,
      });
    } else {
      await prisma.kyc.create({
        data: {
          ...kycData,
          userId: authUser.userId,
        },
      });
    }

    const user = await prisma.user.findUnique({ where: { id: authUser.userId } });
    await notifyAdmins('NEW_KYC', `New KYC submission from ${user?.fullName || 'a user'}`);

    return NextResponse.json({ message: 'KYC submitted successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('KYC submit error:', error);
    return NextResponse.json(
      { error: 'Failed to submit KYC' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request);

    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');

    if (all === 'true') {
      requireAdmin(request);

      const status = searchParams.get('status');
      const where = status
        ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' }
        : {};

      const kycRecords = await prisma.kyc.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      });

      return NextResponse.json(kycRecords);
    }

    const kyc = await prisma.kyc.findUnique({
      where: { userId: authUser.userId },
    });

    return NextResponse.json(kyc);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Get KYC error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KYC' },
      { status: 500 }
    );
  }
}
