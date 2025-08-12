import chalk from 'chalk';
import {errorMessage, getTranslationMandatoryString, requirements, sortList} from "../utils.js";
import {configBuild} from "../configBuild.js";

const mainKey = 'isoCode';
const collection = 'Languages';
const collectionItem = 'Language';

let Languages = [];
let Translations = {};

export const languagesFunctions = {

    DataParse: async data => {
        function throwMex(prop, item, message) {
            throw new Error( errorMessage('main', collection, collectionItem, item, prop, message));
        }

        for (const item of Object.values(data)) {
            if (!Object.prototype.hasOwnProperty.call(item, mainKey)) {
                throwMex(mainKey, JSON.stringify(item), 'Required property is missing');
            }
            let language = {};

            /** isoCode: must be present and must be 3 chars length string */
            if(
                !requirements(item.isoCode, 'mustBeString') ||
                !requirements(item.isoCode, 'regex', /^[a-z]{3}$/i)
            ) {
                throwMex('isoCode', item[mainKey], 'The property must be 3 chars length alphabetical string');
            }
            language.isoCode = item.isoCode.toLowerCase();

            /** part2b: if present, it must be 3 chars length string */
            if(!Object.prototype.hasOwnProperty.call(item, 'part2b')) {
                item.part2b = null;
            }
            if(item.part2b !== null) {
                if(
                    !requirements(item.part2b, 'mustBeString') ||
                    !requirements(item.part2b, 'regex', /^[a-z]{3}$/i)
                ) {
                    throwMex('part2b', item[mainKey],
                        'The property must be null or 3 chars length alphabetical string');
                }
                item.part2b = item.part2b.toLowerCase();
            }
            language.part2b = item.part2b;

            /** part2t: if present, it must be 3 chars length string */
            if(!Object.prototype.hasOwnProperty.call(item, 'part2t')) {
                item.part2t = null;
            }
            if(item.part2t !== null) {
                if(
                    !requirements(item.part2t, 'mustBeString') ||
                    !requirements(item.part2t, 'regex', /^[a-z]{3}$/i)
                ) {
                    throwMex('part2t', item[mainKey],
                        'The property must be null or 3 chars length alphabetical string');
                }
                item.part2t = item.part2t.toLowerCase();
            }
            language.part2t = item.part2t;


            /** part1: if present, it must be 2 chars length string */
            if(!Object.prototype.hasOwnProperty.call(item, 'part1')) {
                item.part1 = null;
            }
            if(item.part1 !== null) {
                if(
                    !requirements(item.part1, 'mustBeString') ||
                    !requirements(item.part1, 'regex', /^[a-z]{2}$/i)
                ) {
                    throwMex('part1', item[mainKey],
                        'The property must be null or 2 chars length alphabetical string');
                }
                item.part1 = item.part1.toLowerCase();
            }
            language.part1 = item.part1;


            /** glottoCode: if present, it must be 4 chars length and 4 numbers length string */
            if(!Object.prototype.hasOwnProperty.call(item, 'glottoCode')) {
                item.glottoCode = null;
            }
            if(item.glottoCode !== null) {
                if(
                    !requirements(item.glottoCode, 'mustBeString') ||
                    !requirements(item.glottoCode, 'regex', /^[a-z]{4}\d{4}$/i)
                ) {
                    throwMex('glottoCode', item[mainKey],
                        'The property must be null or 2 chars length and 4 numbers length alphabetical string');
                }
                item.glottoCode = item.glottoCode.toLowerCase();
            }
            language.glottoCode = item.glottoCode;


            /** scope: must be present and must be 1 char length string inside the fixed defined values */
            if(!Object.prototype.hasOwnProperty.call(item, 'scope')) {
                throwMex('scope', item[mainKey], 'Required property is missing');
            } else{
                item.scope = item.scope.toUpperCase();
                const scopePattern = new RegExp(`^(?:${configBuild.extra.languages.scopes.join('|')})$`);
                const scopeAvailable = '`' + configBuild.extra.languages.scopes.join('`, `') + '`';
                if(
                    !requirements(item.scope, 'mustBeString') ||
                    !requirements(item.scope, 'regex', scopePattern)
                ) {
                    throwMex('scope', item[mainKey],
                        'The property must be 1 char length string inside the fixed defined values ' +
                        '(' + scopeAvailable + ')'
                    );
                }
            }
            language.scope = item.scope;

            /** type: must be present and must be 1 char length string inside the fixed defined values */
            if(!Object.prototype.hasOwnProperty.call(item, 'type')) {
                throwMex('type', item[mainKey], 'Required property is missing');
            } else{
                item.type = item.type.toUpperCase();
                const typePattern = new RegExp(`^(?:${configBuild.extra.languages.types.join('|')})$`);
                const typeAvailable = '`' + configBuild.extra.languages.types.join('`, `') + '`';
                if(
                    !requirements(item.type, 'mustBeString') ||
                    !requirements(item.type, 'regex', typePattern)
                ) {
                    throwMex('type', item[mainKey],
                        'The property must be 1 char length string inside the fixed defined values ' +
                        '(' + typeAvailable + ')'
                    );
                }
            }
            language.type = item.type;

            /** macroLanguageRef: if present, it must be 3 chars length string */
            if(!Object.prototype.hasOwnProperty.call(item, 'macroLanguageRef')) {
                item.macroLanguageRef = null;
            }
            if(item.macroLanguageRef !== null) {
                if(
                    !requirements(item.macroLanguageRef, 'mustBeString') ||
                    !requirements(item.macroLanguageRef, 'regex', /^[a-z]{3}$/i)
                ) {
                    throwMex('macroLanguageRef', item[mainKey],
                        'The property must be null or 3 chars length alphabetical string');
                }
                item.macroLanguageRef = item.macroLanguageRef.toLowerCase();
            }
            language.macroLanguageRef = item.macroLanguageRef;

            /** scripts: if present, it must be an array */
            if(!Object.prototype.hasOwnProperty.call(item, 'scripts')) {
                item.scripts = [];
            }
            if(!requirements(item.scripts, 'mustBeArray')) {
                throwMex('scripts', item[mainKey], 'The property must be an array');
            }
            let scripts = [];
            for (let [idx, script] of item.scripts.entries()) {
                if(
                    !requirements(script, 'mustBeString') &&
                    !requirements(script, 'regex', /^[a-z]{4}$/i)
                ) {
                    throwMex('scripts.' + idx, item[mainKey],
                        'The property must be null or 4 chars length alphabetical string');
                }
                scripts.push(script.charAt(0).toUpperCase() + script.slice(1).toLowerCase());
            }
            language.scripts = scripts;

            /** ---- **/
            Languages.push(language);
        }
        Languages = sortList(Languages, mainKey);

        console.log(chalk.cyan('         - Main data for `Languages` parsed'));
        return Languages;
    },

    DataTranslations: async (data, defaultLanguage = 'en') => {
        let ln;

        function getTranslationStructure(structureName, langObjs, lang, items) {
            let structure = {};
            if (
                !Object.prototype.hasOwnProperty.call(langObjs, structureName)
            ) {
                if (lang === defaultLanguage) {
                    throw new Error( errorMessage('trans', collection, collectionItem, lang, structureName,
                        'Missing mandatory property for language `' + lang + '` (default language)', lang));
                }
            }
            for (const key of Object.values(items)) {
                structure[key] =
                    (getTranslationMandatoryString(
                        collection,
                        'Language Meta',
                        structureName,
                        langObjs[structureName],
                        lang,
                        defaultLanguage,
                        key
                    )) ?? '';

            }
            return structure;
        }

        for (const [lang, langObjs] of Object.entries(data)) {

            Translations[lang] = {
                scopes: {},
                types: {},
                languages: {},
            };

            /** PART RELATED TO THE SCOPES **/
            Translations[lang]['scopes'] = getTranslationStructure (
                'scopes', langObjs, lang, configBuild.extra.languages.scopes
            );

            /** PART RELATED TO THE TYPES **/
            Translations[lang]['types'] = getTranslationStructure (
                'types', langObjs, lang, configBuild.extra.languages.types
            );

            /** PART RELATED TO THE LANGUAGES **/
            for (const language of Object.values(Languages)) {
                ln = language[mainKey];
                Translations[lang]['languages'][ln] = {};

                /** `name`: the source must be a string (required for the default language) **/
                Translations[lang]['languages'][ln].name =
                    (getTranslationMandatoryString(
                        collection,
                        collectionItem,
                        ln,
                        langObjs['languages'][ln],
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

