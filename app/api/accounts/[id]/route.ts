import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const { balance, mt5Id, mt5Password, server } = body;

    const dataToUpdate: any = {};
    if (balance !== undefined) dataToUpdate.balance = Number(balance);
    if (mt5Id !== undefined) dataToUpdate.mt5Id = mt5Id;
    if (mt5Password !== undefined) dataToUpdate.mt5Password = mt5Password;
    if (server !== undefined) dataToUpdate.server = server;

    const updatedAccount = await prisma.tradingAccount.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedAccount);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Update account error:', error);
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    );
  }
}
