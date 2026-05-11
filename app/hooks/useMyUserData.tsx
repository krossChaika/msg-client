import { useQuery } from '@tanstack/react-query';
import api, { User } from '~/api';

export const myUserDataQueryKey: Readonly<string[]> = ['myUserData'];

// export function useMyServersQuery() {
//     return useQuery<ServerMember[]>({
//         queryKey: myServersQueryKey,
//         queryFn: async () => {
//             return await api.serverMembers.getMyServers();
//         },
//         staleTime: Infinity,
//     });
// }

export function useMyUserData() {
    return useQuery<User>({
        queryKey: myUserDataQueryKey,
        queryFn: async () => {
            return await api.users.getMe();
        },
        staleTime: Infinity,
    });
}