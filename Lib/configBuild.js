import { configFunctions } from './Builders/configBuilder.js';
import { countriesFunctions } from './Builders/countriesBuilder.js';
import { geoSetsFunctions } from './Builders/geoSetsBuilder.js';
import { currenciesFunctions } from './Builders/currenciesBuilder.js';
import {languagesFunctions} from "./Builders/languagesBuilder.js";

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
    TranslationData: {
        countries: {
            name: 'ccNameCommon',
            fullName: 'ccNameFull',
            demonyms: 'ccDemonyms',
            acronymsAliasFormer: 'ccAcronymsAliasFormer',
            adjectives: 'ccAdjectives',
            others: 'ccOthers',
            typos: 'ccTypos'
        },
        geoSets: {
            name: 'geoSets'
        },
        currencies: {
            name: 'currencies'
        },
        languages: {
            name: 'languages'
        }
    },
    appConfig: 'config.json',
    configFunctions: configFunctions,
    appData: {
        countries: countriesFunctions,
        currencies: currenciesFunctions,
        geoSets: geoSetsFunctions,
        languages: languagesFunctions
    },
    extra: {
        countries: {
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
                    'royal',
                    'presidential'
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
                    'main',
                    'exceptions'
                ]
            }
        },
        geoSets: {
            internalCode: [
                'GEOG',
                'CONV',
                'ORGS',
                'ZONE',
            ]
        }

    }
};