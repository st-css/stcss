import { StProvider } from '@st-css/core';
import { GatsbySSR } from 'gatsby';
import { stCss } from './src/index';

export const wrapRootElement: GatsbySSR['wrapRootElement'] = ({ element }) => {
    return <StProvider value={stCss}>{element}</StProvider>;
};

export const onRenderBody: GatsbySSR['onRenderBody'] = ({ setHeadComponents }) => {
    const { styleManager } = stCss;
    setHeadComponents([<style key="st-css" dangerouslySetInnerHTML={{ __html: styleManager.toString() }} />]);
};
