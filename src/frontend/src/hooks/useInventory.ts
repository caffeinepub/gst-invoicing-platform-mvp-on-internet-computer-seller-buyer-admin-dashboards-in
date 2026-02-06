import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { POLLING_CONFIG } from '../config/polling';
import type { InventoryItem, LowStockAlert } from '../types/extended';

export function useGetInventoryStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not yet implemented - return empty array
      return [];
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: POLLING_CONFIG.inventory,
  });
}

export function useGetLowStockAlerts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LowStockAlert[]>({
    queryKey: ['lowStockAlerts'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not yet implemented - return empty array
      return [];
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: POLLING_CONFIG.inventory,
  });
}

export function useAddInventoryItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: InventoryItem) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      throw new Error('Inventory functionality not yet implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['lowStockAlerts'] });
    },
  });
}

export function useUpdateInventoryItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      quantity, 
      threshold 
    }: { 
      id: string; 
      quantity: bigint; 
      threshold: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      throw new Error('Inventory functionality not yet implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['lowStockAlerts'] });
    },
  });
}
