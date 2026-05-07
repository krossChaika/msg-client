import { memo, type PropsWithChildren, type SubmitEventHandler } from 'react';

export type MyFormProps = PropsWithChildren<{
    className: string | undefined;
    onSubmit: (body: any) => void;
}>

export default memo(({ children, className, onSubmit }: MyFormProps) => {
    const onSubmitFinal: SubmitEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.currentTarget);
        const body: any = {};
        for (const [key, value] of formData.entries()) {
            body[key] = value;
        }
        
        onSubmit(body);
    };
    
    return (
        <form onSubmit={onSubmitFinal} className={className}>{children}</form>
    );
});