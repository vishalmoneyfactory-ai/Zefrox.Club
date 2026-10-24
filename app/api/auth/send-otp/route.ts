import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOtp, getOtpExpiry } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, phone } = await request.json();

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { error: 'Full name, email, and phone are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({ where: { email } });

    if (existingUser) {
      await prisma.user.update({
        where: { email },
        data: { fullName, phone },
      });
    } else {
      await prisma.user.create({
        data: { fullName, email, phone },
      });
    }

    await prisma.otp.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.otp.create({
      data: {
        email,
        code: hashedOtp,
        expiresAt: getOtpExpiry(),
      },
    });

    await sendOtpEmail(email, otp, fullName);

    return NextResponse.json({ message: 'OTP sent to your email' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
