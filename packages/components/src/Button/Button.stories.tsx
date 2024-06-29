import { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const config: Meta<typeof Button> = {
    component: Button,
    title: 'Example/Button',
    // we have to manually specify arg types until we can get react-docgen working with st-css
    // TODO: look into leveraging structured-types as custom doc generator or build custom react-doc resolver
    argTypes: {
        backgroundColor: { control: 'color' },
    },
};

export default config;

export const Primary: StoryObj<typeof Button> = { args: { children: 'Default Button' } };
