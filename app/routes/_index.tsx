import { Link } from 'react-router';

export default function Home() {
    // max-w-[100vw] w-[40%] min-w-[600px]
    // w-[max(800px,40%)]
    return (
        <main className={'max-w-[100vw] w-200 m-auto p-4'}>
            <h1 className={'w-full text-center mt-4'}>Welcome!</h1>
            <hr />
            <ul className={'text-blue-500 underline space-y-8 mt-4'}>
                <li>
                    <Link to={'/auth/register'}>Register</Link>
                </li>
                <li>
                    <Link to={'/auth/login'}>Log in</Link>
                </li>
                <li>
                    <Link to={'/channels/me'}>Start chatting</Link>
                </li>
            </ul>
        </main>
    );
}