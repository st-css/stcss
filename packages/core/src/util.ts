import { Reactive, reactive, ReactivelyParams } from '@reactively/core';
import { CustomCss, MaybeArray, Obj, ResponsiveRuleMap, RuleValue, StaticStyle } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const responsiveEquals = (a: any, b: any): boolean => {
    if (a === b) return true;

    if (Array.isArray(a) && Array.isArray(b)) {
        let length = a.length;
        if (length !== b.length) return false;
        while (length-- && a[length] === b[length]);
        return length === -1;
    }
    return false;
};

export const expandResponsiveValue = (value: RuleValue[]): RuleValue[] | RuleValue => {
    if (value.length === 4) return value;
    if (value.length === 1) return value[0];

    const expandedResponsiveValue: RuleValue[] = [];
    for (let i = 0; i < 4; i++) {
        expandedResponsiveValue[i] = value[i] === undefined ? expandedResponsiveValue[i - 1] ?? null : value[i];
    }
    return expandedResponsiveValue;
};

export const resolveResponsiveValueAtBp = <V>(val: MaybeArray<V> | null, bp: number, defaultValue: MaybeArray<V> | null = null): V | null => {
    if (!Array.isArray(val)) return val;
    for (let i = bp; i >= 0; i--) {
        if (val[i] !== undefined) {
            return val[i] ?? resolveResponsiveValueAtBp(defaultValue, bp);
        }
    }
    return null;
};

export const styleIsStatic = (style: Obj): boolean => {
    for (const cssProp in style) {
        const val = style[cssProp];
        if (typeof val === 'function') return false;
        if (val && typeof val === 'object' && !Array.isArray(val) && !styleIsStatic(val as Obj)) {
            return false;
        }
    }
    return true;
};

export const mergeRuleMaps = (ruleMaps: ResponsiveRuleMap[] = []): ResponsiveRuleMap => {
    const ruleMapCount = ruleMaps.length;
    const mergedRuleMap = new Map(ruleMaps[ruleMapCount - 1] ?? []);
    for (let i = ruleMapCount - 1; i >= 0; i--) {
        if (!ruleMaps[i]?.size) continue;

        ruleMaps[i]?.forEach((value, rule) => {
            const existingRuleValue = mergedRuleMap.get(rule);

            // if we haven't seen this rule before all we
            // need to do is set it
            if (existingRuleValue === undefined) {
                mergedRuleMap.set(rule, value);
            }

            // if we already have a non-responsive version of this rule
            // then nothing to do, since it always takes precedence
            if (!Array.isArray(existingRuleValue)) return;

            // at this point, we have an existing rule that is responsive so
            // we need to merge them to account for null values, which indicates
            // a value with less precedence should be carried over

            // replace any existing null values with the next value in the chain
            mergedRuleMap.set(
                rule,
                existingRuleValue.map((existingValueAtBp, bp) => {
                    if (existingValueAtBp !== null) return existingValueAtBp;
                    return Array.isArray(value) ? value[bp] : value;
                }),
            );
        });
    }
    return mergedRuleMap;
};

export interface BuildRuleMapOptions {
    props?: Obj;
    attrs?: Obj;
    bp?: number;
    customCss?: CustomCss;
    //transformers?: any[];
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const buildRuleMap = (stylesOrFunc: any, options?: BuildRuleMapOptions, sel = '?', result: ResponsiveRuleMap = new Map()): ResponsiveRuleMap => {
    const { customCss = {}, ...optionsWithoutCustomCss } = options ?? {};
    const { props, attrs, bp } = optionsWithoutCustomCss;
    const styles = typeof stylesOrFunc === 'function' ? stylesOrFunc(props, { attrs }) : stylesOrFunc;
    Object.entries(styles ?? {}).forEach(([cssPropOrSel, valueOrFunc]) => {
        const value = typeof valueOrFunc === 'function' ? valueOrFunc(props, { attrs }) : valueOrFunc;
        if (value !== undefined) {
            if (typeof value === 'object' && !Array.isArray(value)) {
                const expandedSels = cssPropOrSel.split(',');
                return expandedSels.forEach((expandedSel) => {
                    const newSel = expandedSel.replace('&', sel).trim();
                    buildRuleMap(value, options, newSel, result);
                });
            }

            const resolvedValue = bp === undefined ? (Array.isArray(value) ? expandResponsiveValue(value) : value) : resolveResponsiveValueAtBp(value, bp);

            if (resolvedValue !== null) {
                const transformCustom = customCss[cssPropOrSel];
                if (transformCustom) {
                    let transformedStyle: StaticStyle;
                    if (Array.isArray(resolvedValue)) {
                        transformedStyle = resolvedValue.reduce((style, val, _bp) => {
                            Object.entries(transformCustom(val)).forEach(([tProp, tVal]) => {
                                if (style[tProp] === undefined) {
                                    style[tProp] = [];
                                }
                                style[tProp].push(tVal);
                            });
                            return style;
                        }, {});
                    } else {
                        transformedStyle = transformCustom(resolvedValue);
                    }
                    buildRuleMap(transformedStyle, optionsWithoutCustomCss, sel, result);
                } else {
                    result.set(`${sel}|${cssPropOrSel}`, resolvedValue);
                }
            }
        }
    });
    return result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setSignalValue = (signalMap: Map<string, Reactive<any>>, name: string, value: any, signalParams?: ReactivelyParams): void => {
    let $signal = signalMap.get(name);
    if ($signal) {
        $signal.set(value);
    } else {
        $signal = reactive(value, signalParams);
        signalMap.set(name, $signal);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getSignalValue = (signalMap: Map<string, Reactive<any>>, name: string, defaultValue?: any, signalParams?: ReactivelyParams): any => {
    let $signal = signalMap.get(name);
    if (!$signal) {
        $signal = reactive(defaultValue, signalParams);
        signalMap.set(name, $signal);
    }
    return $signal.get();
};
