import type { StorybookViteConfig } from '@storybook/builder-vite';

const config: StorybookViteConfig = {
    framework: '@storybook/react',
    stories: [
        '../packages/components/src/**/*.stories.@(tsx|mdx)',
    ],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions'
    ],
    core: {
        builder: '@storybook/builder-vite',
        disableTelemetry: true,
    },
    features: {
        storyStoreV7: true
    },
    typescript: {
        reactDocgen: 'react-docgen-typescript'
    },
    async viteFinal(config, options) {
        return config;
    },
};

export default config;
