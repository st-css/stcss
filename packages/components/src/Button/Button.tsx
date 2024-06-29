import { st } from '@st-css/core';

interface ButtonProps {
    type?: 'primary' | 'secondary';
}

export const Button = st<ButtonProps>()({
    el: 'button',
    forwardCss: ['backgroundColor'],
    css: {
        appearance: 'none',
        cursor: 'pointer',
        textAlign: 'center',
        lineHeight: 'inherit',
        textDecoration: 'none',
        fontSize: 'inherit',
        padding: '1em ',
        color: 'white',
        background: 'black',
        border: 0,
        borderRadius: '4px',
        '&': ['p', ({ type }) => ({ color: type === 'primary' ? 'green' : 'red' })],
    },
});

export default Button;
