import {
    checkRangesAndTotal,
    requirements,
    sortList
} from '../utils.js';
import { scriptsSchemaConfig } from '../configScriptsSchema.js';
import {
    checkBySchemaRule,
    createItemRefGetter,
    createThrowMex,
    getByDotPath,
    parseTranslationsCategoriesByRoots,
    parseTranslationsMandatoryByKeys,
    logDetail,
    logPhaseDone,
    logPhaseStart,
    validateMainKeyRequired
} from './modularShared.js';

const mainKey = scriptsSchemaConfig.mainKey;
const mainKeyRules = scriptsSchemaConfig.mainKeyRules;
const collection = 'Scripts';
const collectionItem = 'Script';

const throwMex = createThrowMex(collection, collectionItem);
const getItemRef = createItemRefGetter(mainKey);

function validateMainKey(data) {
    validateMainKeyRequired(data, {
        mainKey,
        mainKeyRules,
        throwMex,
        getItemRef
    });
}

function validateCode(data) {
    const rules = scriptsSchemaConfig.rules.code;
    logDetail("validating property 'code'");
    for (const item of Object.values(data)) {
        if (!checkBySchemaRule(item.code, rules) || !rules.regex.test(item.code)) {
            throwMex('code', getItemRef(item), 'The property must be 4 chars length alphabetical string');
        }
        item.code = item.code.charAt(0).toUpperCase() + item.code.slice(1).toLowerCase();
    }
}

function validateNumeric(data) {
    const rules = scriptsSchemaConfig.rules.numeric;
    logDetail("validating property 'numeric'");
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, 'numeric')) {
            throwMex('numeric', getItemRef(item), 'Required property is missing');
        }
        item.numeric = item.numeric.toString().padStart(rules.padStart ?? 3, '0');
        if (!/^\d{3}$/i.test(item.numeric)) {
            throwMex('numeric', getItemRef(item), 'The property must be 3 chars length numeric string');
        }
    }
}

function validateWritingDirection(data, configBuild) {
    const rules = scriptsSchemaConfig.rules.writingDirection;
    const enumValues = getByDotPath(configBuild, rules.enumPath);
    if (!Array.isArray(enumValues)) {
        throwMex('writingDirection', collectionItem, 'Invalid schema: writingDirection enum path is not a list');
    }
    const enumPattern = new RegExp(`^(?:${enumValues.join('|')})$`);
    const available = '`' + enumValues.join('`, `') + '`';

    logDetail("validating property 'writingDirection'");
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, 'writingDirection')) {
            item.writingDirection = rules.defaultValue ?? 'nla';
        }
        if (item.writingDirection !== null) {
            if (!checkBySchemaRule(item.writingDirection, rules)) {
                throwMex(
                    'writingDirection',
                    getItemRef(item),
                    'The property must be 3 char length string inside the fixed defined values '
                    + '(' + available + ')'
                );
            }
            item.writingDirection = item.writingDirection.toLowerCase();
            if (
                !requirements(item.writingDirection, 'regex', enumPattern)
            ) {
                throwMex(
                    'writingDirection',
                    getItemRef(item),
                    'The property must be 3 char length string inside the fixed defined values '
                    + '(' + available + ')'
                );
            }
        } else {
            item.writingDirection = 'nla';
        }
    }
}

function validateUnicode(data) {
    logDetail("validating property 'unicode'");
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, 'unicode')) {
            throwMex('unicode', getItemRef(item), 'Required property is missing');
        }
        if (
            !requirements(item.unicode, 'mustBeObject') ||
            !requirements(item.unicode, 'cannotBeEmpty')
        ) {
            throwMex('unicode', getItemRef(item), 'The property must be a not empty object');
        }

        if (!Object.prototype.hasOwnProperty.call(item.unicode, 'version')) {
            item.unicode.version = null;
        }
        if (item.unicode.version !== null) {
            if (typeof item.unicode.version === 'number') {
                item.unicode.version = item.unicode.version.toFixed(1);
            }
            if (
                !requirements(item.unicode.version, 'mustBeString') ||
                !requirements(item.unicode.version, 'regex', /^\d+\.\d$/)
            ) {
                throwMex(
                    'unicode.version',
                    getItemRef(item),
                    'The property must be a version string with a decimal (Ex. `1.0`)'
                );
            }
        }

        if (!Object.prototype.hasOwnProperty.call(item.unicode, 'ranges')) {
            throwMex('unicode.ranges', getItemRef(item), 'Required property is missing');
        }
        if (!requirements(item.unicode.ranges, 'mustBeArray')) {
            throwMex('unicode.ranges', getItemRef(item), 'The property must be an array');
        }

        const ranges = [];
        const normalizedRanges = [];
        for (const [idx, range] of item.unicode.ranges.entries()) {
            if (
                !requirements(range, 'mustBeArray') ||
                !requirements(range, 'cannotBeEmpty')
            ) {
                throwMex('unicode.ranges.' + idx, getItemRef(item), 'The property must be a not empty array');
            }
            if (range.length < 1 || range.length > 2) {
                throwMex('unicode.ranges.' + idx, getItemRef(item), 'The property must have 1 or 2 elements');
            }
            let checkOrder;
            let intStart = null;
            let intEnd = null;
            for (const [idEntry, entryRaw] of range.entries()) {
                const entry = entryRaw.toUpperCase();
                if (
                    !requirements(entry, 'mustBeString') ||
                    !requirements(entry, 'regex', /^(?:[0-9A-F]{4,5}|10[0-9A-F]{4})$/)
                ) {
                    throwMex(
                        'unicode.ranges.' + idx,
                        getItemRef(item),
                        'The property has an element that does not match with the unicode pattern'
                    );
                }
                const intEntry = parseInt(entry, 16);
                if (idEntry === 0) {
                    checkOrder = intEntry;
                    intStart = intEntry;
                } else {
                    if (intEntry < checkOrder) {
                        throwMex(
                            'unicode.ranges.' + idx,
                            getItemRef(item),
                            'The property has not correctly ordered elements'
                        );
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
            throwMex('unicode.ranges', getItemRef(item), 'The property has overlapping ranges');
        }
        if (!requirements(item.unicode.totalCodePoints, 'mustBePositiveIntegerOrZero')) {
            throwMex(
                'unicode.totalCodePoints',
                getItemRef(item),
                'The property must be null or a positive integer greater then zero'
            );
        }
        if (totalCodePoints !== item.unicode.totalCodePoints) {
            throwMex(
                'unicode.totalCodePoints',
                getItemRef(item),
                'The property value (' + item.unicode.totalCodePoints + ') mismatch with the calculated point '
                + 'from the ranges (' + totalCodePoints + ').'
            );
        }

        item.unicode.ranges = ranges;
    }
}

function buildScriptsOutput(items) {
    const out = [];
    for (const item of items) {
        out.push({
            code: item.code,
            numeric: item.numeric,
            writingDirection: {
                code: item.writingDirection
            },
            unicode: item.unicode
        });
    }
    return sortList(out, mainKey);
}

export async function parseScriptsDataModular(data, configBuild) {
    logPhaseStart('Schema-driven parser started');
    validateMainKey(data);
    validateCode(data);
    validateNumeric(data);
    validateWritingDirection(data, configBuild);
    validateUnicode(data);
    const sorted = buildScriptsOutput(Object.values(data));
    logPhaseDone('Schema-driven parser completed');
    return sorted;
}

export async function parseScriptsTranslationsModular(data, defaultLanguage = 'en', scripts = []) {
    return parseTranslationsMandatoryByKeys({
        data,
        defaultLanguage,
        sourceRows: scripts,
        mainKey,
        mandatoryProps: scriptsSchemaConfig.translations.mandatoryStringProps,
        collection,
        collectionItem,
        logCollection: collection
    });
}

export async function parseScriptsTranslationsCategoriesModular(data, defaultLanguage = 'en', configBuild) {
    const rules = scriptsSchemaConfig.translationsCategories;
    return parseTranslationsCategoriesByRoots({
        data,
        defaultLanguage,
        roots: [{ rootKey: rules.rootKey, enumPath: rules.enumPath }],
        configBuild,
        collection,
        collectionItem,
        logCollection: collection,
        schemaErrorPrefix: 'scripts'
    });
}
