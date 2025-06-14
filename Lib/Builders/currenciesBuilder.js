import chalk from 'chalk';
import {checkForTranslationString, errorMessage, requirements, sortList} from '../utils.js';

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
            if(
                !requirements(item.isoAlpha, 'mustBeString') ||
                !requirements(item.isoAlpha, 'regex', /^[a-z]{3}$/i)
            ) {
                throwMex('isoAlpha', item[mainKey], 'The property must be 3 chars length alphabetical string');
            }
            currency.isoAlpha = item.isoAlpha.toUpperCase();


            /** isoNumber: must be present and must be 3 chars length numeric string */
            if(!Object.prototype.hasOwnProperty.call(item, 'isoNumber')) {
                throwMex('isoNumber', item[mainKey], 'Required property is missing');
            }
            item.isoNumber = item.isoNumber.toString().padStart(3, '0');
            if( !requirements(item.isoNumber, 'regex', /^\d{3}$/i) ) {
                throwMex('isoNumber', item[mainKey], 'The property must be 3 chars length numeric string');
            }
            currency.isoNumber = item.isoNumber;


            /** symbol: can be null or string */
            if(!Object.prototype.hasOwnProperty.call(item, 'symbol')) {
                item.symbol = null;
            }
            if( !requirements(item.symbol, 'mustBeStringOrNull')  ) {
                throwMex('symbol', item[mainKey], 'The property must be null or string');
            }
            currency.symbol = item.symbol;

            /** decimal: must be null or a positive integer (zero included)*/
            if(!Object.prototype.hasOwnProperty.call(item, 'decimal')) {
                item.decimal = null;
            }
            if(item.decimal != null) {
                if( !requirements(item.decimal, 'mustBePositiveIntegerOrZero') ) {
                    throwMex('decimal', item[mainKey],
                        'The property must be null or a positive integer (zero included)');
                }
            }
            currency.decimal = item.decimal;

            /** ---- **/
            Currencies.push(currency);
        }

        Currencies = sortList(Currencies, mainKey);
        console.log(chalk.cyan('         - Main data for `' + collection +'` parsed'));
        return Currencies;
    },

    DataTranslations: async (data, defaultLanguage = 'en') => {
        let cur;
        for (const [lang, langObjs] of Object.entries(data)) {
            Translations[lang] = {};
            for (const currency of Object.values(Currencies)) {
                cur = currency[mainKey];
                Translations[lang][cur] = {};

                /** `name`: the source must be a string (required for the default language) **/
                Translations[lang][cur].name =
                    (checkForTranslationString(
                        collection,
                        collectionItem,
                        cur,
                        langObjs.name,
                        lang,
                        defaultLanguage,
                        'name'
                    )) ? langObjs.name[cur] : '';
            }
            console.log(
                chalk.cyan('         - Translation language `' + lang + '` data for `' + collection +'` parsed')
            );
        }
        return Translations;
    }
};

