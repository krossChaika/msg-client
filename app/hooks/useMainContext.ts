import { useContext } from 'react';
import { MainContext, type MainContextType } from '~/hooks/useMain';

export default function() {
    const { context, updateContext } = useContext(MainContext);
    
    const getCurrentServer = (ctx: MainContextType) => {
        if (ctx.currentServerId) {
            return ctx.servers?.get(ctx.currentServerId);
        }
    };
    
    const getCurrentChannel = (ctx: MainContextType) => {
        if (!ctx.currentChannelId) {
            return undefined;
        }
        
        const currentServer = getCurrentServer(ctx);
        
        if (currentServer) {
            return currentServer.channels.find(c => c.id === ctx.currentChannelId);
        }
        
        return ctx.chats?.get(ctx.currentChannelId);
    };
    
    const getChannel = (ctx: MainContextType, id: string, serverId?: string) => {
        if (serverId) {
            return ctx.servers?.get(serverId)?.channels.find(c => c.id == id);
        }
        
        return ctx.chats.get(id);
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