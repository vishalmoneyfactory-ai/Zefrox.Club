'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

interface KycData {
  id: string;
  fullName: string;
  address: string;
  upiId: string;
  bankAccount: string;
  ifscCode: string;
  aadhaarNumber?: string;
  selfieUrl: string;
  status: string;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export function useKycStatus() {
  const [kycData, setKycData] = useState<KycData | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchKyc = useCallback(async () => {
    try {
      const { data } = await api.get('/api/kyc');
      if (data) {
        setKycData(data);
        setKycStatus(data.status);
      } else {
        setKycData(null);
        setKycStatus(null);
      }
    } catch {
      setKycData(null);
      setKycStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKyc();
  }, [fetchKyc]);

  return {
    kycStatus,
    kycData,
    loading,
    refetch: fetchKyc,
  };
}
