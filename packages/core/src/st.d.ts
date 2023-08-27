import React from 'react';
import type { MaybeArray, MergeDefaults, Obj, Optional, StComponentProps, StCssProps, StDynamicValue, StObj, StResponsiveObj, StStyle } from './types';

//consider ditching default props generic and merge defualts stuff...

// I = intrinsic element type
export type StCreateOptions<
    I extends keyof JSX.IntrinsicElements,
    P extends Obj = Obj,
    DP extends Partial<P> = Obj,
    FA extends Exclude<keyof JSX.IntrinsicElements[I], 'className'> = never,
    FS extends keyof StCssProps = never,
> = {
    el: I;
    className?: MaybeArray<StDynamicValue<string, MergeDefaults<P, keyof DP>>>;
    defaultAttrs?: MaybeArray<StObj<Omit<JSX.IntrinsicElements[I], 'className'>, MergeDefaults<P, keyof DP>>>;
    defaultProps?: MaybeArray<StResponsiveObj<DP>>;
    forwardAttrs?: FA[];
    forwardCss?: FS[];
    css?: MaybeArray<StStyle<MergeDefaults<P, keyof DP>>>;
    Component?: React.FC<MergeDefaults<P, keyof DP> & { C: I; attrs: JSX.IntrinsicElements[I] & { children?: React.ReactNode } }>;
};

// I = intrinsic element type
// P = props of a StComponent (before dynamic/responsive)
export type StComponent<I extends keyof JSX.IntrinsicElements, P extends Obj> = React.FC<StComponentProps<I, P>> & {
    // E = props to add to extended component
    // A = intrinsic element type of extended component (if different)
    // ED = default props (that can include original and extended)
    // FA = keys of forwarded attributes
    // FS = keys of forwarded styles
    extend: <E extends Obj = Obj>() => <
        A extends keyof JSX.IntrinsicElements = I,
        FA extends Exclude<keyof JSX.IntrinsicElements[A], 'className'> = never,
        FS extends keyof StCssProps = never,
        ED extends Partial<P & E> = Obj,
    >(
        options: Omit<StCreateOptions<A, P & E, ED, FA, FS>, 'render' | 'el'> & { as?: A },
    ) => StComponent<A, Optional<P & E, keyof ED> & Pick<JSX.IntrinsicElements[A], FA> & Pick<StCssProps, FS>>;
};

// P = props of a StComponent (before dynamic/responsive)
// I = intrinsic element type
// PD = default props
// FA = keys of forwarded attributes
// FS = keys of forwarded styles
export declare function st<P extends Obj>(): <
    I extends keyof JSX.IntrinsicElements,
    FA extends Exclude<keyof JSX.IntrinsicElements[I], 'className'> = never,
    FS extends keyof StCssProps = never,
    PD extends Partial<P> = Obj,
>(
    options: StCreateOptions<I, P, PD, FA, FS>,
) => StComponent<I, Optional<P, keyof PD> & Pick<JSX.IntrinsicElements[I], FA> & Pick<StCssProps, FS>>;
