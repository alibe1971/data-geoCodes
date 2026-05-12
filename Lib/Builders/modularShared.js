import chalk from 'chalk';
import {
    errorMessage,
    getTranslationMandatoryCategoryString,
    getTranslationMandatoryString
} from '../utils.js';
import { requirements } from '../utils.js';

const isVerbose = process.env.GEOCODES_LOG_VERBOSE === '1';

export function logPhaseStart(message) {
    console.log(chalk.magenta(`         - ${message}`));
}

export function logPhaseDone(message) {
    console.log(chalk.green(`         - ${message}`));
}

export function logDetail(message) {
    if (!isVerbose) {
        return;
    }
    console.log(chalk.cyan(`         - ${message}`));
}

export function getByDotPath(obj, path) {
    if (!path) {
        return undefined;
    }
    let cursor = obj;
    for (const segment of path.split('.')) {
        if (cursor === null || typeof cursor !== 'object' || !Object.prototype.hasOwnProperty.call(cursor, segment)) {
            return undefined;
        }
        cursor = cursor[segment];
    }
    return cursor;
}

export function createThrowMex(collection, collectionItem) {
    return (prop, item, message) => {
        throw new Error(errorMessage('main', collection, collectionItem, item, prop, message));
    };
}

export function createItemRefGetter(mainKey) {
    return item => {
        if (Object.prototype.hasOwnProperty.call(item, mainKey)) {
            return item[mainKey];
        }
        return JSON.stringify(item);
    };
}

export function validateMainKeyRequired(data, options) {
    const {
        mainKey,
        mainKeyRules,
        throwMex,
        getItemRef
    } = options;
    logDetail(`validating main key '${mainKey}'`);
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, mainKey)) {
            throwMex(mainKey, JSON.stringify(item), 'Required property is missing');
        }
        if (mainKeyRules.required !== true) {
            throwMex(mainKey, getItemRef(item), 'Invalid schema: mainKeyRules.required must be true');
        }
    }
}

export function parseTranslationsMandatoryByKeys({
    data,
    defaultLanguage = 'en',
    sourceRows = [],
    mainKey,
    mandatoryProps,
    collection,
    collectionItem,
    logCollection
}) {
    const out = {};
    for (const [lang, langObjs] of Object.entries(data)) {
        out[lang] = {};
        for (const row of Object.values(sourceRows)) {
            const key = row[mainKey];
            out[lang][key] = {};
            for (const prop of mandatoryProps) {
                out[lang][key][prop] =
                    (
                        getTranslationMandatoryString(
                            collection,
                            collectionItem,
                            key,
                            langObjs[key],
                            lang,
                            defaultLanguage,
                            prop
                        )
                    ) ?? '';
            }
        }
        if (logCollection) {
            logDetail(`translation language \`${lang}\` data for \`${logCollection}\` parsed`);
        }
    }
    return out;
}

export function parseTranslationsCategoriesByRoots({
    data,
    defaultLanguage = 'en',
    roots = [],
    configBuild,
    collection,
    collectionItem,
    logCollection,
    schemaErrorPrefix = 'schema-driven parser'
}) {
    const out = {};
    for (const [lang, langObjs] of Object.entries(data)) {
        out[lang] = {};
        for (const root of roots) {
            const enumValues = getByDotPath(configBuild, root.enumPath);
            if (!Array.isArray(enumValues)) {
                throw new Error(
                    `[${schemaErrorPrefix}] Invalid schema: translations category enum path `
                    + `'${root.enumPath}' is not a list`
                );
            }
            out[lang][root.rootKey] = {};
            for (const value of enumValues) {
                out[lang][root.rootKey][value] =
                    (
                        getTranslationMandatoryCategoryString(
                            collection,
                            collectionItem,
                            root.rootKey,
                            langObjs[root.rootKey],
                            lang,
                            defaultLanguage,
                            value
                        )
                    ) ?? '';
            }
        }
        logDetail(`translation language \`${lang}\` categories data for \`${logCollection}\` parsed`);
    }
    return out;
}

const SCHEMA_TYPE_TO_REQUIREMENT = {
    positiveIntegerNotZero: 'mustBePositiveIntegerNotZero',
    positiveIntegerOrZero: 'mustBePositiveIntegerOrZero',
    nullableString: 'mustBeStringOrNull',
    string: 'mustBeString',
    object: 'mustBeObject',
    array: 'mustBeArray'
};

const SCHEMA_KIND_TO_REQUIREMENT = {
    string: 'mustBeString',
    nullableString: 'mustBeStringOrNull',
    enumString: 'mustBeString',
    object: 'mustBeObject',
    stringList: 'mustBeArray',
    scriptCodeList: 'mustBeArray',
    localeList: 'mustBeArray',
    numericString: null,
    nullableNumericString: null,
    nullablePositiveIntegerOrZero: 'mustBePositiveIntegerOrZero'
};

export function checkBySchemaType(value, schemaType) {
    const requirementRule = SCHEMA_TYPE_TO_REQUIREMENT[schemaType];
    if (!requirementRule) {
        return false;
    }
    return requirements(value, requirementRule);
}

export function checkBySchemaRule(value, schemaRule) {
    if (!schemaRule || typeof schemaRule !== 'object') {
        return false;
    }
    if (schemaRule.type) {
        return checkBySchemaType(value, schemaRule.type);
    }
    const requirementRule = SCHEMA_KIND_TO_REQUIREMENT[schemaRule.kind];
    if (!requirementRule) {
        return true;
    }
    return requirements(value, requirementRule);
}
