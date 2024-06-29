/* eslint-disable @typescript-eslint/no-explicit-any */
import { Reactive, reactive } from '@reactively/core';
import { createElement, useMemo } from 'react';
import { buildRuleMap, getSignalValue, mergeRuleMaps, resolveResponsiveValueAtBp, responsiveEquals, setSignalValue, styleIsStatic } from './util';
import { StyleManager } from './style-manager';
import {
    Attrs,
    CanonizeConfig,
    CssProp,
    CustomCss,
    CustomCssProp,
    DefaultVariants,
    DynamicStyle,
    El,
    MaybeResponsive,
    Obj,
    ResponsiveRuleMap,
    RuleMap,
    StaticStyle,
    StComponent,
    StConfig,
} from './types';

export const canonizeStCss = <MQ extends Obj<string>, CC extends CustomCss>(config: CanonizeConfig<MQ, CC>) => {
    const { breakpoints, customCss } = config;
    const styleManager = new StyleManager(config);
    // eslint-disable-next-line @typescript-eslint/ban-types
    function st<P extends Obj = {}>() {
        return function stCss<
            I extends keyof El,
            FA extends keyof El[I] | undefined,
            FC extends keyof (CssProp & CustomCssProp<CC>) | undefined,
            V extends Obj<Obj>,
            DV extends DefaultVariants<V>,
        >(stConfig: StConfig<CC, P, I, FC, V, DV, FA>) {
            const { el, Component, className = [], css = {} } = stConfig;

            // we use type hints here to widen the types to make things easier below
            const forwardCss: string[] = (stConfig.forwardCss as string[]) ?? [];
            const forwardAttrs: unknown[] = stConfig.forwardAttrs ?? [];
            const defaultAttrs: Obj = stConfig.defaultAttrs ?? {};
            const defaultProps: Obj = stConfig.defaultProps ?? {};
            const variants: Obj<Obj<StaticStyle>> = stConfig.variants ?? ({} as any);
            const defaultVariants: Obj<MaybeResponsive<unknown>> = {};

            // break out CSS into static/dynamic objects, allowing us to
            // build and cache the static CSS rule map
            const staticCss: StaticStyle = {};
            const dynamicCss: DynamicStyle = {};
            Object.entries(css).forEach(([cssProp, value]) => {
                const cssObj: any = typeof value === 'function' ? dynamicCss : staticCss;
                cssObj[cssProp] = value;
            });

            const staticRuleMap = buildRuleMap(staticCss, { customCss });
            const staticVariantNames: string[] = [];
            Object.entries(variants).forEach(([variantName, variantStyle]) => {
                if (styleIsStatic(variantStyle)) {
                    staticVariantNames.push(variantName);
                }
            });

            // this function will be used at the component level to isolate state between component instances
            const makeAttrResolver = () => {
                // map of all attribute signals
                const attrSignalMap = new Map();

                //we need to assign defaults so we can have them immediately available to the component,
                // even if they are not accessed by dynamic style functions
                Object.entries(defaultAttrs).forEach(([attrName, value]) => setSignalValue(attrSignalMap, attrName, value));

                // create proxy to track attribute references in dynamic style functions
                const proxiedAttrs = new Proxy({}, { get: (_, attrName: string) => getSignalValue(attrSignalMap, attrName, defaultAttrs[attrName]) });

                // map of all prop signals
                const propSignalMap = new Map();

                // create proxy to track property references in dynamic style functions
                // this will be passed to non-variant dynamic style functions and will present
                // variant props as they are passed to the component
                const proxiedProps = new Proxy<Obj>(
                    {},
                    {
                        get: (_, propName: string) =>
                            getSignalValue(
                                propSignalMap,
                                propName,
                                variants[propName] ? defaultVariants[propName] : defaultProps[propName],
                                variants[propName] || forwardCss.includes(propName) ? { equals: responsiveEquals } : undefined,
                            ),
                    },
                );

                // create proxies per-breakpoint that will be passed to dynamic style functions used within variants
                // so we can support responsive variants. regular props (i.e. non-variants) will reference the
                // same signals as proxiedProps
                const proxiedPropsByBp = breakpoints.map((_, bpIndex) => {
                    return new Proxy<Obj>(
                        {},
                        {
                            get: (_, propName: string) => resolveResponsiveValueAtBp(proxiedProps[propName], bpIndex, defaultVariants[propName]),
                        },
                    );
                });

                // create array of rule map signals in order of precedence
                const ruleMapBuildOptions = { attrs: proxiedAttrs, props: proxiedProps, customCss };

                const ruleMapSignals = [
                    // dynamic top-level css config
                    reactive(() => buildRuleMap(dynamicCss, ruleMapBuildOptions)),

                    // variant styles
                    ...Object.keys(variants).map((variantName) =>
                        reactive(() => {
                            let ruleMap: ResponsiveRuleMap;

                            // avoid building per breakpoint when both variant value is non-responsive and variant css is static
                            if (staticVariantNames.includes(variantName) && !Array.isArray(proxiedProps[variantName])) {
                                return buildRuleMap(variants[variantName]?.[proxiedProps[variantName] as string]);
                            }

                            // build rule map at each breakpoint, merging the individual values together
                            // TODO: explore optimizations to this algorithm
                            proxiedPropsByBp.forEach((proxiedPropsAtBp, bp) => {
                                const variantValue = proxiedPropsAtBp[variantName] ?? '';
                                const style = variants[variantName]?.[variantValue as string];
                                const ruleMapAtBp = buildRuleMap(style, { bp, attrs: proxiedAttrs, props: proxiedPropsAtBp }) as RuleMap;

                                if (!ruleMap) {
                                    ruleMap = ruleMapAtBp;
                                    return;
                                }

                                ruleMapAtBp.forEach((value, rule) => {
                                    const existingValue = ruleMap.get(rule) ?? null;

                                    if (existingValue === value) return;

                                    if (existingValue === undefined) {
                                        ruleMap.set(rule, value);
                                    } else if (Array.isArray(existingValue)) {
                                        existingValue.push(value);
                                    } else {
                                        const valueArray = new Array(bp).fill(existingValue);
                                        valueArray.push(value);
                                        ruleMap.set(rule, valueArray);
                                    }
                                });
                            });

                            return ruleMap!;
                        }),
                    ),

                    // component-level css overrides
                    reactive(() => buildRuleMap((props: any) => props.css, ruleMapBuildOptions)),

                    // component-level forwarded css overrides
                    reactive(() =>
                        buildRuleMap(
                            (props: any) =>
                                forwardCss.reduce((style, prop) => {
                                    if (props[prop] !== undefined) {
                                        style[prop] = props[prop];
                                    }
                                    return style;
                                }, {} as Obj),
                            ruleMapBuildOptions,
                        ),
                    ),
                ];

                // array of merged rule maps
                const $mergedRuleMap = reactive(() => {
                    return mergeRuleMaps([staticRuleMap, ...ruleMapSignals.map(($ruleMap) => $ruleMap.get())]);
                });

                const $className = reactive(() => {
                    const classes = new Set(Array.isArray(className) ? className : className.split(' '));
                    $mergedRuleMap.get().forEach((value, rule) => {
                        if (Array.isArray(value)) {
                            for (let i = 0; i < value.length; i++) {
                                const bp = breakpoints[i];
                                classes.add(styleManager.getClassForRule(rule, value[i] as string, bp as string));
                            }
                        } else {
                            classes.add(styleManager.getClassForRule(rule, value as string, '__global'));
                        }
                    });

                    return [...classes].join(' ');
                });

                const $attrs = reactive(() => {
                    const attrs: Record<string, Reactive<any>> = {};
                    attrSignalMap.forEach(($attr, attrName) => (attrs[attrName] = $attr.get()));
                    return attrs;
                });

                return ({ attrs = {}, ...props }: any) => {
                    Object.entries(attrs).forEach(([attrName, value]) => {
                        if (value !== undefined) {
                            setSignalValue(attrSignalMap, attrName, value);
                        }
                    });

                    Object.entries(props).forEach(([propName, value]) => {
                        if (value !== undefined) {
                            const signalMap = forwardAttrs.includes(propName) ? attrSignalMap : propSignalMap;
                            setSignalValue(signalMap, propName, value, forwardCss.includes(propName) ? { equals: responsiveEquals } : undefined);
                        }
                    });

                    propSignalMap.forEach(($prop, propName) => {
                        if (props[propName] === undefined) {
                            $prop.set(defaultProps[propName]);
                        }
                    });

                    attrSignalMap.forEach(($attr, attrName) => {
                        if (attrs[attrName] === undefined && props[attrName] === undefined) {
                            $attr.set(defaultAttrs[attrName]);
                        }
                    });

                    return { className: $className.get(), ...$attrs.get() };
                };
            };

            const St: StComponent<CC, P, I, FC, V, FA> = function St({ children, as, ...props }) {
                const attrResolver = useMemo(makeAttrResolver, []);
                const attrs = attrResolver(props) as Attrs<I>;

                if (Component) {
                    return createElement(Component, { El: (as as I) || el, ...defaultProps, ...props, attrs }, children);
                }

                return createElement(as || el, attrs, children);
            };

            return St;
        };
    }

    st.config = config;
    st.styleManager = styleManager;

    return st;
};
