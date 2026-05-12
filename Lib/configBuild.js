import { configFunctions } from './Builders/configBuilder.js';
import { countriesFunctions } from './Builders/countriesBuilder.js';
import { geoSetsFunctions } from './Builders/geoSetsBuilder.js';
import { currenciesFunctions } from './Builders/currenciesBuilder.js';
import {languagesFunctions} from "./Builders/languagesBuilder.js";
import {scriptsFunctions} from "./Builders/scriptsBuilder.js";
import { countriesSchemaConfig } from './configCountriesSchema.js';
import { currenciesSchemaConfig } from './configCurrenciesSchema.js';
import { geoSetsSchemaConfig } from './configGeoSetsSchema.js';
import { languagesSchemaConfig } from './configLanguagesSchema.js';
import { scriptsSchemaConfig } from './configScriptsSchema.js';

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
        countries: countriesSchemaConfig.meta,
        geoSets: geoSetsSchemaConfig.meta,
        currencies: currenciesSchemaConfig.meta,
        languages: languagesSchemaConfig.meta,
        scripts: scriptsSchemaConfig.meta
    }
};
