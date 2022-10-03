import { StResponsiveObj } from './types';

export interface StyleManagerConfig {
    mediaQueries: Record<string, string>;
    breakpoints: string[];
}

export class StyleManager {
    protected readonly cache: Map<string, string> = new Map();
    protected readonly rules: Map<string, string[]> = new Map();
    protected readonly sheets: Map<string, CSSStyleSheet | CSSMediaRule> = new Map();
    protected readonly styleTag?: HTMLStyleElement;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(readonly config: StyleManagerConfig) {
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

    getClassesForStyle(style: StResponsiveObj<Record<string, string>> = {}): string[] {
        const classes: string[] = [];
        Object.entries(style).forEach(([rule, val]) => {
            if (Array.isArray(val)) {
                for (let i = 0; i < val.length; i++) {
                    const bp = this.config.breakpoints[i];
                    classes.push(this.getClassForRule(rule, val[i] as string, bp));
                }
            } else {
                classes.push(this.getClassForRule(rule, val, '__global'));
            }
        });

        return classes;
    }

    getClassForRule(stRule: string, val: string, bp: string): string {
        const key = `${stRule}|${val}|${bp}`;
        const cachedClass = this.cache.get(key);
        if (cachedClass) return cachedClass;

        const className = `st${this.cache.size.toString(36)}`;
        this.cache.set(key, className);

        const [selector, prop] = stRule.split('|');

        const rule = `${selector.replaceAll('?', `.${className}`)}{${prop.replace(/[A-Z]/g, '-$&').toLowerCase()}:${val}}`;
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
