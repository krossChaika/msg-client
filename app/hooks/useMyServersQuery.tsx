import { useQuery } from '@tanstack/react-query';
import api, { ServerMember } from '~/api';

export const myServersQueryKey: Readonly<string[]> = ['servers'];

export function useMyServersQuery() {
    return useQuery<ServerMember[]>({
        queryKey: myServersQueryKey,
        queryFn: async () => {
            return await api.serverMembers.getMyServers();
        },
        staleTime: Infinity,
    });
}