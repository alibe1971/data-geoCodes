import chalk from 'chalk';
import {checkForTranslationString, errorMessage, sortList} from '../utils.js';

const mainKey = 'internalCode';
const collection = 'GeoSets';
const collectionItem = 'GeoSet';

let GeoSets = [];
let Translations = {};

export const geoSetsFunctions = {
    DataParse: async (data, dataDir) => {
        // eslint-disable-next-line no-unused-vars
        const unused = dataDir;

        function throwMex(prop, item, message) {
            throw new Error( errorMessage('main', collection, collectionItem, item, prop, message));
        }

        for (const item of Object.values(data)) {
            if (!Object.prototype.hasOwnProperty.call(item, mainKey)) {
                throwMex(mainKey, JSON.stringify(item), 'Required property is missing');
            }
            let geoSet = {};

            /** internalCode: must be present and must be a string with alphabetical and dashes  */
            if (
                typeof item.internalCode != 'string' || !/^(?=.*[a-zA-Z0-9])[^-]+(-[^-]+){1,4}$/.test(item.internalCode)
            ) {
                throwMex('internalCode', item[mainKey], 'The property has not the correct format');
            }
            geoSet.internalCode = item.internalCode.toUpperCase();

            /** unM49: must be 3 chars length numeric string or null*/
            if(!Object.prototype.hasOwnProperty.call(item, 'unM49')) {
                item.unM49 = null;
            }
            if(item.unM49 !== null) {
                item.unM49 = item.unM49.toString().padStart(3, '0');
                if(item.unM49.length != 3 || !/^\d+$/.test(item.unM49)) {
                    throwMex('unM49', item[mainKey], 'The property must be 3 chars length numeric string');
                }
            }
            geoSet.unM49 = item.unM49;

            /** tags: must be present and must be an array of strings*/
            if(!Object.prototype.hasOwnProperty.call(item, 'tags')) {
                throwMex('tags', item[mainKey], 'Required property is missing');
            }
            if(
                typeof item.tags != 'object' ||
                item.tags === null ||
                !Array.isArray(item.tags)
            ) {
                throwMex('tags', item[mainKey], 'The property must be an array');
            }
            let tmpTag = [];
            for (const tag of item.tags) {
                if(typeof tag != 'string' || /\s/.test(tag)) {
                    throwMex('tags', item[mainKey],
                        'The value timeZones["' + tag + '"]` must be a single word string');
                }
                tmpTag.push(tag.toLowerCase());
            }
            geoSet.tags = tmpTag;


            /** countryCodes: must be present and must be an array of 2 length chars strings*/
            if(!Object.prototype.hasOwnProperty.call(item, 'countryCodes')) {
                throwMex('countryCodes', item[mainKey], 'Required property is missing');
            }
            if(
                typeof item.countryCodes != 'object' ||
                item.countryCodes === null ||
                !Array.isArray(item.countryCodes) ||
                item.countryCodes.length === 0
            ) {
                throwMex('countryCodes', item[mainKey], 'The property must be a not empty array');
            }
            let tmpCC = [];
            for (const countryCode of item.countryCodes) {
                if(typeof countryCode != 'string' || !/^[a-zA-Z]{2}$/.test(countryCode)) {
                    throwMex('alpha2', item[mainKey],
                        'The value `countryCodes["' + countryCode + '"]` must be 2 chars length alphabetical string');
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
                    (checkForTranslationString(
                        collection,
                        collectionItem,
                        cc,
                        langObjs.name,
                        lang,
                        defaultLanguage,
                        'name'
                    )) ? langObjs.name[cc] : '';
            }
            console.log(chalk.cyan('         - Translation language `' + lang + '` data for `geoSets` parsed'));
        }
        return Translations;
    }
};

