import { createElement } from 'react';
import { useSt } from './hooks';
import { mergeResponsiveObjs, mergeStObjs, resolveDynamicValue, resolveStStyle } from './util';

// this function is intentially NOT written in typescript since the typings
// quickly took a relatively straight forward function and made it very difficult
// to follow. Ambient typings are provided in st.d.ts and unit tests confirm behavior

export const st = () => {
    return function st(options) {
        const { el, defaultAttrs = [], defaultProps = [], className = [], forwardAttrs = [], forwardCss = [], css = [], render } = options;

        const defaultAttrsArray = Array.isArray(defaultAttrs) ? defaultAttrs : [defaultAttrs];
        const defaultPropsArray = Array.isArray(defaultProps) ? defaultProps : [defaultProps];
        const defaultCssArray = Array.isArray(css) ? css : [css];
        const classNameArray = Array.isArray(className) ? className : [className];

        const St = function St({ children, as, attrs, css, className, ...props }) {
            const { bpIndex, styleManager, breakpoints } = useSt();

            const forwardedAttrs = {};
            const forwardedCss = {};
            if (forwardAttrs.length || forwardCss.length) {
                Object.keys(props).forEach((prop) => {
                    if (forwardAttrs.includes(prop)) {
                        forwardedAttrs[prop] = props[prop];
                    } else if (forwardCss.includes(prop)) {
                        forwardedCss[prop] = props[prop];
                    }
                });
            }

            const mergedProps = mergeStObjs(bpIndex, [...defaultPropsArray, props]);
            const mergedAttrs = mergeStObjs(bpIndex, [...defaultAttrsArray, attrs, forwardedAttrs], mergedProps);

            const mergedCss = mergeResponsiveObjs(
                [...defaultCssArray, css, forwardedCss].map((style) => resolveStStyle(style, mergedProps)),
                breakpoints.length
            );
            const cssClassNames = styleManager.getClassesForStyle(mergedCss);
            const classNames = [...classNameArray.map((c) => resolveDynamicValue(c, mergedProps)), className, ...cssClassNames].filter(Boolean);
            if (classNames.length) {
                mergedAttrs.className = classNames.join(' ');
            }

            if (!render) {
                return createElement(as || el, mergedAttrs, children);
            }

            return render({ C: as || el, attrs: { children, ...mergedAttrs }, ...mergedProps });
        };

        St.extend = () => {
            return function stExtend(options) {
                const extendedCss = options.css || [];
                return st({
                    el: options.as || el,
                    className: options.className,
                    forwardAttrs: options.forwardAttrs,
                    forwardCss: options.forwardCss,
                    defaultAttrs: [...defaultAttrsArray, options.defaultAttrs],
                    defaultProps: [...defaultPropsArray, options.defaultProps],
                    css: [...defaultCssArray, ...(Array.isArray(extendedCss) ? extendedCss : [extendedCss])],
                    render,
                });
            };
        };

        return St;
    };
};
