import axios from 'axios';
import MyForm from '~/components/MyForm';

export default function() {
    const onSubmit = async (body: any) => {
        try {
            const response = await axios.post(import.meta.env.VITE_API_URL + '/auth/login', body, {
                withCredentials: true,
            });
            
            const mes = response.data.message;
            
            if (mes) {
                console.log(mes);
            } else {
                console.log('login error');
            }
        } catch (error) {
            console.log(error);
        }
    };
    
    return (
        <main className={'flex flex-col'}>
            <MyForm className={'flex flex-col space-y-4 m-4'} onSubmit={onSubmit}>
                <input type="text" name={'username'} />
                <input type="text" name={'password'} />
                <button className={'button-primary'}>Login</button>
            </MyForm>
        </main>
    );
}