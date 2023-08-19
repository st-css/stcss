import { st } from '@st-css/core';

const Title = st()({
    el: 'h1',
    css: {
        display: 'block',
        color: ['green', 'red'],
    },
});

const IndexPage = () => <Title>Test</Title>;

export default IndexPage;
