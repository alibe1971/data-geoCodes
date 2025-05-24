import chalk from 'chalk';
import {errorMessage} from '../utils.js';

const collection = 'Config';

export const configFunctions = {

    DataParse: async Config => {

        function throwMex(prop, message) {
            throw new Error( errorMessage('main', collection, null, null, prop, message));
        }

        /** settings: must be present */
        if(!Object.prototype.hasOwnProperty.call(Config, 'settings')) {
            throwMex('settings', 'Required property is missing');
        }
        /** settings: must be an object */
        if(typeof Config.settings != 'object' || Config.settings === null || Array.isArray(Config.settings)) {
            throwMex('settings', 'The property must be an object');
        }

        /** settings.languages: must be present */
        if(!Object.prototype.hasOwnProperty.call(Config.settings, 'languages')) {
            throwMex('settings.languages', 'Required property is missing');
        }
        /** settings.languages: must be an object */
        if(
            typeof Config.settings.languages != 'object' ||
            Config.settings.languages === null ||
            Array.isArray(Config.settings.languages)
        ) {
            throwMex('settings.languages', 'The property must be an object');
        }

        /** settings.languages.inPackage: must be present */
        if(!Object.prototype.hasOwnProperty.call(Config.settings.languages, 'inPackage')) {
            throwMex('settings.languages.inPackage', 'Required property is missing');
        }
        /** settings.languages.inPackage: must be a not empty object */
        if(
            typeof Config.settings.languages.inPackage != 'object' ||
            Config.settings.languages.inPackage === null ||
            Array.isArray(Config.settings.languages.inPackage) ||
            Object.keys(Config.settings.languages.inPackage).length === 0
        ) {
            throwMex('settings.languages.inPackage', 'The property must be a not empty object');
        }
        let inPackage = {};
        for (let [lang, locale] of Object.entries(Config.settings.languages.inPackage)) {
            if(typeof lang != 'string' || !/^[a-z]{2}$/i.test(lang)) {
                throwMex('settings.languages.inPackage',
                    'The key `' + lang + '` must be 2 chars length alphabetic string');
            }
            if(typeof locale != 'string' || !/^[a-z]{2}_[a-z]{2}$/i.test(locale)) {
                throwMex('settings.languages.inPackage',
                    'The value `' + locale + '` has not the correct format (Ie: string `ss_SS`, case insensitive)');
            }
            lang = lang.toLowerCase();
            let [locLang, locCC] = locale.split('_');
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
        if(!Object.prototype.hasOwnProperty.call(Config.settings.languages, 'default')) {
            throwMex('settings.languages.default', 'Required property is missing');
        }
        /** settings.languages.default: must be a 2 char string string  */
        if(
            typeof Config.settings.languages.default != 'string' ||
            !/^[a-z]{2}$/i.test(Config.settings.languages.default)
        ) {
            throwMex('settings.languages.default',
                'The Property must be 2 chars length alphabetic string');
        }
        /** settings.languages.default: must be a 2 char string string  */
        Config.settings.languages.default = Config.settings.languages.default.toLowerCase();
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

