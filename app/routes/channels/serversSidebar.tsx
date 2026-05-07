import { memo, useMemo, useRef, useState } from 'react';
import { Server } from '~/api';
import { Link } from 'react-router';
import { checkNewMessages } from '~/hooks/useMain';
import useMainContext from '~/hooks/useMainContext';
import { Modal } from '~/components/Modal';
import MyForm from '~/components/MyForm';
import { useChatSocket } from '~/hooks/useChatSocket';
import { plainToInstance } from 'class-transformer';
import add from '~/components/add.svg';

export const ServersSidebar = memo(({ servers }: { servers: Map<string, Server> }) => {
    const serversList = useMemo(() => {
        const arr: Server[] = [];
        servers.forEach((server) => {
            arr.push(server);
        });
        return arr;
    }, [servers]);
    
    const { context, updateContext, currentServer } = useMainContext();
    
    const createServerBtnRef = useRef<HTMLButtonElement>(null);
    
    const socket = useChatSocket();
    
    const onCreateServer = async (body: any) => {
        const server = structuredClone(plainToInstance(Server, await socket.createServer(body.name)));
        updateContext(draft => {
            draft.servers.set(server.id, server);
        });
    };
    
    const onJoinServer = async (body: any) => {
        const server = structuredClone(plainToInstance(Server, await socket.joinServer(body.code)));
        updateContext(draft => {
            draft.servers.set(server.id, server);
        });
    };
    
    return (
        <nav className={'servers-sidebar border-nav-r'}>
            <Link to={'/channels/me'}>Chats</Link>
            <hr />
            <ul>
                {serversList.map(server => {
                    let className;
                    
                    let unread = false;
                    
                    for (const channel of server.channels) {
                        unread = checkNewMessages(context, channel);
                        if (unread) break;
                    }
                    
                    if (currentServer?.id === server.id) {
                        className = 'current-channel';
                    } else if (unread) {
                        className = 'unread-channel';
                    } else {
                        className = 'channel';
                    }
                    
                    return (
                        <li key={'server-' + server.id} className={className}>
                            <Link to={'/channels/' + server.id}>
                                {server.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
            <hr />
            <button className={'button-secondary w-8! h-8! rounded-[50%]!'} ref={createServerBtnRef}>
                <img src={add} alt="+" />
            </button>
            <Modal showButtonRef={createServerBtnRef}>
                <MyForm className={'flex flex-col gap-2 mb-4'} onSubmit={onCreateServer}>
                    <input
                        name={'name'}
                        type="text"
                        placeholder={'Enter server\'s name...'}
                        minLength={1}
                        maxLength={30}
                        required
                    />
                    <button className={'button-primary w-full!'}>
                        Create
                    </button>
                </MyForm>
                <p className={'mb-4 w-full text-center'}>or</p>
                <MyForm className={'flex flex-col gap-2'} onSubmit={onJoinServer}>
                    <input
                        name={'code'}
                        type="text"
                        placeholder={'Enter server\'s invite code...'}
                        minLength={6}
                        maxLength={6}
                        required
                    />
                    <button className={'button-primary w-full!'}>
                        Join
                    </button>
                </MyForm>
            </Modal>
        </nav>
    );
});