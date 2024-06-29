import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { st } from '../';

export const renderAtBp = (bp: string, el: React.ReactElement, options?: { debug?: boolean }) => {
    const { container, debug } = render(el);

    // JSDOM uses CSSOM which cannot parse CSS media queries (and just ignores them)
    // to overcome this limitation, we copy over the rules within the media query / breakpoint
    // we are currently testing/rendering, and insert them into the style tag manually without
    // wrapping them inside a media query. This means we can render only one reponsive component
    // per test (jsdom instance)
    //const style = document.getElementById(`st-${bp}`) as HTMLStyleElement;
    //style.innerHTML = style.sheet?.cssRules[0]?.cssText.replace(/@media (?:[^{]*){([\s\S]*)}/, '$1') || '';

    if (options?.debug) {
        console.log('='.repeat(50));
        console.log(st.styleManager.toString());
        console.log('~'.repeat(50));
        debug(container);
        console.log('='.repeat(50));
    }

    return container.firstChild;
};

export const testAtBps = (el: React.ReactElement, bpTest: (el: ChildNode | null, bpIndex: number) => void) => {
    // todo: fix typing
    st.config.breakpoints.forEach((bp: string, i: number) => {
        test(`at ${bp} breakpoint`, () => {
            bpTest(renderAtBp(bp, el), i);
        });
    });
};
