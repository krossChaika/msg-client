import './channelSidebar.css';
import { memo } from 'react';
import { checkNewMessages } from '~/hooks/useMain';
import { Link } from 'react-router';
import { getOtherUserId } from '~/api';
import useMainContext from '~/hooks/useMainContext';

export const ChatsSidebar = memo(() => {
    const { context, currentChannel } = useMainContext();
    
    return (
        <ul>
            {[...context.chats.entries()].map(chat => {
                const channel = chat[1];
                
                if (!channel.chatMembers) {
                    // throw new Error(`Channel ${channel.id} is not a chat`);
                    return;
                }
                
                const url = `/channels/me/${channel.id}`;
                
                let className;
                
                if (currentChannel?.id === channel.id) {
                    className = 'current-channel';
                } else if (checkNewMessages(context, channel)) {
                    className = 'unread-channel';
                } else {
                    className = 'channel';
                }
                
                return (
                    <li
                        className={className}
                        key={'channel-' + channel.id}
                    >
                        <Link className={'flex flex-1'} to={url}>
                            {getOtherUserId(channel, context.user.id).user.name}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
});