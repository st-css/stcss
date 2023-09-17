import { st, StCreateOptions } from '../st';
import { renderAtBp, testAtBps } from './utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const types: [string, StCreateOptions<'h1'>][] = [
    ['primitive components', { el: 'h1' }],
    [
        'inline components',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { el: 'h1', render: ({ El, attrs, children, ..._props }: any) => <El {...attrs}>{children}</El> },
    ],
];

describe('st', () => {
    types.forEach(([type, options]) => {
        describe(type, () => {
            test('render with the correct tag', () => {
                const Title = st()({
                    ...options,
                });

                testAtBps(<Title />, (el) => {
                    expect(el?.nodeName).toEqual('H1');
                });
            });

            test('render with the tag passed in "as" prop', () => {
                const Title = st()({
                    ...options,
                });

                testAtBps(<Title as="h2" />, (el) => {
                    expect(el?.nodeName).toEqual('H2');
                });
            });

            test('render with single className string passed in options', () => {
                const Title = st()({
                    ...options,
                    className: 'title',
                });

                testAtBps(<Title />, (el) => {
                    expect(el).toHaveClass('title');
                });
            });

            test('render with dynamic and string classNames passed in options', () => {
                const Title = st<{ size: string }>()({
                    ...options,
                    className: ['title', ({ size }) => size],
                });

                testAtBps(<Title size="large" />, (el) => {
                    expect(el).toHaveClass('title', 'large');
                });
            });

            test('render attributes passed as defaults', () => {
                const title = ['test-mobile', 'test-tablet', 'test-laptop', 'test-desktop'];
                const Title = st()({
                    ...options,
                    defaultAttrs: { title },
                });

                testAtBps(<Title />, (el, i) => {
                    expect(el).toHaveAttribute('title', title[i]);
                });
            });

            test('render atributes passed in attrs prop', () => {
                const title = ['test-mobile', 'test-tablet', 'test-laptop', 'test-desktop'];
                const Title = st()({
                    ...options,
                });

                testAtBps(<Title attrs={{ title }} />, (el, i) => {
                    expect(el).toHaveAttribute('title', title[i]);
                });
            });

            test('render atributes passed as forwarded prop', () => {
                const title = ['test-mobile', 'test-tablet', 'test-laptop', 'test-desktop'];
                const Title = st()({
                    ...options,
                    forwardAttrs: ['title'],
                });

                testAtBps(<Title title={title} />, (el, i) => {
                    expect(el).toHaveAttribute('title', title[i]);
                });
            });

            test('render non-responsive attributes, following precedence rules', () => {
                const Title = st()({
                    ...options,
                    defaultAttrs: {
                        title: 'default',
                        role: 'alert',
                    },
                    forwardAttrs: ['title'],
                });

                const el = renderAtBp('mobile', <Title title={'forwarded'} attrs={{ title: 'attrs', role: 'definition' }} />);
                expect(el).toHaveAttribute('title', 'forwarded');
                expect(el).toHaveAttribute('role', 'definition');
            });

            test('render responsive attributes, following precedence rules', () => {
                const Title = st()({
                    ...options,
                    defaultAttrs: { title: ['default-mobile', 'default-tablet', 'default-laptop', 'default-desktop'] },
                    forwardAttrs: ['title'],
                });

                testAtBps(
                    <Title title={['forward-mobile', null, 'forward-laptop', null]} attrs={{ title: [null, null, 'attrs-laptop-desktop'] }} />,
                    (el, i) => {
                        expect(el).toHaveAttribute('title', ['forward-mobile', 'default-tablet', 'forward-laptop', 'attrs-laptop-desktop'][i]);
                    },
                );
            });

            test('process default props', () => {
                const Title = st<{ role: 'primary' | 'secondary' }>()({
                    ...options,
                    defaultProps: {
                        role: 'primary',
                    },
                    defaultAttrs: {
                        title: ({ role }) => role,
                    },
                });

                testAtBps(<Title />, (el) => {
                    expect(el).toHaveAttribute('title', 'primary');
                });
            });

            test('process props passed directly', () => {
                const Title = st<{ role: 'primary' | 'secondary' }>()({
                    ...options,
                    defaultAttrs: {
                        title: ({ role }) => role,
                    },
                });

                testAtBps(<Title role="secondary" />, (el) => {
                    expect(el).toHaveAttribute('title', 'secondary');
                });
            });

            test('process non-responsive props, following precendence rules', () => {
                const Title = st<{ role: 'primary' | 'secondary' }>()({
                    ...options,
                    defaultProps: {
                        role: 'primary',
                    },
                    defaultAttrs: {
                        title: ({ role }) => role,
                    },
                });

                testAtBps(<Title role="secondary" />, (el) => {
                    expect(el).toHaveAttribute('title', 'secondary');
                });
            });

            test('process responsive props, following precendence rules', () => {
                const Title = st<{ role: 'primary' | 'secondary' }>()({
                    ...options,
                    defaultProps: {
                        role: ['primary', , 'secondary'],
                    },
                    defaultAttrs: {
                        title: ({ role }) => role,
                    },
                });

                testAtBps(<Title role={['secondary', null, , 'primary']} />, (el, i) => {
                    expect(el).toHaveAttribute('title', ['secondary', 'primary', 'secondary', 'primary'][i]);
                });
            });

            test('render css passed in options', () => {
                const Title = st()({
                    ...options,
                    css: {
                        color: ['green', 'blue'],
                        fontSize: '12px',
                    },
                });

                testAtBps(<Title>Testing</Title>, (el, i) => {
                    expect(el).toHaveStyle({
                        color: ['green', 'blue', 'blue', 'blue'][i],
                        fontSize: '12px',
                    });
                });
            });

            test('render css passed in css prop', () => {
                const Title = st()({
                    ...options,
                });

                testAtBps(<Title css={{ color: ['yellow', 'red'], fontSize: '14px' }}>Testing</Title>, (el, i) => {
                    expect(el).toHaveStyle({
                        color: ['yellow', 'red', 'red', 'red'][i],
                        fontSize: '14px',
                    });
                });
            });

            test('render css passed as forwarded prop', () => {
                const Title = st()({
                    ...options,
                    forwardCss: ['color'],
                });

                testAtBps(<Title color={['green', 'blue']}>Testing</Title>, (el, i) => {
                    expect(el).toHaveStyle({
                        color: ['green', 'blue', 'blue', 'blue'][i],
                    });
                });
            });

            test('render non-responsive css, following precedence rules', () => {
                const Title = st()({
                    ...options,
                    css: {
                        color: 'red',
                        display: 'flex',
                        opacity: 0,
                    },
                    forwardCss: ['color', 'display'],
                });

                const el = renderAtBp('mobile', <Title color="blue" css={{ color: 'yellow', display: 'block' }} />);

                // TODO: explore why color is getting converted to RGB in this particular
                // test case and no others...very strange
                expect(el).toHaveStyle({
                    color: 'rgb(0, 0, 255)',
                    display: 'block',
                    opacity: 0,
                });
            });

            test('render responsive css, following precedence rules', () => {
                const Title = st()({
                    ...options,
                    css: { color: ['red', , 'blue'] },
                    forwardCss: ['color'],
                });

                testAtBps(<Title color={[null, null, 'green']} css={{ color: ['yellow', null] }} />, (el, i) => {
                    expect(el).toHaveStyle({
                        color: ['yellow', 'red', 'green', 'blue'][i],
                    });
                });
            });

            test('render responsive css, following precedence rules', () => {
                const Title = st()({
                    ...options,
                    css: { color: ['red', , 'blue'] },
                    forwardCss: ['color'],
                });

                testAtBps(<Title color={[null, null, 'green']} css={{ color: ['yellow', null] }} />, (el, i) => {
                    expect(el).toHaveStyle({
                        color: ['yellow', 'red', 'green', 'blue'][i],
                    });
                });
            });

            test('can be extended with new default tag', () => {
                const Title = st()({
                    ...options,
                });

                const Subtitle = Title.extend()({
                    as: 'h2',
                });

                testAtBps(<Subtitle />, (el) => {
                    expect(el?.nodeName).toEqual('H2');
                });
            });

            test('can be extended with new default tag', () => {
                const Title = st()({
                    ...options,
                });

                const Subtitle = Title.extend()({
                    as: 'h2',
                });

                testAtBps(<Subtitle />, (el) => {
                    expect(el?.nodeName).toEqual('H2');
                });
            });

            test('can be extended with new default tag that can still be overridden', () => {
                const Title = st()({
                    ...options,
                });

                const Subtitle = Title.extend()({
                    as: 'h2',
                });

                testAtBps(<Subtitle as="h3" />, (el) => {
                    expect(el?.nodeName).toEqual('H3');
                });
            });

            test('can be extended with new default tag that can still be overridden', () => {
                const Title = st()({
                    ...options,
                });

                const Subtitle = Title.extend()({
                    as: 'h2',
                });

                testAtBps(<Subtitle as="h3" />, (el) => {
                    expect(el?.nodeName).toEqual('H3');
                });
            });

            test('can be extended with new default attributes', () => {
                const Title = st()({
                    ...options,
                    defaultAttrs: {
                        title: 'default',
                    },
                });

                const Subtitle = Title.extend()({
                    as: 'h2',
                    defaultAttrs: {
                        title: 'extended',
                    },
                });

                testAtBps(<Subtitle as="h3" />, (el) => {
                    expect(el).toHaveAttribute('title', 'extended');
                });
            });

            test('can be extended with new default props', () => {
                const Title = st<{ role: 'primary' | 'secondary' }>()({
                    ...options,
                    defaultProps: {
                        role: 'primary',
                    },
                    defaultAttrs: {
                        title: ({ role }) => role,
                    },
                });

                const Subtitle = Title.extend()({
                    as: 'h2',
                    defaultProps: {
                        role: 'secondary',
                    },
                });

                testAtBps(<Subtitle />, (el) => {
                    expect(el).toHaveAttribute('title', 'secondary');
                });
            });

            test('when extended, overwrite existing class name', () => {
                const Title = st()({
                    ...options,
                    className: 'title',
                });

                const Subtitle = Title.extend()({
                    className: 'subtitle',
                });

                testAtBps(<Subtitle />, (el) => {
                    expect(el).toHaveClass('subtitle');
                    expect(el).not.toHaveClass('title');
                });
            });

            test('when extended, follow precedence rules for attributes', () => {
                const Title = st()({
                    ...options,
                    defaultAttrs: {
                        title: ['mobile', , 'laptop'],
                    },
                });

                const Subtitle = Title.extend()({
                    forwardAttrs: ['title'],
                    defaultAttrs: {
                        title: [null, 'tablet', null],
                    },
                });

                testAtBps(<Subtitle title={[null, null, null, 'desktop']} />, (el, i) => {
                    expect(el).toHaveAttribute('title', ['mobile', 'tablet', 'laptop', 'desktop'][i]);
                });
            });

            test('when extended, follow precedence rules for props', () => {
                const Title = st<{ role: 'primary' | 'secondary' }>()({
                    el: 'h1',
                    defaultAttrs: {
                        title: ({ role }) => role,
                    },
                    defaultProps: {
                        role: ['primary', , 'secondary'],
                    },
                });

                const Subtitle = Title.extend()({
                    defaultProps: {
                        role: [null, 'secondary'],
                    },
                });

                testAtBps(<Subtitle role={[null, null, 'primary']} />, (el, i) => {
                    expect(el).toHaveAttribute('title', ['mobile', 'tablet', 'laptop', 'desktop'][i]);
                });
            });

            test('when extended, follow precedence rules for css', () => {
                const Title = st()({
                    ...options,
                    css: {
                        color: ['red', 'white', 'blue'],
                    },
                });

                const Subtitle = Title.extend()({
                    forwardCss: ['color'],
                    css: {
                        color: ['yellow', null, null, 'red'],
                    },
                });

                testAtBps(<Subtitle color={[, , 'green']} />, (el, i) => {
                    expect(el).toHaveStyle({ color: ['yellow', 'white', 'green', 'green'][i] });
                });
            });
        });
    });
});
