import { createContext, useContext, useEffect, useState } from 'react';
import { Channel, FriendRequest, Friendship, Server, ServerMember, User } from '~/api';
import { useMyServersQuery } from '~/hooks/useMyServersQuery';
import type { Updater } from 'use-immer';

export type MainContextType = {
    user: User;
    // currentServer?: Server;
    // currentChannel?: Channel;
    currentServerId?: string;
    currentChannelId?: string;
    servers: Map<string, Server>;
    chats: Map<string, Channel>;
    friendships: Friendship[];
    sentFriendRequests: FriendRequest[];
    receivedFriendRequests: FriendRequest[];
    lastVisitDates: Map<string, { prev?: Date, current: Date }>;
}

export const MainContext = createContext<{
    context: MainContextType,
    updateContext: Updater<MainContextType>
}>(null!);

type HookResult = {
    isLoading: boolean;
    context: MainContextType;
    updateContext: Updater<MainContextType>;
}

export const checkNewMessages = (
    context: MainContextType,
    channel: Channel,
): boolean => {
    // console.log('checkNewMessages', obj);
    const lastVisitedDate = context.lastVisitDates.get(channel.id)?.current;
    if (!lastVisitedDate) return true;
    const newestMessageDate = channel.lastMessageDate;
    // if (newestMessageDate) {
    //     console.log(obj.name + '-lastVisitedDate', lastVisitedDate);
    //     console.log(obj.name + '-newestMessageDate', newestMessageDate);
    // }
    return lastVisitedDate < newestMessageDate;
};

export default function(serverId?: string, channelId?: string): HookResult {
    const membershipsQuery = useMyServersQuery();
    const { context, updateContext } = useContext(MainContext);
    const [data, setData] = useState<ServerMember[] | null>(null);
    
    const isLoading = data === null;
    
    useEffect(() => {
        if (!membershipsQuery.data) return;
        
        setData(structuredClone(membershipsQuery.data));
    }, [membershipsQuery.data]);
    
    useEffect(() => {
        if (!data) return;
        
        if (!context.user) {
            updateContext(draft => {
                const user = data[0].user;
                draft.user = user;
                draft.friendships = [...user.friendships];
                draft.sentFriendRequests = [...user.outgoingFriendRequests];
                draft.receivedFriendRequests = [...user.incomingFriendRequests];
                draft.lastVisitDates = new Map();
                
                for (const date of user.lastVisitDates) {
                    draft.lastVisitDates.set(date.channelId, {
                        prev: date.date,
                        current: date.date,
                    });
                }
                
                if (context.servers && context.chats) return;
                
                const servers = new Map();
                const chats = new Map();
                
                for (const m of data) {
                    const _channels = [...m.server.channels];
                    _channels.sort((a, b) => (a.lastMessageDate > b.lastMessageDate) ? 1 : 0);
                    servers.set(m.serverId, m.server);
                    // for (const channel of _channels) {
                    //     channels.set(channel.id, channel);
                    // }
                }
                
                for (const chat of data[0].user.chats) {
                    chats.set(chat.channel.id, chat.channel);
                }
                
                draft.servers = servers;
                draft.chats = chats;
                // setCurrentChannel(channelId, draft);
            });
        }
    }, [data]);
    
    useEffect(() => {
        // if (!context.servers) return;
        //
        // if (serverId === 'me' || !serverId) {
        //     updateContext(draft => {
        //         draft.currentServer = undefined;
        //     });
        //     return;
        // }
        //
        // const server = context.servers.get(serverId);
        //
        // updateContext(draft => {
        //     draft.currentServer = server;
        //     setCurrentChannel(channelId, draft);
        // });
        updateContext(draft => {
            draft.currentServerId = serverId;
        });
    }, [serverId]);
    
    useEffect(() => {
        updateContext(draft => {
            // setCurrentChannel(channelId, draft);
            draft.currentChannelId = channelId;
        });
    }, [channelId]);
    
    // const setCurrentChannel = (channelId: string | undefined, draft: ChannelPageContextType) => {
    //     if (!data) return;
    //
    //     let channel: Channel | undefined;
    //
    //     if (draft.currentServer) {
    //         channel = draft.currentServer.channels.find(c => c.id === channelId);
    //         //?? context.currentServer.channels[0]
    //     } else if (channelId) {
    //         channel = draft.chats.get(channelId);
    //     }
    //
    //     draft.currentChannel = channel;
    // };
    
    return {
        isLoading,
        context,
        updateContext,
    };
}