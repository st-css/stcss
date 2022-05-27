/* eslint-disable @typescript-eslint/no-explicit-any */
import { MaybeArray, Obj, StDynamicValue, StObj, StResponsiveObj, StResponsiveValue, StStyle } from './types';

export const resolveDynamicValue = <V, A>(value: StDynamicValue<V, A>, args: A): V | undefined => {
    return typeof value === 'function' ? (value as any)(args) : value;
};

export const objForEach = (obj: any, args: any | undefined, cb: (c: [string, any]) => void): void => {
    if (obj === undefined) return;
    if (typeof obj === 'function') return objForEach(obj(args), args, cb);
    if (obj && typeof obj === 'object') {
        Object.entries(obj).forEach(([key, val]) => {
            if (typeof val === 'function') {
                val = val(args);
            }
            cb([key, val]);
        });
    }
};

export type Transformer = (prop: string, value: string) => Record<string, string> | string | undefined;

export const transformValue = (prop: string, val: string, transformers: Transformer[], result: Record<string, string> = {}): Record<string, string> => {
    let transformed = false;
    for (const transformer of transformers) {
        const r = transformer(prop, val);
        if (r !== undefined) {
            transformed = true;
            if (r && typeof r === 'object') {
                Object.entries(r).forEach(([tProp, tVal]) => {
                    transformValue(
                        tProp,
                        tVal,
                        transformers.filter((t) => t !== transformer),
                        result
                    );
                });
                break;
            } else {
                result[prop] = r;
            }
        }
    }

    if (!transformed) {
        result[prop] = val;
    }

    return result;
};

export const resolveStStyle = <A>(
    style: StStyle<A> | undefined,
    args?: A,
    transformers?: Transformer[],
    sel = '?',
    result: Record<string, string | string[]> = {}
): Record<string, MaybeArray<string | number>> => {
    if (style) {
        objForEach(style, args, ([key, val]) => {
            if (typeof val === 'object') {
                if (key === '&') {
                    const nestedSel = val[0].split(',');
                    return nestedSel.forEach((ns: string) => {
                        let newSel = ns.replaceAll('&', sel);
                        if (!newSel.includes('?')) {
                            newSel = '? ' + newSel;
                        }
                        resolveStStyle(val[1], args, transformers, newSel, result);
                    });
                } else if (!Array.isArray(val)) {
                    return resolveStStyle(val, args, transformers, sel + key, result);
                }
            }
            if (transformers) {
                let transformedValue: Record<string, string | string[]>;
                if (Array.isArray(val)) {
                    const transformedValues = val.map((v) => transformValue(key, v, transformers));
                    transformedValue = transformedValues.reduce((obj, v) => {
                        Object.entries(v).forEach(([tProp, tVal]) => {
                            if (!obj[tProp]) {
                                obj[tProp] = [];
                            }
                            obj[tProp].push(tVal);
                        });
                        return obj;
                    }, {} as Record<string, string[]>);
                } else {
                    transformedValue = transformValue(key, val, transformers);
                }
                Object.entries(transformedValue).forEach(([tProp, tVal]) => {
                    result[`${sel}|${tProp}`] = tVal;
                });
            } else {
                result[`${sel}|${key}`] = val;
            }
        });
    }
    return result;
};

export function resolveStObj<O extends Obj, A extends Obj>(obj: StObj<O, A> | StResponsiveObj<O> | undefined, bpIndex: number, args: A = {} as any): O {
    const result: Record<string, unknown> = {};
    objForEach(obj, args, ([prop, value]) => {
        if (Array.isArray(value)) {
            let v;
            for (let i = bpIndex + 1; i--; i >= 0) {
                if (value[i] !== undefined) {
                    v = value[i];
                    break;
                }
            }
            if (v !== null && v !== undefined) {
                result[prop] = v;
            }
        } else {
            result[prop] = value && typeof value === 'object' ? resolveStObj(value, bpIndex, args) : value;
        }
    });
    return result as O;
}

export const mergeStObjs = <O extends Obj, A extends Obj>(bpIndex: number, objs: (StObj<O, A> | undefined)[], args: A = {} as any): O => {
    const mergedObj: Obj = {};
    for (const obj of objs) {
        Object.assign(mergedObj, resolveStObj(obj, bpIndex, args));
    }
    return mergedObj as O;
};

export const resolveResponsiveValue = <V>(val: StResponsiveValue<V>, bpIndex: number): V | null | undefined => {
    if (!Array.isArray(val)) return val;
    for (let i = bpIndex; i >= 0; i--) {
        if (val[i] !== undefined) {
            return val[i];
        }
    }
    return null;
};

export const mergeResponsiveObjs = (objs: StResponsiveObj<any>[], bpCount = 4): StResponsiveObj<any> | undefined => {
    const result: StResponsiveObj<any> = {};
    objs.forEach((obj) => {
        Object.entries(obj || {}).forEach(([key, val]) => {
            const prevVal = result[key];
            if (Array.isArray(val)) {
                result[key] = [];
                for (let i = 0; i < bpCount; i++) {
                    result[key][i] = resolveResponsiveValue(val, i);
                    if (result[key][i] === null) {
                        result[key][i] = resolveResponsiveValue(prevVal, i);
                    }
                }
                if ((result[key] as string[]).every((v, _, arr) => v === arr[0])) {
                    if (result[key][0] === null || result[key][0] === undefined) {
                        delete result[key];
                    } else {
                        result[key] = result[key][0];
                    }
                }
            } else if (val !== undefined && val !== null) {
                result[key] = val;
            }
        });
    });
    return result;
};

/*
export const variant =
    <P, K extends keyof P>(
        prop: K,
        styles: Exclude<P[K], undefined> extends string
            ? Partial<Record<Exclude<P[K], undefined>, StStyles<P>>>
            : never,
        defaultValue?: Exclude<P[K], undefined>
    ): StDynamicStyles<P> =>
    (props: P): StStyles<P> | undefined => {
        const val = props[prop] || defaultValue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return val === undefined ? undefined : (styles as any)[val];
    };
*/
