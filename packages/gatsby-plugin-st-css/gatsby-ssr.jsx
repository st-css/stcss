// eslint-disable-next-line @typescript-eslint/no-unused-vars
//import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { StProvider } = require('@st-css/core');

//import type { GatsbySSR } from 'gatsby';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { stCss } = require('./src/index');

exports.wrapRootElement = ({ element }) => {
    return <StProvider value={stCss}>{element}</StProvider>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.onRenderBody = ({ setHeadComponents }) => {
    const { styleManager } = stCss;
    setHeadComponents([<style key="st-css" dangerouslySetInnerHTML={{ __html: styleManager.toString() }} />]);
};
