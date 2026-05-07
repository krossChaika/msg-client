import { useContext } from 'react';
import { MainContext, type MainContextType } from '~/hooks/useMain';

export default function() {
    const { context, updateContext } = useContext(MainContext);
    
    const getCurrentServer = (context: MainContextType) => {
        if (context.currentServerId) {
            return context.servers?.get(context.currentServerId);
        }
    };
    
    const getCurrentChannel = (context: MainContextType) => {
        if (!context.currentChannelId) {
            return undefined;
        }
        
        const currentServer = getCurrentServer(context);
        
        if (currentServer) {
            return currentServer.channels.find(c => c.id === context.currentChannelId);
        }
        
        return context.chats?.get(context.currentChannelId);
    };
    
    const getChannel = (context: MainContextType, id: string, serverId?: string) => {
        if (serverId) {
            return context.servers.get(serverId)?.channels.find(c => c.id == id);
        }
        
        return context.chats.get(id);
    };
    
    const currentServer = getCurrentServer(context);
    const currentChannel = getCurrentChannel(context);
    
    return {
        context,
        updateContext,
        currentServer,
        currentChannel,
        getCurrentServer,
        getCurrentChannel,
        getChannel,
    };
}