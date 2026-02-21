import chalk from 'chalk';
import {
    errorMessage,
    getTranslationMandatoryString,
    requirements,
    sortList
} from '../utils.js';
import {configBuild} from "../configBuild.js";

const mainKey = 'internalCode';
const collection = 'GeoSets';
const collectionItem = 'GeoSet';

let GeoSets = [];
let Translations = {};

export const geoSetsFunctions = {
    DataParse: async data => {

        function throwMex(prop, item, message) {
            throw new Error( errorMessage('main', collection, collectionItem, item, prop, message));
        }

        for (const item of Object.values(data)) {
            if (!Object.prototype.hasOwnProperty.call(item, mainKey)) {
                throwMex(mainKey, JSON.stringify(item), 'Required property is missing');
            }
            let geoSet = {},
                macroSet;

            /** internalCode: must be present and must be a string with alphabetical and dashes  */
            if(
                !requirements(item.internalCode, 'mustBeString') ||
                !requirements(item.internalCode, 'regex', /^[A-Z]{4}(?:-[A-Z0-9]{2,8})+$/)
            ) {
                throwMex('internalCode', item[mainKey],
                    'The property must be a string, having from 2 to 4 alphanumeric sequences separated by an hyphen.');
            }
            item.internalCode = item.internalCode.toUpperCase();
            macroSet = item.internalCode.split('-')[0];
            if ( !configBuild.extra.geoSets.internalCode.includes(macroSet) ) {
                throwMex('internalCode', item[mainKey],
                    'The property must begin with one of this (' + configBuild.extra.geoSets.internalCode + ')');
            }
            geoSet.internalCode = item.internalCode;

            /** unM49: must be 3 chars length numeric string or null*/
            if(!Object.prototype.hasOwnProperty.call(item, 'unM49')) {
                item.unM49 = null;
            }
            if(item.unM49 !== null) {
                item.unM49 = item.unM49.toString().padStart(3, '0');
                if( !requirements(item.unM49, 'regex', /^\d{3}$/i) ) {
                    throwMex('unM49', item[mainKey], 'The property must be 3 chars length numeric string');
                }
                if (macroSet != 'GEOG') {
                    throwMex('unM49', item[mainKey], 'The property must be null for sets that not belong to `GEOG`');
                }
            } else {
                if (macroSet == 'GEOG') {
                    throwMex('unM49', item[mainKey], 'The property cannot be null for sets that belong to `GEOG`');
                }
            }
            geoSet.unM49 = item.unM49;

            /** tags: must be present and must be an array of strings*/
            if(!Object.prototype.hasOwnProperty.call(item, 'tags')) {
                throwMex('tags', item[mainKey], 'Required property is missing');
            }
            if(
                !requirements(item.tags, 'mustBeArray') ||
                !requirements(item.tags, 'cannotBeEmpty')
            ) {
                throwMex('tags', item[mainKey], 'The property must be a not empty array');
            }
            let tmpTag = [];
            for (const tag of item.tags) {
                if(
                    !requirements(tag, 'mustBeString') ||
                    !requirements(tag, 'regex', /^[a-z0-9]+$/i)
                ) {
                    throwMex('tags', item[mainKey],
                        'The value of the tag `' + tag + '` must be a single word string');
                }
                tmpTag.push(tag.toLowerCase());
            }
            geoSet.tags = tmpTag.filter((v, i) => tmpTag.indexOf(v) === i);


            /** countryCodes: must be present and must be an array of 2 length chars strings*/
            if(!Object.prototype.hasOwnProperty.call(item, 'countryCodes')) {
                throwMex('countryCodes', item[mainKey], 'Required property is missing');
            }
            if(
                !requirements(item.countryCodes, 'mustBeArray') ||
                !requirements(item.countryCodes, 'cannotBeEmpty')
            ) {
                throwMex('countryCodes', item[mainKey], 'The property must be a not empty array');
            }
            let tmpCC = [];
            for (const countryCode of item.countryCodes) {
                if(
                    !requirements(countryCode, 'mustBeString') ||
                    !requirements(countryCode, 'regex', /^[a-z]{2}$/i)
                ) {
                    throwMex('countryCodes', item[mainKey],
                        'The value of countryCodes `' + countryCode + '` must be 2 chars length alphabetical string');
                }
                tmpCC.push(countryCode.toUpperCase());
            }
            geoSet.countryCodes = tmpCC.filter((v, i) => tmpCC.indexOf(v) === i);

            /** ---- **/
            GeoSets.push(geoSet);
        }

        GeoSets = sortList(GeoSets, mainKey);
        console.log(chalk.cyan('         - Main data for `' + collection +'` parsed'));
        return GeoSets;
    },

    DataTranslations: async (data, defaultLanguage = 'en') => {
        let gs;

        for (const [lang, langObjs] of Object.entries(data)) {

            Translations[lang] = {};

            for (const geoSet of Object.values(GeoSets)) {
                gs = geoSet[mainKey];
                Translations[lang][gs] = {};

                /** `name`: the source must be a string (required for the default language) **/
                Translations[lang][gs].name =
                    (getTranslationMandatoryString(
                        collection,
                        collectionItem,
                        gs,
                        langObjs[gs],
                        lang,
                        defaultLanguage,
                        'name'
                    )) ?? '';
            }
            console.log(
                chalk.cyan('         - Translation language `' + lang + '` data for `' + collection +'` parsed')
            );
        }
        return Translations;
    }
};

