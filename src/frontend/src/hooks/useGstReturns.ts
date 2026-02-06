import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { GSTR1Data, GSTR3BData } from '../types/extended';

export function useGenerateGSTR1() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ year, month }: { year: number; month: number }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      throw new Error('GST return generation not yet implemented in backend');
    },
  });
}

export function useGenerateGSTR3B() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ year, month }: { year: number; month: number }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      throw new Error('GST return generation not yet implemented in backend');
    },
  });
}
