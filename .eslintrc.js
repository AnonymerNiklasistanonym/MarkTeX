module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": [
        "plugin:jsdoc/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": [
            "tsconfig.json",
            "tsconfig.internal.json"
        ],
        "sourceType": "module"
    },
    "plugins": [
        "jsdoc",
        "@typescript-eslint",
        "prefer-arrow"
    ],
    "settings": {
        "jsdoc": {
            "mode": "typescript",
            "tagNamePreference": {
                "arg": "param",
                "return": "returns"
            }
        }
    },
    "rules": {
        "no-duplicate-imports": "error",
        "arrow-spacing": "error",
        "sort-keys": "error",
        "template-curly-spacing": ["error", "never"],
        "rest-spread-spacing": ["error", "always"],
        "sort-imports": ["error", { ignoreCase: true }],
        "keyword-spacing": ["error", { before: true, after: true }],
        "space-before-blocks": ["error", "always"],
        "block-spacing": ["error", "always"],
        "space-before-function-paren": ["error", "always"],
        "array-bracket-spacing": ["error", "always", { "singleValue": false }],
        "object-curly-spacing": ["error", "always"],
        "computed-property-spacing": ["error", "never"],
        "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
        "jsdoc/check-types": 0,
        "jsdoc/require-returns-type": 0,
        "jsdoc/require-param-type": 0,
        "@typescript-eslint/array-type": "error",
        "@typescript-eslint/indent": "error",
        "@typescript-eslint/member-delimiter-style": [
            "error",
            {
                "multiline": {
                    "delimiter": "none",
                    "requireLast": true
                },
                "singleline": {
                    "delimiter": "semi",
                    "requireLast": false
                }
            }
        ],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-use-before-define": "error",
        "@typescript-eslint/prefer-for-of": "error",
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/quotes": [
            "error",
            "double"
        ],
        "semi": "off",
        "@typescript-eslint/semi": [ "error" ],
        "@typescript-eslint/unified-signatures": "error",
        "camelcase": "error",
        "comma-dangle": "error",
        "complexity": ["error", { "max": 5 }],
        "constructor-super": "error",
        "dot-notation": "error",
        "eqeqeq": [
            "error",
            "smart"
        ],
        "guard-for-in": "error",
        "id-blacklist": [
            "error",
            "any",
            "number",
            "string",
            "Boolean",
            "boolean"
        ],
        "id-match": "error",
        "linebreak-style": [
            "error",
            "unix"
        ],
        "max-classes-per-file": [
            "error",
            1
        ],
        "max-len": [
            "error",
            {
                "code": 120
            }
        ],
        "new-parens": "error",
        "no-bitwise": "error",
        "no-caller": "error",
        "no-cond-assign": "error",
        "no-console": "error",
        "no-debugger": "error",
        "no-empty": "error",
        "no-eval": "error",
        "no-fallthrough": "off",
        "no-invalid-this": "off",
        "no-irregular-whitespace": "error",
        "no-new-wrappers": "error",
        "no-shadow": [
            "error",
            {
                "hoist": "all"
            }
        ],
        "no-throw-literal": "error",
        "no-trailing-spaces": "error",
        "no-undef-init": "error",
        "no-underscore-dangle": "error",
        "no-unsafe-finally": "error",
        "no-unused-expressions": "error",
        "no-unused-labels": "error",
        "object-shorthand": "error",
        "one-var": [
            "error",
            "never"
        ],
        "prefer-arrow/prefer-arrow-functions": "error",
        "radix": "error",
        "spaced-comment": "error",
        "use-isnan": "error",
        "valid-typeof": "off",
    }
};
