/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext } from 'react';
import { useMediaQueries } from './hooks';
import { StyleManager } from './style-manager';

export type StConfig<MQ extends Record<string, string> = Record<string, string>> = {
    mediaQueries: MQ;
    breakpoints: (keyof MQ)[];
};

/*
const defaultConfig = {
    mediaQueries: {
        mobile: '(max-width: 719px)',
        tablet: '(min-width: 720px) and (max-width: 991px)',
        laptop: '(min-width: 992px) and (max-width: 1199px)',
        desktop: '(min-width: 1200px)',
    },
    breakpoints: ['mobile', 'tablet', 'laptop', 'desktop'],
};
*/

export type StContext<MQ extends Record<string, string> = Record<string, string>> = StCss<MQ> & { bpIndex: number; mqs: Record<keyof MQ, boolean> };

export type StCss<MQ extends Record<string, string> = Record<string, string>> = StConfig<MQ> & {
    styleManager: StyleManager;
};

export const isStCss = <MQ extends Record<string, string> = Record<string, string>>(config: StConfig<MQ> | StCss<MQ>): config is StCss<MQ> => {
    return (config as StCss<MQ>).styleManager !== undefined;
};

export const canonizeStCss = <MQ extends Record<string, string> = Record<string, string>>(config: StConfig<MQ>): StCss<MQ> => {
    const styleManager = new StyleManager(config as unknown as StConfig<Record<string, string>>);
    return {
        ...config,
        styleManager,
    };
};

export const StContext = createContext({} as StContext);

export const StProvider = ({ children, value }: { children: React.ReactNode; value: StCss<Record<string, string>> }) => {
    const { mediaQueries, breakpoints } = value;
    const mqs = useMediaQueries(mediaQueries);
    const bpIndex = breakpoints.findIndex((bp) => mediaQueries[bp]);
    return <StContext.Provider value={{ ...value, bpIndex, mqs }}>{children}</StContext.Provider>;
};
