import { useQuery } from '@tanstack/react-query';
import api, { type Message } from '~/api';

export function getMessagesQueryKey(channelId: string) {
    return ['messages', 'channelId' + channelId];
}

export async function fetchInitialMessages(channelId: string) {
    return (await api.messages.getByChannelId(
        channelId,
        window.screen.height / 24,
        new Date(),
    )).reverse();
}

export type OptimisticMessage = Message & {
    isPending?: boolean;
}

export function useMessagesQuery(channelId: string) {
    return useQuery<OptimisticMessage[]>({
        queryKey: getMessagesQueryKey(channelId),
        queryFn: async () => await fetchInitialMessages(channelId),
        staleTime: Infinity,
    });
}