import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { POLLING_CONFIG } from '../config/polling';
import type { AuditLog, AuditFilters } from '../types/extended';

export function useGetAuditLogs(filters: AuditFilters | null = null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AuditLog[]>({
    queryKey: ['auditLogs', filters],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not yet implemented - return empty array
      return [];
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: POLLING_CONFIG.audit,
  });
}
