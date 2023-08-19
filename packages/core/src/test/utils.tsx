/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { canonizeStCss, StProvider } from '../context';

const stCss = canonizeStCss({
    mediaQueries: {
        mobile: '(max-width: 719px)',
        tablet: '(min-width: 720px) and (max-width: 991px)',
        laptop: '(min-width: 992px) and (max-width: 1199px)',
        desktop: '(min-width: 1200px)',
    },
    breakpoints: ['mobile', 'tablet', 'laptop', 'desktop'],
});

export const renderAtBp = (bp: string, el: React.ReactElement, options?: { debug?: boolean }) => {
    window.matchMedia = vi.fn().mockImplementation((mq) => {
        return {
            addEventListener: () => {},
            removeEventListener: () => {},
            matches: mq === (stCss.mediaQueries as any)[bp],
        };
    });

    const { container, debug } = render(el, {
        wrapper: ({ children }) => <StProvider value={stCss}>{children}</StProvider>,
    });

    // JSDOM uses CSSOM which cannot parse CSS media queries (and just ignores them)
    // to overcome this limitation, we copy over the rules within the media query / breakpoint
    // we are currently testing/rendering, and insert them into the style tag manually without
    // wrapping them inside a media query. This means we can render only one reponsive component
    // per test (jsdom instance)
    const style = document.getElementById(`st-${bp}`) as HTMLStyleElement;
    style.innerHTML = style.sheet?.cssRules[0]?.cssText.replace(/@media (?:[^{]*){([\s\S]*)}/, '$1') || '';

    if (options?.debug) {
        console.log('='.repeat(50));
        console.log(stCss.styleManager.toString());
        console.log('~'.repeat(50));
        debug(container);
        console.log('='.repeat(50));
    }

    return container.firstChild;
};

export const testAtBps = (el: React.ReactElement, bpTest: (el: ChildNode | null, bpIndex: number) => void) => {
    stCss.breakpoints.forEach((bp, i) => {
        test(`at ${bp} breakpoint`, () => {
            bpTest(renderAtBp(bp, el), i);
        });
    });
};
