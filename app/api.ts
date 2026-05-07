import axios from 'axios';
import { plainToInstance, Type } from 'class-transformer';
import 'reflect-metadata';

export class User {
    public id: string;
    public name: string;
    
    @Type(() => LastVisited)
    lastVisitDates: LastVisited[];
    
    @Type(() => ChatMember)
    chats: ChatMember[];
    
    @Type(() => FriendRequest)
    incomingFriendRequests: FriendRequest[];
    
    @Type(() => FriendRequest)
    outgoingFriendRequests: FriendRequest[];
    
    @Type(() => Friendship)
    friendships: Friendship[];
}

export class ChatMember {
    public id: string;
    public userId: string;
    public channelId: string;
    
    @Type(() => User)
    public user: User;
    
    @Type(() => Channel)
    public channel: Channel;
}

export class Friendship {
    // public id: string;
    public userId: string;
    public friendId: string;
    
    @Type(() => User)
    public user: User;
    
    @Type(() => User)
    public friend: User;
}

export class ServerMember {
    public serverId: string;
    
    @Type(() => User)
    public user: User;
    
    @Type(() => Server)
    public server: Server;
}

export class Channel {
    public id: string;
    public name: string;
    public serverId?: string;
    
    @Type(() => Date)
    public lastMessageDate: Date;
    
    @Type(() => ChatMember)
    chatMembers?: ChatMember[];
}

export function getOtherUserId(channel: Channel, myId: string) {
    return channel.chatMembers?.find(x => x.userId !== myId)!;
}

export class Server {
    public id: string;
    public name: string;
    public ownerId: string;
    public inviteCode: string;
    
    @Type(() => Channel)
    channels: Channel[];
    
    @Type(() => ServerMember)
    public members: ServerMember[];
}

export class Message {
    public id: string;
    
    public text: string;
    
    public channelId: string;
    
    @Type(() => Date)
    public createdAt: Date;
    
    @Type(() => User)
    public user: User;
    
    @Type(() => Channel)
    public channel: Channel;
}

export class LastVisited {
    public userId: string;
    public channelId: string;
    
    @Type(() => Date)
    public date: Date;
}

export class FriendRequest {
    public id: string;
    public senderId: string;
    public receiverId: string;
    
    @Type(() => User)
    public sender: User;
    
    @Type(() => User)
    public receiver: User;
}

const url = (relativePath: string) => {
    if (!relativePath.startsWith('/')) {
        relativePath = '/' + relativePath;
    }
    return import.meta.env.VITE_API_URL + relativePath;
};

const colorsMap = new Map<string, string>();

export default {
    url: url,
    users: {
        getColorById: (id: string) => {
            const color = colorsMap.get(id);
            if (color) return color;
            
            const allHexChars = '0123456789abcdef';
            let newColor = '#';
            for (let i = 0; i < 6; i++) {
                newColor += allHexChars.charAt(Math.floor(Math.random() * allHexChars.length));
            }
            
            colorsMap.set(id, newColor);
            return newColor;
        },
    },
    serverMembers: {
        getMyServers: async (): Promise<ServerMember[]> => {
            const res = (await axios.get(url('server-member/me'), {
                withCredentials: true,
            })).data;
            return plainToInstance(ServerMember, res) as any;
        },
    },
    messages: {
        getByChannelId: async (id: string, limit: number, before: Date): Promise<Message[]> => {
            console.log(id);
            const res = await axios.get(
                url(`message/by-channel/${id}?limit=${limit}&before=${before.toISOString()}`),
                { withCredentials: true },
            );
            return plainToInstance(Message, res.data) as any;
        },
    },
    lastVisited: {
        setForChannel: async (channelId: string, date: Date): Promise<void> => {
            console.log('updating last visited');
            return axios.post(url('last-visited'), {
                channelId: channelId,
                date: date,
            }, {
                withCredentials: true,
            });
        },
    },
};