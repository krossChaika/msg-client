import { createContext, useContext, useEffect, useState } from 'react';
import { Channel, FriendRequest, Friendship, Server, User } from '~/api';
import { useMyUserData } from '~/hooks/useMyUserData';
import type { Updater } from 'use-immer';

export type MainContextType = {
    user: User;
    // currentServer?: Server;
    // currentChannel?: Channel;
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

export default function() {
    const membershipsQuery = useMyUserData();
    const { context, updateContext } = useContext(MainContext);
    const [user, setUser] = useState<User | null>(null);
    
    useEffect(() => {
        if (!membershipsQuery.data) return;
        
        setUser(structuredClone(membershipsQuery.data));
    }, [membershipsQuery.data]);
    
    useEffect(() => {
        if (!user) return;
        
        if (!context.user) {
            updateContext(draft => {
                // const user = data;
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
                
                for (const m of user.serverMemberships) {
                    servers.set(m.serverId, m.server);
                }
                
                for (const chat of user.chats) {
                    chats.set(chat.channel.id, chat.channel);
                }
                
                draft.servers = servers;
                draft.chats = chats;
            });
        }
    }, [user]);
}