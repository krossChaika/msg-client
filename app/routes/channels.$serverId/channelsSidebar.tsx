import './channelSidebar.css';
import { memo, useRef } from 'react';
import { Link } from 'react-router';
import { checkNewMessages } from '~/hooks/useMain';
import CreateChannelButton from '~/routes/channels.$serverId/serverManagement/CreateChannelButton';
import useMainContext from '~/hooks/useMainContext';

export const ChannelsSidebar = memo(() => {
    const { context, currentServer, currentChannel } = useMainContext();
    const serverActionsDialogRef = useRef<HTMLDialogElement>(null);
    
    if (!currentServer) return null;
    
    const onServerNameClick = () => {
        const dialogRef = serverActionsDialogRef.current;
        
        if (!dialogRef) return;
        
        dialogRef.open ? dialogRef.close() : dialogRef.show();
    };
    
    return (
        <>
            <div className={'border-nav-b p-2'}>
                <button
                    onClick={onServerNameClick}
                    className={'server-actions-btn'}
                >
                    {currentServer.name}
                </button>
            </div>
            <dialog ref={serverActionsDialogRef} className={'dialog'}>
                <span>Invite code: {currentServer.inviteCode}</span>
                <hr className={'mt-2 border-nav'} />
                <div>
                    {
                        currentServer.ownerId === context.user.id &&
                        <CreateChannelButton closeDialogCallback={() => serverActionsDialogRef.current?.close()} />
                    }
                </div>
            </dialog>
            <ul>
                {currentServer.channels.map(channel => {
                    const url = `/channels/${currentServer.id}/${channel.id}`;
                    
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
                            className={className + ' mx-2'}
                            key={'channel-' + channel.id}>
                            <Link className={'flex flex-1'} to={url}>
                                # {channel.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </>
    );
});