import {
    checkFile,
    errorMessage,
    getMinimizedSvg,
    sortList,
    refactorLanguages,
    requirements
} from '../utils.js';
import { countriesSchemaConfig } from '../configCountriesSchema.js';
import {
    checkBySchemaType,
    createItemRefGetter,
    createThrowMex,
    getByDotPath,
    logDetail,
    logPhaseDone,
    logPhaseStart,
    parseTranslationsMandatoryByKeys,
    validateMainKeyRequired
} from './modularShared.js';
import punycode from 'punycode/punycode.js';
import moment from 'moment-timezone';
import slugify from 'slugify';

const mainKey = countriesSchemaConfig.mainKey;
const mainKeyRules = countriesSchemaConfig.mainKeyRules;
const collection = 'Countries';
const collectionItem = 'Country';

const throwMex = createThrowMex(collection, collectionItem);
const getCountryReference = createItemRefGetter(mainKey);

function validateMainKeyOnly(data) {
    validateMainKeyRequired(data, {
        mainKey,
        mainKeyRules,
        throwMex,
        getItemRef: getCountryReference
    });
}

function normalizeValueByRule(value, rule) {
    if (rule?.normalize === 'upper' && typeof value === 'string') {
        return value.toUpperCase();
    }
    if (rule?.normalize === 'lower' && typeof value === 'string') {
        return value.toLowerCase();
    }
    return value;
}

function validateScalarPropertyByRule(data, prop, options = {}) {
    const rule = countriesSchemaConfig.rules[prop];
    if (!rule || typeof rule !== 'object') {
        throwMex(prop, collectionItem, `Invalid schema: missing rules.${prop}`);
    }

    logDetail(`validating property '${prop}'`);
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, prop)) {
            if (Object.prototype.hasOwnProperty.call(rule, 'defaultValue')) {
                item[prop] = rule.defaultValue;
            } else {
                const itemRef = options.missingRef === 'json' ? JSON.stringify(item) : getCountryReference(item);
                throwMex(prop, itemRef, 'Required property is missing');
            }
            if (!Object.prototype.hasOwnProperty.call(item, prop)) {
                continue;
            }
        }

        if (rule.kind === 'numericString') {
            item[prop] = item[prop].toString().padStart(rule.padStart ?? 3, '0');
            if (!/^\d{3}$/i.test(item[prop])) {
                throwMex(
                    prop,
                    getCountryReference(item),
                    `The property has invalid format. Expected /^\\d{3}$/i, got '${item[prop]}'`
                );
            }
            continue;
        }

        if (item[prop] === null) {
            continue;
        }

        if (!checkBySchemaType(item[prop], rule.kind)) {
            throwMex(prop, getCountryReference(item), options.typeMessage ?? 'The property has invalid type');
        }
        if (rule.regex && !rule.regex.test(item[prop])) {
            throwMex(
                prop,
                getCountryReference(item),
                `The property has invalid format. Expected ${rule.regex}, got '${item[prop]}'`
            );
        }
        item[prop] = normalizeValueByRule(item[prop], rule);

        if (
            Array.isArray(rule.customChecks) &&
            rule.customChecks.includes('notSelfMainKey') &&
            item[prop] === item.alpha2
        ) {
            throwMex(
                prop,
                getCountryReference(item),
                `The property cannot match the main key '${item.alpha2}'`
            );
        }
    }
}

function validateAlpha2BySchema(data) {
    validateScalarPropertyByRule(data, 'alpha2', {
        missingRef: 'json',
        typeMessage: 'The property must be a string'
    });
}

function validateAlpha3BySchema(data) {
    validateScalarPropertyByRule(data, 'alpha3', {
        typeMessage: 'The property must be a string'
    });
}

function validateUnM49BySchema(data) {
    validateScalarPropertyByRule(data, 'unM49');
}

function validateDependencyBySchema(data) {
    validateScalarPropertyByRule(data, 'dependency', {
        typeMessage: 'The property must be null or a string'
    });
}

function validateLocalizedStringObject(value, rules, options) {
    const {
        propPath,
        itemRef,
        emptyObjectMessage = 'The property must be a not empty object',
        invalidKeyMessage = 'The property key non-compliant with BCP 47 format',
        invalidValueTypeMessage = 'The property value must be a string',
        invalidValueEmptyMessage = 'The property value must be a not empty string'
    } = options;

    if (!requirements(value, 'mustBeObject')) {
        throwMex(propPath, itemRef, emptyObjectMessage);
    }

    const normalized = {};
    for (const [lang, text] of Object.entries(value)) {
        if (rules.keyFormat === 'bcp47') {
            const langTest = refactorLanguages(lang);
            if (langTest === 'error' || !requirements(langTest, 'bcp47')) {
                throwMex(`${propPath}.${lang}`, itemRef, invalidKeyMessage);
            }
        }
        if (rules.valueType === 'string' && !requirements(text, 'mustBeString')) {
            throwMex(`${propPath}.${lang}`, itemRef, invalidValueTypeMessage);
        }
        if (rules.valueCannotBeEmpty && !requirements(text, 'cannotBeEmpty')) {
            throwMex(`${propPath}.${lang}`, itemRef, invalidValueEmptyMessage);
        }
        normalized[lang] = text;
    }
    return normalized;
}

function validateOfficialNameBySchema(data) {
    const rules = countriesSchemaConfig.rules.officialName;
    if (!rules || typeof rules !== 'object') {
        throwMex('officialName', collectionItem, 'Invalid schema: missing rules.officialName');
    }

    logDetail("validating property 'officialName'");
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, 'officialName')) {
            item.officialName = rules.defaultValue ?? {};
        }
        item.officialName = validateLocalizedStringObject(item.officialName, rules, {
            propPath: 'officialName',
            itemRef: getCountryReference(item)
        });
    }
}

function alpha2ToFlagEmoji(alpha2) {
    if (typeof alpha2 !== 'string' || alpha2.length !== 2) {
        return null;
    }
    const upper = alpha2.toUpperCase();
    const OFFSET = 127397;
    return String.fromCodePoint(upper.codePointAt(0) + OFFSET, upper.codePointAt(1) + OFFSET);
}

async function validateFlagsBySchema(data, configBuild) {
    const rules = countriesSchemaConfig.rules.flags;
    if (!rules || typeof rules !== 'object') {
        throwMex('flags', collectionItem, 'Invalid schema: missing rules.flags');
    }

    logDetail("validating property 'flags'");
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, 'flags')) {
            throwMex('flags', getCountryReference(item), 'Required property is missing');
        }
        if (!requirements(item.flags, 'mustBeObject')) {
            throwMex('flags', getCountryReference(item), 'The property must be an object');
        }

        const emojiRules = rules.children?.emoji;
        if (!Object.prototype.hasOwnProperty.call(item.flags, 'emoji')) {
            throwMex('flags.emoji', getCountryReference(item), 'Required property is missing');
        }
        if (emojiRules && !checkBySchemaType(item.flags.emoji, emojiRules.kind)) {
            throwMex('flags.emoji', getCountryReference(item), 'The property must be a string');
        }
        if (emojiRules?.regex && !emojiRules.regex.test(item.flags.emoji)) {
            throwMex(
                'flags.emoji',
                getCountryReference(item),
                `The property has invalid format. Expected ${emojiRules.regex}, got '${item.flags.emoji}'`
            );
        }
        if (
            Array.isArray(emojiRules?.customChecks) &&
            emojiRules.customChecks.includes('emojiMatchesAlpha2')
        ) {
            const expected = alpha2ToFlagEmoji(item.alpha2);
            if (expected !== item.flags.emoji) {
                throwMex(
                    'flags.emoji',
                    getCountryReference(item),
                    `The property must match alpha2 '${item.alpha2}'. Expected '${expected}', got '${item.flags.emoji}'`
                );
            }
        }

        const svgRules = rules.children?.svg;
        if (svgRules?.requiredGenerated && svgRules.source === 'originFlagFile') {
            const flagPath = configBuild.readPaths.origin
                + 'Flags/Countries/'
                + item.alpha2.toLowerCase()
                + '/flag_'
                + configBuild.extra.countries.flags.chosenSvgFormat
                + '.svg';
            if (!checkFile(flagPath)) {
                throwMex('flags.svg', getCountryReference(item), `The origin data file \`${flagPath}\` must exists`);
            }
            if (svgRules.minify === true) {
                try {
                    item.flags.svg = await getMinimizedSvg(flagPath);
                } catch (_error) {
                    throwMex('flags.svg', getCountryReference(item), 'Error while minimizing SVG');
                }
            }
        }
    }
}

function validateMottosBySchema(data, configBuild) {
    const rules = countriesSchemaConfig.rules.mottos;
    if (!rules || typeof rules !== 'object') {
        throwMex('mottos', collectionItem, 'Invalid schema: missing rules.mottos');
    }

    const categories = getByDotPath(configBuild, rules.categoriesPath);
    if (!Array.isArray(categories)) {
        throwMex('mottos', collectionItem, 'Invalid schema: categories path is not a list');
    }

    logDetail("validating property 'mottos'");
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, 'mottos')) {
            item.mottos = rules.defaultValue ?? {};
        } else if (!requirements(item.mottos, 'mustBeObject')) {
            throwMex('mottos', getCountryReference(item), 'The property must be an object');
        }

        const normalizedMottos = {};
        for (const cat of categories) {
            if (!Object.prototype.hasOwnProperty.call(item.mottos, cat)) {
                normalizedMottos[cat] = [];
                continue;
            }
            if (!requirements(item.mottos[cat], 'mustBeArray')) {
                throwMex(`mottos.${cat}`, getCountryReference(item), 'The property must be an array');
            }

            const normalizedEntries = [];
            for (const [idx, mottoEntry] of Object.entries(item.mottos[cat])) {
                if (!requirements(mottoEntry, 'mustBeObject') || !requirements(mottoEntry, 'cannotBeEmpty')) {
                    throwMex(
                        `mottos.${cat}.${idx}`,
                        getCountryReference(item),
                        'The property must be a not empty object'
                    );
                }

                for (const reqKey of rules.entryRequiredKeys ?? []) {
                    if (!Object.prototype.hasOwnProperty.call(mottoEntry, reqKey)) {
                        throwMex(
                            `mottos.${cat}.${idx}.${reqKey}`,
                            getCountryReference(item),
                            'Required property is missing'
                        );
                    }
                }

                const textBlock = mottoEntry.text;
                if (!requirements(textBlock, 'mustBeObject') || !requirements(textBlock, 'cannotBeEmpty')) {
                    throwMex(
                        `mottos.${cat}.${idx}.text`,
                        getCountryReference(item),
                        'The property must be a not empty object'
                    );
                }

                const normalizedText = validateLocalizedStringObject(textBlock, {
                    keyFormat: rules.textKeyFormat,
                    valueType: rules.textValueType,
                    valueCannotBeEmpty: rules.textValueCannotBeEmpty
                }, {
                    propPath: `mottos.${cat}.${idx}.text`,
                    itemRef: getCountryReference(item),
                    invalidValueTypeMessage: 'The property must be a string',
                    invalidValueEmptyMessage: 'The property must be a not empty string'
                });

                normalizedEntries.push({
                    text: normalizedText
                });
            }
            normalizedMottos[cat] = normalizedEntries;
        }

        item.mottos = normalizedMottos;
    }
}

function normalizeCategorizedCodeList(container, categories, rules, options) {
    const {
        rootProp,
        itemRef,
        valueMapper,
        formatErrorMessage,
        skipCategories = []
    } = options;
    const normalized = {};
    for (const cat of categories) {
        if (skipCategories.includes(cat)) {
            normalized[cat] = [];
            continue;
        }
        if (!Object.prototype.hasOwnProperty.call(container, cat)) {
            normalized[cat] = [];
            continue;
        }
        if (!requirements(container[cat], 'mustBeArray')) {
            throwMex(`${rootProp}.${cat}`, itemRef, 'The property must be an array');
        }
        const list = [];
        for (const [index, rawValue] of container[cat].entries()) {
            const mapped = valueMapper(rawValue);
            if (!requirements(mapped, 'mustBeString') || !rules.codeRegex.test(mapped)) {
                throwMex(
                    `${rootProp}.${cat}.${index}`,
                    itemRef,
                    formatErrorMessage(mapped)
                );
            }
            const normalizedValue = rules.normalize === 'upper' ? mapped.toUpperCase() : mapped;
            list.push(normalizedValue);
        }
        normalized[cat] = rules.dedupeWithinCategory ? [...new Set(list)] : list;
    }
    return normalized;
}

function validateCurrenciesBySchema(data, configBuild) {
    const rules = countriesSchemaConfig.rules.currencies;
    if (!rules || typeof rules !== 'object') {
        throwMex('currencies', collectionItem, 'Invalid schema: missing rules.currencies');
    }

    const categories = getByDotPath(configBuild, rules.categoriesPath);
    if (!Array.isArray(categories)) {
        throwMex('currencies', collectionItem, 'Invalid schema: categories path is not a list');
    }

    logDetail("validating property 'currencies'");
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, 'currencies')) {
            item.currencies = rules.defaultValue ?? {};
        } else if (!requirements(item.currencies, 'mustBeObject')) {
            throwMex('currencies', getCountryReference(item), 'The property must be an object');
        }

        const normalizedCurrencies = normalizeCategorizedCodeList(item.currencies, categories, rules, {
            rootProp: 'currencies',
            itemRef: getCountryReference(item),
            valueMapper: value => value,
            formatErrorMessage: code => `The value for the property (${code}) must be `
                + '3 chars length alphabetical string'
        });

        if (rules.forbidCrossCategoryOverlap) {
            const legalTenders = new Set(normalizedCurrencies.legalTenders ?? []);
            const widelyAccepted = new Set(normalizedCurrencies.widelyAccepted ?? []);
            const overlap = [...legalTenders].filter(code => widelyAccepted.has(code));
            if (overlap.length > 0) {
                throwMex(
                    'currencies',
                    getCountryReference(item),
                    `Cross-category overlap not allowed. Duplicated codes: [${overlap.join(', ')}]`
                );
            }
        }
        item.currencies = normalizedCurrencies;
    }
}

function validateDialCodesBySchema(data, configBuild) {
    const rules = countriesSchemaConfig.rules.dialCodes;
    if (!rules || typeof rules !== 'object') {
        throwMex('dialCodes', collectionItem, 'Invalid schema: missing rules.dialCodes');
    }

    const categories = getByDotPath(configBuild, rules.categoriesPath);
    if (!Array.isArray(categories)) {
        throwMex('dialCodes', collectionItem, 'Invalid schema: categories path is not a list');
    }
    const exceptionProps = getByDotPath(configBuild, rules.exceptionPropsPath);
    if (!Array.isArray(exceptionProps)) {
        throwMex('dialCodes', collectionItem, 'Invalid schema: exception props path is not a list');
    }

    logDetail("validating property 'dialCodes'");
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, 'dialCodes')) {
            item.dialCodes = rules.defaultValue ?? {};
        } else if (!requirements(item.dialCodes, 'mustBeObject')) {
            throwMex('dialCodes', getCountryReference(item), 'The property must be an object');
        }

        const normalizedDialCodes = normalizeCategorizedCodeList(item.dialCodes, categories, {
            ...rules,
            codeRegex: rules.deJureDeFactoRegex
        }, {
            rootProp: 'dialCodes',
            itemRef: getCountryReference(item),
            skipCategories: [rules.exceptionsCategoryName],
            valueMapper: value => {
                if (Number.isInteger(value)) {
                    return '+' + value.toString();
                }
                if (typeof value === 'string') {
                    return value.replace(/^00/g, '+');
                }
                return value;
            },
            formatErrorMessage: dial => `The the value for the property (${dial}) must be either an integer `
                + 'or a numeric string. It can start with `00` or `+`, but the very next digit must be between 1 and 9'
        });
        for (const cat of categories) {
            if (!Object.prototype.hasOwnProperty.call(item.dialCodes, cat)) {
                continue;
            }
            if (!requirements(item.dialCodes[cat], 'mustBeArray')) {
                throwMex(`dialCodes.${cat}`, getCountryReference(item), 'The property must be an array');
            }

            if (cat === rules.exceptionsCategoryName) {
                const exceptions = [];
                for (const [index, exception] of item.dialCodes[cat].entries()) {
                    if (!requirements(exception, 'mustBeObject') || !requirements(exception, 'cannotBeEmpty')) {
                        throwMex(
                            `dialCodes.${cat}.${index}`,
                            getCountryReference(item),
                            'The property must be a not empty object'
                        );
                    }

                    const normalizedException = {};
                    for (const prop of exceptionProps) {
                        if (!Object.prototype.hasOwnProperty.call(exception, prop)) {
                            throwMex(
                                `dialCodes.${cat}.${index}.${prop}`,
                                getCountryReference(item),
                                'Required property is missing'
                            );
                        }
                        if (prop === 'code') {
                            let codeValue = exception[prop];
                            if (Number.isInteger(codeValue)) {
                                codeValue = codeValue.toString();
                            } else if (typeof codeValue === 'string') {
                                codeValue = codeValue.replace(/\s+/g, '');
                            }
                            if (
                                !requirements(codeValue, 'mustBeString')
                                || !rules.exceptionCodeRegex.test(codeValue)
                            ) {
                                throwMex(
                                    `dialCodes.${cat}.${index}.${prop}`,
                                    getCountryReference(item),
                                    `The the value for the property (${codeValue}) must be either an integer `
                                    + 'or a numeric string. '
                                );
                            }
                            normalizedException[prop] = codeValue;
                            continue;
                        }
                        if (prop === 'origin') {
                            let originValue = exception[prop];
                            if (
                                !requirements(originValue, 'mustBeString')
                                || !rules.exceptionOriginRegex.test(originValue)
                            ) {
                                throwMex(
                                    `dialCodes.${cat}.${index}.${prop}`,
                                    getCountryReference(item),
                                    'The property must be 2 chars length alphabetical string'
                                );
                            }
                            originValue = originValue.toUpperCase();
                            normalizedException[prop] = originValue;
                            continue;
                        }
                        normalizedException[prop] = exception[prop];
                    }
                    exceptions.push(normalizedException);
                }
                normalizedDialCodes[cat] = exceptions;
                continue;
            }
        }

        if (rules.forbidCrossCategoryOverlap) {
            const deJure = new Set(normalizedDialCodes.deJure ?? []);
            const deFacto = new Set(normalizedDialCodes.deFacto ?? []);
            const overlap = [...deJure].filter(code => deFacto.has(code));
            if (overlap.length > 0) {
                throwMex(
                    'dialCodes',
                    getCountryReference(item),
                    `Cross-category overlap not allowed. Duplicated codes: [${overlap.join(', ')}]`
                );
            }
        }
        item.dialCodes = normalizedDialCodes;
    }
}

function validateCcTldBySchema(data) {
    validateScalarPropertyByRule(data, 'ccTld', {
        typeMessage: 'The property must be string or null'
    });
}

function validateCcIdnBySchema(data, configBuild) {
    const rules = countriesSchemaConfig.rules.ccIdn;
    if (!rules || typeof rules !== 'object') {
        throwMex('ccIdn', collectionItem, 'Invalid schema: missing rules.ccIdn');
    }
    const internalProperties = getByDotPath(configBuild, rules.internalPropertiesPath);
    if (!Array.isArray(internalProperties)) {
        throwMex('ccIdn', collectionItem, 'Invalid schema: internal properties path is not a list');
    }

    logDetail("validating property 'ccIdn'");
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, 'ccIdn')) {
            item.ccIdn = rules.defaultValue ?? [];
            continue;
        }
        if (!requirements(item.ccIdn, 'mustBeArray')) {
            throwMex('ccIdn', getCountryReference(item), 'The property must be an array');
        }

        const ccIdns = [];
        for (const [idx, ccIdn] of item.ccIdn.entries()) {
            if (!requirements(ccIdn, 'mustBeObject') || !requirements(ccIdn, 'cannotBeEmpty')) {
                throwMex(
                    `ccIdn.${idx}`,
                    getCountryReference(item),
                    'The internal element must be a not empty object'
                );
            }
            const ccIdnElement = {};
            for (const internalProperty of internalProperties) {
                if (!Object.prototype.hasOwnProperty.call(ccIdn, internalProperty)) {
                    throwMex(
                        `ccIdn.${idx}.${internalProperty}`,
                        getCountryReference(item),
                        'Required property is missing'
                    );
                }

                switch (internalProperty) {
                case 'unicode':
                    if (
                        !requirements(ccIdn[internalProperty], 'mustBeString') ||
                        !rules.unicodeRegex.test(ccIdn[internalProperty])
                    ) {
                        throwMex(
                            `ccIdn.${idx}.${internalProperty}`,
                            getCountryReference(item),
                            'The property must be either null or start with `.` and contain no spaces'
                        );
                    }
                    break;
                case 'punycode':
                    if (
                        !requirements(ccIdn[internalProperty], 'mustBeString') ||
                        !rules.punycodeRegex.test(ccIdn[internalProperty])
                    ) {
                        throwMex(
                            `ccIdn.${idx}.${internalProperty}`,
                            getCountryReference(item),
                            'The property must start with `.` and follow punycode format'
                        );
                    }
                    if (typeof ccIdn.unicode === 'string') {
                        const punicodeTest = punycode.toASCII(
                            ccIdn.unicode.replace(/^\./, '')
                        );
                        const unicodeAscii = ccIdn.punycode.replace(/^\./, '');
                        if (punicodeTest !== unicodeAscii) {
                            throwMex(
                                `ccIdn.${idx}.${internalProperty}`,
                                getCountryReference(item),
                                `The punycode value '${ccIdn.punycode}' does not match unicode '${ccIdn.unicode}'`
                            );
                        }
                    }
                    break;
                case 'language': {
                    const langTest = refactorLanguages(ccIdn[internalProperty]);
                    if (langTest === 'error' || !requirements(langTest, 'bcp47')) {
                        throwMex(
                            `ccIdn.${idx}.${internalProperty}`,
                            getCountryReference(item),
                            'The property value non-compliant with BCP 47 format'
                        );
                    }
                    break;
                }
                case 'regionsOfUse':
                    if (!requirements(ccIdn[internalProperty], 'mustBeArray')) {
                        throwMex(
                            `ccIdn.${idx}.${internalProperty}`,
                            getCountryReference(item),
                            'The property must be an array'
                        );
                    }
                    for (const [iidx, region] of ccIdn[internalProperty].entries()) {
                        if (!requirements(region, 'mustBeString') || !rules.regionRegex.test(region)) {
                            throwMex(
                                `ccIdn.${idx}.${internalProperty}.${iidx}`,
                                getCountryReference(item),
                                'The property must be 2 chars length alphabetical string'
                            );
                        }
                        ccIdn[internalProperty][iidx] = ccIdn[internalProperty][iidx].toUpperCase();
                    }
                    ccIdn[internalProperty] = [...new Set(ccIdn[internalProperty])];
                    break;
                default:
                    // nothing
                }

                ccIdnElement[internalProperty] = ccIdn[internalProperty];
            }
            ccIdns.push(ccIdnElement);
        }
        item.ccIdn = ccIdns;
    }
}

function validateStringListBySchema(value, rules, options) {
    const {
        propName,
        itemRef,
        checkExtra,
        formatErrorMessage,
        extraErrorMessage,
        arrayErrorMessage
    } = options;

    if (
        !requirements(value, 'mustBeArray') ||
        (!rules.canBeEmpty && !requirements(value, 'cannotBeEmpty'))
    ) {
        throwMex(propName, itemRef, arrayErrorMessage ?? 'The property must be a not empty array');
    }

    const normalized = [];
    for (const [index, entry] of value.entries()) {
        if (!requirements(entry, 'mustBeString') || (rules.regex && !rules.regex.test(entry))) {
            throwMex(
                `${propName}.${index}`,
                itemRef,
                formatErrorMessage(entry)
            );
        }
        if (checkExtra && !checkExtra(entry)) {
            throwMex(
                `${propName}.${index}`,
                itemRef,
                extraErrorMessage(entry)
            );
        }
        normalized.push(entry);
    }
    return rules.dedupe ? [...new Set(normalized)] : normalized;
}

function validateTimeZonesBySchema(data) {
    const rules = countriesSchemaConfig.rules.timeZones;
    if (!rules || typeof rules !== 'object') {
        throwMex('timeZones', collectionItem, 'Invalid schema: missing rules.timeZones');
    }

    logDetail("validating property 'timeZones'");
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, 'timeZones')) {
            throwMex('timeZones', getCountryReference(item), 'Required property is missing');
        }
        item.timeZones = validateStringListBySchema(item.timeZones, rules, {
            propName: 'timeZones',
            itemRef: getCountryReference(item),
            checkExtra: tz => !rules.mustExistInTimeZoneDb || moment.tz.names().includes(tz),
            arrayErrorMessage: 'The property must be a not empty array',
            formatErrorMessage: tz => `The value for the property (${tz}) has not the correct format`,
            extraErrorMessage: tz => `The value for the property (${tz}) is not in the database `
                + `(TimeZone Version = ${moment.tz.dataVersion})`
        });
    }
}

function validateLocalesIcuBySchema(data) {
    const rules = countriesSchemaConfig.rules.localesIcu;
    if (!rules || typeof rules !== 'object') {
        throwMex('localesIcu', collectionItem, 'Invalid schema: missing rules.localesIcu');
    }

    logDetail("validating property 'localesIcu'");
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, 'localesIcu')) {
            item.localesIcu = rules.defaultValue ?? [];
            continue;
        }
        item.localesIcu = validateStringListBySchema(item.localesIcu, {
            ...rules,
            canBeEmpty: true
        }, {
            propName: 'localesIcu',
            itemRef: getCountryReference(item),
            arrayErrorMessage: 'The property must be an  array',
            checkExtra: loc => {
                const locTest = refactorLanguages(loc);
                if (rules.localeFormat === 'bcp47' && (locTest === 'error' || !requirements(locTest, 'bcp47'))) {
                    return false;
                }
                return !rules.mustBeSupportedByIntl || Intl.Collator.supportedLocalesOf([loc]).length > 0;
            },
            formatErrorMessage: loc => `The value for the property (${loc}) non-compliant with BCP 47 format`,
            extraErrorMessage: loc => `The value for the property (${loc}) is not supported by the `
                + 'International Components for Unicode'
        });
    }
}

function validateOtherAppsIdsBySchema(data) {
    const rules = countriesSchemaConfig.rules.otherAppsIds;
    if (!rules || typeof rules !== 'object') {
        throwMex('otherAppsIds', collectionItem, 'Invalid schema: missing rules.otherAppsIds');
    }
    const children = rules.children ?? {};

    logDetail("validating property 'otherAppsIds'");
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, 'otherAppsIds')) {
            throwMex('otherAppsIds', getCountryReference(item), 'Required property is missing');
        }
        if (
            !requirements(item.otherAppsIds, 'mustBeObject') ||
            !requirements(item.otherAppsIds, 'cannotBeEmpty')
        ) {
            throwMex('otherAppsIds', getCountryReference(item), 'The property must be a not empty object');
        }

        const normalized = {};
        const checkChild = (key, opts = {}) => {
            const childRule = children[key];
            const propPath = `otherAppsIds.${key}`;
            if (childRule?.required && !Object.prototype.hasOwnProperty.call(item.otherAppsIds, key)) {
                throwMex(propPath, getCountryReference(item), 'Required property is missing');
            }
            if (
                !Object.prototype.hasOwnProperty.call(item.otherAppsIds, key)
                && Object.prototype.hasOwnProperty.call(childRule ?? {}, 'defaultValue')
            ) {
                item.otherAppsIds[key] = childRule.defaultValue;
            }
            if (!Object.prototype.hasOwnProperty.call(item.otherAppsIds, key)) {
                normalized[key] = item.otherAppsIds[key];
                return;
            }
            if (!checkBySchemaType(item.otherAppsIds[key], childRule?.type)) {
                throwMex(propPath, getCountryReference(item), opts.typeErrorMessage);
            }
            if (
                opts.mustBeNotEmptyWhenPresent
                && item.otherAppsIds[key] !== null
                && !requirements(item.otherAppsIds[key], 'cannotBeEmpty')
            ) {
                throwMex(propPath, getCountryReference(item), opts.typeErrorMessage);
            }
            if (item.otherAppsIds[key] !== null && childRule?.regex && !childRule.regex.test(item.otherAppsIds[key])) {
                throwMex(
                    propPath,
                    getCountryReference(item),
                    `The value for the property (${item.otherAppsIds[key]}) has not the correct format`
                );
            }
            item.otherAppsIds[key] = normalizeValueByRule(item.otherAppsIds[key], childRule);
            normalized[key] = item.otherAppsIds[key];
        };

        checkChild('geoNamesOrg', {
            typeErrorMessage: 'The property must be null or a positive integer greater then zero'
        });
        checkChild('wikiData', {
            typeErrorMessage: 'The property must be null or a not empty string',
            mustBeNotEmptyWhenPresent: true
        });
        checkChild('openStreetMapRelation', {
            typeErrorMessage: 'The property must be null or a positive integer greater then zero'
        });

        item.otherAppsIds = normalized;
    }
}

function normalizeLanguageCodeList(values, rules, propPath, itemRef) {
    if (!requirements(values, 'mustBeArray')) {
        throwMex(propPath, itemRef, 'The property must be an array');
    }

    const list = [];
    for (const [idx, lang] of values.entries()) {
        if (!requirements(lang, 'mustBeString') || !rules.languageRegex.test(lang)) {
            throwMex(
                `${propPath}.${idx}`,
                itemRef,
                `The value '${lang}' has not a ISO 639 valid format`
            );
        }
        list.push(rules.normalize === 'lower' ? lang.toLowerCase() : lang);
    }
    return rules.dedupeWithinList ? [...new Set(list)] : list;
}

function validateLanguagesBySchema(data, configBuild) {
    const rules = countriesSchemaConfig.rules.languages;
    if (!rules || typeof rules !== 'object') {
        throwMex('languages', collectionItem, 'Invalid schema: missing rules.languages');
    }
    const categories = getByDotPath(configBuild, rules.categoriesPath);
    if (!Array.isArray(categories)) {
        throwMex('languages', collectionItem, 'Invalid schema: categories path is not a list');
    }
    const subCategoriesMap = getByDotPath(configBuild, rules.subCategoriesPath);
    if (!subCategoriesMap || typeof subCategoriesMap !== 'object' || Array.isArray(subCategoriesMap)) {
        throwMex('languages', collectionItem, 'Invalid schema: subCategories path is not an object');
    }

    logDetail("validating property 'languages'");
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, 'languages')) {
            item.languages = rules.defaultValue ?? {};
        } else if (!requirements(item.languages, 'mustBeObject')) {
            throwMex('languages', getCountryReference(item), 'The property must be an object');
        }

        const normalizedLanguages = {};
        for (const cat of categories) {
            if (Object.prototype.hasOwnProperty.call(subCategoriesMap, cat)) {
                normalizedLanguages[cat] = {};
                if (!Object.prototype.hasOwnProperty.call(item.languages, cat)) {
                    item.languages[cat] = {};
                }

                for (const sub of subCategoriesMap[cat]) {
                    if (!Object.prototype.hasOwnProperty.call(item.languages[cat], sub)) {
                        item.languages[cat][sub] = [];
                    }
                    normalizedLanguages[cat][sub] = normalizeLanguageCodeList(
                        item.languages[cat][sub],
                        rules,
                        `languages.${cat}.${sub}`,
                        getCountryReference(item)
                    );
                }
            } else {
                if (!Object.prototype.hasOwnProperty.call(item.languages, cat)) {
                    item.languages[cat] = [];
                }
                normalizedLanguages[cat] = normalizeLanguageCodeList(
                    item.languages[cat],
                    rules,
                    `languages.${cat}`,
                    getCountryReference(item)
                );
            }
        }

        if (rules.forbidCrossCategoryOverlap) {
            const listPaths = [];
            for (const cat of categories) {
                if (Object.prototype.hasOwnProperty.call(subCategoriesMap, cat)) {
                    for (const sub of subCategoriesMap[cat]) {
                        listPaths.push(`languages.${cat}.${sub}`);
                    }
                } else {
                    listPaths.push(`languages.${cat}`);
                }
            }

            const seen = new Map();
            for (const path of listPaths) {
                const segments = path.split('.').slice(1);
                let listRef = normalizedLanguages;
                for (const seg of segments) {
                    listRef = listRef?.[seg];
                }
                const values = Array.isArray(listRef) ? listRef : [];
                for (const code of values) {
                    if (seen.has(code)) {
                        const firstPath = seen.get(code);
                        throwMex(
                            path,
                            getCountryReference(item),
                            `Cross-category overlap not allowed. Language '${code}' `
                            + `is in both '${firstPath}' and '${path}'`
                        );
                    }
                    seen.set(code, path);
                }
            }
        }
        item.languages = normalizedLanguages;
    }
}

function buildCountriesOutput(items) {
    const out = [];
    for (const item of items) {
        const country = {};
        for (const prop of countriesSchemaConfig.topLevelProperties) {
            country[prop] = item[prop];
        }
        out.push(country);
    }
    return sortList(out, mainKey);
}

export async function parseCountriesDataModular(data, configBuild) {
    logPhaseStart('Schema-driven parser started');
    logDetail(`schema properties: ${countriesSchemaConfig.topLevelProperties.join(', ')}`);

    for (const [group, path] of Object.entries(countriesSchemaConfig.groupKeys)) {
        const resolved = getByDotPath(configBuild, path);
        const count = Array.isArray(resolved) ? resolved.length : (resolved && typeof resolved === 'object'
            ? Object.keys(resolved).length
            : 0);
        logDetail(`schema group '${group}' entries: ${count}`);
    }

    validateMainKeyOnly(data);
    validateAlpha2BySchema(data);
    validateAlpha3BySchema(data);
    validateUnM49BySchema(data);
    validateDependencyBySchema(data);
    validateOfficialNameBySchema(data);
    await validateFlagsBySchema(data, configBuild);
    validateMottosBySchema(data, configBuild);
    validateCurrenciesBySchema(data, configBuild);
    validateDialCodesBySchema(data, configBuild);
    validateCcTldBySchema(data);
    validateCcIdnBySchema(data, configBuild);
    validateTimeZonesBySchema(data);
    validateLocalesIcuBySchema(data);
    validateOtherAppsIdsBySchema(data);
    validateLanguagesBySchema(data, configBuild);
    const sorted = buildCountriesOutput(Object.values(data));
    logPhaseDone('Schema-driven parser completed');
    return sorted;
}

function getTranslationArray(langObjs, countryCode, lang, prop) {
    if (
        !Object.prototype.hasOwnProperty.call(langObjs, countryCode) ||
        !Object.prototype.hasOwnProperty.call(langObjs[countryCode], prop)
    ) {
        return [];
    }
    if (!requirements(langObjs[countryCode][prop], 'mustBeArray')) {
        throw new Error(
            errorMessage(
                'trans',
                collection,
                collectionItem,
                countryCode,
                prop,
                'The property must be an array',
                lang
            )
        );
    }
    for (const [key, value] of Object.entries(langObjs[countryCode][prop])) {
        if (!requirements(value, 'mustBeString') || !requirements(value, 'cannotBeEmpty')) {
            throw new Error(
                errorMessage(
                    'trans',
                    collection,
                    collectionItem,
                    countryCode,
                    `${prop}.${key}`,
                    'The property must be an array',
                    lang
                )
            );
        }
    }
    return langObjs[countryCode][prop];
}

function slugText(input) {
    if (input === null || input === undefined) {
        return '';
    }
    let output = input.replace(/\./g, '');
    output = slugify(output, { replacement: ' ', lower: true, strict: true });
    output = output.replace(/\s+/g, ' ');
    return output.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function getWords(element) {
    return slugText(element).split(' ');
}

function dedupeBySlug(values) {
    const out = [];
    const seen = new Set();
    for (const value of values) {
        const key = slugText(value);
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        out.push(value);
    }
    return out;
}

export async function parseCountriesTranslationsModular(
    data,
    defaultLanguage = 'en',
    countries = []
) {
    const rules = countriesSchemaConfig.translations;
    const out = parseTranslationsMandatoryByKeys({
        data,
        defaultLanguage,
        sourceRows: countries,
        mainKey,
        mandatoryProps: rules.mandatoryStringProps,
        collection,
        collectionItem,
        logCollection: null
    });

    for (const [lang, langObjs] of Object.entries(data)) {
        for (const country of Object.values(countries)) {
            const cc = country[mainKey];

            for (const prop of rules.outputArrayProps) {
                const values = getTranslationArray(langObjs, cc, lang, prop);
                out[lang][cc][prop] = [...new Set(values)];
            }

            const keywordChunks = [];
            for (const prop of rules.keywordSources) {
                const values = dedupeBySlug(getTranslationArray(langObjs, cc, lang, prop));
                keywordChunks.push(...values.map(getWords));
            }
            const dictionary = [].concat(
                slugText(out[lang][cc].name).split(' '),
                slugText(out[lang][cc].fullName).split(' '),
                ...out[lang][cc].demonyms.map(d => slugText(d).split(' '))
            );
            out[lang][cc].keywords = Array.from(new Set([].concat(...keywordChunks)))
                .filter(word => !dictionary.includes(word));
        }
        logDetail(`translation language \`${lang}\` data for \`${collection}\` parsed`);
    }

    return out;
}

export async function parseCountriesTranslationsCategoriesModular(_data, _defaultLanguage) {
    if (countriesSchemaConfig.translationsCategories?.enabled !== false) {
        throw new Error(
            '[countries] Invalid schema: `translationsCategories.enabled` '
            + 'must be false for countries'
        );
    }
    return {};
}
