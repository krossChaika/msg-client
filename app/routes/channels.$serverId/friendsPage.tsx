import { memo, useContext } from 'react';
import { MainContext } from '~/hooks/useMain';
import { type SendFriendRequestFormBody, useChatSocket } from '~/hooks/useChatSocket';
import MyForm from '~/components/MyForm';
import { FriendRequestCard } from '~/routes/channels.$serverId/friendRequestCard';
import { FriendCard } from '~/routes/channels.$serverId/FriendCard';

export const FriendsPage = memo(() => {
    const { context, updateContext } = useContext(MainContext);
    const socket = useChatSocket();
    
    const onSubmit = async (body: SendFriendRequestFormBody) => {
        const response = await socket.sendFriendRequest(body);
        updateContext(draft => {
            draft.sentFriendRequests.push(response);
        });
    };
    
    return (
        <main className={'flex flex-1 flex-col space-y-8 p-4 color-primary'}>
            <h1>Send a friend request</h1>
            <MyForm className={'space-y-2 flex flex-col'} onSubmit={onSubmit}>
                <input
                    type="text"
                    name={'username'}
                    placeholder={'Username...'}
                    minLength={1}
                    maxLength={30}
                />
                <button className={'button-primary'}>
                    Send friend request
                </button>
            </MyForm>
            <hr />
            <section>
                <h1>Sent</h1>
                <ul>
                    {context.sentFriendRequests.map(x => (
                        <FriendRequestCard
                            key={'friend-req-from' + x.receiverId}
                            request={x}
                            isReceived={false}
                        />
                    ))}
                </ul>
            </section>
            <section>
                <h1>Received</h1>
                <ul>
                    {context.receivedFriendRequests.map(x => (
                        <FriendRequestCard
                            key={'friend-req-to' + x.senderId}
                            request={x}
                            isReceived={true}
                        />
                    ))}
                </ul>
            </section>
            <section>
                <h1>Your friends</h1>
                <ul>
                    {context.friendships.map(x => (
                        <FriendCard
                            key={'friend-' + x.friendId}
                            friendship={x}
                        />
                    ))}
                </ul>
            </section>
        </main>
    );
});

