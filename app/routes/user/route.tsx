import { memo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import MyForm from '~/components/MyForm';
import api from '~/api';

export type User = {
    name: string;
    id: number
}

type OptimisticUser = User & {
    isPending?: boolean;
}

export default function() {
    const url = api.url('user');
    
    const query = useQuery({
        queryKey: ['users'],
        staleTime: 5 * 60 * 1000,
        queryFn: async (): Promise<OptimisticUser[]> => {
            const res = await fetch(url);
            const json = await res.json();
            return json;
        },
    });
    
    const queryClient = useQueryClient();
    
    const mutation = useMutation({
        mutationKey: ['addUser'],
        mutationFn: async (body: any) => {
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
            });
            
            if (!response.ok) throw new Error('Failed to create a new user');
            
            return await response.json();
        },
        onMutate: async (newUser, context) => {
            await context.client.cancelQueries({ queryKey: ['users'] });
            
            const optimistic = newUser as OptimisticUser;
            optimistic.isPending = true;
            context.client.setQueryData<OptimisticUser[]>(['users'], old =>
                old ? [...old, optimistic] : [optimistic],
            );
            
            const previousUsers = context.client.getQueryData(['users']);
            return { previousUsers };
        },
        onError: (error, newUser, onMutateResult, context) => {
            context.client.setQueryData(['users'], onMutateResult!.previousUsers);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
    
    if (query.isPending) {
        return <>Loading...</>;
    }
    
    if (query.isError) {
        return <>Error</>;
    }
    
    return (
        <main className={'flex flex-col'}>
            <UsersList users={query.data} />
            <MyForm className={'flex flex-col'} onSubmit={(body) => mutation.mutate(body)}>
                <input type="text" name={'name'} />
                <button className={'button-primary'} type={'submit'}>Create user</button>
            </MyForm>
        </main>
    );
}

const UsersList = memo(({ users }: { users: OptimisticUser[] }) => {
    return (
        <ul className={'border border-zinc-800 rounded-2xl space-y-2'}>
            {users.map(user => <UserCard key={'user-' + user.id} user={user} />)}
        </ul>
    );
});

const UserCard = memo(({ user }: { user: OptimisticUser }) => {
    return (
        <li className={'p-2'} style={{ opacity: user.isPending ? 0.65 : 1 }}>
            {user.name} (id: {user.id})
        </li>
    );
});