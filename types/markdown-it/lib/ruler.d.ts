import MarkdownIt = require(".");
import State = require("./rules_core/state_core");

declare class Ruler<S extends State = State, RULE = MarkdownIt.Rule<S>> {
    after(afterName: string, ruleName: string, rule: RULE, options?: any): void;
    at(name: string, rule: RULE, options?: any): void;
    before(beforeName: string, ruleName: string, rule: RULE, options?: any): void;
    disable(rules: string | string[], ignoreInvalid?: boolean): string[];
    enable(rules: string | string[], ignoreInvalid?: boolean): string[];
    enableOnly(rule: string, ignoreInvalid?: boolean): void;
    getRules(chain: string): RULE[];
    push(ruleName: string, rule: RULE, options?: any): void;
}

export = Ruler;
