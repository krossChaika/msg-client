import { Modal } from '~/components/Modal';
import MyForm from '~/components/MyForm';
import { useContext, useRef } from 'react';
import { useChatSocket } from '~/hooks/useChatSocket';
import useMainContext from '~/hooks/useMainContext';

export default function() {
    const { updateContext, currentServer, getCurrentServer } = useMainContext();
    const createChannelButtonRef = useRef<HTMLButtonElement>(null);
    const { createChannel } = useChatSocket();
    
    const onSubmit = async (body: any) => {
        if (!currentServer) return;
        
        createChannel({
            serverId: currentServer.id,
            name: body.name,
        }).then(channel => {
            updateContext(draft => {
                getCurrentServer(draft)?.channels.push(channel);
            });
        });
    };
    
    return (
        <>
            <button className={'dialog-button'} ref={createChannelButtonRef}>
                Add channel
            </button>
            <Modal showButtonRef={createChannelButtonRef}>
                <MyForm className={'flex flex-col'} onSubmit={onSubmit}>
                    <input
                        type="text"
                        name="name"
                        autoComplete="off"
                        minLength={1}
                        maxLength={30}
                        placeholder={'Channels name...'}
                    />
                    <button className={'button-primary w-full!'}>Create!</button>
                </MyForm>
            </Modal>
        </>
    );
}