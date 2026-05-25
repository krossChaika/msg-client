import './friendRequestCard.css';
import { memo } from 'react';
import { FriendRequest } from '~/api';
import { useChatSocket } from '~/hooks/useChatSocket';

type FriendRequestCardProps = {
    isReceived: boolean;
    request: FriendRequest;
}

export const FriendRequestCard = memo(({ isReceived, request }: FriendRequestCardProps) => {
    const socket = useChatSocket();
    
    const accept = () => socket.decideFriendRequest(request.id, 'accept');
    const decline = () => socket.decideFriendRequest(request.id, 'decline');
    
    const declineButtonText = isReceived ? 'Decline' : 'Cancel';
    
    return (
        <li className={'friend-request-card'}>
            {isReceived ? request.sender.name : request.receiver.name}
            <div className={'flex space-x-2 ml-auto'}>
                {isReceived && (
                    <button className={'button-primary'} onClick={accept}>
                        Accept
                    </button>
                )}
                <button className={'button-red'} onClick={decline}>
                    {declineButtonText}
                </button>
            </div>
        </li>
    );
});