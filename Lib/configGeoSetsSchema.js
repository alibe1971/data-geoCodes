export const geoSetsSchemaConfig = {
    meta: {
        hasCategories: true,
        internalCode: [
            'GEOG',
            'CONV',
            'ORGS'
        ]
    },
    mainKey: 'internalCode',
    mainKeyRules: {
        required: true
    },
    topLevelProperties: [
        'internalCode',
        'unM49',
        'scope',
        'tags',
        'countryCodes'
    ],
    rules: {
        internalCode: {
            required: true,
            kind: 'string',
            regex: /^[A-Z]{4}(?:-[A-Z0-9]{2,8})+$/,
            normalize: 'upper',
            macroAllowedPath: 'extra.geoSets.internalCode'
        },
        unM49: {
            required: false,
            defaultValue: null,
            kind: 'nullableNumericString',
            padStart: 3,
            regex: /^\d{3}$/i
        },
        scope: {
            required: true,
            kind: 'enumString',
            enumPath: 'extra.geoSets.internalCode',
            normalize: 'upper',
            outputWrapCode: true
        },
        tags: {
            required: true,
            kind: 'stringList',
            canBeEmpty: false,
            regex: /^[a-z0-9]+$/i,
            normalize: 'lower',
            dedupeWithinList: true
        },
        countryCodes: {
            required: true,
            kind: 'stringList',
            canBeEmpty: false,
            regex: /^[a-z]{2}$/i,
            normalize: 'upper',
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
        rootKey: 'scope',
        enumPath: 'extra.geoSets.internalCode'
    }
};
