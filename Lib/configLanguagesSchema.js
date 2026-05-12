export const languagesSchemaConfig = {
    meta: {
        hasCategories: true,
        scopes: [
            'I',
            'M',
            'S'
        ],
        types: [
            'A',
            'C',
            'E',
            'H',
            'L',
            'S'
        ]
    },
    mainKey: 'isoCode',
    mainKeyRules: {
        required: true
    },
    topLevelProperties: [
        'isoCode',
        'part2b',
        'part2t',
        'part1',
        'glottoCode',
        'scope',
        'type',
        'macroLanguageRef',
        'scripts'
    ],
    rules: {
        isoCode: {
            required: true,
            kind: 'string',
            regex: /^[a-z]{3}$/i,
            normalize: 'lower'
        },
        part2b: {
            required: false,
            defaultValue: null,
            kind: 'nullableString',
            regex: /^[a-z]{3}$/i,
            normalize: 'lower'
        },
        part2t: {
            required: false,
            defaultValue: null,
            kind: 'nullableString',
            regex: /^[a-z]{3}$/i,
            normalize: 'lower'
        },
        part1: {
            required: false,
            defaultValue: null,
            kind: 'nullableString',
            regex: /^[a-z]{2}$/i,
            normalize: 'lower'
        },
        glottoCode: {
            required: false,
            defaultValue: null,
            kind: 'nullableString',
            regex: /^[a-z]{4}\d{4}$/i,
            normalize: 'lower'
        },
        scope: {
            required: true,
            kind: 'enumString',
            enumPath: 'extra.languages.scopes',
            normalize: 'upper',
            outputWrapCode: true
        },
        type: {
            required: true,
            kind: 'enumString',
            enumPath: 'extra.languages.types',
            normalize: 'upper',
            outputWrapCode: true
        },
        macroLanguageRef: {
            required: false,
            defaultValue: null,
            kind: 'nullableString',
            regex: /^[a-z]{3}$/i,
            normalize: 'lower'
        },
        scripts: {
            required: false,
            defaultValue: [],
            kind: 'scriptCodeList',
            regex: /^[a-z]{4}$/i,
            normalize: 'title',
            dedupeWithinList: true
        }
    },
    translations: {
        mandatoryStringProps: [
            'name'
        ]
    },
    translationsCategories: {
        enabled: true,
        roots: [
            {
                rootKey: 'scope',
                enumPath: 'extra.languages.scopes'
            },
            {
                rootKey: 'type',
                enumPath: 'extra.languages.types'
            }
        ]
    }
};
