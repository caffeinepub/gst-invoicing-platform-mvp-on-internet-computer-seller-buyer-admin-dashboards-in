import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Invoice, AppRole } from '../backend';
import { Principal } from '@dfinity/principal';

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserAppRole'] });
    },
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      user, 
      profile, 
      role 
    }: { 
      user: Principal; 
      profile: UserProfile; 
      role: AppRole;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      if (role === 'seller') {
        return actor.assignSellerRole(user, profile);
      } else if (role === 'buyer') {
        return actor.assignBuyerRole(user, profile);
      } else if (role === 'admin') {
        return actor.assignAdminRole(user, profile);
      }
      throw new Error('Invalid role');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfiles'] });
    },
  });
}
