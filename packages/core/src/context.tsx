/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, CSSProperties } from 'react';
import { useMediaQueries } from './hooks';
import { makeStComponentCreator, St } from './st';
import { StyleManager } from './style-manager';
import { Obj } from './types';

export type CustomCss<CC = Obj> = {
    [P in keyof CC]?: CC[P] extends (val: infer V) => CSSProperties ? V : never;
};

export type Themes<TH> = TH extends Record<infer T, Obj>
    ? TH & {
          default: T;
      }
    : never;

export type StConfig<MQ extends Record<string, string>, CC extends Record<string, (value: any) => CSSProperties>> = {
    mediaQueries: MQ;
    breakpoints: (keyof MQ)[];
    customCss?: CustomCss<CC>;
};

/*
& (
    | {
          themes?: never;
          defaultTheme?: never;
      }
    | { themes: TH; defaultTheme: keyof TH }
);
export const canonizeStCss = <MQ extends Record<string, string>, CC extends Record<string, (value: any) => CSSProperties>, TH extends Record<string, Obj>>(
    _config: StConfig<MQ, CC, TH>
): St<MQ, CustomCss<CC>, TH extends Record<string, infer T extends Obj> ? Merge<T> : never> => {
    //const styleManager = new StyleManager(config as unknown as StConfig<Record<string, string>>);
    //return {
    //    ...config,
    //    styleManager,
    //};
    return {
        st:
    }
};

*/

export type StContext = { bpIndex: number; mqs: Record<string, boolean> };
export const StContext = createContext({} as StContext);

export const canonizeStCss = <MQ extends Record<string, string>, CC extends Record<string, (value: any) => CSSProperties>>(
    config: StConfig<MQ, CC>
): St<MQ, CC> => {
    const { mediaQueries, breakpoints } = config;
    const styleManager = new StyleManager({ mediaQueries, breakpoints: breakpoints as string[] });
    return {
        config,
        st: makeStComponentCreator<MQ, CC>({ styleManager }) as any,
        StProvider: ({ children }) => {
            const mqs = useMediaQueries(config.mediaQueries);
            const bpIndex = breakpoints.findIndex((bp) => mediaQueries[bp]);
            return <StContext.Provider value={{ bpIndex, mqs }}>{children}</StContext.Provider>;
        },
    };
};

/*
const { st } = canonizeStCss({
    mediaQueries: {
        mobile: '(max-width: 719px)',
    },
    breakpoints: ['mobile'],
    customCss: {
        p: (val: string | number) => ({ padding: `${val}px` }),
    },
    themes: {
        light: {
            color: 'green',
        },
        dark: {
            color: 'red',
            size: 2,
        },
    },
    defaultTheme: 'light',
});

const Test = st()({
    el: 'h1',
    forwardCss: ['p'],
    css: {
        color: 'green',
        ':hover': {
            width: ['1px', '2px'],
            '@mobile': ({ theme }) => ({
                color: theme.color
            }),
        },
    },
});
*/
