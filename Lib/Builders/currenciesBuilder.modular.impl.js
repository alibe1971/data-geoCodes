import {
    requirements,
    sortList
} from '../utils.js';
import { currenciesSchemaConfig } from '../configCurrenciesSchema.js';
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

const mainKey = currenciesSchemaConfig.mainKey;
const mainKeyRules = currenciesSchemaConfig.mainKeyRules;
const collection = 'Currencies';
const collectionItem = 'Currency';

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

function validateIsoAlpha(data) {
    const rules = currenciesSchemaConfig.rules.isoAlpha;
    logDetail("validating property 'isoAlpha'");
    for (const item of Object.values(data)) {
        if (!checkBySchemaRule(item.isoAlpha, rules) || !rules.regex.test(item.isoAlpha)) {
            throwMex('isoAlpha', getItemRef(item), 'The property must be 3 chars length alphabetical string');
        }
        item.isoAlpha = rules.normalize === 'upper' ? item.isoAlpha.toUpperCase() : item.isoAlpha;
    }
}

function validateIsoNumber(data) {
    const rules = currenciesSchemaConfig.rules.isoNumber;
    logDetail("validating property 'isoNumber'");
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, 'isoNumber')) {
            throwMex('isoNumber', getItemRef(item), 'Required property is missing');
        }
        item.isoNumber = item.isoNumber.toString().padStart(rules.padStart ?? 3, '0');
        if (!/^\d{3}$/i.test(item.isoNumber)) {
            throwMex('isoNumber', getItemRef(item), 'The property must be 3 chars length numeric string');
        }
    }
}

function validateSymbol(data) {
    const rules = currenciesSchemaConfig.rules.symbol;
    logDetail("validating property 'symbol'");
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, 'symbol')) {
            item.symbol = rules.defaultValue ?? null;
        }
        if (!checkBySchemaRule(item.symbol, rules)) {
            throwMex('symbol', getItemRef(item), 'The property must be null or string');
        }
    }
}

function validateDecimal(data) {
    const rules = currenciesSchemaConfig.rules.decimal;
    logDetail("validating property 'decimal'");
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, 'decimal')) {
            item.decimal = rules.defaultValue ?? null;
        }
        if (item.decimal !== null && !checkBySchemaRule(item.decimal, rules)) {
            throwMex('decimal', getItemRef(item), 'The property must be null or a positive integer (zero included)');
        }
    }
}

function validateScope(data, configBuild) {
    const rules = currenciesSchemaConfig.rules.scope;
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
    }
}

function buildCurrenciesOutput(items) {
    const out = [];
    for (const item of items) {
        out.push({
            isoAlpha: item.isoAlpha,
            isoNumber: item.isoNumber,
            symbol: item.symbol,
            decimal: item.decimal,
            scope: {
                code: item.scope
            }
        });
    }
    return sortList(out, mainKey);
}

export async function parseCurrenciesDataModular(data, configBuild) {
    logPhaseStart('Schema-driven parser started');
    validateMainKey(data);
    validateIsoAlpha(data);
    validateIsoNumber(data);
    validateSymbol(data);
    validateDecimal(data);
    validateScope(data, configBuild);
    const sorted = buildCurrenciesOutput(Object.values(data));
    logPhaseDone('Schema-driven parser completed');
    return sorted;
}

export async function parseCurrenciesTranslationsModular(data, defaultLanguage = 'en', currencies = []) {
    return parseTranslationsMandatoryByKeys({
        data,
        defaultLanguage,
        sourceRows: currencies,
        mainKey,
        mandatoryProps: currenciesSchemaConfig.translations.mandatoryStringProps,
        collection,
        collectionItem,
        logCollection: collection
    });
}

export async function parseCurrenciesTranslationsCategoriesModular(data, defaultLanguage = 'en', configBuild) {
    const rules = currenciesSchemaConfig.translationsCategories;
    return parseTranslationsCategoriesByRoots({
        data,
        defaultLanguage,
        roots: [{ rootKey: rules.rootKey, enumPath: rules.enumPath }],
        configBuild,
        collection,
        collectionItem,
        logCollection: collection,
        schemaErrorPrefix: 'currencies'
    });
}
