import chalk from 'chalk';
import {sortList, checkForTranslationString, getMinimizedSvg, errorMessage} from '../utils.js';
import slugify from 'slugify';
import {configBuild} from "../configBuild.js";

const mainKey = 'alpha2';
const collection = 'Countries';
const collectionItem = 'Country';

let Countries = [];
let Translations = {};

export const countriesFunctions = {

    DataParse: async data => {

        function throwMex(prop, item, message) {
            throw new Error( errorMessage('main', collection, collectionItem, item, prop, message));
        }

        for (const item of Object.values(data)) {
            if(!Object.prototype.hasOwnProperty.call(item, mainKey)) {
                throwMex(mainKey, JSON.stringify(item), 'Required property is missing');
            }
            let country = {};

            /** officialName: must be present and must be an object */
            if(!Object.prototype.hasOwnProperty.call(item, 'officialName')) {
                throwMex('officialName', item[mainKey], 'Required property is missing');
            } else if(
                typeof item.officialName != 'object' ||
                item.officialName === null ||
                Array.isArray(item.officialName)
            ) {
                throwMex('officialName', item[mainKey], 'The property must be an object');
                // throw new
            }
            country.officialName = item.officialName;

            /** alpha2: must be present and must be 2 chars length string */
            if(typeof item.alpha2 != 'string' || item.alpha2.length != 2 || !/^[a-zA-Z]+$/.test(item.alpha2)) {
                throwMex('alpha2', item[mainKey], 'The property must be 2 chars length alphabetical string');
            }
            country.alpha2 = item.alpha2.toUpperCase();

            /** alpha3: must be present and must be 3 chars length string */
            if(!Object.prototype.hasOwnProperty.call(item, 'alpha3')) {
                throwMex('alpha3', item[mainKey], 'Required property is missing');
            } else if(typeof item.alpha3 != 'string' || item.alpha3.length != 3 || !/^[a-zA-Z]+$/.test(item.alpha3)) {
                throwMex('alpha3', item[mainKey], 'The property must be 3 chars length alphabetical string');
            }
            country.alpha3 = item.alpha3.toUpperCase();

            /** unM49: must be present and must be 3 chars length numeric string */
            if(!Object.prototype.hasOwnProperty.call(item, 'unM49')) {
                throwMex('unM49', item[mainKey], 'Required property is missing');
            }
            item.unM49 = item.unM49.toString().padStart(3, '0');
            if(item.unM49.length != 3 || !/^\d+$/.test(item.unM49)) {
                throwMex('unM49', item[mainKey], 'The property must be 3 chars length numeric string');
            }
            country.unM49 = item.unM49;

            /** flags: must be an object */
            if(!Object.prototype.hasOwnProperty.call(item, 'flags')) {
                item.flags = {
                    svg: null
                };
            } else if(
                typeof item.flags != 'object' || item.flags === null || Array.isArray(item.flags)
            ) {
                throw new Error('Item: `' + item[mainKey] + '`. The property `flags` must be an object');
            }
            if(Object.keys(item.flags).length !== 0) {
                /** svg */
                let flagPath = configBuild.readPaths.origin + 'Flags/Countries/' + item[mainKey].toLowerCase()
                    + '/flag_' + configBuild.extra.flags.chosenSvgFormat + '.svg'
                try {
                    item.flags.svg = await getMinimizedSvg(flagPath);
                } catch (error) {
                    throw new Error('Item: `' + item[mainKey] + '`. Error while minimizing SVG');
                }
            }
            country.flags = item.flags;

            /** dependency: can be null or 2 chars length string */
            if(!Object.prototype.hasOwnProperty.call(item, 'dependency')) {
                item.dependency = null;
            }
            if(item.dependency !== null) {
                if(
                    typeof item.dependency != 'string' ||
                    item.dependency.length != 2 ||
                    !/^[a-zA-Z]+$/.test(item.dependency)
                ) {
                    throwMex('dependency', item[mainKey],
                        'The property must be null or 2 chars length alphabetical string');
                }
            }
            country.dependency = item.dependency;

            /** mottos: must be present and must be an object */
            if(!Object.prototype.hasOwnProperty.call(item, 'mottos')) {
                item.mottos = {};
            } else if(typeof item.mottos != 'object' || item.mottos === null || Array.isArray(item.mottos)) {
                throwMex('mottos', item[mainKey], 'The property must be an object');
            }
            if(Object.keys(item.mottos).length !== 0) {
                if(!Object.prototype.hasOwnProperty.call(item.mottos, 'official')) {
                    item.mottos = {};
                } else if(
                    typeof item.mottos.official != 'object' ||
                    item.mottos.official === null ||
                    Array.isArray(item.mottos.official)
                ) {
                    throwMex('mottos.official', item[mainKey], 'The property must be an object');
                    // throw new Error('Item: `'+ item[mainKey] +'`. The property `mottos.official` must be an object');
                } else {
                    item.mottos = {
                        official: item.mottos.official
                    };
                }
            }
            country.mottos = item.mottos;

            /** currencies: must be an object */
            if(!Object.prototype.hasOwnProperty.call(item, 'currencies')) {
                item.currencies = {
                    legalTenders: {},
                    widelyAccepted: {}
                };
            } else if(
                typeof item.currencies != 'object' ||
                item.currencies === null ||
                Array.isArray(item.currencies)
            ) {
                throwMex('currencies', item[mainKey], 'The property must be an object');
            }
            if(Object.keys(item.currencies).length !== 0) {
                if(!Object.prototype.hasOwnProperty.call(item.currencies,'legalTenders')) {
                    item.currencies.legalTenders = {};
                } else if(
                    typeof item.currencies.legalTenders != 'object' ||
                    item.currencies.legalTenders === null ||
                    !Array.isArray(item.currencies.legalTenders)
                ) {
                    throwMex('currencies.legalTenders', item[mainKey], 'The property must be an array');
                }
                if(!Object.prototype.hasOwnProperty.call(item.currencies,'widelyAccepted')) {
                    item.currencies.widelyAccepted = {};
                } else if(
                    typeof item.currencies.widelyAccepted != 'object' ||
                    item.currencies.widelyAccepted === null ||
                    !Array.isArray(item.currencies.widelyAccepted)
                ) {
                    throwMex('currencies.widelyAccepted', item[mainKey], 'The property must be an array');
                }
            }
            country.currencies = {
                legalTenders: item.currencies.legalTenders,
                widelyAccepted: item.currencies.widelyAccepted
            };

            /** dialCodes: must be an object */
            if(!Object.prototype.hasOwnProperty.call(item, 'dialCodes')) {
                item.dialCodes = {
                    main: [],
                    exceptions: []
                };
            } else if(typeof item.dialCodes != 'object' || item.dialCodes === null || Array.isArray(item.dialCodes)) {
                throwMex('dialCodes', item[mainKey], 'The property must be an object');
            }
            if(Object.keys(item.dialCodes).length !== 0) {
                if(!Object.prototype.hasOwnProperty.call(item.dialCodes, 'main')) {
                    item.dialCodes.main = [];
                } else if(
                    typeof item.dialCodes.main != 'object' ||
                    item.dialCodes.main === null ||
                    !Array.isArray(item.dialCodes.main)
                ) {
                    throwMex('dialCodes.main', item[mainKey], 'The property must be an array');
                }
                if(!Object.prototype.hasOwnProperty.call(item.dialCodes, 'exceptions')) {
                    item.dialCodes.exceptions = {};
                } else if(
                    typeof item.dialCodes.exceptions != 'object' ||
                    item.dialCodes.exceptions === null ||
                    !Array.isArray(item.dialCodes.exceptions)
                ) {
                    throwMex('dialCodes.exceptions', item[mainKey], 'The property must be an array');
                }
            }
            country.dialCodes = {
                main: item.dialCodes.main,
                exceptions: item.dialCodes.exceptions
            };

            /** ccTld: can be null or 2 chars length string other the beginning of `.` (3 chars total) */
            if(!Object.prototype.hasOwnProperty.call(item, 'ccTld')) {
                item.ccTld = null;
            }
            if(item.ccTld !== null) {
                if(
                    typeof item.ccTld != 'string' ||
                    !/^\.[a-z]{2}$/.test(item.ccTld)
                ) {
                    throwMex('ccTld', item[mainKey],
                        'The property must be a string, respect the level domain rules (and begin with a `.`)');
                }
            }
            country.ccTld = item.ccTld;

            /** timeZones: must be present and must be a not empty array */
            if(!Object.prototype.hasOwnProperty.call(item, 'timeZones')) {
                throwMex('timeZones', item[mainKey], 'Required property is missing');
            } else if(
                typeof item.timeZones != 'object' ||
                item.timeZones === null ||
                !Array.isArray(item.timeZones) ||
                item.timeZones.length === 0
            ) {
                throwMex('timeZones', item[mainKey], 'The property must be a not empty array');
            }
            for (const tz of item.timeZones) {
                if(typeof tz != 'string' || !/^[^/]+(\/[^/]+){1,2}$/.test(tz)) {
                    throwMex('timeZones', item[mainKey],
                        'The value timeZones["' + tz + '"]` has not the correct format');
                }
            }
            country.timeZones = item.timeZones;

            /** languages: TODO */
            country.languages = [];

            /** locales: must be present and must be a not empty array */
            if(!Object.prototype.hasOwnProperty.call(item, 'locales')) {
                throwMex('locales', item[mainKey], 'Required property is missing');
            } else if(
                typeof item.locales != 'object' ||
                item.locales === null ||
                !Array.isArray(item.locales) ||
                item.locales.length === 0
            ) {
                throwMex('locales', item[mainKey], 'The property must be a not empty array');
            }
            for (const loc of item.locales) {
                if(typeof loc != 'string' || !/^(?=.*[a-zA-Z])([a-zA-Z]+-?)*[a-zA-Z]+$/.test(loc)) {
                    throwMex('locales', item[mainKey],
                        'The value locales["' + loc + '"]` has not the correct format');
                }
            }
            country.locales = item.locales;

            /** otherAppsIds: must be an object */
            if(!Object.prototype.hasOwnProperty.call(item, 'otherAppsIds')) {
                item.otherAppsIds = {
                    geoNamesOrg: null
                };
            } else if(
                typeof item.otherAppsIds != 'object' || item.otherAppsIds === null || Array.isArray(item.otherAppsIds)
            ) {
                throwMex('otherAppsIds', item[mainKey], 'The property must be an object');
            }
            if(Object.keys(item.otherAppsIds).length !== 0) {
                if(!Object.prototype.hasOwnProperty.call(item.otherAppsIds, 'geoNamesOrg')) {
                    item.otherAppsIds.geoNamesOrg = null;
                } else if(
                    (!Number.isInteger(item.otherAppsIds.geoNamesOrg) || item.otherAppsIds.geoNamesOrg <= 0) &&
                    item.otherAppsIds.geoNamesOrg !== null
                ) {
                    throwMex('otherAppsIds.geoNamesOrg', item[mainKey],
                        'The property must be a positive integer or null');
                }
            }
            country.otherAppsIds = {
                geoNamesOrg: item.otherAppsIds.geoNamesOrg
            };

            /** ---- **/
            Countries.push(country);
        }

        Countries = sortList(Countries, mainKey);
        console.log(chalk.cyan('         - Main data for `' + collection +'` parsed'));
        return Countries;
    },

    DataTranslations: async (data, defaultLanguage = 'en') => {
        let currentObj;
        let cc;

        function checkIfIsArray(mainKey, lang, prop) {
            if (
                !Object.prototype.hasOwnProperty.call(currentObj, cc) ||
                !Object.prototype.hasOwnProperty.call(currentObj[cc], prop)
            ) {
                return false;
            }
            if (!Array.isArray(currentObj[cc][prop])) {
                throw new Error( errorMessage('trans', collection, collectionItem, mainKey, prop,
                    'The property must be an array', lang));
            }
            return true;
        }
        function slug(input) {
            if (input === null || input === undefined) return '';
            input = input.replace(/\./g, '');
            input = slugify(input, { replacement: ' ', lower: true, strict: true });
            input = input.replace(/\s+/g, ' ');
            return input.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        }
        function getWords(element) {
            return slug(element).split(' ');
        }

        for (const [lang, langObjs] of Object.entries(data)) {
            Translations[lang] = {};
            for (const country of Object.values(Countries)) {
                cc = country[mainKey];
                Translations[lang][cc] = {};

                /** `name` (common name): the source must be a string (required for the default language) **/
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

                /** `fullName`: the source must be a string (required for the default language) **/
                Translations[lang][cc].fullName =
                    (checkForTranslationString(
                        collection,
                        collectionItem,
                        cc,
                        langObjs.name,
                        lang,
                        defaultLanguage,
                        'name'
                    )) ? langObjs.fullName[cc] : '';

                /** `demonyms`: the source (if present) must be an array **/
                currentObj = langObjs.demonyms;
                Translations[lang][cc].demonyms = (checkIfIsArray(cc, lang, 'demonyms')) ?
                    langObjs.demonyms[cc].demonyms : [];

                /** `keywords`: all the sources (if present) must be an array **/
                currentObj = langObjs.acronymsAliasFormer;
                let acronymsAliasFormer = (checkIfIsArray(cc, lang, 'acronymsAliasFormer')) ?
                    langObjs.acronymsAliasFormer[cc].acronymsAliasFormer : [];
                currentObj = langObjs.adjectives;
                let adjectives = (checkIfIsArray(cc, lang, 'adjectives')) ? langObjs.adjectives[cc].adjectives : [];
                currentObj = langObjs.others;
                let others = (checkIfIsArray(cc, lang, 'others')) ? langObjs.others[cc].others : [];
                currentObj = langObjs.typos;
                let typos = (checkIfIsArray(cc, lang, 'typos')) ? langObjs.typos[cc].typos : [];

                Translations[lang][cc].keywords =
                    Array.from(new Set([].concat(
                        ...acronymsAliasFormer.map(getWords),
                        ...adjectives.map(getWords),
                        ...others.map(getWords),
                        ...typos.map(getWords)
                    )))
                        .filter(word => ![].concat(
                            slug(Translations[lang][cc].name).split(' '),
                            slug(Translations[lang][cc].completeName).split(' '),
                            ...Translations[lang][cc].demonyms.map(d => slug(d).split(' '))
                        ).includes(word)
                        );
            }
            console.log(chalk.cyan('         - Translation language `' + lang + '` data for `' + collection +'` parsed'));
        }
        return Translations;
    }
};

