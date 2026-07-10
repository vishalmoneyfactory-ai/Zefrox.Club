import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, requireAuth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(request);
    const { id } = params;
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const { id } = params;

    const account = await prisma.tradingAccount.findUnique({ where: { id } });
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    if (account.userId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { accountId: id } }),
      prisma.paymentRequest.deleteMany({ where: { accountId: id } }),
      prisma.tradingAccount.delete({ where: { id } })
    ]);

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
