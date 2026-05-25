import { Link, useParams } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import MyForm from '~/components/MyForm';
import api, { Message } from '~/api';
import { type CreateMessageDto, useChatSocket } from '~/hooks/useChatSocket';
import { useLayoutEffect, useRef } from 'react';
import { type ChannelsPageParams } from '~/routes/channels/route';
import {
    type MainContextType,
} from '~/hooks/useMain';
import { MessagesList } from '~/routes/channels.$serverId.$channelId/MessagesList';
import { getMessagesQueryKey, type OptimisticMessage } from '~/hooks/useMessagesQuery';
import { plainToInstance } from 'class-transformer';
import useMainContext from '~/hooks/useMainContext';
import ArrowBack from '~/routes/channels.$serverId.$channelId/arrowback.svg';

export default function() {
    const { channelId } = useParams<ChannelsPageParams>() as ChannelsPageParams;
    const {
        context,
        updateContext,
        currentServer,
        currentChannel,
        getCurrentChannel,
    } = useMainContext();
    
    const adjustScrollbarFnRef = useRef<(threshold: number) => void>(() => ({}));
    const messageInputRef = useRef<HTMLInputElement>(null);
    const channelIdRef = useRef(channelId);
    
    const messagesQueryKey = getMessagesQueryKey(channelId!);
    useLayoutEffect(() => {
        const now = new Date();
        updateContext(draft => {
            const prev = draft.lastVisitDates.get(channelId)?.current;
            api.lastVisited.setForChannel(channelId, now);
            draft.lastVisitDates.set(channelId, { prev, current: now });
        });
        
        channelIdRef.current = channelId;
    }, [channelId]);
    
    const socket = useChatSocket([{
        event: 'create-new-message',
        listener: (message: Message) => {
            message = plainToInstance(Message, message);
            
            if (message.channel?.id !== channelIdRef.current) return;
            
            adjustScrollbarFnRef.current(100);
            const now = new Date();
            updateContext!(draft => {
                const prev = draft.lastVisitDates.get(channelId)?.current;
                api.lastVisited.setForChannel(channelIdRef.current, now);
                draft.lastVisitDates.set(channelIdRef.current, { prev, current: now });
            });
        },
    }]);
    
    const addMessageMutation = useMutation({
        mutationFn: async (
            { dto, pageContext }: {
                dto: CreateMessageDto,
                pageContext: MainContextType
            },
        ) => {
            const response = await socket.sendMessage(dto);
            const message = response.message as Message;
            
            // || response.error
            if (!message) {
                // throw new Error('Failed to create message', response.error);
                return;
            }
            
            message.user = pageContext.user;
            message.channel = getCurrentChannel(pageContext)!;
            return message;
        },
        onMutate: async ({ dto, pageContext }, context) => {
            const temporaryId = Math.random().toString();
            
            const message: OptimisticMessage = {
                ...dto,
                id: temporaryId,
                createdAt: new Date(),
                isPending: true,
                user: pageContext.user,
                channel: getCurrentChannel(pageContext)!,
            };
            
            context.client.setQueryData<OptimisticMessage[]>(messagesQueryKey, (old) =>
                old ? [...old, message] : [message],
            );
            
            return { temporaryId };
        },
        onSuccess: (data, _, onMutateResult, context) => {
            context.client.setQueryData<OptimisticMessage[]>(messagesQueryKey, (old) => {
                if (!old) return [data!];
                return old.map(m => m.id === onMutateResult.temporaryId ? data! : m);
            });
        },
        onError: (_error, _variables, onMutateResult, context) => {
            context.client.setQueryData<OptimisticMessage[]>(messagesQueryKey, (old) =>
                old?.filter(message => message.id !== onMutateResult?.temporaryId),
            );
        },
    });
    
    if (!currentChannel) return null;
    
    const onMessageSubmit = async (body: CreateMessageDto) => {
        if (!channelId) return;
        
        body.channelId = channelId;
        
        addMessageMutation.mutate({ dto: body, pageContext: context });
        adjustScrollbarFnRef.current(Infinity);
        messageInputRef.current!.value = '';
    };
    
    return (
        <main className={'bg-primary color-primary flex flex-1'}>
            <div className={'flex flex-col flex-1 gap-2 min-h-0'}>
                <header className={'border-normal-b p-4'}>
                    <Link
                        to={'/channels/' + context.currentServerId}
                        className={'back-to-channels-btn mr-4 color-nav-text'}
                    >
                        <img className={'inline'} src={ArrowBack} alt="Back" />
                    </Link>
                    # {currentChannel.name}
                </header>
                <MessagesList
                    adjustScrollbar={adjustScrollbarFnRef}
                />
                <MyForm className={'flex gap-2 m-2'} onSubmit={onMessageSubmit}>
                    <input
                        className={'w-full'}
                        type="text"
                        name={'text'}
                        placeholder={`Message #${currentChannel.name}`}
                        autoComplete="off"
                        ref={messageInputRef}
                    />
                    <button className={'button-primary'}>Send</button>
                </MyForm>
            </div>
            {
                context.currentServerId !== 'me' &&
                <aside className={'members-sidebar border-normal-l'}>
                    <p className={'color-nav-text mb-4'}>Members:</p>
                    <hr className={'mb-4'} />
                    <ul>
                        {currentServer?.members.map(member => (
                            <li
                                key={'member-' + member.user.id}
                                style={{ color: api.users.getColorById(member.user.id) }}
                            >
                                {member.user.name}
                            </li>
                        ))}
                    </ul>
                </aside>
            }
        </main>
    );
}