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
import punycode from 'punycode/punycode.js';

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
                let langTest = refactorLanguages(lang);
                if ( langTest == 'error' || !requirements(langTest, 'bcp47') ) {
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
                    itemMottos[cat] = [];
                } else if( !requirements(item.mottos[cat], 'mustBeArray') ) {
                    throwMex('mottos.' + cat, item[mainKey], 'The property must be an array');
                } else {
                    let mottoEntries = [];
                    for (const [idx, mottoCatEntry] of Object.entries(item.mottos[cat])) {
                        if(
                            !requirements(mottoCatEntry, 'mustBeObject') ||
                            !requirements(mottoCatEntry, 'cannotBeEmpty')
                        ) {
                            throwMex(
                                'mottos.' + cat+ '.' + idx, item[mainKey],
                                'The property must be a not empty object'
                            );
                        }
                        let mottoCatEntryItem = {
                            text: {}
                        };
                        /** text property */
                        if(!Object.prototype.hasOwnProperty.call(mottoCatEntry, 'text')) {
                            throwMex(
                                'mottos.' + cat+ '.' + idx + '.text', item[mainKey],
                                'Required property is missing'
                            );
                        }
                        let mottos = {};
                        for (let [lang, motto] of Object.entries(mottoCatEntry.text)) {
                            let langTest = refactorLanguages(lang);
                            if ( langTest == 'error' || !requirements(langTest, 'bcp47') ) {
                                throwMex(
                                    'mottos.' + cat + '.' + lang, item[mainKey],
                                    'The property key non-compliant with BCP 47 format');
                            }
                            if (
                                !requirements(motto, 'mustBeString') ||
                                !requirements(motto, 'cannotBeEmpty')
                            ) {
                                throwMex(
                                    'mottos.' + cat + '.' + lang, item[mainKey],
                                    'The property must be a not empty string'
                                );
                            }
                            mottos[lang] = motto;
                        }
                        mottoCatEntryItem.text = mottos;
                        mottoEntries.push(mottoCatEntryItem);
                    }
                    itemMottos[cat] = mottoEntries;
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
                    if (cat == 'exceptions') {
                        for (let [index, exception] of item.dialCodes[cat].entries()) {
                            if (
                                !requirements(exception, 'mustBeObject')  ||
                                !requirements(exception, 'cannotBeEmpty')
                            ) {
                                throwMex(
                                    'dialCodes.' + cat + '.' + index, item[mainKey],
                                    'The property must be a not empty object'
                                );
                            }
                            for (const exceptionsProps of configBuild.extra.countries.dialCodes.exceptionsProps) {
                                if(!Object.prototype.hasOwnProperty.call(exception, exceptionsProps)) {
                                    throwMex(
                                        'dialCodes.' + cat + '.' + index + '.' + exceptionsProps, item[mainKey],
                                        'Required property is missing'
                                    );
                                }
                                if (exceptionsProps == 'code') {
                                    if (Number.isInteger(exception['code'])) {
                                        exception['code'] = exception['code'].toString();
                                    } else if (typeof exception['code'] == 'string') {
                                        exception['code'] = exception['code'].replace(/\s+/g, '');
                                    }
                                    if (
                                        !requirements(exception['code'], 'mustBeString') ||
                                        !requirements(exception['code'], 'regex', /^(\d+)$/)
                                    ) {
                                        throwMex(
                                            'dialCodes.' + cat + '.' + index + '.' + exceptionsProps,
                                            item[mainKey],
                                            'The the value for the property (' + exception['code'] + ') must '
                                            + 'be either an integer or a numeric string. '
                                        );
                                    }
                                }
                                if (exceptionsProps == 'origin') {
                                    if(
                                        !requirements(exception['origin'], 'mustBeString') ||
                                        !requirements(exception['origin'], 'regex', /^[a-z]{2}$/i)
                                    ) {
                                        throwMex(
                                            'dialCodes.' + cat + '.' + index + '.' + exceptionsProps,
                                            item[mainKey],
                                            'The property must be 2 chars length alphabetical string'
                                        );
                                    }
                                    exception['origin'] = exception['origin'].toUpperCase();
                                }
                                dialCodes.push(exception);
                            }
                        }
                        itemDialCodes[cat] = [...new Set(dialCodes)];
                    } else {
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
                        'The property as string must respect the cc top level domain rules');
                }
                if (!requirements(item.ccTld, 'validDomain')) {
                    throwMex('ccTld', item[mainKey],
                        'The value for the property (' + item.ccTld + ') ' +
                        'is not a valid domain');
                }
            }
            country.ccTld = item.ccTld;

            /** ccIdn (Internationalized Domain Names) */
            country.ccIdn = [];
            if(!Object.prototype.hasOwnProperty.call(item, 'ccIdn')) {
                item.ccIdn = [];
            } else if (!requirements(item.ccIdn, 'mustBeArray')) {
                throwMex('ccIdn', item[mainKey], 'The property must be an array');
            }
            if (item.ccIdn.length > 0) {
                let ccIdns = [];
                for (const [idx, ccIdn] of item.ccIdn.entries()) {
                    if (
                        !requirements(ccIdn, 'mustBeObject') ||
                        !requirements(ccIdn, 'cannotBeEmpty')
                    ) {
                        throwMex('ccIdn.' + idx, item[mainKey], 'The internal element must be a not empty object');
                    }
                    let ccIdnElement = {};
                    for (const internalProperty of configBuild.extra.countries.ccIdn.internalProperties) {
                        if(!Object.prototype.hasOwnProperty.call(ccIdn, internalProperty)) {
                            throwMex('ccIdn.' + idx + '.' + internalProperty, item[mainKey],
                                'Required property is missing');
                        }
                        switch (internalProperty) {
                        case 'unicode':
                        case 'punycode':
                        case 'language':
                            if (
                                !requirements(ccIdn[internalProperty], 'mustBeString') ||
                                !requirements(ccIdn[internalProperty], 'cannotBeEmpty')
                            ) {
                                throwMex('ccIdn.' + idx + '.' + internalProperty, item[mainKey],
                                    'The property value must be a not empty string');
                            }
                            break;
                        case 'regionsOfUse':
                            if (
                                !requirements(ccIdn[internalProperty], 'mustBeArray') ||
                                !requirements(ccIdn, 'cannotBeEmpty')
                            ) {
                                throwMex('ccIdn.' + idx + '.' + internalProperty, item[mainKey],
                                    'The property value must be a not empty array');
                            }
                            break;
                        default:
                            // nothing
                        }

                        switch (internalProperty) {
                        case 'unicode':
                            ccIdn[internalProperty] =
                                ccIdn[internalProperty].replace(/^[^.]/, match => '.' + match).toLowerCase();
                            if (!requirements(ccIdn[internalProperty], 'validDomain')) {
                                throwMex('ccIdn.' + idx + '.' + internalProperty, item[mainKey],
                                    'The value for the property (' + ccIdn[internalProperty] + ') ' +
                                    'is not a valid domain');
                            }
                            break;
                        case 'punycode': {
                            const unicodeAscii = punycode.toASCII(ccIdn['unicode'].slice(1));
                            ccIdn[internalProperty] =
                                ccIdn[internalProperty].replace(/^[^.]/, match => '.' + match).toLowerCase();
                            const punicodeTest = ccIdn[internalProperty].slice(1);
                            if (!requirements(ccIdn[internalProperty], 'regex', /^\.?xn--[a-z0-9-]{1,59}$/)) {
                                throwMex('ccIdn.' + idx + '.' + internalProperty, item[mainKey],
                                    'The value for the property (' + ccIdn[internalProperty] +
                                    ') has not the correct format');
                            }
                            if (punicodeTest != unicodeAscii) {
                                console.log(punicodeTest + ' != ' + unicodeAscii);
                                throwMex('ccIdn.' + idx + '.' + internalProperty, item[mainKey],
                                    'The value for the property (' + ccIdn[internalProperty] + ') ' +
                                    'does not match with the related unicode (' +
                                    ccIdn['unicode'] + ' => .' + unicodeAscii + ')');
                            }
                            break;
                        }
                        case 'language': {
                            let loc = refactorLanguages(ccIdn[internalProperty]);
                            if (loc == 'error' || !requirements(loc, 'bcp47')) {
                                throwMex('ccIdn.' + idx + '.' + internalProperty, item[mainKey],
                                    'The value for the property (' + ccIdn[internalProperty] + ') ' +
                                    'non-compliant with BCP 47 format');
                            }
                            if (!Intl.Collator.supportedLocalesOf([loc]).length) {
                                throwMex('ccIdn.' + idx + '.' + internalProperty, item[mainKey],
                                    'The value for the property (' + loc + ') is not supported by the '
                                    + 'International Components for Unicode');
                            }
                            break;
                        }
                        case 'regionsOfUse':
                            for (const [iidx, region] of ccIdn[internalProperty].entries()) {
                                if(
                                    !requirements(region, 'mustBeString') ||
                                    !requirements(region, 'regex', /^[a-z]{2}$/i)
                                ) {
                                    throwMex('ccIdn.' + idx + '.' + internalProperty + '.' + iidx, item[mainKey],
                                        'The property must be 2 chars length alphabetical string');
                                }
                                ccIdn[internalProperty][iidx] = ccIdn[internalProperty][iidx].toUpperCase();
                            }
                            break;
                        default:
                            // nothing
                        }

                        ccIdnElement[internalProperty] = ccIdn[internalProperty];
                    }
                    ccIdns.push(ccIdnElement);
                }
                country.ccIdn=ccIdns;
            }

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

            /** languages: */
            if (!Object.prototype.hasOwnProperty.call(item, 'languages')) {
                item.languages = {};
            }
            for (const cat of configBuild.extra.countries.languages.categories) {
                if (cat === 'official' || cat === 'signs') {
                    if (!Object.prototype.hasOwnProperty.call(item.languages, cat)) {
                        item.languages[cat] = {};
                    }

                    for (const sub of configBuild.extra.countries.languages.subCategories[cat]) {
                        if (!Object.prototype.hasOwnProperty.call(item.languages[cat], sub)) {
                            item.languages[cat][sub] = [];
                        }
                        let list = item.languages[cat][sub]
                            .map(lang => lang.toLowerCase())
                            .filter((lang, index, self) => self.indexOf(lang) === index);

                        if (!requirements(list, 'mustBeArray')) {
                            throwMex(`languages.${cat}.${sub}`, item[mainKey], 'The property must be an array');
                        }
                        list.forEach((lang, idx) => {
                            if (
                                !requirements(lang, 'mustBeString') ||
                                !requirements(lang, 'regex', /^[a-z]{2,3}$/i)
                            ) {
                                throwMex(`languages.${cat}.${sub}.${idx}`, item[mainKey],
                                    `The value '${lang}' has not a ISO 639 valid format`);
                            }
                        });
                        item.languages[cat][sub] = list;
                    }
                } else {
                    if (!Object.prototype.hasOwnProperty.call(item.languages, cat)) {
                        item.languages[cat] = [];
                    }

                    let list = item.languages[cat]
                        .map(lang => lang.toLowerCase())
                        .filter((lang, index, self) => self.indexOf(lang) === index);

                    if (!requirements(list, 'mustBeArray')) {
                        throwMex(`languages.${cat}`, item[mainKey], 'The property must be an array');
                    }

                    list.forEach((lang, idx) => {
                        if (
                            !requirements(lang, 'mustBeString') ||
                            !requirements(lang, 'regex', /^[a-z]{2,3}$/i)
                        ) {
                            throwMex(`languages.${cat}.${idx}`, item[mainKey],
                                `The value '${lang}' has not a ISO 639 valid format`);
                        }
                    });

                    item.languages[cat] = list;
                }
            }

            country.languages = item.languages;

            /** localesIcu: must be present and must be a not empty array */
            let localesIcu = [];
            if(!Object.prototype.hasOwnProperty.call(item, 'localesIcu')) {
                item.localesIcu = localesIcu;
            } else if(!requirements(item.localesIcu, 'mustBeArray') ) {
                throwMex('localesIcu', item[mainKey], 'The property must be an  array');
            }
            for (let [index, loc] of item.localesIcu.entries()) {
                let locTest = refactorLanguages(loc);
                if ( locTest == 'error' || !requirements(locTest, 'bcp47') ) {
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
            } else {
                if( !requirements(item.otherAppsIds.geoNamesOrg, 'mustBePositiveIntegerNotZero') ) {
                    throwMex('otherAppsIds.geoNamesOrg', item[mainKey],
                        'The property must be null or a positive integer greater then zero');
                }
            }

            // wikidata
            if(!Object.prototype.hasOwnProperty.call(item.otherAppsIds, 'wikidata')) {
                item.otherAppsIds.wikidata = null;
            } else {
                if (
                    !requirements(item.otherAppsIds.wikidata, 'mustBeString') ||
                    !requirements(item.otherAppsIds.wikidata, 'cannotBeEmpty')
                ) {
                    throwMex('otherAppsIds.wikidata', item[mainKey],
                        'The property must be null or a not empty string');
                }
                if(
                    !requirements(item.otherAppsIds.wikidata, 'regex', /^Q[1-9][0-9]*$/i)
                ) {
                    throwMex('otherAppsIds.wikidata', item[mainKey],
                        'The value for the property (' + item.otherAppsIds.wikidata + ') has not the correct format');
                }
                item.otherAppsIds.wikidata = item.otherAppsIds.wikidata.toUpperCase();
            }

            // Open Street Map
            if(!Object.prototype.hasOwnProperty.call(item.otherAppsIds, 'openStreetMap')) {
                item.otherAppsIds.openStreetMap = {
                    type: null,
                    id: null
                };
            } else {
                if (
                    !requirements(item.otherAppsIds.openStreetMap, 'mustBeObject') ||
                    !requirements(item.otherAppsIds.openStreetMap, 'cannotBeEmpty')
                ) {
                    throwMex('otherAppsIds.openStreetMap', item[mainKey],
                        'The property must be null or a not empty object');
                }

                if(!Object.prototype.hasOwnProperty.call(item.otherAppsIds.openStreetMap, 'type')) {
                    throwMex('otherAppsIds.openStreetMap.type', item[mainKey], 'Required property is missing');
                }
                if(
                    !requirements(item.otherAppsIds.openStreetMap.type, 'mustBeString') ||
                    !requirements(item.otherAppsIds.openStreetMap.type, 'regex', /^(node|way|relation)$/i)
                ) {
                    throwMex('otherAppsIds.openStreetMap.type', item[mainKey],
                        'The value for the property (' + item.otherAppsIds.openStreetMap.type + ') ' +
                        'has not the correct format (`node` or `way` or `relation`, case insensitive)'
                    );
                }
                item.otherAppsIds.openStreetMap.type = item.otherAppsIds.openStreetMap.type.toLowerCase();

                if(!Object.prototype.hasOwnProperty.call(item.otherAppsIds.openStreetMap, 'id')) {
                    throwMex('otherAppsIds.openStreetMap.id', item[mainKey], 'Required property is missing');
                }
                if( !requirements(item.otherAppsIds.openStreetMap.id, 'mustBePositiveIntegerNotZero') ) {
                    throwMex('otherAppsIds.geoNamesOrg.id', item[mainKey],
                        'The property must be null or a positive integer greater then zero');
                }
            }

            country.otherAppsIds = {
                geoNamesOrg: item.otherAppsIds.geoNamesOrg,
                wikidata: item.otherAppsIds.wikidata,
                openStreetMap: item.otherAppsIds.openStreetMap
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

