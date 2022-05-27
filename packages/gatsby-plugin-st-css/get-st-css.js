// eslint-disable-next-line @typescript-eslint/no-var-requires
const { canonizeStCss, isStCss } = require('@st-css/core');

let stCss;

exports.getStCss = (stCssOrConfig) => {
    if (stCss) return stCss;
    stCss = isStCss(stCssOrConfig) ? stCssOrConfig : canonizeStCss(stCssOrConfig);
    return stCss;
};
