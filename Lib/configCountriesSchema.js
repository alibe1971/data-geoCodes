export const countriesSchemaConfig = {
    meta: {
        hasCategories: false,
        flags: {
            enumSvgFormat: [
                '1x1',
                '4x3',
                '10x7'
            ],
            defaultSvgFormat: '10x7',
            chosenSvgFormat: null
        },
        mottos: {
            categories: [
                'official',
                'popular',
                'founding',
                'presidential',
                'royal',
                'military',
                'historical'
            ]
        },
        currencies: {
            categories: [
                'legalTenders',
                'widelyAccepted'
            ]
        },
        dialCodes: {
            categories: [
                'deJure',
                'deFacto',
                'exceptions'
            ],
            exceptionsProps: [
                'code',
                'origin'
            ]
        },
        ccIdn: {
            internalProperties: [
                'unicode',
                'punycode',
                'language',
                'regionsOfUse'
            ]
        },
        languages: {
            categories: [
                'official',
                'regional',
                'widelySpoken',
                'localCommunities',
                'extraTerritorialCommunities',
                'signs',
                'dialects'
            ],
            subCategories: {
                official: [
                    'deJure',
                    'deFacto'
                ],
                signs: [
                    'deJure',
                    'recognized',
                    'used'
                ]
            }
        }
    },
    mainKey: 'alpha2',
    mainKeyRules: {
        required: true
    },
    topLevelProperties: [
        'officialName',
        'alpha2',
        'alpha3',
        'unM49',
        'flags',
        'dependency',
        'mottos',
        'currencies',
        'dialCodes',
        'ccTld',
        'ccIdn',
        'timeZones',
        'languages',
        'localesIcu',
        'otherAppsIds'
    ],
    groupKeys: {
        mottos: 'extra.countries.mottos.categories',
        currencies: 'extra.countries.currencies.categories',
        dialCodes: 'extra.countries.dialCodes.categories',
        languages: 'extra.countries.languages.categories',
        languagesSubCategories: 'extra.countries.languages.subCategories'
    },
    rules: {
        officialName: {
            required: false,
            defaultValue: {},
            kind: 'localizedObject',
            minEntries: 1,
            keyFormat: 'bcp47',
            valueType: 'string',
            valueCannotBeEmpty: true
        },
        flags: {
            required: true,
            kind: 'object',
            children: {
                emoji: {
                    required: true,
                    kind: 'string',
                    regex: /^\p{Regional_Indicator}{2}$/u,
                    customChecks: [
                        'emojiMatchesAlpha2'
                    ]
                },
                svg: {
                    requiredGenerated: true,
                    source: 'originFlagFile',
                    minify: true
                }
            }
        },
        alpha2: {
            required: true,
            kind: 'string',
            regex: /^[a-z]{2}$/i,
            normalize: 'upper'
        },
        alpha3: {
            required: true,
            kind: 'string',
            regex: /^[a-z]{3}$/i,
            normalize: 'upper'
        },
        unM49: {
            required: true,
            kind: 'numericString',
            padStart: 3
        },
        dependency: {
            required: false,
            defaultValue: null,
            kind: 'nullableString',
            regex: /^[a-z]{2}$/i,
            normalize: 'upper',
            customChecks: [
                'notSelfMainKey'
            ]
        },
        mottos: {
            required: false,
            defaultValue: {},
            kind: 'categorizedLocalizedList',
            categoriesPath: 'extra.countries.mottos.categories',
            entryRequiredKeys: [
                'text'
            ],
            textKeyFormat: 'bcp47',
            textValueType: 'string',
            textValueCannotBeEmpty: true
        },
        currencies: {
            required: false,
            defaultValue: {},
            kind: 'categorizedCodeList',
            categoriesPath: 'extra.countries.currencies.categories',
            codeRegex: /^[a-z]{3}$/i,
            normalize: 'upper',
            dedupeWithinCategory: true,
            forbidCrossCategoryOverlap: true
        },
        dialCodes: {
            required: false,
            defaultValue: {},
            kind: 'dialCodesByCategory',
            categoriesPath: 'extra.countries.dialCodes.categories',
            exceptionsCategoryName: 'exceptions',
            exceptionPropsPath: 'extra.countries.dialCodes.exceptionsProps',
            deJureDeFactoRegex: /^(?:\+[1-9]\d*|\d+)$/,
            exceptionCodeRegex: /^(\d+)$/,
            exceptionOriginRegex: /^[a-z]{2}$/i,
            dedupeWithinCategory: true,
            forbidCrossCategoryOverlap: true
        },
        ccTld: {
            required: false,
            defaultValue: null,
            kind: 'nullableString',
            regex: /^\.[a-z]{2}$/i,
            normalize: 'lower'
        },
        ccIdn: {
            required: false,
            defaultValue: [],
            kind: 'ccIdnList',
            internalPropertiesPath: 'extra.countries.ccIdn.internalProperties',
            unicodeRegex: /^\.\S+$/u,
            punycodeRegex: /^\.(xn--)[a-z0-9]+(?:-[a-z0-9]+)*$/i,
            languageFormat: 'bcp47',
            regionRegex: /^[a-z]{2}$/i
        },
        timeZones: {
            required: true,
            kind: 'stringList',
            canBeEmpty: false,
            regex: /^[A-Za-z][A-Za-z0-9._+-]*(?:\/[A-Za-z0-9][A-Za-z0-9._+-]*)+$/i,
            mustExistInTimeZoneDb: true,
            dedupe: true
        },
        localesIcu: {
            required: false,
            defaultValue: [],
            kind: 'localeList',
            localeFormat: 'bcp47',
            mustBeSupportedByIntl: true,
            dedupe: true
        },
        otherAppsIds: {
            required: true,
            kind: 'object',
            children: {
                geoNamesOrg: {
                    required: true,
                    type: 'positiveIntegerNotZero'
                },
                wikiData: {
                    required: false,
                    defaultValue: null,
                    type: 'nullableString',
                    regex: /^Q[1-9][0-9]*$/i,
                    normalize: 'upper'
                },
                openStreetMapRelation: {
                    required: false,
                    defaultValue: null,
                    type: 'positiveIntegerNotZero'
                }
            }
        },
        languages: {
            required: false,
            defaultValue: {},
            kind: 'categorizedLanguageLists',
            categoriesPath: 'extra.countries.languages.categories',
            subCategoriesPath: 'extra.countries.languages.subCategories',
            languageRegex: /^[a-z]{2,3}$/i,
            normalize: 'lower',
            dedupeWithinList: true,
            forbidCrossCategoryOverlap: true
        }
    },
    translations: {
        mandatoryStringProps: [
            'name',
            'fullName'
        ],
        outputArrayProps: [
            'demonyms'
        ],
        keywordSources: [
            'acronymsAliasFormer',
            'adjectives',
            'others',
            'typos'
        ]
    },
    translationsCategories: {
        enabled: false
    }
};
