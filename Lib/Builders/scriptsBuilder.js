import { configBuild } from '../configBuild.js';
import {
    parseScriptsDataModular,
    parseScriptsTranslationsCategoriesModular,
    parseScriptsTranslationsModular
} from './scriptsBuilder.modular.js';

let Scripts = [];
let Translations = {};
let TranslationsCategories = {};

export const scriptsFunctions = {

    DataParse: async data => {
        Scripts = await parseScriptsDataModular(data, configBuild);
        return Scripts;
    },

    DataTranslations: async (data, defaultLanguage = 'en') => {
        Translations = await parseScriptsTranslationsModular(
            data,
            defaultLanguage,
            Scripts
        );
        return Translations;
    },

    DataTranslationsCategories: async (data, defaultLanguage = 'en') => {
        TranslationsCategories = await parseScriptsTranslationsCategoriesModular(
            data,
            defaultLanguage,
            configBuild
        );
        return TranslationsCategories;
    }
};

