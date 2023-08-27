import type { GatsbyConfig } from 'gatsby';

const config: GatsbyConfig = {
    siteMetadata: {
        title: `StCss Gatsby Example`,
    },
    plugins: [`@st-css/gatsby-plugin-st-css`],
};

export default config;
