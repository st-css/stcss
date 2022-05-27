// eslint-disable-next-line @typescript-eslint/no-unused-vars
//import * as React from 'react';
//import type { GatsbyBrowser } from 'gatsby';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { StProvider } = require('@st-css/core');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getStCss } = require('./get-st-css');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.wrapRootElement = ({ element }, { plugins: _plugins, ...stCssOrConfig }) => {
    return <StProvider value={getStCss(stCssOrConfig)}>{element}</StProvider>;
};
