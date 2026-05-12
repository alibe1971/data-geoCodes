import { configBuild } from '../configBuild.js';
import {
    parseCountriesDataModular,
    parseCountriesTranslationsCategoriesModular,
    parseCountriesTranslationsModular
} from './countriesBuilder.modular.js';

let Countries = [];
let Translations = {};
let TranslationsCategories = {};

export const countriesFunctions = {

    DataParse: async data => {
        Countries = await parseCountriesDataModular(data, configBuild);
        return Countries;
    },

    DataTranslations: async (data, defaultLanguage = 'en') => {
        Translations = await parseCountriesTranslationsModular(
            data,
            defaultLanguage,
            Countries
        );
        return Translations;
    },

    DataTranslationsCategories: async (data, defaultLanguage = 'en') => {
        TranslationsCategories = await parseCountriesTranslationsCategoriesModular(
            data,
            defaultLanguage
        );
        return TranslationsCategories;
    }
};
