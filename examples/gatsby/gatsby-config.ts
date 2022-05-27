import type { GatsbyConfig } from 'gatsby';

const config: GatsbyConfig = {
    siteMetadata: {
        title: `StCss Gatsby Example`,
    },
    plugins: [
        {
            resolve: `@st-css/gatsby-plugin-st-css`,
            options: {
                mediaQueries: {
                    mobile: '(max-width: 719px)',
                    tablet: '(min-width: 720px) and (max-width: 991px)',
                    laptop: '(min-width: 992px) and (max-width: 1199px)',
                    desktop: '(min-width: 1200px)',
                },
                breakpoints: ['mobile', 'tablet', 'laptop', 'desktop'],
            },
        },
    ],
};

export default config;
