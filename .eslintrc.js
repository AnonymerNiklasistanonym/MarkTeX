module.exports = {
    env: {
        browser: true,
        es6: true
    },
    extends: [
        "plugin:jsdoc/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: [
            "tsconfig.json",
            "tsconfig.internal.json"
        ],
        sourceType: "module"
    },
    plugins: [
        "jsdoc",
        "@typescript-eslint",
        "prefer-arrow"
    ],
    rules: {
        "@typescript-eslint/array-type": "error",
        "@typescript-eslint/indent": "error",
        "@typescript-eslint/member-delimiter-style": [
            "error",
            {
                multiline: {
                    delimiter: "none",
                    requireLast: true
                },
                singleline: {
                    delimiter: "semi",
                    requireLast: false
                }
            }
        ],
        "@typescript-eslint/restrict-template-expressions": ["error", { allowBoolean: true }],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-misused-promises": [ "error", { checksVoidReturn: false } ],
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-use-before-define": "error",
        "@typescript-eslint/prefer-for-of": "error",
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/quotes": [ "error", "double" ],
        "@typescript-eslint/semi": "error",
        "@typescript-eslint/unified-signatures": "error",
        "array-bracket-spacing": [ "error", "always", { singleValue: false } ],
        "arrow-spacing": "error",
        "block-spacing": [ "error", "always" ],
        "brace-style": [ "error", "1tbs", { allowSingleLine: true } ],
        "camelcase": "error",
        "comma-dangle": "error",
        "complexity": [ "error", { max: 10 } ],
        "computed-property-spacing": [ "error", "never" ],
        "constructor-super": "error",
        "dot-notation": "error",
        "eqeqeq": [ "error", "smart" ],
        "guard-for-in": "error",
        "id-blacklist": [ "error", "any", "number", "string", "Boolean", "boolean" ],
        "id-match": "error",
        "jsdoc/check-types": 0,
        "jsdoc/require-param-type": 0,
        "jsdoc/require-returns-type": 0,
        "keyword-spacing": [ "error", { after: true, before: true } ],
        "linebreak-style": [ "error", "unix" ],
        "max-classes-per-file": [ "error", 1 ],
        "max-len": [ "error", { code: 120 } ],
        "new-parens": "error",
        "no-bitwise": "error",
        "no-caller": "error",
        "no-cond-assign": "error",
        "no-console": [ "error", { allow: [ "warn", "error" ] } ],
        "no-debugger": "error",
        "no-duplicate-imports": "error",
        "no-empty": "error",
        "no-eval": "error",
        "no-fallthrough": "off",
        "no-invalid-this": "off",
        "no-irregular-whitespace": "error",
        "no-new-wrappers": "error",
        "no-shadow": [ "error", { hoist: "all" } ],
        "no-throw-literal": "error",
        "no-trailing-spaces": "error",
        "no-undef-init": "error",
        "no-underscore-dangle": "error",
        "no-unsafe-finally": "error",
        "no-unused-expressions": "error",
        "no-unused-labels": "error",
        "object-curly-spacing": [ "error", "always" ],
        "object-shorthand": "error",
        "one-var": [ "error", "never" ],
        "prefer-arrow/prefer-arrow-functions": "error",
        "radix": "error",
        "rest-spread-spacing": [ "error", "always" ],
        "semi": "off",
        "sort-imports": [ "error", { ignoreCase: true } ],
        "sort-keys": "error",
        "space-before-blocks": [ "error", "always" ],
        "space-before-function-paren": [ "error", "always" ],
        "spaced-comment": "error",
        "template-curly-spacing": [ "error", "never" ],
        "use-isnan": "error",
        "valid-typeof": "off"
    },
    settings: {
        jsdoc: {
            mode: "typescript",
            tagNamePreference: {
                arg: "param",
                return: "returns"
            }
        }
    }
};
