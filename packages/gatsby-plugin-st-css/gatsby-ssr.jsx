// eslint-disable-next-line @typescript-eslint/no-unused-vars
//import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { StProvider } = require('@st-css/core');

//import type { GatsbySSR } from 'gatsby';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getStCss } = require('./get-st-css');

exports.wrapRootElement = ({ element }, { plugins: _plugins, ...stCssOrConfig }) => {
    return <StProvider value={getStCss(stCssOrConfig)}>{element}</StProvider>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.onRenderBody = ({ setHeadComponents }, { plugins: _plugins, ...stCssOrConfig }) => {
    const { styleManager } = getStCss(stCssOrConfig);
    setHeadComponents([<style key="st-css" dangerouslySetInnerHTML={{ __html: styleManager.toString() }} />]);
};
