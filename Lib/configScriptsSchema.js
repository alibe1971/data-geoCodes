export const scriptsSchemaConfig = {
    meta: {
        hasCategories: true,
        direction: [
            'nla',
            'ltr',
            'rtl'
        ]
    },
    mainKey: 'code',
    mainKeyRules: {
        required: true
    },
    topLevelProperties: [
        'code',
        'numeric',
        'writingDirection',
        'unicode'
    ],
    rules: {
        code: {
            required: true,
            kind: 'string',
            regex: /^[a-z]{4}$/i,
            normalize: 'title'
        },
        numeric: {
            required: true,
            kind: 'numericString',
            padStart: 3
        },
        writingDirection: {
            required: false,
            defaultValue: 'nla',
            kind: 'enumString',
            enumPath: 'extra.scripts.direction',
            normalize: 'lower',
            outputWrapCode: true
        },
        unicode: {
            required: true,
            kind: 'unicodeBlock'
        }
    },
    translations: {
        mandatoryStringProps: [
            'name'
        ]
    },
    translationsCategories: {
        enabled: true,
        rootKey: 'writingDirection',
        enumPath: 'extra.scripts.direction'
    }
};
