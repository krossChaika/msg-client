import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '~/root';

export default function() {
    return (
        <>
            <h2>auth header</h2>
            <Outlet />
        </>
    );
}