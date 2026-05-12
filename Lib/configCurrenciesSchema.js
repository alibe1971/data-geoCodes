export const currenciesSchemaConfig = {
    meta: {
        hasCategories: true,
        scopes: [
            'M',
            'F',
            'P',
            'S'
        ]
    },
    mainKey: 'isoAlpha',
    mainKeyRules: {
        required: true
    },
    topLevelProperties: [
        'isoAlpha',
        'isoNumber',
        'symbol',
        'decimal',
        'scope'
    ],
    rules: {
        isoAlpha: {
            required: true,
            kind: 'string',
            regex: /^[a-z]{3}$/i,
            normalize: 'upper'
        },
        isoNumber: {
            required: true,
            kind: 'numericString',
            padStart: 3
        },
        symbol: {
            required: false,
            defaultValue: null,
            kind: 'nullableString'
        },
        decimal: {
            required: false,
            defaultValue: null,
            kind: 'nullablePositiveIntegerOrZero'
        },
        scope: {
            required: true,
            kind: 'enumString',
            enumPath: 'extra.currencies.scopes',
            normalize: 'upper',
            outputWrapCode: true
        }
    },
    translations: {
        mandatoryStringProps: [
            'name'
        ]
    },
    translationsCategories: {
        enabled: true,
        rootKey: 'scope',
        enumPath: 'extra.currencies.scopes'
    }
};
