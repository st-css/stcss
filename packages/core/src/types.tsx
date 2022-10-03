/* eslint-disable @typescript-eslint/no-explicit-any */
import * as CSS from 'csstype';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Obj = object;

export type MaybeArray<V> = V | V[];

export type MergeDefaults<T, K> = Omit<T, Extract<K, keyof T>> & Required<Pick<T, Extract<K, keyof T>>>;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;

export type PartialSome<T, K> = Omit<T, Extract<K, keyof T>> & Partial<Pick<T, Extract<K, keyof T>>>;
export type RequiredLiteralKeys<T> = keyof {
    [K in keyof T as string extends K ? never : number extends K ? never : Obj extends Pick<T, K> ? never : K]: 0;
};
export type OptionalLiteralKeys<T> = keyof {
    [K in keyof T as string extends K ? never : number extends K ? never : Obj extends Pick<T, K> ? K : never]: 0;
};

export type RequiredKeys<T> = { [K in keyof T]-?: Obj extends Pick<T, K> ? never : K }[keyof T];
export type PickRequired<T> = Pick<T, RequiredKeys<T>>;
export type PickOptional<T> = Omit<T, RequiredKeys<T>>;

export type ExcludeUnassignable<T, U> = T extends U ? T : never;

export type CommonKeys<T extends object> = keyof T;
export type AllKeys<T> = T extends any ? keyof T : never;
export type Subtract<A, C> = A extends C ? never : A;
export type NonCommonKeys<T extends object> = Subtract<AllKeys<T>, CommonKeys<T>>;
export type PickType<T, K extends AllKeys<T>> = T extends { [k in K]?: any } ? T[K] : undefined;
export type PickTypeOf<T, K extends string | number | symbol> = K extends AllKeys<T> ? PickType<T, K> : never;

export type Merge<T extends Obj> = {
    [k in CommonKeys<T>]: PickTypeOf<T, k>;
} & {
    [k in NonCommonKeys<T>]?: PickTypeOf<T, k>;
};

// V = type of value that is to become responsive
// undefined indicates a values should inherit from smaller breakpoints
// null indicates the lack of (and removal) of a value
export type StResponsiveValue<V> = V | (V | undefined | null)[];

// O = object to make all values responsive
export type StResponsiveObj<O> = {
    [K in keyof O]: StResponsiveValue<O[K]>;
};

// V = type of value that should become dynamic
// A = args used to produce values dynamically
export type StDynamicValue<V, A> = V | ((args: A) => V | undefined);

// O = object to make all values responsive
// A = args used to produce values dynamically
export type StDynamicObj<O, A> = {
    [K in keyof O]: StDynamicValue<O[K], A>;
};

// O = object to make all values responsive
// A = args used to produce values dynamically
// the ultimate dynamic responsive object
export type StObj<O, A> = StDynamicValue<StDynamicObj<StResponsiveObj<O>, A>, A>;

// CC = custom CSS
// An object of all standard and custom CSS properties and value types
export type StCssProps<CC> = CSS.Properties & CC;

// A = args used to produce values dynamically
// CC = custom CSS
export type StCssPseudos<MQ, A, CC> = {
    [K in CSS.Pseudos]?: StStyle<MQ, A, CC>;
};

// MQ = media queries
// A = args used to produce values dynamically
// CC = custom CSS
// eslint-disable-next-line @typescript-eslint/ban-types
export type StCssMediaQueries<MQ, A, CC> = keyof MQ extends string ? Partial<Record<`@${keyof MQ}`, StStyle<never, A, CC>>> : {};

// A = args used to produce values dynamically
// CC = custom CSS
export type StStyle<MQ, A, CC> = StObj<StCssProps<CC>, A> &
    StCssMediaQueries<MQ, A, CC> &
    StCssPseudos<MQ, A, CC> & {
        '&'?: [string, StStyle<MQ, A, CC>];
    };

// I = intrinsic element type
// P = props of a StComponent (before dynamic/responsive)
// CC = custom CSS
// TH = theme object passed to canonize
// represents a component's props along with those
// provided by the library before resolving responsive props
export type StComponentProps<I extends keyof JSX.IntrinsicElements, P extends Obj = Obj, CC extends Obj = Obj, TH extends Obj = never> = StResponsiveObj<P> & {
    as?: keyof JSX.IntrinsicElements;
    css?: StResponsiveObj<StCssProps<CC>>;
    attrs?: StResponsiveObj<Omit<JSX.IntrinsicElements[I], 'className'>>;
    theme?: keyof TH;
    className?: string;
    children?: React.ReactNode;
};

// css props + custom props + css pseudos
