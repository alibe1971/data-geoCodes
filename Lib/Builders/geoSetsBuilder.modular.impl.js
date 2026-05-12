import {
    requirements,
    sortList
} from '../utils.js';
import { geoSetsSchemaConfig } from '../configGeoSetsSchema.js';
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

const mainKey = geoSetsSchemaConfig.mainKey;
const mainKeyRules = geoSetsSchemaConfig.mainKeyRules;
const collection = 'GeoSets';
const collectionItem = 'GeoSet';

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

function validateInternalCode(data, configBuild) {
    const rules = geoSetsSchemaConfig.rules.internalCode;
    const macroAllowed = getByDotPath(configBuild, rules.macroAllowedPath);
    if (!Array.isArray(macroAllowed)) {
        throwMex('internalCode', collectionItem, 'Invalid schema: macro allowed path is not a list');
    }

    logDetail("validating property 'internalCode'");
    for (const item of Object.values(data)) {
        if (!checkBySchemaRule(item.internalCode, rules) || !rules.regex.test(item.internalCode)) {
            throwMex(
                'internalCode',
                getItemRef(item),
                'The property must be a string, having from 2 to 4 alphanumeric sequences separated by an hyphen.'
            );
        }
        item.internalCode = item.internalCode.toUpperCase();
        const macroSet = item.internalCode.split('-')[0];
        if (!macroAllowed.includes(macroSet)) {
            throwMex(
                'internalCode',
                getItemRef(item),
                'The property must begin with one of this (' + macroAllowed + ')'
            );
        }
    }
}

function validateUnM49(data) {
    const rules = geoSetsSchemaConfig.rules.unM49;
    logDetail("validating property 'unM49'");
    for (const item of Object.values(data)) {
        const macroSet = item.internalCode.split('-')[0];
        if (!Object.prototype.hasOwnProperty.call(item, 'unM49')) {
            item.unM49 = rules.defaultValue ?? null;
        }
        if (item.unM49 !== null) {
            item.unM49 = item.unM49.toString().padStart(rules.padStart ?? 3, '0');
            if (!rules.regex.test(item.unM49)) {
                throwMex('unM49', getItemRef(item), 'The property must be 3 chars length numeric string');
            }
            if (macroSet !== 'GEOG') {
                throwMex('unM49', getItemRef(item), 'The property must be null for sets that not belong to `GEOG`');
            }
        } else if (macroSet === 'GEOG') {
            throwMex('unM49', getItemRef(item), 'The property cannot be null for sets that belong to `GEOG`');
        }
    }
}

function validateScope(data, configBuild) {
    const rules = geoSetsSchemaConfig.rules.scope;
    const enumValues = getByDotPath(configBuild, rules.enumPath);
    if (!Array.isArray(enumValues)) {
        throwMex('scope', collectionItem, 'Invalid schema: scope enum path is not a list');
    }
    const enumPattern = new RegExp(`^(?:${enumValues.join('|')})$`);
    const available = '`' + enumValues.join('`, `') + '`';

    logDetail("validating property 'scope'");
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, 'scope')) {
            throwMex('scope', getItemRef(item), 'Required property is missing');
        }
        if (!checkBySchemaRule(item.scope, rules)) {
            throwMex(
                'scope',
                getItemRef(item),
                'The property must be 1 char length string inside the fixed defined values (' + available + ')'
            );
        }
        item.scope = rules.normalize === 'upper' ? item.scope.toUpperCase() : item.scope;
        if (!requirements(item.scope, 'regex', enumPattern)) {
            throwMex(
                'scope',
                getItemRef(item),
                'The property must be 1 char length string inside the fixed defined values (' + available + ')'
            );
        }
        const macroSet = item.internalCode.split('-')[0];
        if (macroSet !== item.scope) {
            throwMex(
                'scope',
                getItemRef(item),
                'The property value must match with the first element of the internalCode'
            );
        }
    }
}

function validateStringList(data, propName, errorText) {
    const rules = geoSetsSchemaConfig.rules[propName];
    logDetail(`validating property '${propName}'`);
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, propName)) {
            throwMex(propName, getItemRef(item), 'Required property is missing');
        }
        if (
            !requirements(item[propName], 'mustBeArray') ||
            (!rules.canBeEmpty && !requirements(item[propName], 'cannotBeEmpty'))
        ) {
            throwMex(propName, getItemRef(item), 'The property must be a not empty array');
        }
        const list = [];
        for (const value of item[propName]) {
            if (!requirements(value, 'mustBeString') || !rules.regex.test(value)) {
                throwMex(propName, getItemRef(item), errorText.replace('{value}', value));
            }
            let normalized = value;
            if (rules.normalize === 'lower') {
                normalized = value.toLowerCase();
            } else if (rules.normalize === 'upper') {
                normalized = value.toUpperCase();
            }
            list.push(normalized);
        }
        item[propName] = rules.dedupeWithinList ? [...new Set(list)] : list;
    }
}

function buildGeoSetsOutput(items) {
    const out = [];
    for (const item of items) {
        out.push({
            internalCode: item.internalCode,
            unM49: item.unM49,
            scope: {
                code: item.scope
            },
            tags: item.tags,
            countryCodes: item.countryCodes
        });
    }
    return sortList(out, mainKey);
}

export async function parseGeoSetsDataModular(data, configBuild) {
    logPhaseStart('Schema-driven parser started');
    validateMainKey(data);
    validateInternalCode(data, configBuild);
    validateUnM49(data);
    validateScope(data, configBuild);
    validateStringList(
        data,
        'tags',
        'The value of the tag `{value}` must be a single word string'
    );
    validateStringList(
        data,
        'countryCodes',
        'The value of countryCodes `{value}` must be 2 chars length alphabetical string'
    );
    const sorted = buildGeoSetsOutput(Object.values(data));
    logPhaseDone('Schema-driven parser completed');
    return sorted;
}

export async function parseGeoSetsTranslationsModular(data, defaultLanguage = 'en', geoSets = []) {
    return parseTranslationsMandatoryByKeys({
        data,
        defaultLanguage,
        sourceRows: geoSets,
        mainKey,
        mandatoryProps: geoSetsSchemaConfig.translations.mandatoryStringProps,
        collection,
        collectionItem,
        logCollection: collection
    });
}

export async function parseGeoSetsTranslationsCategoriesModular(data, defaultLanguage = 'en', configBuild) {
    const rules = geoSetsSchemaConfig.translationsCategories;
    return parseTranslationsCategoriesByRoots({
        data,
        defaultLanguage,
        roots: [{ rootKey: rules.rootKey, enumPath: rules.enumPath }],
        configBuild,
        collection,
        collectionItem,
        logCollection: collection,
        schemaErrorPrefix: 'geoSets'
    });
}
