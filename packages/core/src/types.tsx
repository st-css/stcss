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

export type StCssProps = CSS.Properties;

// A = args used to produce values dynamically
export type StCssPseudos<A> = {
    [K in CSS.Pseudos]?: StStyle<A>;
};

export type StCssMediaQuery<MQ extends Record<string, string>> = keyof MQ extends string ? `@${keyof MQ}` : never;

// MQ = media queries
// A = args used to produce values dynamically
export type StCssMediaQueries<MQ extends Record<string, string>, A> = Record<StCssMediaQuery<MQ>, StStyle<A>>;

// A = args used to produce values dynamically
export type StStyle<A> = StObj<StCssProps, A> &
    StCssPseudos<A> & {
        '&'?: [string, StStyle<A>];
    };

// I = intrinsic element type
// P = props of a StComponent (before dynamic/responsive)
// represents a component's props along with those
// provided by the library before resolving responsive props
export type StComponentProps<I extends keyof JSX.IntrinsicElements, P extends Obj = Obj> = StResponsiveObj<P> & {
    as?: keyof JSX.IntrinsicElements;
    css?: StResponsiveObj<StCssProps>;
    attrs?: StResponsiveObj<Omit<JSX.IntrinsicElements[I], 'className'>>;
    className?: string;
    children?: React.ReactNode;
};
