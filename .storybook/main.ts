import { dirname, join } from "path";
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
    framework: {
        name: getAbsolutePath("@storybook/react-vite"),
        options: {}
    },

    stories: [
        '../packages/components/src/**/*.stories.@(tsx|mdx)',
    ],

    addons: [
        getAbsolutePath("@storybook/addon-links"),
        getAbsolutePath("@storybook/addon-essentials"),
        getAbsolutePath("@storybook/addon-interactions")
    ],

    core: {
        disableTelemetry: true
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

    docs: {
        autodocs: true
    }
};

export default config;

function getAbsolutePath(value: string): any {
    return dirname(require.resolve(join(value, "package.json")));
}
