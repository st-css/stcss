import { StProvider } from '@st-css/core';
import { GatsbyBrowser } from 'gatsby';
import { stCss } from './src/index';

export const wrapRootElement: GatsbyBrowser['wrapRootElement'] = ({ element }) => {
    return <StProvider value={stCss}>{element}</StProvider>;
};
