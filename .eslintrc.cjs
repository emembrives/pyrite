module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
    ],
    globals: {
        $: true,
        app: true,
        globalThis: true,
    },
    ignorePatterns: ['node_modules/', 'protocol.js'],
    plugins: [
        'sort-class-members',
    ],
    root: true,
    rules: {
        'comma-dangle': [2, 'always-multiline'],
        'eol-last': [2, 'always'],
        indent: ['error', 4],
        'init-declarations': 'off',
        'no-cond-assign': ['error', 'always'],
        'no-console': 'off',
        'no-inline-comments': 'off',
        'no-multiple-empty-lines': [2, {max: 2, maxEOF: 1}],
        'one-var': 'off',
        'quote-props': [2, 'as-needed'],
        semi: [2, 'never'],
        'sort-class-members/sort-class-members': [2, {
            accessorPairPositioning: 'getThenSet',
            groups: {
                'conventional-private-methods': [
                    {
                        name: '/_.+/',
                        sort: 'alphabetical',
                        type: 'method',
                    },
                ],
                methods: [
                    {
                        sort: 'alphabetical',
                        type: 'method',
                    },
                ],
            },
            order: [
                'constructor',
                '[static-properties]',
                '[static-methods]',
                '[conventional-private-properties]',
                '[conventional-private-methods]',
                '[properties]',
                '[methods]',
                '[everything-else]',
            ],
            stopAfterFirstProblem: true,
        }],
        'sort-imports': ['error', {
            ignoreCase: true,
            ignoreDeclarationSort: false,
            ignoreMemberSort: false,
            memberSyntaxSortOrder: ['none',  'all', 'single', 'multiple'],
        }],
        'sort-keys': [2, 'asc', {
            caseSensitive: false,
            natural: true,
        }],
        'sort-vars': [2, {ignoreCase: true}],
        'space-before-function-paren': [2, 'never'],
        'space-in-brackets': [0, 'never'],
        'spaced-comment': [2, 'always'],
        strict: [2, 'global'],

        'use-isnan': 2,
        'vars-on-top': 0,
        'vue/attributes-order': ['error', {
            alphabetical: true,
            order: [
                'DEFINITION',
                'LIST_RENDERING',
                'CONDITIONALS',
                'RENDER_MODIFIERS',
                'GLOBAL',
                'UNIQUE',
                'TWO_WAY_BINDING',
                'OTHER_DIRECTIVES',
                'OTHER_ATTR',
                'EVENTS',
                'CONTENT',
            ],
        }],
        'vue/html-indent': ['error', 4],
        'vue/max-attributes-per-line': ['error', {
            multiline: {
                allowFirstLine: false,
                max: 2,
            },
            singleline: 3,
        }],
        'vue/order-in-components': 'off',
    },
}
