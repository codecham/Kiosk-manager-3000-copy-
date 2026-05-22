import { useState } from 'react';
import { toast } from 'sonner';
import * as enrollService from '@/services/enroll.service';
import type { EnrollToken, PermanentKey } from '@/types/models.types';

export const useEnroll = () => {
  const [tokenData, setTokenData] = useState<EnrollToken | null>(null);
  const [permanentData, setPermanentData] = useState<PermanentKey | null>(null);
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [isPermanentLoading, setIsPermanentLoading] = useState(false);

  const generateToken = async () => {
    setIsTokenLoading(true);
    setTokenData(null);
    try {
      const data = await enrollService.createEnrollToken();
      setTokenData(data);
    } catch {
      toast.error('Erreur lors de la génération du token');
    } finally {
      setIsTokenLoading(false);
    }
  };

  const fetchPermanentKey = async () => {
    setIsPermanentLoading(true);
    try {
      const data = await enrollService.getPermanentKey();
      setPermanentData(data);
    } catch {
      toast.error('Erreur lors de la récupération de la clé');
    } finally {
      setIsPermanentLoading(false);
    }
  };

  const rotateKey = async () => {
    try {
      await enrollService.rotateKey();
      setPermanentData(null);
      toast.success('Clé renouvelée — mettez à jour vos images ISO');
    } catch {
      toast.error('Erreur lors du renouvellement');
    }
  };

  const reset = () => {
    setTokenData(null);
    setPermanentData(null);
  };

  return { tokenData, permanentData, isTokenLoading, isPermanentLoading, generateToken, fetchPermanentKey, rotateKey, reset };
};
