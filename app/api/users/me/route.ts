import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request);

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: {
        kyc: {
          select: {
            id: true,
            status: true,
            selfieUrl: true,
            rejectionReason: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const unreadNotifications = await prisma.notification.count({
      where: {
        userId: authUser.userId,
        read: false,
      },
    });

    return NextResponse.json({
      ...user,
      kycStatus: user.kyc?.status || null,
      unreadNotifications,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
