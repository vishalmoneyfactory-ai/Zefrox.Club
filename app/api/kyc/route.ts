import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const authUser = requireAuth(request);

    const formData = await request.formData();
    const fullName = formData.get('fullName') as string;
    const address = formData.get('address') as string;
    const upiId = formData.get('upiId') as string;
    const bankAccount = formData.get('bankAccount') as string;
    const ifscCode = formData.get('ifscCode') as string;
    const aadhaarNumber = formData.get('aadhaarNumber') as string;
    const aadhaarPhoto = formData.get('aadhaarPhoto') as File | null;
    const selfie = formData.get('selfie') as File | null;

    if (!fullName || !address || !upiId || !bankAccount || !ifscCode || !aadhaarNumber) {
      return NextResponse.json(
        { error: 'All required text fields must be provided' },
        { status: 400 }
      );
    }

    if (!selfie || !aadhaarPhoto) {
      return NextResponse.json(
        { error: 'Both Selfie and Aadhaar Photo are required' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(selfie.type) || !allowedTypes.includes(aadhaarPhoto.type)) {
      return NextResponse.json(
        { error: 'Only JPG, JPEG, and PNG files are allowed' },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selfie.size > maxSize || aadhaarPhoto.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const selfieBuffer = Buffer.from(await selfie.arrayBuffer());
    const aadhaarBuffer = Buffer.from(await aadhaarPhoto.arrayBuffer());
    
    // Upload both to Cloudinary concurrently
    const [selfieUrl, aadhaarPhotoUrl] = await Promise.all([
      uploadToCloudinary(selfieBuffer, 'kyc'),
      uploadToCloudinary(aadhaarBuffer, 'kyc')
    ]);

    const existingKyc = await prisma.kyc.findUnique({
      where: { userId: authUser.userId },
    });

    const kycData = {
      fullName,
      address,
      upiId,
      bankAccount,
      ifscCode,
      aadhaarNumber,
      aadhaarPhotoUrl,
      selfieUrl,
      status: 'PENDING' as const,
      rejectionReason: null,
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
