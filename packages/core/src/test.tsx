import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { canonizeStCss } from './context';

const { st, StProvider } = canonizeStCss({
    mediaQueries: {
        mobile: '(max-width: 719px)',
        tablet: '(min-width: 720px) and (max-width: 991px)',
        laptop: 'screen and (min-width: 992px) and (max-width: 1199px)',
        desktop: 'screen and (min-width: 1200px)',
        portrait: 'screen and (orientation:portrait)',
        landscape: 'screen and (orientation:portrait)',
        print: 'print',
    },
    breakpoints: ['mobile', 'tablet', 'laptop', 'desktop'],
});

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

const Title = st<{ role: 'primary' | 'secondary' }>()({
    el: 'h1',
    className: 'title',
    forwardAttrs: ['title'],
    defaultAttrs: {
        title: 'testing title',
    },
});

const Subtitle = Title.extend()({
    as: 'h2',
    className: 'subtitle',
    defaultAttrs: {
        title: 'testing subtitle',
    },
    defaultProps: {
        role: 'primary',
    },
});

const Text = Subtitle.extend()({
    as: 'h3',
});

root.render(
    <StrictMode>
        <StProvider>
            <Text attrs={{ title: ['text-mobile', 'text'] }}>I am text</Text>
        </StProvider>
    </StrictMode>
);
