import React from 'react';
import type { MaybeArray, MergeDefaults, Obj, Optional, StComponentProps, StCssProps, StDynamicValue, StObj, StResponsiveObj, StStyle } from './types';
import type { StConfig } from './context';

// I = intrinsic element type
// P = props of a StComponent (before dynamic/responsive)
// DP = default props that will no longer be required
// MQ = media queries
// CC = custom CSS props
// FA = keys of forwarded attributes
// FS = keys of forwarded styles
export type StCreateOptions<
    I extends keyof JSX.IntrinsicElements,
    P extends Obj = Obj,
    DP extends Partial<P> = Obj,
    MQ extends Record<string, string> = Obj,
    CC extends Obj = Obj,
    FA extends Exclude<keyof JSX.IntrinsicElements[I], 'className'> = never,
    FS extends keyof StCssProps<CC> = never
> = {
    el: I;
    className?: MaybeArray<StDynamicValue<string, MergeDefaults<P, keyof DP>>>;
    defaultAttrs?: MaybeArray<StObj<Omit<JSX.IntrinsicElements[I], 'className'>, MergeDefaults<P, keyof DP>>>;
    defaultProps?: MaybeArray<StResponsiveObj<DP>>;
    forwardAttrs?: FA[];
    forwardCss?: FS[];
    css?: MaybeArray<StStyle<MQ, MergeDefaults<P, keyof DP>, CC>>;
    Component?: React.FC<MergeDefaults<P, keyof DP> & { C: I; attrs: JSX.IntrinsicElements[I] & { children?: React.ReactNode } }>;
};

// I = intrinsic element type
// P = props of a StComponent (before dynamic/responsive)
export type StComponent<I extends keyof JSX.IntrinsicElements, P extends Obj, TH extends Obj> = React.FC<StComponentProps<I, P, TH>> & {
    // E = props to add to extended component
    // A = intrinsic element type of extended component (if different)
    // CC = custom CSS props
    // ED = default props (that can include original and extended)
    // FA = keys of forwarded attributes
    // FS = keys of forwarded styles
    extend: <E extends Obj = Obj>() => <
        A extends keyof JSX.IntrinsicElements = I,
        CC extends Obj = Obj,
        FA extends Exclude<keyof JSX.IntrinsicElements[A], 'className'> = never,
        FS extends keyof StCssProps<CC> = never,
        ED extends Partial<P & E> = Obj
    >(
        options: Omit<StCreateOptions<A, P & E, ED, CC, FA, FS>, 'render' | 'el'> & { as?: A }
    ) => StComponent<A, Optional<P & E, keyof ED> & Pick<JSX.IntrinsicElements[A], FA> & Pick<StCssProps<CC>, FS>>;
};

// MQ = object of media queries
// CC = object containing custom CSS transform functions
// P = props of a StComponent (before dynamic/responsive)
// CC = custom CSS props
// I = intrinsic element type
// PD = default props
// FA = keys of forwarded attributes
// FS = keys of forwarded styles
export type CreateStComponent<MQ extends Record<string, string> = Obj, CC extends Obj = Obj> = <P extends Obj>() => <
    I extends keyof JSX.IntrinsicElements,
    FA extends Exclude<keyof JSX.IntrinsicElements[I], 'className'> = never,
    FS extends keyof StCssProps<CC> = never,
    PD extends Partial<P> = Obj
>(
    options: StCreateOptions<I, P, PD, MQ, CC, FA, FS>
) => StComponent<I, Optional<P, keyof PD> & Pick<JSX.IntrinsicElements[I], FA> & Pick<StCssProps<CC>, FS>>;

declare function makeStComponentCreator<MQ extends Record<string, string> = Obj, CC extends Obj = Obj>(config: {
    styleManager: StyleManager;
}): () => ReturnType<CreateStComponent<MQ, CC>>;

// MQ = object of media queries
// CC = object containing custom CSS transform functions
export type St<MQ extends Record<string, string>, CC extends Obj> = {
    config: StConfig<MQ, CC>;
    st: CreateStComponent<MQ, CC>;
    StProvider: React.FC<{ children: React.ReactNode }>;
};
