import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { POLLING_CONFIG } from '../config/polling';
import type { Payment, PaymentStatus } from '../types/extended';

export function useGetPaymentStatus(invoiceId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Payment | null>({
    queryKey: ['payment', invoiceId],
    queryFn: async () => {
      if (!actor || !invoiceId) return null;
      // Backend method not yet implemented - return mock data for now
      return null;
    },
    enabled: !!actor && !actorFetching && !!invoiceId,
    refetchInterval: POLLING_CONFIG.payments,
  });
}

export function useInitiatePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, amount }: { invoiceId: string; amount: number }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      throw new Error('Payment functionality not yet implemented in backend');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payment', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      invoiceId, 
      status, 
      amount 
    }: { 
      invoiceId: string; 
      status: PaymentStatus; 
      amount: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      throw new Error('Payment functionality not yet implemented in backend');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payment', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
