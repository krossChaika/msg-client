import { memo, useContext, useRef } from 'react';
import { Link } from 'react-router';
import { MainContext, checkNewMessages } from '~/hooks/useMain';
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
            <button onClick={onServerNameClick} className={'server-actions-btn'}>
                {currentServer.name}
            </button>
            <dialog ref={serverActionsDialogRef} className={'dialog'}>
                Invite code: {currentServer.inviteCode}
                <hr />
                {
                    currentServer.ownerId === context.user.id &&
                    <CreateChannelButton />
                }
            </dialog>
            <hr />
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
                            className={className}
                            key={'channel-' + channel.id}>
                            <Link className={'flex flex-1'} to={url}>
                                # {channel.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
            <hr />
        </>
    );
});