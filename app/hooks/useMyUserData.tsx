import { useQuery } from '@tanstack/react-query';
import api, { User } from '~/api';

export function useMyUserData() {
    return useQuery<User>({
        queryKey: ['myUserData'],
        queryFn: async () => {
            return await api.users.getMe();
        },
        staleTime: Infinity,
    });
}