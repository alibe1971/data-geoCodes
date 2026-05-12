import { configBuild } from '../configBuild.js';
import {
    parseCurrenciesDataModular,
    parseCurrenciesTranslationsCategoriesModular,
    parseCurrenciesTranslationsModular
} from './currenciesBuilder.modular.js';

let Currencies = [];
let Translations = {};
let TranslationsCategories = {};

export const currenciesFunctions = {
    DataParse: async data => {
        Currencies = await parseCurrenciesDataModular(data, configBuild);
        return Currencies;
    },

    DataTranslations: async (data, defaultLanguage = 'en') => {
        Translations = await parseCurrenciesTranslationsModular(
            data,
            defaultLanguage,
            Currencies
        );
        return Translations;
    },

    DataTranslationsCategories: async (data, defaultLanguage = 'en') => {
        TranslationsCategories = await parseCurrenciesTranslationsCategoriesModular(
            data,
            defaultLanguage,
            configBuild
        );
        return TranslationsCategories;
    }
};

