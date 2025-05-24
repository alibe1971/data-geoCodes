import chalk from 'chalk';
import {checkForTranslationString, errorMessage, sortList} from '../utils.js';

const mainKey = 'isoAlpha';
const collection = 'Currencies';
const collectionItem = 'Currency';

let Currencies = [];
let Translations = {};

export const currenciesFunctions = {
    DataParse: async data => {

        function throwMex(prop, item, message) {
            throw new Error( errorMessage('main', collection, collectionItem, item, prop, message));
        }

        for (const item of Object.values(data)) {
            if (!Object.prototype.hasOwnProperty.call(item, mainKey)) {
                throwMex(mainKey, JSON.stringify(item), 'Required property is missing');
            }
            let currency = {};

            /** isoAlpha: must be present and must be 3 chars length string */
            if(typeof item.isoAlpha != 'string' || item.isoAlpha.length != 3 || !/^[a-zA-Z]+$/.test(item.isoAlpha)) {
                throwMex('isoAlpha', item[mainKey], 'The property must be 3 chars length alphabetical string');
            }
            currency.isoAlpha = item.isoAlpha.toUpperCase();

            /** unM49: must be present and must be 3 chars length numeric string */
            if(!Object.prototype.hasOwnProperty.call(item, 'isoNumber')) {
                throwMex('unM49', item[mainKey], 'Required property is missing');
            }
            item.isoNumber = item.isoNumber.toString().padStart(3, '0');
            if(item.isoNumber.length != 3 || !/^\d+$/.test(item.isoNumber)) {
                throwMex('unM49', item[mainKey], 'The property must be 3 chars length numeric string');
            }
            currency.isoNumber = item.isoNumber;


            /** symbol: can be null or string */
            if(!Object.prototype.hasOwnProperty.call(item, 'symbol')) {
                item.symbol = null;
            }
            if(item.symbol !== null) {
                if(typeof item.symbol != 'string') {
                    throwMex('symbol', item[mainKey],  'The property must be null or s string');
                }
            }
            currency.symbol = item.symbol;

            /** decimal: must be present and an integer */
            if(!Object.prototype.hasOwnProperty.call(item, 'decimal')) {
                throwMex('decimal', item[mainKey], 'Required property is missing');
            }
            if(item.decimal !== null) {
                if(!Number.isInteger(item.decimal)) {
                    throwMex('decimal', item[mainKey], 'The property must be a positive integer');
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
            console.log(chalk.cyan('         - Translation language `' + lang + '` data for `currencies` parsed'));
        }
        return Translations;
    }
};

