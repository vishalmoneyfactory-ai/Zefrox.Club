import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    const accounts = await prisma.tradingAccount.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ accounts });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { type, plan } = body;

    if (type === 'DEMO') {
      return NextResponse.json(
        { error: 'You cannot create this account' },
        { status: 400 }
      );
    }

    if (type !== 'LIVE') {
      return NextResponse.json({ error: 'Invalid account type' }, { status: 400 });
    }

    if (!['Standard', 'Premium', 'Platinum'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const account = await prisma.tradingAccount.create({
      data: {
        userId: user.userId,
        type: 'LIVE',
        plan,
        balance: 0,
        equity: 0,
        margin: 0,
        mt5Id: '',
        mt5Password: '',
        server: ''
      }
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}
