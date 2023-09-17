# St. Css
> _the patron saint of frontend developers_

![version][]
![size][]

[version]: https://flat.badgen.net/npm/v/@st-css/core
[size]: https://flat.badgen.net/bundlephobia/minzip/@st-css/core

```sh
npm i @st-css/core
```

St. Css is a lightweight css-in-js solution optimized for building responsive
design systems and frontend websites, with first-class TypeScript support
and a heavenly developer experience.

> Note: this library is currently for React only, however
> if there is enough community interest, supporting other frameworks should be
> possible since only a small portion of code is React specific. Pull requests
> welcome!!


## Getting Started
-------------------------------------------------------------------------------------------------
St. Css borrows many concepts from other "styled" libraries like styled-components
and emotion however has a slightly different API:
```tsx
const Title = st()({
    el: 'h1',
    css: {
        color: 'blue'
    }
});

// default
<Title>I'm Blue Da Ba Dee</Title>

// "css" prop takes precedence over default styles
<Title css={{ color: 'red' }}>The pen is red</Title>

// "as" prop overrides default element type
<Title as="h2">I'm a subtitle now</Title>

// "attrs" prop to set element attributes
<Title attrs={{ title: "Hover Text" }}>Hover over Me</Title>
```
Simple cases like the above might feel a tad verbose compared to other libraries, but this single
pattern provides great flexibility, discoverability, and strong type inference.

## Dynamic Styles
-------------------------------------------------------------------------------------------------
One of the major motivations for using css-in-js libraries is the ease of altering styles based
on prop values. This should look familiar:

```tsx
const Link = st<{ active: boolean }>()({
    el: 'a',
    css: {
        color: ({ active }) => active ? 'blue' : 'green'
    }
});

<Link active>I'm Blue Da Ba Dee</Link>
```

Alternatively, the `css` option accepts an array of style objects/functions. This pattern is primarily
for helper utilities like `variant`.

```tsx
const Link = st<{ active: boolean }>()({
    el: 'a',
    css: [
        ({ active }) => ({
            color: active ? 'blue' : 'green'
        })
    ]
});

```

> It might be tempting to use the second approach exclusively to avoid creating multiple functions,
> however if you are a TypeScript user, be aware that when using a function to produce entire style
> objects, excess property checks won't happen, i.e. things like misspelled css properties will not
> be caught by the compiler. See https://github.com/microsoft/TypeScript/issues/241 to learn more.
> In general, reevaluating even dozens of simple functions on component render or breakpoint change
> is not a performance concern for all but the most aggressively rendered components.

## Media Queries / Responsiveness
-------------------------------------------------------------------------------------------------
Responsive design wouldn't be possible without media queries. Despite their importance, they are
often sprinkled in towards the end of development and tend to get overlooked or out of sync when
design modifications are made down the road. To help combat this, St. Css provides a nifty shorthand
employed by other libraries like [styled-system](https://styled-system.com). Instead of specifying
a single style value, you can use an array of values that correspond to each breakpoint. By default,
4 breakpoints are configured to represent mobile, tablet, laptop, and desktop displays. When an array
contains fewer values than the number of breakpoints, the value is carried over in a "mobile-first"
fashion.

```tsx
const Header = st()({
    el: 'h1',
    css: {
        fontSize: ['16px','20px','24px', '28px'],
        color: ['green', 'red']
    }
})

// at mobile breakpoint
<Header>I am 16px and green</Header>

// at tablet breakpoint
<Header>I am 20px and red</Header>

// at laptop breakpoint
<Header>I am 24px and red</Header>

// at desktop breakpoint
<Header>I am 28px and red<Header>
```
In general, `undefined` is treated as meaning "carry over the previous breakpoint's value" so it
can actually appear anywhere in the array and can even be omitted entirely if you don't mind the
double comma:

```tsx
// the following
<Header css={{ textDecoration: ['underline',,'none'] }}>Underlined in Mobile & Tablet Only</Header>

// is equivalent to
<Header css={{ textDecoration: ['underline', 'underline', 'none', 'none'] }}>Underlined in Mobile & Tablet Only</Header>

```
Sometimes when overriding styles you may wish to preserve the original value at a particular breakpoint.
In this case `null` can be used to carry over the original values. When null is used as a property value
override for a property that was never defined in the first place, it simply doesn't apply a value.

```tsx
// assume the original Header component above

<Header color={['purple', null]}>I'm purple at mobile, and red above</Header>

// font-weight never applied above mobile breakpoint
<Header css={{ fontWeight: ['bold', null] }}>Bold only on mobile</Header>
```


_But wait there's more!_ Even custom component props support this array syntax:

```tsx
const Sidebar = st<{ collapsed: boolean }>()({
    el: 'a',
    css: {
        width: ({ collapsed }) => collapsed ? '0px' : '250px'
    }
});

// Collapsed On Mobile
<Sidebar collapsed={[true, false]} />
```

> __Wait!? Doesn't the array syntax prevent arrays from being used as prop types?__
> In situations where you need to pass an array as a prop value, simply wrap it in an extra
> set of brackets, i.e. `[[1,2,3]]`. Since responsive arrays expand undefined values to
> larger breakpoints, `[[1,2,3]]` is ultimately equivalent to `[1,2,3]`. We felt like this
> was a fair tradeoff to enable such a useful shorthand.

## Object-based $mq syntax: an alternative to array syntax
When modifying groups of related CSS properties within a single breakpoint, the array syntax can
sometimes be less convenient. In this situation, St. Css offers another way to specify responsive
styles. The names (and number) of these breakpoints can be

```tsx
const Link = st()({
    el: 'a',
    css: {
        $sm: {
            color: 'red',
            fontSize: '14px'
        },
        $md: {
            color: 'blue',
            fontSize: '16px'
        }
    }
});
```

Media queries cannot be nested, so the following examples are invalid:

```tsx
const Link = st()({
    el: 'a',
    css: {
        $sm: {
            color: 'red',
            $md: {
                color: 'blue'
            }
        }
    }
});
```

```tsx
const Link = st()({
    el: 'a',
    css: {
        $sm: {
            color: ['red', 'blue'],
        }
    }
});
```

In rare situations where nesting media queries might make sense, the current state of media
queries is made available to dynamic styles:

```tsx
const Link = st()({
    el: 'a',
    css: {
        $sm: {
            color: ({ mq }) => mq.print ? 'black' : 'red',
        }
    }
});
```

> Along with pseudo and other advanced selectors, you can use this syntax within the `css` prop of
> any St. Css component, however consider moving those styles to a variant or extended component to
> avoid the decreased readbility of nested objects.

## HTML Attributes
-------------------------------------------------------------------------------------------------
Perhaps the area where St. Css differs the most from other styling libraries is in its handling
of attributes. By default, St. Css components do not make HTML attributes directly available as
props. Instead a single prop, `attrs` is used to specify attributes, while the `defaultAttrs`
option can be used to configure default values:
```tsx
const TextInput = st()({
    el: 'input',
    defaultAttrs: {
        type: 'text'
    },
    fowardAttrs: ['value']
});

<TextInput value="Hello World" attrs={{ readonly: 1 }} />
```
The primary motivation for this polarizing approach is to avoid sending props to the DOM that were
only intended to be available within dynamic styles or component logic. Other libraries either ship
with a comprehensive whitelist of valid DOM attributes or put the burden on the developer to strip
away invalid attributes via `shouldForwardProp` functions and the like. Seeing as this library is
primarily geared towards design systems, it's my belief that within component libraries the great
majority of HTML attributes should be abstracted away from consumers making it more common to want
to _prevent_ props from being forwarded to the DOM. The `attrs` prop and `forwardAttrs` option
provide reasonable escape hatches. This approach has the added benefit of preventing hundreds of
rarely used attributes from showing up in intellisense or documentation generators like storybook.

## Prop Forwarding
-------------------------------------------------------------------------------------------------
When building primitive reusable components, it's often convenient to provide direct prop shorthands
for commonly required attributes and styles. St. Css provides the `forwardAttrs` and `forwardCss`
options to cover this use case. Consider the following example:

```tsx
const Link = st()({
    el: 'a',
    forwardCss: ['color', 'fontSize'],
    forwardProps: ['target','href']
});

<Link href="https://google.com" target="_blank" color="yellow" fontSize="18px">Google</Link>
```

## Inline Components
-------------------------------------------------------------------------------------------------
For anything but the most trivial of components, it's often necessary to provide both styles
and component logic. To achieve this many developers create two components - a "styled" one that
captures css (including dynamic styles produced from props) and a "main" component that
wraps the styled component with additional logic. While there is nothing inherently wrong with
this pattern, it can become cumbersome once you want to "extend" an existing component since you
generally lose the component logic in the process. You also have to be very careful to pass any
required props to your styled component, including props like `as` and `css` if you wish to expose
them to consumers. In contrast, St. Css provides a more streamlined way of creating components with
custom styles and logic at the same time:

```tsx
const ToggleButton = st()({
    el: 'button',
    css: {
        background: 'transparent',
        border: '1px solid black',
    },
    render: ({ El, attrs }) => {
        const [enabled, setEnabled] = useState(false);
        const onClick = () => setEnabled((enabled) => !enabled);
        return (
            <El {...attrs} onClick={onClick}>
                {enabled ? 'Enabled' : 'Disabled'}
            </El>
        );
    },
});

```

This technique can also be used to style 3rd-party components. The only requirement is that
the component being styled accepts the "className" prop. Since the `El` wrapper is not used
the `as` prop will have no effect (unless of course the 3rd-party component respects that
prop as well).

```tsx
const StyledSlider = st<ThirdPartySliderProps>()({
    el: 'div',
    css: {
        width: '800px'
    },
    render: ({ attrs }) => <ThirdPartySlider {...attrs} />
})
```

> The `attrs` provided to you as part of the "Component" option must be spread on the returned
> wrapper component since it contains all the merged attributes and classNames after processing
> all the styles. Any additional props attached to this component _will not be made available
> to dynamic styles and will ultimately be passed to the DOM_. If you need dynamic styles to have
> access to internal state like `enabled` in the example above, you can leverage the `addClassname`
> helper to append extra classes to the component at run-time and leverage CSS class selectors
> to alter styles accordingly.


## Extending Components
-------------------------------------------------------------------------------------------------
St. Css makes extending components inc

## Style Variants
-------------------------------------------------------------------------------------------------

## Advanced Styling
-------------------------------------------------------------------------------------------------

## Configuration
-------------------------------------------------------------------------------------------------
canonize() = createSt()

## Custom CSS Transformers
-------------------------------------------------------------------------------------------------

## Theming
-------------------------------------------------------------------------------------------------

## Utilities & Hooks
-------------------------------------------------------------------------------------------------
1. useMediaQuery
[matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia)
2. useStyle
## FAQ
-------------------------------------------------------------------------------------------------
### 1. What's with the double function()() syntax?
Yeah...about that. Obviously it would have been preferable to maintain the API most developers
are already familiar with. Unfortunately limitations in how typescript infers generics meant losing
automatic type inferrence or leveraging currying and the awkward double function()() syntax. It's
something typescript might very well address one day. Check out [this issue](https://github.com/microsoft/TypeScript/issues/10571)
for an interesting discussion on potential solutions.

### 2. Why are there so many tiny class names?
St. Css uses an approach called "atomic css". This means that every unique combination of css
property and value gets its own unique class name. It's an interesting trade-off that lends itself
to a relatively straight forward implementation and fairly optimal bundle sizes for many use
cases. The obvious downside is that elements with lots of custom styling end up having tons
of meaningless class names. For this reason, it's recommended to attach a human-readable classname
to all your custom components. Not only will this make using devtools easier, it also provides
a way for independent components to target each other's styles.

### 3. Can inline component css styles access internal state?

### 4. Can this library be used in frameworks other than React?

### 5. How is this library different from Stiches?

### 6. Thanks, but I'll stick to Tailwind.

## TODO
-------------------------------------------------------------------------------------------------

1. useStyle() hook that produces array of class names
2. make sure mqs are passed to dynamic styles (and fix example)
3. should dynamic styles be allowed in css prop? would that make typings easier?
4. global styles / resets
