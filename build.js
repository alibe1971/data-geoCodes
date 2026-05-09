import chalk from 'chalk';
import {checkFile, readJsonFile, cleanDir, checkDir, cloneDir, requirements} from './Lib/utils.js';
import { configBuild } from './Lib/configBuild.js';
import { createRequire } from 'module';


const require = createRequire(import.meta.url);

let APP = {
    config: {},
    data: {},
    TranslationDir: configBuild.TranslationDir,
    translations: {},
    TranslationCategoriesDir: configBuild.TranslationCategoriesDir,
    translationsCategories: {},
    extra: {}
};

const BUILD_CONFIG_BASE = 'buildConfig.example.json';
const BUILD_CONFIG_FALLBACK = 'buildConfig.json';
const BUILD_CONFIG_LOCAL = 'buildConfig.local.json';

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

const deepMerge = (base, override) => {
    if (!isObject(base) || !isObject(override)) {
        return override;
    }
    const result = { ...base };
    for (const [key, value] of Object.entries(override)) {
        if (isObject(value) && isObject(base[key])) {
            result[key] = deepMerge(base[key], value);
            continue;
        }
        result[key] = value;
    }
    return result;
};

const collectUnknownKeys = (reference, candidate, prefix = '') => {
    if (!isObject(reference) || !isObject(candidate)) {
        return [];
    }
    let unknown = [];
    for (const [key, value] of Object.entries(candidate)) {
        const path = prefix.length ? `${prefix}.${key}` : key;
        if (!Object.prototype.hasOwnProperty.call(reference, key)) {
            unknown.push(path);
            continue;
        }
        unknown = unknown.concat(collectUnknownKeys(reference[key], value, path));
    }
    return unknown;
};

const loadExtraConfig = async () => {
    let config = {};

    if (checkFile(BUILD_CONFIG_BASE)) {
        console.log(chalk.cyan('   - Loading build base config from `' + BUILD_CONFIG_BASE + '`'));
        config = await readJsonFile(BUILD_CONFIG_BASE);
    }

    if (checkFile(BUILD_CONFIG_FALLBACK)) {
        console.log(chalk.cyan('   - Applying build override from `' + BUILD_CONFIG_FALLBACK + '`'));
        config = deepMerge(config, await readJsonFile(BUILD_CONFIG_FALLBACK));
    }

    if (checkFile(BUILD_CONFIG_LOCAL)) {
        console.log(chalk.cyan('   - Applying local build override from `' + BUILD_CONFIG_LOCAL + '`'));
        const localConfig = await readJsonFile(BUILD_CONFIG_LOCAL);
        const unknownLocalKeys = collectUnknownKeys(config, localConfig);
        if (unknownLocalKeys.length > 0) {
            console.log(
                chalk.yellow(
                    '   - WARNING: unknown keys in `buildConfig.local.json`: '
                    + unknownLocalKeys.join(', ')
                )
            );
        }
        config = deepMerge(config, localConfig);
    }

    return config;
};



(async function build() {
    Object.keys(require.cache).forEach(function(key) {
        delete require.cache[key];
    });

    await (async function extra() {
        APP['extra'] = await loadExtraConfig();

        /** extra.countries.flagsSvgFormat */
        if(
            !Object.prototype.hasOwnProperty.call(APP['extra'], 'flagsSvgFormat') ||
            typeof APP['extra'].flagsSvgFormat != 'string' ||
            !configBuild.extra.countries.flags.enumSvgFormat.includes(APP['extra'].flagsSvgFormat)
        ) {
            APP['extra'].flagsSvgFormat = configBuild.extra.countries.flags.defaultSvgFormat;
        }
        configBuild.extra.countries.flags.chosenSvgFormat = APP['extra'].flagsSvgFormat;

        /** extra.exportDataDirs */
        if(
            !Object.prototype.hasOwnProperty.call(APP['extra'], 'exportDataDirs') ||
            !requirements(APP['extra'].exportDataDirs, 'mustBeObject')
        ) {
            APP['extra'].exportDataDirs = {};
        }
    })();

    console.log(chalk.yellow('   - DATA PARSING'));

    console.log(chalk.magenta('      - Begin to parse `config` data'));
    APP['config'] = await configBuild.configFunctions.DataParse(
        await readJsonFile(configBuild.readPaths.origin + 'config.json')
    );
    console.log(chalk.green('      - Data `Config` parsing completed with success'));
    for (const [key, functions] of Object.entries(configBuild.appData)) {
        console.log(chalk.magenta('      - Begin to parse `' + key + '` data'));
        APP.data[key] = await functions.DataParse(
            await readJsonFile(configBuild.readPaths.origin + key + '.json')
        );

        let translationData = {};
        let translationCategoriesData = {};
        for (const lang of APP['config'].settings.languages.inPackage) {
            translationData[lang] = {};
            translationData[lang] = await readJsonFile(
                configBuild.readPaths.origin + configBuild.TranslationDir + lang + '/' + key + '.json'
            );
            if (configBuild.extra[key].hasCategories === true) {
                translationCategoriesData[lang] = {};
                translationCategoriesData[lang] = await readJsonFile(
                    configBuild.readPaths.origin + configBuild.TranslationDir + lang + '/'
                    + configBuild.TranslationCategoriesDir + key + '.json'
                );
            }
        }
        APP.translations[key] = await functions.DataTranslations(
            translationData,
            APP['config'].settings.languages.default
        );
        if (configBuild.extra[key].hasCategories === true) {
            APP.translationsCategories[key] = await functions.DataTranslationsCategories(
                translationCategoriesData,
                APP['config'].settings.languages.default
            );
        }

        console.log(chalk.green('      - Data `' + key + '` parsing completed with success'));
    }
    console.log(chalk.green('   - DATA PARSING SUCCEDED'));

    console.log(chalk.yellow('   - DATA FILE WRITING'));
    for (const [app, functions] of Object.entries(configBuild.Apps)) {
        console.log(chalk.magenta('      - Begin to write the `' + app + '` data'));
        await cleanDir(
            configBuild.readPaths.destin + app,
            '/' + configBuild.TranslationDir + '/',
            '/' +configBuild.TranslationCategoriesDir,
            APP['config'].settings.languages.inPackage
        );
        console.log(chalk.cyan('         - The `' + app + '` directory has now been cleaned'));
        await functions.save(configBuild.readPaths.destin + app + '/', APP);
        console.log(chalk.green('      - The writing of the `' + app + '` data has been successfully ended'));
    }
    console.log(chalk.green('   - DATA FILE WRITTEN SUCCESSFULLY'));

    if ( requirements(Object.keys(APP['extra'].exportDataDirs), 'cannotBeEmpty')) {
        console.log(chalk.green('   - BEGIN DATA EXPORT'));
        for (const [app, paths] of Object.entries(APP['extra'].exportDataDirs)) {
            if (!Object.prototype.hasOwnProperty.call(configBuild.Apps, app)) {
                console.log(chalk.red('         - The `' + app + '` is not part in this project. Skipping ...'));
                continue;
            }
            if (paths.length === 0) {
                console.log(chalk.red('         - The `' + app + '` has no path where execute the export. ' +
                    'Skipping ...'));
                continue;
            }
            console.log(chalk.magenta('         - Exporting the `' + app + '` data ...'));
            for(const path of paths) {
                if (
                    typeof path !== "string" ||
                    path.length === 0 ||
                    !await checkDir(path)
                ) {
                    console.log(chalk.red('            - The directory `' + path +
                        '` for the app `' + app + '` does not exist. Skipping ...'));
                    continue;
                }
                try {
                    await cloneDir(configBuild.readPaths.destin + app, path);
                    console.log(chalk.cyan('            - The `' + app + '` data successfully exported in `' +
                        path + '`'));
                } catch (e) {
                    console.log(chalk.red('            - The cloning operation in the directory `' + path +
                        '` for the app `' + app + '` returned with this error:`' + e + '`. Skipping ...'));
                }
            }
        }

        console.log(chalk.green('   - DATA EXPORTATION TERMINATED'));

    } else {
        console.log(chalk.yellow('   - DATA EXPORTATION JUMPED (no extra directories defined in build config)'));
    }

    console.log(chalk.green('PROCESS COMPLETED WITH SUCCESS'));

})().catch(err => {
    console.error(chalk.red(err));
    process.exit(1);
});


console.log(chalk.green('PROCESS BEGIN'));
