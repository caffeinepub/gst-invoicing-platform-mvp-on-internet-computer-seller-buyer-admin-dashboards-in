import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, AppRole } from '../backend';

export function useCurrentUser() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const profileQuery = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  const appRoleQuery = useQuery<AppRole | null>({
    queryKey: ['currentUserAppRole'],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      return actor.getAppRole(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    userProfile: profileQuery.data,
    isProfileLoading: actorFetching || profileQuery.isLoading,
    isProfileFetched: !!actor && profileQuery.isFetched,
    appRole: appRoleQuery.data,
    isAppRoleLoading: actorFetching || appRoleQuery.isLoading,
    isAuthenticated: !!identity,
  };
}
