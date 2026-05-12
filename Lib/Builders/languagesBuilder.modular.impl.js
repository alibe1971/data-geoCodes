import {
    requirements,
    sortList
} from '../utils.js';
import { languagesSchemaConfig } from '../configLanguagesSchema.js';
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

const mainKey = languagesSchemaConfig.mainKey;
const mainKeyRules = languagesSchemaConfig.mainKeyRules;
const collection = 'Languages';
const collectionItem = 'Language';

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

function validateSimpleStringProp(data, propName, errorMessageText) {
    const rules = languagesSchemaConfig.rules[propName];
    logDetail(`validating property '${propName}'`);
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, propName)) {
            if (Object.prototype.hasOwnProperty.call(rules, 'defaultValue')) {
                item[propName] = rules.defaultValue;
                continue;
            }
            throwMex(propName, getItemRef(item), 'Required property is missing');
        }
        if (item[propName] === null) {
            continue;
        }
        if (!checkBySchemaRule(item[propName], rules) || (rules.regex && !rules.regex.test(item[propName]))) {
            throwMex(propName, getItemRef(item), errorMessageText);
        }
        if (rules.normalize === 'lower') {
            item[propName] = item[propName].toLowerCase();
        } else if (rules.normalize === 'upper') {
            item[propName] = item[propName].toUpperCase();
        }
    }
}

function validateEnumString(data, propName, configBuild) {
    const rules = languagesSchemaConfig.rules[propName];
    const enumValues = getByDotPath(configBuild, rules.enumPath);
    if (!Array.isArray(enumValues)) {
        throwMex(propName, collectionItem, `Invalid schema: enum path '${rules.enumPath}' is not a list`);
    }
    const enumPattern = new RegExp(`^(?:${enumValues.join('|')})$`);
    const available = '`' + enumValues.join('`, `') + '`';

    logDetail(`validating property '${propName}'`);
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, propName)) {
            throwMex(propName, getItemRef(item), 'Required property is missing');
        }
        if (!checkBySchemaRule(item[propName], rules)) {
            throwMex(
                propName,
                getItemRef(item),
                'The property must be 1 char length string inside the fixed defined values (' + available + ')'
            );
        }
        item[propName] = rules.normalize === 'upper' ? item[propName].toUpperCase() : item[propName];
        if (!requirements(item[propName], 'regex', enumPattern)) {
            throwMex(
                propName,
                getItemRef(item),
                'The property must be 1 char length string inside the fixed defined values (' + available + ')'
            );
        }
    }
}

function validateScriptsList(data) {
    const rules = languagesSchemaConfig.rules.scripts;
    logDetail("validating property 'scripts'");
    for (const item of Object.values(data)) {
        if (!Object.prototype.hasOwnProperty.call(item, 'scripts')) {
            item.scripts = rules.defaultValue ?? [];
        }
        if (!requirements(item.scripts, 'mustBeArray')) {
            throwMex('scripts', getItemRef(item), 'The property must be an array');
        }
        const list = [];
        for (const [idx, script] of item.scripts.entries()) {
            if (!requirements(script, 'mustBeString') || !rules.regex.test(script)) {
                throwMex(
                    'scripts.' + idx,
                    getItemRef(item),
                    'The property must be null or 4 chars length alphabetical string'
                );
            }
            const normalized = script.charAt(0).toUpperCase() + script.slice(1).toLowerCase();
            list.push(normalized);
        }
        item.scripts = rules.dedupeWithinList ? [...new Set(list)] : list;
    }
}

function buildLanguagesOutput(items) {
    const out = [];
    for (const item of items) {
        out.push({
            isoCode: item.isoCode,
            part2b: item.part2b,
            part2t: item.part2t,
            part1: item.part1,
            glottoCode: item.glottoCode,
            scope: {
                code: item.scope
            },
            type: {
                code: item.type
            },
            macroLanguageRef: item.macroLanguageRef,
            scripts: item.scripts
        });
    }
    return sortList(out, mainKey);
}

export async function parseLanguagesDataModular(data, configBuild) {
    logPhaseStart('Schema-driven parser started');
    validateMainKey(data);
    validateSimpleStringProp(data, 'isoCode', 'The property must be 3 chars length alphabetical string');
    validateSimpleStringProp(data, 'part2b', 'The property must be null or 3 chars length alphabetical string');
    validateSimpleStringProp(data, 'part2t', 'The property must be null or 3 chars length alphabetical string');
    validateSimpleStringProp(data, 'part1', 'The property must be null or 2 chars length alphabetical string');
    validateSimpleStringProp(
        data,
        'glottoCode',
        'The property must be null or 2 chars length and 4 numbers length alphabetical string'
    );
    validateEnumString(data, 'scope', configBuild);
    validateEnumString(data, 'type', configBuild);
    validateSimpleStringProp(
        data,
        'macroLanguageRef',
        'The property must be null or 3 chars length alphabetical string'
    );
    validateScriptsList(data);
    const sorted = buildLanguagesOutput(Object.values(data));
    logPhaseDone('Schema-driven parser completed');
    return sorted;
}

export async function parseLanguagesTranslationsModular(data, defaultLanguage = 'en', languages = []) {
    return parseTranslationsMandatoryByKeys({
        data,
        defaultLanguage,
        sourceRows: languages,
        mainKey,
        mandatoryProps: languagesSchemaConfig.translations.mandatoryStringProps,
        collection,
        collectionItem,
        logCollection: collection
    });
}

export async function parseLanguagesTranslationsCategoriesModular(data, defaultLanguage = 'en', configBuild) {
    const rules = languagesSchemaConfig.translationsCategories;
    return parseTranslationsCategoriesByRoots({
        data,
        defaultLanguage,
        roots: rules.roots,
        configBuild,
        collection,
        collectionItem,
        logCollection: collection,
        schemaErrorPrefix: 'languages'
    });
}
