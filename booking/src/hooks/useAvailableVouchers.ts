import { useState, useEffect } from 'react';
import { voucherAPI } from '../services/api';
import { VoucherResponse } from '../types/voucher';

export const useAvailableVouchers = (hotelId: string | null) => {
  const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hotelId) {
      setVouchers([]);
      return;
    }

    const fetchVouchers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await voucherAPI.getAvailableVouchersForHotel(hotelId);
        if (response.data.success) {
          setVouchers(response.data.result);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load vouchers');
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, [hotelId]);

  return { vouchers, loading, error, refetch: () => setVouchers([]) };
}; 