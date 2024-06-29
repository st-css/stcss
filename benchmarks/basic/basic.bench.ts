/* eslint-disable @typescript-eslint/no-explicit-any */
import { createElement } from 'react';
import { styled } from 'styled-components';
import { bench } from 'vitest';
import { st } from '@st-css/core';
import { renderToString } from 'react-dom/server';
import emotionStyled from '@emotion/styled';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderComponent = (Component: any, props?: any) => {
    renderToString(createElement(Component, props));
};

describe('static css', () => {
    const staticCss = {
        textAlign: 'center',
        '&:hover': {
            color: 'blue',
        },
    } as const;

    bench('st-css', () => {
        renderComponent(
            st<{ counter: number }>()({
                el: 'div',
                forwardCss: ['color'],
                css: {
                    ...staticCss,
                    opacity: (p) => (p.counter > 0.5 ? 1 : 0),
                } as const,
            }),
            { counter: Math.random(), color: 'red' },
        );
    });

    bench('styled-components', () => {
        renderComponent(
            styled('div')((p: any) => ({
                ...staticCss,
                color: p.color,
                opacity: p.counter > 0.5 ? 1 : 0,
            })),
            { counter: Math.random(), color: 'red' },
        );
    });

    bench('emotion', () => {
        renderComponent(
            emotionStyled('div')((p: any) => ({
                ...staticCss,
                color: p.color,
                opacity: p.counter > 0.5 ? 1 : 0,
            })),
            { counter: Math.random(), color: 'red' },
        );
    });
});
