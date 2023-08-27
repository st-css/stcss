import type { GatsbyNode } from 'gatsby';

export const onCreateBabelConfig: GatsbyNode['onCreateBabelConfig'] = ({ actions }) => {
    // this is only necessary if you don't want to import
    // React at the top of all your components
    actions.setBabelPlugin({
        name: '@babel/plugin-transform-react-jsx',
        options: {
            runtime: 'automatic',
        },
    });
};
