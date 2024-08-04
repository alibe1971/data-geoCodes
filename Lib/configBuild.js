import { countriesFunctions } from './Builders/countriesBuilder.js';
import { geoSetsFunctions } from './Builders/geoSetsBuilder.js';
import { currenciesFunctions } from './Builders/currenciesBuilder.js';

import { saveDataForJson } from './Writers/appJson.js';
import { saveDataForNode } from './Writers/appNode.js';
import { saveDataForPhp } from './Writers/appPhp.js';

export const configBuild = {
    readPaths: {
        origin: 'Data/origin/',
        destin: 'Data/built/',
    },
    Apps: {
        json: saveDataForJson,
        node: saveDataForNode,
        php: saveDataForPhp,
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
        }
    },
    appConfig: 'Config.json',
    appData: {
        countries: countriesFunctions,
        currencies: currenciesFunctions,
        geoSets: geoSetsFunctions
    }
};