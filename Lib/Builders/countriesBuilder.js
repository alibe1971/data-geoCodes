import chalk from 'chalk';
import {
    sortList,
    checkForTranslationString,
    getMinimizedSvg,
    errorMessage,
    checkFile,
    requirements, refactorLanguages
} from '../utils.js';
import slugify from 'slugify';
import {configBuild} from "../configBuild.js";
import moment from 'moment-timezone';

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

            /** officialName: it must be present and it must be an object not empty */
            if(!Object.prototype.hasOwnProperty.call(item, 'officialName')) {
                item.officialName = {};
            }
            if( !requirements(item.officialName, 'mustBeObject') ) {
                throwMex('officialName', item[mainKey], 'The property must be a not empty object');
            }
            let officialName = {};
            for (let [lang, name] of Object.entries(item.officialName)) {
                /** key */
                lang = refactorLanguages(lang);
                if ( lang == 'error' || !requirements(lang, 'bcp47') ) {
                    throwMex('officialName.'+lang, item[mainKey], 'The property key non-compliant with BCP 47 format');
                }

                /** value */
                if ( !requirements(name, 'mustBeString') || !requirements(name, 'cannotBeEmpty') ) {
                    throwMex('officialName.'+lang, item[mainKey], 'The property value must be a not empty string');
                }
                officialName[lang] = name;
            }
            country.officialName = officialName;

            /** alpha2: must be present and must be 2 chars length string */
            if(
                !requirements(item.alpha2, 'mustBeString') ||
                !requirements(item.alpha2, 'regex', /^[a-z]{2}$/i)
            ) {
                throwMex('alpha2', item[mainKey], 'The property must be 2 chars length alphabetical string');
            }
            country.alpha2 = item.alpha2.toUpperCase();

            /** alpha3: must be present and must be 3 chars length string */
            if(!Object.prototype.hasOwnProperty.call(item, 'alpha3')) {
                throwMex('alpha3', item[mainKey], 'Required property is missing');
            } else if(
                !requirements(item.alpha3, 'mustBeString') ||
                !requirements(item.alpha3, 'regex', /^[a-z]{3}$/i)
            ) {
                throwMex('alpha3', item[mainKey], 'The property must be 3 chars length alphabetical string');
            }
            country.alpha3 = item.alpha3.toUpperCase();

            /** unM49: must be present and must be 3 chars length numeric string */
            if(!Object.prototype.hasOwnProperty.call(item, 'unM49')) {
                throwMex('unM49', item[mainKey], 'Required property is missing');
            }
            item.unM49 = item.unM49.toString().padStart(3, '0');
            if( !requirements(item.unM49, 'regex', /^\d{3}$/i) ) {
                throwMex('unM49', item[mainKey], 'The property must be 3 chars length numeric string');
            }
            country.unM49 = item.unM49;

            /** flags: must be an object */
            if(!Object.prototype.hasOwnProperty.call(item, 'flags')) {
                throwMex('flags', item[mainKey], 'Required property is missing');
            } else if(
                !requirements(item.flags, 'mustBeObject')
            ) {
                throwMex('flags', item[mainKey], 'The property must be an object');
            }
            /** flags.emoji: must be an emoji */
            if(!Object.prototype.hasOwnProperty.call(item.flags, 'emoji')) {
                throwMex('flags.emoji', item[mainKey], 'Required property is missing');
            }
            if(
                !requirements(item.flags.emoji, 'mustBeString') ||
                !requirements(item.flags.emoji, 'regex', /^\p{Regional_Indicator}{2}$/u)
            ) {
                throwMex('flags.emoji', item[mainKey], 'The property must be a flag emoji');
            }
            /** flags.svg: built in */
            let flagPath = configBuild.readPaths.origin + 'Flags/Countries/' + item[mainKey].toLowerCase()
                + '/flag_' + configBuild.extra.countries.flags.chosenSvgFormat + '.svg';
            if (!checkFile(flagPath)) {
                throwMex('flags.svg', item[mainKey], 'The origin data file `' + flagPath +'` must exists');
            }
            try {
                item.flags.svg = await getMinimizedSvg(flagPath);
            } catch (error) {
                throwMex('flags.svg', item[mainKey], 'Error while minimizing SVG');
            }
            country.flags = item.flags;

            /** dependency: can be null or 2 chars length string */
            if(!Object.prototype.hasOwnProperty.call(item, 'dependency')) {
                item.dependency = null;
            }
            if(item.dependency !== null) {
                if(
                    !requirements(item.dependency, 'mustBeString') ||
                    !requirements(item.dependency, 'regex', /^[a-z]{2}$/i)
                ) {
                    throwMex('dependency', item[mainKey],
                        'The property must be null or 2 chars length alphabetical string');
                }
                item.dependency = item.dependency.toUpperCase();
            }
            country.dependency = item.dependency;

            /** mottos: if present, it must be an object */
            let itemMottos = {};
            if ( !Object.prototype.hasOwnProperty.call(item, 'mottos') ) {
                item.mottos = itemMottos;
            } else if( !requirements(item.mottos, 'mustBeObject') ) {
                throwMex('mottos', item[mainKey], 'The property must be an object');
            }
            for (const cat of configBuild.extra.countries.mottos.categories) {
                if(!Object.prototype.hasOwnProperty.call(item.mottos, cat)) {
                    itemMottos[cat] = {};
                } else if( !requirements(item.mottos[cat], 'mustBeObject') ) {
                    throwMex('mottos.' + cat, item[mainKey], 'The property must be an object');
                } else {
                    let mottos = {};
                    for (let [lang, motto] of Object.entries(item.mottos[cat])) {
                        lang = refactorLanguages(lang);
                        if ( lang == 'error' || !requirements(lang, 'bcp47') ) {
                            throwMex(
                                'mottos.' + cat + '.' + lang, item[mainKey],
                                'The property key non-compliant with BCP 47 format');
                        }
                        if ( !requirements(motto, 'mustBeString') || !requirements(motto, 'cannotBeEmpty') ) {
                            throwMex(
                                'mottos.' + cat + '.' + lang, item[mainKey],
                                'The property must be a not empty string'
                            );
                        }
                        mottos[lang] = motto;
                    }
                    itemMottos[cat] = mottos;
                }
            }
            country.mottos = itemMottos;

            /** currencies: must be an object */
            let itemCurrencies = {};
            if ( !Object.prototype.hasOwnProperty.call(item, 'currencies') ) {
                item.currencies = itemCurrencies;
            } else if( !requirements(item.currencies, 'mustBeObject') ) {
                throwMex('currencies', item[mainKey], 'The property must be an object');
            }
            for (const cat of configBuild.extra.countries.currencies.categories) {
                if(!Object.prototype.hasOwnProperty.call(item.currencies, cat)) {
                    itemCurrencies[cat] = [];
                } else if( !requirements(item.currencies[cat], 'mustBeArray') ) {
                    throwMex('currencies.' + cat, item[mainKey], 'The property must be an array');
                } else {
                    let currencies = [];
                    for (const [index, curr] of item.currencies[cat].entries()) {
                        if(
                            !requirements(curr, 'mustBeString') ||
                            !requirements(curr, 'regex', /^[a-z]{3}$/i)
                        ) {
                            throwMex('currencies.' + cat + '.' + index, item[mainKey],
                                'The value for the property (' + curr + ') must be 3 chars length alphabetical string');
                        }
                        currencies.push(curr.toUpperCase());
                    }
                    itemCurrencies[cat] = [...new Set(currencies)];
                }
            }
            country.currencies = itemCurrencies;

            /** dialCodes: must be an object */
            let itemDialCodes = {};
            if ( !Object.prototype.hasOwnProperty.call(item, 'dialCodes') ) {
                item.dialCodes = itemDialCodes;
            } else if( !requirements(item.dialCodes, 'mustBeObject') ) {
                throwMex('dialCodes', item[mainKey], 'The property must be an object');
            }
            for (const cat of configBuild.extra.countries.dialCodes.categories) {
                if(!Object.prototype.hasOwnProperty.call(item.dialCodes, cat)) {
                    itemDialCodes[cat] = [];
                } else if( !requirements(item.dialCodes[cat], 'mustBeArray') ) {
                    throwMex('dialCodes.' + cat, item[mainKey], 'The property must be an array');
                } else {
                    let dialCodes = [];
                    for (let [index, dial] of item.dialCodes[cat].entries()) {
                        if (Number.isInteger(dial)) {
                            dial = '+' + dial.toString();
                        } else if (typeof dial == 'string') {
                            dial = dial.replace(/^00/g, '+');
                        }
                        if(
                            !requirements(dial, 'mustBeString') ||
                            !requirements(dial, 'regex', /^(?:\+[1-9]\d*|\d+)$/)
                        ) {
                            throwMex('dialCodes.' + cat + '.' + index, item[mainKey],
                                'The the value for the property (' + dial + ') must be either an integer or '
                                + 'a numeric string. '
                                + 'It can start with `00` or `+`, but the very next digit must be between 1 and 9');
                        }
                        dialCodes.push(dial);
                    }
                    itemDialCodes[cat] = [...new Set(dialCodes)];
                }
            }
            country.dialCodes = itemDialCodes;

            /** ccTld: can be null or 2 chars length string other the beginning of `.` (3 chars total) */
            if(!Object.prototype.hasOwnProperty.call(item, 'ccTld')) {
                item.ccTld = null;
            }
            if ( !requirements(item.ccTld, 'mustBeStringOrNull') ) {
                throwMex('ccTld', item[mainKey], 'The property must be string or null');
            }
            if(item.ccTld !== null) {
                item.ccTld = item.ccTld.replace(/^[^.]/, match => '.' + match).toLowerCase();
                if (
                    !requirements(item.ccTld, 'mustBeString') ||
                    !requirements(item.ccTld, 'regex', /^\.[a-z]{2}$/i)
                ) {
                    throwMex('ccTld', item[mainKey],
                        'The property as string must respect the level domain rules (and begin with a `.`)');
                }
                item.ccTld = item.ccTld.toLowerCase();
            }
            country.ccTld = item.ccTld;

            /** ccIdn (Internationalized Domain Names): TODO */
            country.ccIdn = [];

            /** timeZones: must be present and must be a not empty array */
            if(!Object.prototype.hasOwnProperty.call(item, 'timeZones')) {
                throwMex('timeZones', item[mainKey], 'Required property is missing');
            } else if(
                !requirements(item.timeZones, 'mustBeArray') ||
                !requirements(item.timeZones, 'cannotBeEmpty')
            ) {
                throwMex('timeZones', item[mainKey], 'The property must be a not empty array');
            }
            for (const [index, tz] of item.timeZones.entries()) {
                if(
                    !requirements(tz, 'mustBeString') ||
                    !requirements(tz, 'regex', /^[^/]+(\/[^/]+){1,2}$/i)
                ) {
                    throwMex('timeZones.' + index, item[mainKey],
                        'The value for the property (' + tz + ') has not the correct format');
                }
                if( !(moment.tz.zone(tz) != null) ) {
                    throwMex('timeZones.' + index, item[mainKey],
                        'The value for the property (' + tz + ') is not in the database');
                }
            }
            country.timeZones = item.timeZones;

            /** languages: TODO */
            country.languages = [];

            /** localesIcu: must be present and must be a not empty array */
            let localesIcu = [];
            if(!Object.prototype.hasOwnProperty.call(item, 'localesIcu')) {
                item.localesIcu = localesIcu;
            } else if(!requirements(item.localesIcu, 'mustBeArray') ) {
                throwMex('localesIcu', item[mainKey], 'The property must be an  array');
            }
            for (let [index, loc] of item.localesIcu.entries()) {
                loc = refactorLanguages(loc);
                if ( loc == 'error' || !requirements(loc, 'bcp47') ) {
                    throwMex('localesIcu.' + index, item[mainKey],
                        'The value for the property (' + loc + ') ' +
                        'non-compliant with BCP 47 format');
                }
                if (!Intl.Collator.supportedLocalesOf([loc]).length) {
                    throwMex('localesIcu.' + index, item[mainKey],
                        'The value for the property (' + loc + ') is not supported by the International Components '
                        + 'for Unicode');
                }
                localesIcu.push(loc);
            }
            country.localesIcu = localesIcu;

            /** otherAppsIds: must be present and be a not empty object */
            if(!Object.prototype.hasOwnProperty.call(item, 'otherAppsIds')) {
                throwMex('otherAppsIds', item[mainKey], 'Required property is missing');
            }
            if(
                !requirements(item.otherAppsIds, 'mustBeObject') ||
                !requirements(item.otherAppsIds, 'cannotBeEmpty')
            ) {
                throwMex('otherAppsIds', item[mainKey], 'The property must be a not empty object');
            }
            if(!Object.prototype.hasOwnProperty.call(item.otherAppsIds, 'geoNamesOrg')) {
                throwMex('otherAppsIds.geoNamesOrg', item[mainKey], 'Required property is missing');
            }

            // geoNamesOrg
            if(!Object.prototype.hasOwnProperty.call(item.otherAppsIds, 'geoNamesOrg')) {
                item.otherAppsIds.geoNamesOrg = null;
            }
            if( !requirements(item.otherAppsIds.geoNamesOrg, 'mustBePositiveIntegerNotZero') ) {
                throwMex('otherAppsIds.geoNamesOrg', item[mainKey],
                    'The property must be a positive greater then zero');
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
            console.log(
                chalk.cyan('         - Translation language `' + lang + '` data for `' + collection +'` parsed')
            );
        }
        return Translations;
    }
};

