import { Modal } from '~/components/Modal';
import MyForm from '~/components/MyForm';
import { useContext, useRef, useState } from 'react';
import { useChatSocket } from '~/hooks/useChatSocket';
import useMainContext from '~/hooks/useMainContext';
import { useModal } from '~/hooks/useModal';

export default function({ closeDialogCallback }: { closeDialogCallback: () => void }) {
    const { updateContext, currentServer, getCurrentServer } = useMainContext();
    const modalRef = useRef<HTMLDialogElement>(null);
    const modal = useModal(modalRef);
    const { createChannel } = useChatSocket();
    const [submitting, setSubmitting] = useState(false);
    
    const onSubmit = async (body: any) => {
        if (!currentServer) return;
        
        setSubmitting(true);
        
        createChannel({
            serverId: currentServer.id,
            name: body.name,
        }).then(channel => {
            setSubmitting(false);
            updateContext(draft => {
                getCurrentServer(draft)?.channels.push(channel);
                const now = new Date();
                draft.lastVisitDates.set(channel.id, {
                    prev: now, current: now,
                });
            });
            closeDialogCallback();
            modal.closeModal();
        });
    };
    
    return (
        <>
            <button className={'dialog-button'} onClick={modal.showModal}>
                Add channel
            </button>
            <Modal ref={modalRef}>
                <MyForm className={'flex flex-col gap-2'} onSubmit={onSubmit}>
                    <input
                        type="text"
                        name="name"
                        autoComplete="off"
                        minLength={1}
                        maxLength={30}
                        placeholder={'Channels name'}
                    />
                    <button
                        className={'button-primary w-full! transition duration-200'}
                        style={{ opacity: submitting ? 0.65 : 1 }}
                    >
                        {submitting ? 'Wait a sec...' : 'Create!'}
                    </button>
                </MyForm>
            </Modal>
        </>
    );
}