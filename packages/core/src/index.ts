import { canonizeStCss } from './st';

export * from './st';
export * from './types';
export * from './util';

export const st = canonizeStCss({
    mediaQueries: {
        mobile: '(max-width: 719px)',
        tablet: '(min-width: 720px) and (max-width: 991px)',
        laptop: '(min-width: 992px) and (max-width: 1199px)',
        desktop: '(min-width: 1200px)',
    },
    breakpoints: ['mobile', 'tablet', 'laptop', 'desktop'],
    customCss: {
        px: function (value: string | number) {
            return {
                paddingLeft: String(value),
                paddingRight: String(value),
            };
        },
    },
});
