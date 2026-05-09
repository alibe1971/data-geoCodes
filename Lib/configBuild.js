import { configFunctions } from './Builders/configBuilder.js';
import { countriesFunctions } from './Builders/countriesBuilder.js';
import { geoSetsFunctions } from './Builders/geoSetsBuilder.js';
import { currenciesFunctions } from './Builders/currenciesBuilder.js';
import {languagesFunctions} from "./Builders/languagesBuilder.js";
import {scriptsFunctions} from "./Builders/scriptsBuilder.js";

import { saveDataForJson } from './Writers/appJson.js';
import { saveDataForNode } from './Writers/appNode.js';
import { saveDataForPhp } from './Writers/appPhp.js';
import { saveDataForGo } from './Writers/appGo.js';
import { saveDataForXml } from './Writers/appXml.js';
import { saveDataForYaml } from './Writers/appYaml.js';


export const configBuild = {
    readPaths: {
        origin: 'Data/origin/',
        destin: 'Data/built/',
    },
    Apps: {
        json: saveDataForJson,
        node: saveDataForNode,
        yaml: saveDataForYaml,
        php: saveDataForPhp,
        go: saveDataForGo,
        xml: saveDataForXml,
    },
    TranslationDir: 'Translations/',
    TranslationCategoriesDir: 'Categories/',
    appConfig: 'config.json',
    configFunctions: configFunctions,
    appData: {
        countries: countriesFunctions,
        currencies: currenciesFunctions,
        geoSets: geoSetsFunctions,
        languages: languagesFunctions,
        scripts: scriptsFunctions
    },
    extra: {
        countries: {
            hasCategories: false,
            flags: {
                enumSvgFormat: [
                    '1x1',
                    '4x3',
                    '10x7'
                ],
                defaultSvgFormat: '10x7',
                chosenSvgFormat: null,
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
                ],
                subCategories: [
                    'text'
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
        geoSets: {
            hasCategories: true,
            internalCode: [
                'GEOG',
                'CONV',
                'ORGS'
            ]
        },
        currencies: {
            hasCategories: true,
            scopes: [
                'M',
                'F',
                'P',
                'S'
            ]
        },
        languages: {
            hasCategories: true,
            scopes: [
                'I',
                'M',
                'S'
            ],
            types:[
                'A',
                'C',
                'E',
                'H',
                'L',
                'S'
            ]
        },
        scripts: {
            hasCategories: true,
            direction: [
                'nla',
                'ltr',
                'rtl'
            ]
        },
    }
};
