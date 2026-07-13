import { memo, useContext, useRef } from 'react';
import { ChatMember, type Friendship } from '~/api';
import { useChatSocket } from '~/hooks/useChatSocket';
import { MainContext } from '~/hooks/useMain';
import { plainToInstance } from 'class-transformer';
import MyForm from '~/components/MyForm';
import { Modal } from '~/components/Modal';
import { useModal } from '~/hooks/useModal';

export type FriendCardProps = {
    friendship: Friendship;
};

export const FriendCard = memo(({ friendship }: FriendCardProps) => {
    const socket = useChatSocket();
    const { updateContext } = useContext(MainContext);
    const modalRef = useRef<HTMLDialogElement>(null);
    const modal = useModal(modalRef);
    
    const onSubmit = async ({ message }: { message: string }) => {
        const membership = plainToInstance(ChatMember, await socket.createChat({
            message: message,
            userId: friendship.friendId,
        }));
        
        updateContext(draft => {
            draft.chats.set(membership.channelId, membership.channel);
            draft.lastVisitDates.set(membership.channelId, {
                prev: membership.channel.lastMessageDate,
                current: membership.channel.lastMessageDate,
            });
        });
    };
    
    return (
        <li className={'friend-request-card'}>
            {friendship.friend.name}
            <div className={'ml-auto'}>
                <button className={'button-primary'} onClick={modal.showModal}>
                    Send a message
                </button>
            </div>
            <Modal ref={modalRef}>
                <MyForm className={'flex flex-col space-y-4'} onSubmit={onSubmit}>
                    <input
                        type="text"
                        name={'message'}
                        minLength={1}
                        placeholder={'Say hello!'}
                        className={'max-w-[calc(100vw-100px)] w-100'}
                    />
                    <button className={'button-primary w-full!'}>Send</button>
                </MyForm>
            </Modal>
        </li>
    );
});