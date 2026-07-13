import type { RefObject } from 'react';

export function useModal(dialogRef: RefObject<HTMLDialogElement | null>) {
    const showModal = () => {
        if (!dialogRef.current) return;
        
        dialogRef.current.showModal();
    };
    
    const closeModal = () => {
        if (!dialogRef.current) return;
        
        dialogRef.current.close();
    };
    
    return {
        showModal,
        closeModal,
    };
}