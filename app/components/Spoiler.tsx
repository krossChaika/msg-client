import { type PropsWithChildren, useState } from 'react';

export default function({ children }: PropsWithChildren<{}>) {
    const [hidden, setHidden] = useState(true);
    
    return (
        <span className={'rounded-b-sm'}>{children}</span>
    );
}