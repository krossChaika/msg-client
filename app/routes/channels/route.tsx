import { ServersSidebar } from '~/routes/channels/serversSidebar';
import { Outlet } from 'react-router';
import useMain, {
    MainContext,
    type MainContextType,
} from '~/hooks/useMain';
import { useImmer } from 'use-immer';
import { useChatSocket } from '~/hooks/useChatSocket';
import { Channel, ChatMember, FriendRequest, Friendship, Message } from '~/api';
import { plainToInstance } from 'class-transformer';
import { useQueryClient } from '@tanstack/react-query';
import { getMessagesQueryKey, type OptimisticMessage } from '~/hooks/useMessagesQuery';
import useMainContext from '~/hooks/useMainContext';

export type ChannelsPageParams = {
    serverId: string;
    channelId: string;
}

export default function() {
    const [context, updateContext] = useImmer({} as MainContextType);
    
    return (
        <MainContext value={{ context, updateContext }}>
            <Page />
        </MainContext>
    );
}

function Page() {
    useMain();
    const { context, updateContext, getChannel } = useMainContext();
    
    const queryClient = useQueryClient();
    
    useChatSocket([
        {
            event: 'create-new-message',
            listener: ({ message, serverId }: { message: Message, serverId: string }) => {
                const channel = getChannel(context, message.channelId, message.channel?.id);
                if (channel && !message.channel) {
                    message.channel = channel;
                }
                
                queryClient.setQueryData<OptimisticMessage[]>(
                    getMessagesQueryKey(message.channel.id),
                    (old) => {
                        if (old) return [...old, message];
                    },
                );
                
                message = plainToInstance(Message, message);
                updateContext(draft => {
                    const channel = getChannel(draft, message.channelId, serverId);
                    
                    if (!channel) return;
                    
                    channel.lastMessageDate = new Date();
                });
            },
        },
        {
            event: 'delete-message',
            listener: (dto: { messageId: string, channelId: string }) => {
                const queryKey = getMessagesQueryKey(dto.channelId);
                
                queryClient.setQueryData<Message[]>(queryKey, (old) => {
                    if (!old) return old;
                    
                    return old.filter(m => m.id !== dto.messageId);
                });
            },
        },
        {
            event: 'receive-friend-request',
            listener: (request: FriendRequest) => {
                // console.log(request);
                updateContext(draft => {
                    draft.receivedFriendRequests.push(request);
                });
            },
        },
        {
            event: 'accepted-friend-request',
            listener: ({ friendship, id }: {
                friendship: Friendship,
                id: string
            }) => {
                updateContext(draft => {
                    draft.sentFriendRequests = draft.sentFriendRequests.filter(
                        f => f.id !== id,
                    );
                    
                    draft.receivedFriendRequests = draft.receivedFriendRequests.filter(
                        f => f.id !== id,
                    );
                    
                    draft.friendships.push(friendship);
                });
            },
        },
        {
            event: 'declined-friend-request',
            listener: (id: string) => {
                updateContext(draft => {
                    draft.sentFriendRequests = draft.sentFriendRequests.filter(
                        f => f.id !== id,
                    );
                    
                    draft.receivedFriendRequests = draft.receivedFriendRequests.filter(
                        f => f.id !== id,
                    );
                });
            },
        },
        {
            event: 'create-chat',
            listener: (chatMembership: ChatMember) => {
                const instance = structuredClone(plainToInstance(ChatMember, chatMembership));
                
                updateContext(draft => {
                    draft.chats.set(instance.channelId, instance.channel);
                });
            },
        },
        {
            event: 'create-channel',
            listener: (channel: Channel) => {
                channel = plainToInstance(Channel, channel);
                
                updateContext(draft => {
                    if (!channel.serverId) {
                        throw new Error('Channels server ID is missing');
                    }
                    
                    draft.servers.get(channel.serverId)?.channels.push(channel);
                });
            },
        },
    ]);
    
    if (!context.servers) return null;
    
    return (
        <div className={'channels-page'}>
            <ServersSidebar servers={context.servers} />
            <Outlet />
        </div>
    );
}