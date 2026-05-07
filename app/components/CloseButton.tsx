import { memo } from 'react';
import cross from './cross.svg';

type CloseButtonProps = {
    className?: string;
    onClick?: () => void;
}

export const CloseButton = memo((props: CloseButtonProps) => {
    return (
        <button className={props.className} onClick={props.onClick}>
            <img src={cross} alt={'Close'} />
        </button>
    );
});