import crypto from 'crypto';

export function generateOtp(): string {
  const otp = crypto.randomInt(100000, 999999);
  return otp.toString();
}

export function getOtpExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10);
  return expiry;
}
