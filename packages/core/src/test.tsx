import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { st } from '.';

const container = document.getElementById('root');
const root = createRoot(container!);

const Title = st<{ type?: 'primary' | 'secondary' }>()({
    el: 'h1',
    forwardCss: ['px'],
    forwardAttrs: ['title'],
    defaultAttrs: {
        title: 'test',
    },
    css: {
        color: (p) => (p.type === 'primary' ? 'green' : 'red'),
        padding: '2px',
    },
    variants: {
        size: {
            sm: {
                fontSize: '12px',
            },
            md: {
                fontSize: '16px',
            },
            lg: {
                fontSize: '24px',
            },
        },
    },
    defaultVariants: {
        size: ['md', , 'lg', null],
    },
    Component: ({ El, attrs, children }) => {
        return (
            <El {...attrs}>
                <em>{children}</em>
            </El>
        );
    },
});

const Test = () => {
    const [on, setOn] = useState(false);
    return (
        <div>
            <Title size={['sm', 'md', 'lg']} title={'3'}>
                Above
            </Title>
            <button onClick={() => setOn(!on)}>{on ? 'OFF' : 'ON'}</button>
        </div>
    );
};

root.render(
    <StrictMode>
        <Test />
    </StrictMode>,
);
