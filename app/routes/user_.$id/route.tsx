import { use, useEffect, useState } from 'react';
import type { User } from '~/routes/user/route';

export default function({ params }: { params: { id: string } }) {
    const [user, setUser] = useState<User | undefined>(undefined);
    
    useEffect(() => {
        fetch('http://localhost:3000/user/' + params.id)
            .then(res => res.json())
            .then(data => setUser(data));
    }, []);
    
    return <>User with id {params.id}, name: {user?.name}</>;
}