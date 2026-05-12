import { configBuild } from '../configBuild.js';
import {
    parseLanguagesDataModular,
    parseLanguagesTranslationsCategoriesModular,
    parseLanguagesTranslationsModular
} from './languagesBuilder.modular.js';

let Languages = [];
let Translations = {};
let TranslationsCategories = {};

export const languagesFunctions = {

    DataParse: async data => {
        Languages = await parseLanguagesDataModular(data, configBuild);
        return Languages;
    },

    DataTranslations: async (data, defaultLanguage = 'en') => {
        Translations = await parseLanguagesTranslationsModular(
            data,
            defaultLanguage,
            Languages
        );
        return Translations;
    },

    DataTranslationsCategories: async (data, defaultLanguage = 'en') => {
        TranslationsCategories = await parseLanguagesTranslationsCategoriesModular(
            data,
            defaultLanguage,
            configBuild
        );
        return TranslationsCategories;
    }
};

