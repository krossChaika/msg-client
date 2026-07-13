import './MessageList.css';
import { memo, type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import api from '~/api';
import { useQueryClient } from '@tanstack/react-query';
import { getMessagesQueryKey, type OptimisticMessage, useMessagesQuery } from '~/hooks/useMessagesQuery';
import TrashBin from './trashbin.svg';
import { useChatSocket } from '~/hooks/useChatSocket';
import useMainContext from '~/hooks/useMainContext';
import { useParams } from 'react-router';

interface MessageCardProps {
    message: OptimisticMessage,
    canDelete: boolean,
    isHeader: boolean,
    onDelete: () => void,
}

const MessageText = memo(({ message, canDelete, isHeader, onDelete }: MessageCardProps) => {
    const date = new Date(message.createdAt);
    const className = 'message-card' + (isHeader ? ' flex flex-col mt-4' : ' ');
    
    return (
        <div className={className}>
            <div className={'message-timestamp'}>
                {date.getHours()}:{date.getMinutes().toString().padStart(2, '0')}
            </div>
            <div className={'message-actions'}>
                {
                    canDelete &&
                    <button onClick={onDelete}>
                        <img src={TrashBin} alt="Delete" />
                    </button>
                }
            </div>
            {
                isHeader &&
                <span style={{ color: api.users.getColorById(message.user.id) }}>
                    {message.user.name}
                </span>
            }
            {message.text}
        </div>
    );
});

export type MessagesListProps = {
    adjustScrollbar: RefObject<((threshold: number) => void) | null>,
}

export const MessagesList = memo((props: MessagesListProps) => {
    const { context, currentServer, currentChannel } = useMainContext();
    const { channelId } = useParams();
    
    const messagesQueryKey = getMessagesQueryKey(currentChannel!.id);
    const messagesQuery = useMessagesQuery(currentChannel!.id);
    const queryClient = useQueryClient();
    const { deleteMessage } = useChatSocket();
    
    useEffect(() => {
        props.adjustScrollbar.current = (threshold: number) => {
            const el = messageBoxRef.current;
            if (!el) return;
            // console.log(el.scrollHeight - el.scrollTop - el.clientHeight);
            shouldScrollToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
        };
    }, []);
    
    const shouldScrollToBottomRef = useRef(false);
    const messageBoxRef = useRef<HTMLDivElement>(null);
    const messageBoxBottomRef = useRef<HTMLDivElement>(null);
    
    const loadOlderMessages = async () => {
        const limit = window.screen.height / 24;
        const oldestMessage = messagesRef.current?.at(0);
        const date = oldestMessage ? oldestMessage.createdAt : new Date();
        
        return api.messages.getByChannelId(currentChannel!.id, limit, date)
            .then((newMessages) => {
                if (newMessages.length === 0) {
                    shouldFetchOlderMessagesRef.current = false;
                    return newMessages;
                }
                
                queryClient.setQueryData<OptimisticMessage[]>(
                    messagesQueryKey,
                    (old) => [...newMessages.reverse(), ...(old ?? [])],
                );
                if (messageBoxRef.current && messageBoxRef.current.scrollTop < 10) {
                    messageBoxRef.current.scrollTop = 500;
                }
                
                return newMessages;
            });
    };
    
    const tryLoadOlderMessages = async () => {
        if (!messagesRef.current) {
            return 'no messagesRef';
        }
        
        if (!shouldFetchOlderMessagesRef.current) {
            return 'has loaded all messages already';
        }
        
        return loadOlderMessages();
    };
    
    useLayoutEffect(() => {
        if (shouldScrollToBottomRef.current) {
            // console.log('scrolling');
            messageBoxBottomRef.current?.scrollIntoView();
            shouldScrollToBottomRef.current = false;
        }
        
        messagesRef.current = messagesQuery.data;
    }, [messagesQuery.data]);
    
    const messagesRef = useRef<OptimisticMessage[] | undefined>(messagesQuery.data);
    const shouldFetchOlderMessagesRef = useRef(true);
    const [messageBoxTopRef, setMessageBoxTopRef] = useState<any>();
    const observerRef = useRef(new IntersectionObserver(async (entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            // console.log('intersecting, loading older messages');
            await tryLoadOlderMessages();
            // console.log(res);
        }
    }));
    
    useEffect(() => {
        shouldFetchOlderMessagesRef.current = true;
        if (!messageBoxTopRef) return;
        observerRef.current?.unobserve(messageBoxTopRef);
        observerRef.current = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                tryLoadOlderMessages();
            }
        });
        observerRef.current.observe(messageBoxTopRef);
    }, [channelId]);
    
    useEffect(() => {
        if (!messageBoxTopRef) return;
        observerRef.current?.observe(messageBoxTopRef);
        
        return () => {
            observerRef.current?.unobserve(messageBoxTopRef);
        };
    }, [messageBoxTopRef]);
    
    useEffect(() => {
        if (currentChannel && messageBoxRef.current) {
            messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
        }
    }, [currentChannel]);
    
    if (!currentChannel) return null;
    
    let hrPlaced = false;
    
    return (
        <div className={'flex-1 overflow-y-auto'} ref={messageBoxRef}>
            <div className={'relative'}>
                <div className={'absolute h-125'} ref={setMessageBoxTopRef} />
            </div>
            <ul>
                {messagesQuery.data?.map((message, index) => {
                    const prev = messagesQuery.data[index - 1];
                    const isHeader = !prev || prev.user.id !== message.user.id;
                    const canDelete = message.user.id === context.user.id
                        || context.user.id === currentServer?.ownerId;
                    
                    const lastVisitedDate = context.lastVisitDates.get(currentChannel!.id);
                    
                    const placeHr = !hrPlaced && lastVisitedDate?.prev
                        && lastVisitedDate.prev < message.createdAt
                        && message.user.id !== context.user.id;
                    
                    if (placeHr) hrPlaced = true;
                    
                    return (
                        <li
                            key={'message-' + message.id}
                            style={{ opacity: message.isPending ? 0.5 : 1 }}
                        >
                            {
                                placeHr &&
                                <hr className={'border-red-500! mt-4'} />
                            }
                            <MessageText
                                message={message}
                                isHeader={isHeader}
                                canDelete={canDelete}
                                onDelete={() => deleteMessage(message.id)}
                            />
                        </li>
                    );
                })}
            </ul>
            <div ref={messageBoxBottomRef} />
        </div>
    );
});