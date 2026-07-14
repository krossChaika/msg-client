import axios from 'axios';
import MyForm from '~/components/MyForm';
import { useNavigate } from 'react-router';
import api from '~/api';

export default function() {
    const navigate = useNavigate();
    
    const onSubmit = async (body: any) => {
        try {
            const response = await axios.post(api.url('/auth/register'), body, {
                withCredentials: true,
            });
            
            console.log(response.data.message);
            navigate('/channels/me');
        } catch (error) {
            console.log(error);
            alert('User already exists!');
        }
    };
    
    return (
        <main className={'max-w-[100vw] w-200 m-auto p-4'}>
            <h1 className={'text-center mt-4'}>Register</h1>
            <MyForm className={'flex flex-col flex-1 space-y-2 m-4'} onSubmit={onSubmit}>
                <input
                    type="text"
                    name={'username'}
                    placeholder={'Username...'}
                    minLength={4}
                    maxLength={32}
                />
                <input
                    type="text"
                    name={'password'}
                    placeholder={'Password...'}
                    minLength={4}
                    maxLength={32}
                />
                <button className={'button-primary mt-8 w-full!'}>Register</button>
            </MyForm>
        </main>
    );
}