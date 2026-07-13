import { useContext } from 'react';
import { MainContext, type MainContextType } from '~/hooks/useMain';
import { useParams } from 'react-router';

export default function() {
    const { context, updateContext } = useContext(MainContext);
    const params = useParams<{ serverId: string, channelId: string }>();
    
    const getCurrentServer = (ctx: MainContextType) => {
        if (params.serverId) {
            return ctx.servers?.get(params.serverId);
        }
    };
    
    const getCurrentChannel = (ctx: MainContextType) => {
        if (!params.channelId) {
            return undefined;
        }
        
        const currentServer = getCurrentServer(ctx);
        
        if (currentServer) {
            return currentServer.channels.find(c => c.id === params.channelId);
        }
        
        return ctx.chats?.get(params.channelId);
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