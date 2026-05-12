import chalk from 'chalk';
import { errorMessage, refactorLanguages, requirements } from '../utils.js';
import { configSchemaConfig } from '../configConfigSchema.js';

const collection = 'Config';

function throwMex(prop, message) {
    throw new Error(errorMessage('main', collection, null, null, prop, message));
}

function validateObjectField(parent, key, propPath, rule) {
    if (rule.required && !Object.prototype.hasOwnProperty.call(parent, key)) {
        throwMex(propPath, 'Required property is missing');
    }
    if (
        !requirements(parent[key], 'mustBeObject') ||
        (rule.cannotBeEmpty && !requirements(parent[key], 'cannotBeEmpty'))
    ) {
        throwMex(propPath, 'The property must be a not empty object');
    }
}

function normalizeLanguageCode(lang, propPath) {
    if (!requirements(lang, 'mustBeString')) {
        throwMex(propPath, 'The property must be a string');
    }
    const normalized = refactorLanguages(lang);
    if (normalized === 'error' || !requirements(normalized, 'bcp47')) {
        throwMex(propPath, `The value for the property (${normalized}) non-compliant with BCP 47 format`);
    }
    if (!Intl.Collator.supportedLocalesOf([normalized]).length) {
        throwMex(
            propPath,
            `The value for the property (${normalized}) is not supported by the International Components for Unicode`
        );
    }
    return normalized;
}

export const configFunctions = {

    DataParse: async data => {
        if (!requirements(data, 'mustBeObject')) {
            throwMex('root', 'The property must be a not empty object');
        }

        validateObjectField(data, 'settings', 'settings', configSchemaConfig.settings);
        validateObjectField(data.settings, 'languages', 'settings.languages', configSchemaConfig.languages);

        const fields = configSchemaConfig.fields;
        const languages = data.settings.languages;

        if (fields.inPackage.required && !Object.prototype.hasOwnProperty.call(languages, 'inPackage')) {
            throwMex('settings.languages.inPackage', 'Required property is missing');
        }
        if (!requirements(languages.inPackage, 'mustBeArray')) {
            throwMex('settings.languages.inPackage', 'The property must be an  array');
        }

        const inPackage = [];
        for (const [index, lang] of languages.inPackage.entries()) {
            inPackage.push(normalizeLanguageCode(lang, `settings.languages.inPackage.${index}`));
        }

        if (fields.default.required && !Object.prototype.hasOwnProperty.call(languages, 'default')) {
            throwMex('settings.languages.default', 'Required property is missing');
        }
        const defaultLang = normalizeLanguageCode(languages.default, 'settings.languages.default');

        if (fields.default.mustBeIn === 'inPackage' && !inPackage.includes(defaultLang)) {
            throwMex(
                'settings.languages.default',
                'The property value must be present in the `settings.languages.inPackage` array'
            );
        }

        const configOut = {
            settings: {
                languages: {
                    default: defaultLang,
                    inPackage
                }
            }
        };

        console.log(chalk.cyan(`         - Main data for \`${collection}\` parsed`));
        return configOut;
    }
};
