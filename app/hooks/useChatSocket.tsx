import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Channel, ChatMember, type Message, Server } from '~/api';
import type { MainContextType } from '~/hooks/useMain';
import type { Updater } from 'use-immer';

export const socket = io('ws://localhost:3002', {
    withCredentials: true,
});

export type SocketMessage = 'create-new-message'
    | 'delete-message'
    | 'send-friend-request'
    | 'receive-friend-request'
    | 'decide-friend-request'
    | 'accepted-friend-request'
    | 'declined-friend-request'
    | 'create-server'
    | 'join-server'
    | 'create-chat'
    | 'create-channel';

type EventListener = {
    event: SocketMessage;
    listener: (...args: any[]) => void;
};

export type SendFriendRequestFormBody = {
    username: string;
}

export type CreateMessageDto = {
    text: string;
    channelId: string;
}

export function useChatSocket(listeners?: EventListener[]) {
    useEffect(() => {
        if (listeners) {
            for (const listener of listeners) {
                socket.on(listener.event, listener.listener);
            }
            
            return () => {
                // socket.disconnect();
                for (const listener of listeners) {
                    socket.off(listener.event, listener.listener);
                }
            };
        }
    }, []);
    
    return {
        socket,
        sendMessage,
        deleteMessage,
        createServer,
        joinServer,
        createChat,
        createChannel,
        sendFriendRequest,
        decideFriendRequest,
    };
}

const sendMessage = (dto: CreateMessageDto): Promise<{ message: Message }> => {
    return socket.emitWithAck<SocketMessage>('create-new-message', dto);
};

const deleteMessage = (messageId: string) => {
    return socket.emitWithAck<SocketMessage>('delete-message', { messageId });
};

const createServer = (name: string) => {
    return socket.emitWithAck<SocketMessage>('create-server', { name });
};

const joinServer = (code: string) => {
    return socket.emitWithAck<SocketMessage>('join-server', { code });
};

const createChat = (dto: { message: string, userId: string }): Promise<ChatMember> => {
    return socket.emitWithAck<SocketMessage>('create-chat', dto);
};

const createChannel = (dto: { serverId: string, name: string }): Promise<Channel> => {
    return socket.emitWithAck<SocketMessage>('create-channel', dto);
};

const sendFriendRequest = (dto: SendFriendRequestFormBody) => {
    return socket.emitWithAck<SocketMessage>('send-friend-request', dto);
};

const decideFriendRequest = (id: string, action: 'accept' | 'decline') => {
    socket.emit<SocketMessage>('decide-friend-request', { id, action });
};