import { CanonizeConfig, CustomCss, Obj } from './types';

export class StyleManager<MQ extends Obj<string>, CC extends CustomCss> {
    protected readonly cache: Map<string, string> = new Map();
    protected readonly rules: Map<string, string[]> = new Map();
    protected readonly sheets: Map<string, CSSStyleSheet | CSSMediaRule> = new Map();
    protected readonly styleTag?: HTMLStyleElement;

    constructor(readonly config: CanonizeConfig<MQ, CC>) {
        Object.entries({ __global: '', ...this.config.mediaQueries }).forEach(([bp, mq]) => {
            this.rules.set(bp, []);
            if (typeof document !== 'undefined') {
                const styleTag = document.createElement('style');
                styleTag.setAttribute('id', `st-${bp}`);
                let sheet: CSSStyleSheet | CSSMediaRule = document.head.appendChild(styleTag).sheet as CSSStyleSheet;
                if (mq) {
                    sheet.insertRule(this.mqString(bp));
                    sheet = sheet.cssRules[0] as CSSMediaRule;
                }
                this.sheets.set(bp, sheet);
            }
        });
    }

    getClassForRule(stRule: string, val: string, bp: string): string {
        const key = `${stRule}|${val}|${bp}`;
        const cachedClass = this.cache.get(key);
        if (cachedClass) return cachedClass;

        const className = `st${this.cache.size.toString(36)}`;
        this.cache.set(key, className);

        const [selector, prop] = stRule.split('|');

        const rule = `${selector?.replaceAll('?', `.${className}`)}{${prop?.replace(/[A-Z]/g, '-$&').toLowerCase()}:${val}}`;
        this.rules.get(bp)?.push(rule);

        const sheet = this.sheets.get(bp);
        sheet?.insertRule(rule, sheet.cssRules.length);

        return className;
    }

    mqString = (bp: string, content = ''): string => {
        const mediaQuery = this.config.mediaQueries[bp];
        if (mediaQuery) {
            return `@media ${mediaQuery} {${content}}`;
        }
        return content;
    };

    toString = (): string => {
        let str = '';
        this.rules.forEach((rules, bp) => {
            if (rules.length) {
                str += this.mqString(bp, rules.join('\n'));
            }
        });
        return str;
    };
}
