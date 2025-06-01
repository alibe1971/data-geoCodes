import chalk from 'chalk';
import {errorMessage, refactorLanguages, requirements} from '../utils.js';

const collection = 'Config';

let Config = {
    settings: {
        languages: {
            default: null,
            inPackage: {}
        }
    }
};

export const configFunctions = {

    DataParse: async data => {

        function throwMex(prop, message) {
            throw new Error( errorMessage('main', collection, null, null, prop, message));
        }

        /** settings: must be present */
        if(!Object.prototype.hasOwnProperty.call(data, 'settings')) {
            throwMex('settings', 'Required property is missing');
        }
        /** settings: must be an object */
        if(
            !requirements(data.settings, 'mustBeObject') ||
            !requirements(data.settings, 'cannotBeEmpty')
        ) {
            throwMex('settings', 'The property must be a not empty object');
        }

        /** settings.languages: must be present */
        if(!Object.prototype.hasOwnProperty.call(data.settings, 'languages')) {
            throwMex('settings.languages', 'Required property is missing');
        }
        /** settings.languages: must be a not empty object */
        if(
            !requirements(data.settings.languages, 'mustBeObject') ||
            !requirements(data.settings.languages, 'cannotBeEmpty')
        ) {
            throwMex('settings.languages', 'The property must be a not empty object');
        }

        /** settings.languages.inPackage: must be present */
        if(!Object.prototype.hasOwnProperty.call(Config.settings.languages, 'inPackage')) {
            throwMex('settings.languages.inPackage', 'Required property is missing');
        }
        /** settings.languages.inPackage: must be a not empty object */
        if(
            !requirements(data.settings.languages.inPackage, 'mustBeObject') ||
            !requirements(data.settings.languages.inPackage, 'cannotBeEmpty')
        ) {
            throwMex('settings.languages.inPackage', 'The property must be a not empty object');
        }
        let inPackage = {};
        for (let [lang, locale] of Object.entries(data.settings.languages.inPackage)) {
            if( !requirements(lang, 'mustBeString') || !requirements(lang, 'regex', /^[a-z]{2}$/i) ) {
                throwMex('settings.languages.inPackage',
                    'The key `' + lang + '` must be 2 chars length alphabetic string');
            }

            if( !requirements(locale, 'mustBeString') || !requirements(locale, 'cannotBeEmpty') ) {
                throwMex('settings.languages.inPackage',
                    'The value `' + locale + '` must be a not empty string');
            }
            locale = refactorLanguages(locale);
            if ( locale == 'error' || !requirements(locale, 'bcp47') ) {
                throwMex(
                    'settings.languages.inPackage',
                    'The value `' + locale + '` non-compliant with BCP 47 format'
                );
            }
            if (!Intl.Collator.supportedLocalesOf([locale]).length) {
                throwMex('settings.languages.inPackage', 'The value `' + locale + '` is not supported');
            }

            lang = lang.toLowerCase();
            let [locLang, locCC] = locale.split('-');
            locLang = locLang.toLowerCase();
            if(locLang != lang) {
                throwMex('settings.languages.inPackage',
                    'The key `' + lang + '` does not match with the locale lang part `' + locale + '`');
            }
            locale = locLang + '_' + locCC.toUpperCase();
            inPackage[lang] = locale;
        }
        Config.settings.languages.inPackage = inPackage;

        /** settings.languages.default: must be present */
        if(!Object.prototype.hasOwnProperty.call(data.settings.languages, 'default')) {
            throwMex('settings.languages.default', 'Required property is missing');
        }
        /** settings.languages.default: must be a 2 char string string  */
        if(
            !requirements(data.settings.languages.default, 'mustBeString') ||
            !requirements(data.settings.languages.default, 'regex', /^[a-z]{2}$/i)
        ) {
            throwMex('settings.languages.default', 'The Property must be 2 chars length alphabetic string');
        }
        /** settings.languages.default: must be present in the `inPackage` keys  */
        Config.settings.languages.default = data.settings.languages.default.toLowerCase();
        if(
            !Object.prototype.hasOwnProperty.call(
                Config.settings.languages.inPackage,
                Config.settings.languages.default
            )
        ) {
            throwMex('settings.languages.default',
                'The property must be present as key in the `settings.languages.inPackage` object');
        }

        console.log(chalk.cyan('         - Main data for `' + collection +'` parsed'));
        return Config;
    }
};

