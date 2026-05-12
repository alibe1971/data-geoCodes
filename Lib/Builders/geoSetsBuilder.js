import { configBuild } from '../configBuild.js';
import {
    parseGeoSetsDataModular,
    parseGeoSetsTranslationsCategoriesModular,
    parseGeoSetsTranslationsModular
} from './geoSetsBuilder.modular.js';

let GeoSets = [];
let Translations = {};
let TranslationsCategories = {};

export const geoSetsFunctions = {
    DataParse: async data => {
        GeoSets = await parseGeoSetsDataModular(data, configBuild);
        return GeoSets;
    },

    DataTranslations: async (data, defaultLanguage = 'en') => {
        Translations = await parseGeoSetsTranslationsModular(
            data,
            defaultLanguage,
            GeoSets
        );
        return Translations;
    },

    DataTranslationsCategories: async (data, defaultLanguage = 'en') => {
        TranslationsCategories = await parseGeoSetsTranslationsCategoriesModular(
            data,
            defaultLanguage,
            configBuild
        );
        return TranslationsCategories;
    }
};

