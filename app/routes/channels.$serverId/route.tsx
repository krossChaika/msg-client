import { ChannelsSidebar } from '~/routes/channels.$serverId/channelsSidebar';
import { Outlet, useParams } from 'react-router';
import type { ChannelsPageParams } from '~/routes/channels/route';
import { ChatsSidebar } from '~/routes/channels.$serverId/chatsSidebar';
import { FriendsPage } from '~/routes/channels.$serverId/friendsPage';

export default function() {
    const { serverId, channelId } = useParams<ChannelsPageParams>();
    
    if (!serverId) return null;
    
    return (
        <>
            <nav className={'channels-sidebar'}>
                {serverId === 'me' ? <ChatsSidebar /> : <ChannelsSidebar />}
            </nav>
            {!channelId && serverId === 'me' ? <FriendsPage /> : <Outlet />}
        </>
    );
}