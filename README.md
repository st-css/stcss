# St. Css
_the patron saint of frontend developers_

![version][]
![size][]

[version]: https://flat.badgen.net/npm/v/@st-css/core
[size]: https://flat.badgen.net/bundlephobia/minzip/@st-css/core

```sh
npm i @st-css/core
```

St. Css is a lightweight css-in-js solution optimized for building responsive
design systems and frontend websites.


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
Simple cases like the above might feel a tad verbose, but this single pattern provides
great flexibility, discoverability, and strong type inference.

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
> objects excess property checks won't happen, i.e. things like misspelled css properties will not
> be caught by the compiler. See https://github.com/microsoft/TypeScript/issues/241 to learn more.

## Media Queries / Responsiveness
-------------------------------------------------------------------------------------------------
Responsive design wouldn't be possible without media queries. Despite their importance, they are
often sprinkled in towards the end of development and tend to get overlooked and out of sync when
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
In general, `undefined` is treated as meaning "carry over the previous value" so it can actually
appear anywhere in the array and can even be omitted entirely if you don't mind the double comma:

```tsx
// the following
<Header css={{ textDecoration: ['underline',,'none'] }}>Underlined in Mobile & Tablet Only</Header>

// is equivalent to
<Header css={{ textDecoration: ['underline', 'underline', 'none', 'none'] }}>Underlined in Mobile & Tablet Only</Header>

```
Sometimes when overriding styles you may wish to preserve previous values at a particular breakpoint.
In this case `null` can be used which to carry over a previously specified value. If no previous value
exists, then the style is not applied at that breakpoint:

```tsx
// assume the original Header component above

<Header color={['purple', null]}>I'm purple at mobile, and red above</Header>

<Header css={{ fontWeight: ['underline', null] }}>Bold only on mobile</Header>
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
provide reasonable escape hatches.

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
required props to your styled component. In contrast, St. Css provides a more streamlined
way of creating components with custom styles and logic at the same time:

```tsx
const ToggleButton = st()({
    el: 'button',
    css: {
        color:
    },
    Component: ({ C, attrs }) => {
        const [enabled, setEnabled] = useState(false);
        const onClick = () => setEnabled((enabled) => !enabled);
        return (
            <C {...attrs} onClick={onClick}>
                {enabled ? 'Enabled' : 'Disabled'}
            </C>
        );
    },
});

```


## Extending Components
-------------------------------------------------------------------------------------------------

## Style Variants
-------------------------------------------------------------------------------------------------

## Advanced Styling
-------------------------------------------------------------------------------------------------

## Theming

## FAQ
1. What's with the double function()() syntax?
2. Why are there so many tiny class names?

