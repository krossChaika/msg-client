import { memo, type PropsWithChildren, type RefObject, useEffect, useRef } from 'react';
import { CloseButton } from '~/components/CloseButton';

type ModalProps = PropsWithChildren<{
    showButtonRef: RefObject<HTMLButtonElement | null>;
}>

export const Modal = memo(({ children, showButtonRef }: ModalProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    
    const onShowButtonClick = () => {
        if (!dialogRef.current) return;
        console.log('show');
        dialogRef.current.showModal();
    };
    
    const onCloseButtonClick = () => {
        if (!dialogRef.current) return;
        dialogRef.current.close();
    };
    
    useEffect(() => {
        showButtonRef.current?.addEventListener('click', onShowButtonClick);
        
        return () => {
            showButtonRef.current?.removeEventListener('click', onShowButtonClick);
        };
    }, []);
    
    return (
        <dialog className={'modal-dialog'} ref={dialogRef}>
            <CloseButton
                className={'absolute right-2 top-2 p-0!'}
                onClick={onCloseButtonClick}
            />
            {children}
        </dialog>
    );
});