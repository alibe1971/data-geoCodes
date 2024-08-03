import chalk from 'chalk';
import {checkForTranslationString, sortList} from '../utils.js';

const mainKey = 'isoAlpha';

let Currencies = [];
let Translations = {};

export const currenciesFunctions = {
    DataParse: async (data, dataDir) => {
        // eslint-disable-next-line no-unused-vars
        const unused = dataDir;
        for (const item of Object.values(data)) {
            if (!Object.prototype.hasOwnProperty.call(item, mainKey)) {
                throw new Error('The property `' + mainKey + '` is required in every items.');
            }
            let currency = {};

            /** isoAlpha: must be present and must be 3 chars length string */
            if(typeof item.isoAlpha != 'string' || item.isoAlpha.length != 3 || !/^[a-zA-Z]+$/.test(item.isoAlpha)) {
                throw new Error(
                    'Item: `' + item[mainKey] + '`. The property `alpha2` must be 2 chars length alphabetical string'
                );
            }
            currency.isoAlpha = item.isoAlpha.toUpperCase();

            /** unM49: must be present and must be 3 chars length numeric string */
            if(!Object.prototype.hasOwnProperty.call(item, 'isoNumber')) {
                throw new Error('Item: `' + item[mainKey] + '`. The property `isoNumber` is required');
            }
            item.isoNumber = item.isoNumber.toString().padStart(3, '0');
            if(item.isoNumber.length != 3 || !/^\d+$/.test(item.isoNumber)) {
                throw new Error(
                    'Item: `' + item[mainKey] + '`. The property `isoNumber` must be 3 chars length numeric string'
                );
            }
            currency.isoNumber = item.isoNumber;


            /** symbol: can be null or string */
            if(!Object.prototype.hasOwnProperty.call(item, 'symbol')) {
                item.symbol = null;
            }
            if(item.symbol !== null) {
                if(typeof item.symbol != 'string') {
                    throw new Error('Item: `' + item[mainKey] + '`. The property `symbol` must be null or a string');
                }
            }
            currency.symbol = item.symbol;

            /** decimal: must be present and an integer */
            if(!Object.prototype.hasOwnProperty.call(item, 'decimal')) {
                throw new Error('Item: `' + item[mainKey] + '`. The property `decimal` is required');
            }
            if(item.symbol !== null) {
                if(!Number.isInteger(item.decimal)) {
                    throw new Error('Item: `' + item[mainKey] + '`. The property `decimal` must be an integer');
                }
            }
            currency.decimal = item.decimal;

            /** ---- **/
            Currencies.push(currency);
        }

        Currencies = sortList(Currencies, mainKey);
        console.log(chalk.cyan('         - Main data for `Currencies` parsed'));
        return Currencies;
    },

    DataTranslations: async (data, defaultLanguage = 'en') => {
        let cc;
        for (const [lang, langObjs] of Object.entries(data)) {
            Translations[lang] = {};
            for (const country of Object.values(Currencies)) {
                cc = country[mainKey];
                Translations[lang][cc] = {};

                /** `name`: the source must be a string (required for the default language) **/
                Translations[lang][cc].name =
                    (checkForTranslationString(cc, langObjs.name, lang, defaultLanguage, 'name')) ?
                        langObjs.name[cc] : '';
            }
            console.log(chalk.cyan('         - Translation language `' + lang + '` data for `currencies` parsed'));
        }
        return Translations;
    }
};

