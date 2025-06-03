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
    extra: {}
};



(async function build() {
    Object.keys(require.cache).forEach(function(key) {
        delete require.cache[key];
    });

    await (async function extra() {
        if (checkFile('buildConfig.json')) {
            APP['extra'] = await readJsonFile('buildConfig.json');
        }

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
        for (const lang of APP['config'].settings.languages.inPackage) {
            translationData[lang] = {};
            for (const [transKey, transObj] of Object.entries(configBuild.TranslationData[key])) {
                translationData[lang][transKey] = await readJsonFile(
                    configBuild.readPaths.origin + configBuild.TranslationDir + lang + '/' + transObj + '.json'
                );
            }
        }
        APP.translations[key] = await functions.DataTranslations(
            translationData,
            APP['config'].settings.languages.default
        );
        console.log(chalk.green('      - Data `' + key + '` parsing completed with success'));
    }
    console.log(chalk.green('   - DATA PARSING SUCCEDED'));

    console.log(chalk.yellow('   - DATA FILE WRITING'));
    for (const [app, functions] of Object.entries(configBuild.Apps)) {
        console.log(chalk.magenta('      - Begin to write the `' + app + '` data'));
        await cleanDir(
            configBuild.readPaths.destin + app,
            '/' + configBuild.TranslationDir + '/',
            APP['config'].settings.languages.inPackage
        );
        console.log(chalk.cyan('         - The `' + app + '` directory has now been cleaned'));
        await functions.save(configBuild.readPaths.destin + app + '/', APP);
        console.log(chalk.green('      - The writing of the `' + app + '` data has been successfully ended'));
    }
    console.log(chalk.green('   - DATA FILE WRITTEN SUCCESSFULLY'));

    if ( !requirements(Object.keys(APP['extra'].exportDataDirs, 'cannotBeEmpty'))) {
        console.log(chalk.green('   - BEGIN DATA EXPORT'));
        for (const [app, paths] of Object.entries(APP['extra'].exportDataDirs)) {
            if (!Object.prototype.hasOwnProperty.call(configBuild.Apps, app)) {
                console.log(chalk.red('         - The `' + app + '` is not part in this project. Skipping ...'));
                continue;
            }
            if (paths.length == 0) {
                console.log(chalk.red('         - The `' + app + '` has no path where execute the export. ' +
                    'Skipping ...'));
                continue;
            }
            console.log(chalk.magenta('         - Exporting the `' + app + '` data ...'));
            for(const path of paths) {
                if (
                    typeof path !== "string" ||
                    path.length == 0 ||
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
        console.log(chalk.yellow('   - DATA EXPORTATION JUMPED (no extra directories defined in `buildConfig.json`)'));
    }

    console.log(chalk.green('PROCESS COMPLETED WITH SUCCESS'));

})().catch(err => {
    console.error(chalk.red(err));
    process.exit(1);
});


console.log(chalk.green('PROCESS BEGIN'));