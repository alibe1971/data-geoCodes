import chalk from 'chalk';
import {checkForTranslationString, sortList} from '../utils.js';

const mainKey = 'internalCode';

let GeoSets = [];
let Translations = {};



export const geoSetsFunctions = {
    DataParse: async (data) => {
        for (const item of Object.values(data)) {
            if (!Object.prototype.hasOwnProperty.call(item, mainKey)) {
                throw new Error('The property `' + mainKey + '` is required in every items.');
            }
            let geoSet = {};

            /** internalCode: must be present and must be a string with alphabetical and dashes  */
            if (
                typeof item.internalCode != 'string' || !/^(?=.*[a-zA-Z0-9])[^-]+(-[^-]+){1,4}$/.test(item.internalCode)
            ) {
                throw new Error(
                    'Item: `' + item[mainKey] + '`. The property `internalCode` has not the correct format'
                );
            }
            geoSet.internalCode = item.internalCode.toUpperCase();

            /** unM49: must be 3 chars length numeric string or null*/
            if(!Object.prototype.hasOwnProperty.call(item, 'unM49')) {
                item.unM49 = null;
            }
            if(item.unM49 !== null) {
                item.unM49 = item.unM49.toString().padStart(3, '0');
                if(item.unM49.length != 3 || !/^\d+$/.test(item.unM49)) {
                    throw new Error(
                        'Item: `' + item[mainKey] + '`. The property `unM49` must be 3 chars length numeric string'
                    );
                }
            }
            geoSet.unM49 = item.unM49;

            /** tags: must be present and must be an array of strings*/
            if(!Object.prototype.hasOwnProperty.call(item, 'tags')) {
                throw new Error('Item: `' + item[mainKey] + '`. The property `tags` is required');
            }
            if(
                typeof item.tags != 'object' ||
                item.tags === null ||
                !Array.isArray(item.tags)
            ) {
                throw new Error('Item: `' + item[mainKey] + '`. The property `tags` must be an array');
            }
            let tmpTag = [];
            for (const tag of item.tags) {
                if(typeof tag != 'string' || /\s/.test(tag)) {
                    throw new Error(
                        'Item: `' + item[mainKey] + '`. The value `tags["' + tag + '"]` must be a single word string'
                    );
                }
                tmpTag.push(tag.toLowerCase());
            }
            geoSet.tags = tmpTag;


            /** countryCodes: must be present and must be an array of 2 length chars strings*/
            if(!Object.prototype.hasOwnProperty.call(item, 'countryCodes')) {
                throw new Error('Item: `' + item[mainKey] + '`. The property `countryCodes` is required');
            }
            if(
                typeof item.countryCodes != 'object' ||
                item.countryCodes === null ||
                !Array.isArray(item.countryCodes)
            ) {
                throw new Error('Item: `' + item[mainKey] + '`. The property `countryCodes` must be an array');
            }
            let tmpCC = [];
            for (const countryCode of item.countryCodes) {
                if(typeof countryCode != 'string' || !/^[a-zA-Z]{2}$/.test(countryCode)) {
                    throw new Error(
                        'Item: `' + item[mainKey] + '`. The value `countryCodes["' + countryCode + '"]` must be a' +
                        'single 2 length alphabetical string'
                    );
                }
                tmpCC.push(countryCode.toUpperCase());
            }
            geoSet.countryCodes = tmpCC;

            /** ---- **/
            GeoSets.push(geoSet);
        }

        GeoSets = sortList(GeoSets, mainKey);
        console.log(chalk.cyan('         - Main data for `GeoSets` parsed'));
        return GeoSets;
    },

    DataTranslations: async (data, defaultLanguage = 'en') => {
        let cc;
        for (const [lang, langObjs] of Object.entries(data)) {
            Translations[lang] = {};
            for (const country of Object.values(GeoSets)) {
                cc = country[mainKey];
                Translations[lang][cc] = {};

                /** `name`: the source must be a string (required for the default language) **/
                Translations[lang][cc].name =
                    (checkForTranslationString(cc, langObjs.name, lang, defaultLanguage, 'name')) ?
                        langObjs.name[cc] : '';
            }
            console.log(chalk.cyan('         - Translation language `' + lang + '` data for `geoSets` parsed'));
        }
        return Translations;
    }
};

