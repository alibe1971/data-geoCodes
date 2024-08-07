import { countriesFunctions } from './Builders/countriesBuilder.js';
import { geoSetsFunctions } from './Builders/geoSetsBuilder.js';
import { currenciesFunctions } from './Builders/currenciesBuilder.js';
import {languagesFunctions} from "./Builders/languagesBuilder.js";

import { saveDataForJson } from './Writers/appJson.js';
import { saveDataForNode } from './Writers/appNode.js';
import { saveDataForPhp } from './Writers/appPhp.js';
import { saveDataForGo } from './Writers/appGo.js';


export const configBuild = {
    readPaths: {
        origin: 'Data/origin/',
        destin: 'Data/built/',
    },
    Apps: {
        json: saveDataForJson,
        node: saveDataForNode,
        php: saveDataForPhp,
        go: saveDataForGo
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
    appConfig: 'Config.json',
    appData: {
        countries: countriesFunctions,
        currencies: currenciesFunctions,
        geoSets: geoSetsFunctions,
        languages: languagesFunctions
    }
};