import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
    framework: "@storybook/react-vite",
    stories: [
        '../packages/components/src/**/*.stories.@(tsx|mdx)',
    ],

    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/addon-interactions"
    ],

    core: {
        disableTelemetry: true
    },

    typescript: {
        reactDocgen: false, // TODO: why does it crash with react-docgen / react-docgen-typescript
    },

    async viteFinal(config, options) {
        return config;
    },

    docs: {
        autodocs: true
    }
};

export default config;