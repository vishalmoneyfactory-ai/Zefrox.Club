import React from 'react';
import Link from 'next/link';

interface KycStatusBannerProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  rejectionReason?: string | null;
}

export default function KycStatusBanner({
  status,
  rejectionReason,
}: KycStatusBannerProps) {
  if (status === 'APPROVED') return null;

  if (!status) {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 flex items-start gap-3">
        <svg
          className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
        <div>
          <p className="text-sm font-medium">
            Complete your KYC verification to unlock payment features.
          </p>
          <Link
            href="/kyc"
            className="text-sm text-blue-600 font-semibold underline hover:text-blue-700 mt-1 inline-block"
          >
            Start KYC Verification →
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'PENDING') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 flex items-start gap-3">
        <svg
          className="h-5 w-5 flex-shrink-0 mt-0.5 text-yellow-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm font-medium">
          Your KYC verification is under review. This usually takes 1–2 business
          days.
        </p>
      </div>
    );
  }

  if (status === 'REJECTED') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start gap-3">
        <svg
          className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <p className="text-sm font-medium">Your KYC verification was rejected.</p>
          {rejectionReason && (
            <p className="text-sm mt-1 text-red-700">
              Reason: {rejectionReason}
            </p>
          )}
          <Link
            href="/kyc"
            className="text-sm text-red-600 font-semibold underline hover:text-red-700 mt-1 inline-block"
          >
            Resubmit KYC →
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
