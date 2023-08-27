// eslint-disable-next-line @typescript-eslint/no-unused-vars
//import * as React from 'react';
//import type { GatsbyBrowser } from 'gatsby';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { StProvider } = require('@st-css/core');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { stCss } = require('./src/index');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.wrapRootElement = ({ element }) => {
    return <StProvider value={stCss}>{element}</StProvider>;
};
