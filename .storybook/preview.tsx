import React from 'react';
import { Preview } from '@storybook/react';
import { canonizeStCss, StProvider } from '@st-css/core';


export const stCss = canonizeStCss({
    mediaQueries: {
        mobile: '(max-width: 719px)',
        tablet: '(min-width: 720px) and (max-width: 991px)',
        laptop: '(min-width: 992px) and (max-width: 1199px)',
        desktop: '(min-width: 1200px)',
    },
    breakpoints: ['mobile', 'tablet', 'laptop', 'desktop'],
});

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    }
  },
  decorators:[
    (Story) => (
      <StProvider value={stCss}>
        <Story />
      </StProvider>
    ),
  ],
};

export default preview;