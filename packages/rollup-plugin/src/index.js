import { createFilter } from '@rollup/pluginutils';

const stConfigRegExp = /(?:const|let|var)\s*(\S*)\s*= st(?:<[\s\S]*>)?\(\)\(({[\s\S]*})/g;

export default function strip(options = {}) {
    const include = options.include || '**/*.tsx';
    const { exclude } = options;
    const filter = createFilter(include, exclude);

    return {
        name: 'st-css',

        transform(code, id) {
            if (!filter(id)) {
                return null;
            }

            const matches = [...code.matchAll(stConfigRegExp)];

            if (!matches.length) {
                return null;
            }

            for (const [_, name, configJson] of matches) {
                const config = eval(`(${configJson})`);
                const className = [config.className ?? []].flat();
                className.push(name.toLowerCase());
                config.className = className;
                code = code.replace(configJson, JSON.stringify(config));
            }

            console.log('code', code);

            return code;
        },
    };
}
