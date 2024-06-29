/* eslint-disable @typescript-eslint/no-explicit-any */
import type * as CSS from 'csstype';
import type { JSX } from 'react';

export type Obj<T = unknown> = Record<string, T>;
export type EmptyObj = Obj<never>;

export type Override<T, O> = Omit<T, keyof O> & O;

export type MaybeArray<V> = V | V[];

export type Dynamic<V, A extends unknown[] = unknown[]> = (...args: A) => V | undefined;
export type MaybeDynamic<V, A extends unknown[]> = V | Dynamic<V, A>;

export type Responsive<V> = (V | undefined | null)[];
export type MaybeResponsive<V> = V | Responsive<V>;

export type CssProp = CSS.Properties;
export type El = JSX.IntrinsicElements;
export type Attrs<I> = I extends keyof El ? Partial<El[I]> : never;

export type NestedSelector = `&${string}` | `${string}&` | `${string}&${string}`;

export type StaticStyle<O = Obj> = {
    [K in keyof O]: MaybeResponsive<O[K]>;
} & {
    [K in NestedSelector]: StaticStyle<O>;
};

export type DynamicStyle<O = Obj, A extends unknown[] = unknown[]> = {
    [K in keyof O]: MaybeDynamic<MaybeResponsive<O[K]>, A>;
} & {
    [K in NestedSelector]: DynamicStyle<O, A>;
};

export type CustomCss<O = Obj> = {
    [K in keyof O]: (value: any) => StaticStyle<CssProp>;
};

export type CustomCssProp<CC> = CC extends CustomCss
    ? {
          [K in keyof CC]?: Parameters<CC[K]>[0];
      }
    : never;

export interface CanonizeConfig<MQ, CC> {
    mediaQueries: MQ;
    breakpoints: (keyof MQ)[];
    customCss?: CC extends CustomCss ? CC : never;
}

export type VariantStyles<C = CSS.Properties, A extends unknown[] = unknown[]> = Obj<DynamicStyle<C, A>>;
export type VariantValues<V extends Obj<Obj>> = {
    [K in keyof V]?: MaybeResponsive<keyof V[K]>;
};
export type ResolvedVariantValues<V extends Obj<VariantStyles>> = {
    [K in keyof V]?: keyof V[K];
};

export type Variants<C, P, I, V, FC> = {
    [K in keyof V]: {
        [S in keyof V[K]]: DynamicStyle<
            C,
            [
                P & { [K in keyof V]?: keyof V[K] } & (FC extends keyof C
                        ? {
                              [K in FC]?: C[K];
                          }
                        : unknown),
                { attrs: Attrs<I> },
            ]
        >;
    };
};

export type DefaultVariants<V extends Obj> = {
    [K in keyof V]?: MaybeResponsive<keyof V[K]>;
};

export type ForwardedAttrs<FA, I extends keyof El> = FA extends keyof El[I] ? { [K in FA]?: El[I][K] } : unknown;
export type ForwardedCss<FC, CC> = FC extends keyof (CssProp & CustomCssProp<CC>)
    ? { [K in FC]?: MaybeResponsive<Override<CssProp, CustomCssProp<CC>>[K]> }
    : unknown;

export interface StConfig<CC extends CustomCss, P extends Obj, I extends keyof El, FC, V extends Obj<Obj>, DV extends DefaultVariants<V>, FA> {
    el: I;
    Component?: React.FC<{ El: I; attrs: Attrs<I>; children?: React.ReactNode }>;
    className?: MaybeArray<string>;
    defaultAttrs?: Attrs<I>;
    forwardAttrs?: FA[];
    forwardCss?: FC[];
    defaultProps?: Partial<P>;
    variants?: Variants<Override<CssProp, CustomCssProp<CC>>, P, I, V, FC>;
    defaultVariants?: DV;
    css?: DynamicStyle<Override<CssProp, CustomCssProp<CC>>, [P & ForwardedCss<FC, CC> & VariantValues<V>, { attrs: Attrs<I> }]>;
}

export type StComponent<CC extends CustomCss, P extends Obj, I extends keyof El, FC, V extends Obj<Obj>, FA> = React.FC<
    P &
        DefaultVariants<V> &
        ForwardedCss<FC, CC> &
        ForwardedAttrs<FA, I> & { css?: StaticStyle<Override<CssProp, CustomCssProp<CC>>>; attrs?: Attrs<I>; children?: React.ReactNode; as?: keyof El }
>;

// TODO: double check we want to include undefined/null here
export type RuleValue = string | number | undefined | null;
export type RuleMap = Map<string, RuleValue>;
export type ResponsiveRuleMap = Map<string, MaybeArray<RuleValue>>;
export type Transformer = (propName: string, value: RuleValue, transformers: Transformer[]) => RuleValue | undefined;
