import chalk from 'chalk';
import {
    errorMessage, getTranslationMandatoryString, requirements, sortList, checkRangesAndTotal,
    getTranslationMandatoryCategoryString
} from "../utils.js";
import {configBuild} from "../configBuild.js";

const mainKey = 'code';
const collection = 'Scripts';
const collectionItem = 'Script';

let Scripts = [];
let Translations = {};
let TranslationsCategories = {};

export const scriptsFunctions = {

    DataParse: async data => {
        function throwMex(prop, item, message) {
            throw new Error( errorMessage('main', collection, collectionItem, item, prop, message));
        }

        for (const item of Object.values(data)) {
            if (!Object.prototype.hasOwnProperty.call(item, mainKey)) {
                throwMex(mainKey, JSON.stringify(item), 'Required property is missing');
            }
            let script = {};

            /** code: must be present and must be 4 chars length string */
            if(
                !requirements(item.code, 'mustBeString') ||
                !requirements(item.code, 'regex', /^[a-z]{4}$/i)
            ) {
                throwMex('code', item[mainKey], 'The property must be 4 chars length alphabetical string');
            }
            script.code = item.code.charAt(0).toUpperCase() + item.code.slice(1).toLowerCase();

            /** numeric: must be present and must be 3 chars length numeric string */
            if(!Object.prototype.hasOwnProperty.call(item, 'numeric')) {
                throwMex('numeric', item[mainKey], 'Required property is missing');
            }
            item.numeric = item.numeric.toString().padStart(3, '0');
            if( !requirements(item.numeric, 'regex', /^\d{3}$/i) ) {
                throwMex('numeric', item[mainKey], 'The property must be 3 chars length numeric string');
            }
            script.numeric = item.numeric;

            /** writingDirection: if present, it must be 3 chars length string */
            if(!Object.prototype.hasOwnProperty.call(item, 'writingDirection')) {
                item.writingDirection = null;
            }
            if(item.writingDirection !== null) {
                item.writingDirection = item.writingDirection.toLowerCase();
                const directionPattern =
                    new RegExp(`^(?:${configBuild.extra.scripts.direction.join('|')})$`);
                const directionAvailable = '`' + configBuild.extra.scripts.direction.join('`, `') + '`';
                if(
                    !requirements(item.writingDirection, 'mustBeString') ||
                    !requirements(item.writingDirection, 'regex', directionPattern)
                ) {
                    throwMex('writingDirection', item[mainKey],
                        'The property must be 3 char length string inside the fixed defined values ' +
                        '(' + directionAvailable + ')'
                    );
                }
            } else {
                item.writingDirection = 'nla'; // not listed / available
            }
            script.writingDirection = {
                code: item.writingDirection
            };

            /** unicode: it must be present, and it must be an object not empty */
            if(!Object.prototype.hasOwnProperty.call(item, 'unicode')) {
                throwMex('unicode', item[mainKey], 'Required property is missing');
            }
            if(
                !requirements(item.unicode, 'mustBeObject') ||
                !requirements(item.unicode, 'cannotBeEmpty')
            ) {
                throwMex('unicode', item[mainKey], 'The property must be a not empty object');
            }
            if(!Object.prototype.hasOwnProperty.call(item.unicode, 'version')) {
                item.unicode.version = null;
            }
            if (item.unicode.version !== null) {
                if (typeof item.unicode.version === 'number') {
                    item.unicode.version = item.unicode.version.toFixed(1);
                }
                if(
                    !requirements(item.unicode.version, 'mustBeString') ||
                    !requirements(item.unicode.version, 'regex', /^\d+\.\d$/)
                ) {
                    throwMex('unicode.version', item[mainKey],
                        'The property must be a version string with a decimal (Ex. `1.0`)');
                }
            }
            if(!Object.prototype.hasOwnProperty.call(item.unicode, 'ranges')) {
                throwMex('unicode.ranges', item[mainKey], 'Required property is missing');
            }
            if( !requirements(item.unicode.ranges, 'mustBeArray') ) {
                throwMex('unicode.ranges', item[mainKey],'The property must be an array');
            }
            let ranges = [];
            let normalizedRanges = [];
            for (let [idx, range] of item.unicode.ranges.entries()) {
                if(
                    !requirements(range, 'mustBeArray') ||
                    !requirements(range, 'cannotBeEmpty')
                ) {
                    throwMex('unicode.ranges.' + idx, item[mainKey],
                        'The property must be a not empty array');
                }
                if (range.length < 1 || range.length > 2) {
                    throwMex('unicode.ranges.' + idx, item[mainKey],
                        'The property must have 1 or 2 elements');
                }
                let checkOrder;
                let intStart = null;
                let intEnd = null;
                for (let [idEntry, entry] of range.entries()) {
                    entry = entry.toUpperCase();
                    if(
                        !requirements(entry, 'mustBeString') ||
                        !requirements(entry, 'regex', /^(?:[0-9A-F]{4,5}|10[0-9A-F]{4})$/)
                    ) {
                        throwMex('unicode.ranges.' + idx, item[mainKey],
                            'The property has an element that does not match with the unicode pattern'
                        );
                    }
                    const intEntry = parseInt(entry, 16);
                    if (idEntry === 0) {
                        checkOrder = intEntry;
                        intStart = intEntry;
                    } else {
                        if( intEntry < checkOrder) {
                            throwMex('unicode.ranges.' + idx, item[mainKey],
                                'The property has not correctly ordered elements');
                        } else {
                            intEnd = intEntry;
                        }
                    }
                    range[idEntry] = entry;
                }
                if (intEnd === null) {
                    intEnd = intStart;
                }
                normalizedRanges.push({ start: intStart, end: intEnd });
                ranges.push(range);
            }
            const { overlaps, totalCodePoints } = checkRangesAndTotal(normalizedRanges);
            if (overlaps.length > 0) {
                throwMex(
                    'unicode.ranges',
                    item[mainKey],
                    'The property has overlapping ranges'
                );
            }
            if( !requirements(item.unicode.totalCodePoints, 'mustBePositiveIntegerOrZero') ) {
                throwMex(
                    'unicode.totalCodePoints',
                    item[mainKey],
                    'The property must be null or a positive integer greater then zero'
                );
            }
            if( totalCodePoints != item.unicode.totalCodePoints ) {
                throwMex(
                    'unicode.totalCodePoints',
                    item[mainKey],
                    'The property value (' +
                    item.unicode.totalCodePoints + ') mismatch with the calculated point from the ranges (' +
                    totalCodePoints + ').'
                );
            }

            script.unicode = item.unicode;
            script.unicode.ranges = ranges;

            /** ---- **/
            Scripts.push(script);
        }
        Scripts = sortList(Scripts, mainKey);

        console.log(chalk.cyan('         - Main data for `Scripts` parsed'));
        return Scripts;
    },

    DataTranslations: async (data, defaultLanguage = 'en') => {
        let sc;

        for (const [lang, langObjs] of Object.entries(data)) {

            Translations[lang] = {};

            for (const script of Object.values(Scripts)) {
                sc = script[mainKey];
                Translations[lang][sc] = {};

                /** `name`: the source must be a string (required for the default language) **/
                Translations[lang][sc].name =
                    (getTranslationMandatoryString(
                        collection,
                        collectionItem,
                        sc,
                        langObjs[sc],
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
    },

    DataTranslationsCategories: async (data, defaultLanguage = 'en') => {
        for (const [lang, langObjs] of Object.entries(data)) {
            TranslationsCategories[lang] = {
                writingDirection: {}
            };
            /** `writingDirection`: the source properties must be a string (required for the default language) **/
            for (const direction of Object.values(configBuild.extra.scripts.direction)) {
                TranslationsCategories[lang].writingDirection[direction] =
                    (getTranslationMandatoryCategoryString(
                        collection,
                        collectionItem,
                        'writingDirection',
                        langObjs['writingDirection'],
                        lang,
                        defaultLanguage,
                        direction
                    )) ?? '';
            }
            console.log(
                chalk.cyan(
                    '         - Translation language `' + lang + '` categories data for `' + collection +'` parsed'
                )
            );
        }
        return TranslationsCategories;
    }
};

