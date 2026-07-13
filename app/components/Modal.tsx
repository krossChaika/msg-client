import { memo, type PropsWithChildren, type RefObject } from 'react';
import { CloseButton } from '~/components/CloseButton';
import { useModal } from '~/hooks/useModal';

type ModalProps = PropsWithChildren<{
    ref: RefObject<HTMLDialogElement | null>;
}>

export const Modal = memo(({ children, ref }: ModalProps) => {
    const controls = useModal(ref);
    
    return (
        <dialog className={'modal-dialog'} ref={ref}>
            <CloseButton
                className={'absolute right-2 top-2 p-0!'}
                onClick={controls.closeModal}
            />
            {children}
        </dialog>
    );
});