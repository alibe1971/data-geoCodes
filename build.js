import chalk from 'chalk';
import {readJsonFile, cleanDir, checkDir, cloneDir} from './Lib/utils.js';
import { configBuild } from './Lib/configBuild.js';

let APP = {
    config: {},
    data: {},
    TranslationDir: configBuild.TranslationDir,
    translations: {},
    exports: {}
};

(async function() {
    try {
        APP['config'] = await readJsonFile(configBuild.readPaths.origin + 'Config.json');
        console.log(chalk.yellow('   - DATA PARSING'));
        for (const [key, functions] of Object.entries(configBuild.appData)) {
            console.log(chalk.magenta('      - Begin to parse `' + key + '` data'));
            APP.data[key] = await functions.DataParse(
                await readJsonFile(configBuild.readPaths.origin + key + '.json'),
                configBuild.readPaths.origin
            );
            let translationData = {};
            for (const lang of Object.keys(APP['config'].settings.languages.inPackage)) {
                translationData[lang] = {};
                for (const [transKey, transObj] of Object.entries(configBuild.TranslationData[key])) {
                    translationData[lang][transKey] = await readJsonFile(
                        configBuild.readPaths.origin + configBuild.TranslationDir + lang + '/' + transObj + '.json'
                    );
                }
            }
            APP.translations[key] = await functions.DataTranslations(translationData);
            console.log(chalk.green('      - Data `' + key + '` parsing completed with success'));
        }
        console.log(chalk.green('   - DATA PARSING SUCCEDED'));

        console.log(chalk.yellow('   - DATA FILE WRITING'));
        for (const [app, functions] of Object.entries(configBuild.Apps)) {
            console.log(chalk.magenta('      - Begin to write the `' + app + '` data'));
            await cleanDir(
                configBuild.readPaths.destin + app,
                '/' + configBuild.TranslationDir + '/',
                Object.keys(APP['config'].settings.languages.inPackage)
            );
            console.log(chalk.cyan('         - The `' + app + '` directory has now been cleaned'));
            await functions.save(configBuild.readPaths.destin + app + '/', APP);
            console.log(chalk.green('      - The writing of the `' + app + '` data has been successfully ended'));
        }
        console.log(chalk.green('   - DATA FILE WRITTEN SUCCESSFULLY'));

        console.log(chalk.green('   - BEGIN DATA EXPORT'));
        APP['exports'] = await readJsonFile('exportConfig.json');
        for (const [app, paths] of Object.entries(APP['exports'])) {
            if (!configBuild.Apps.hasOwnProperty(app)) {
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
                if (!await checkDir(path)) {
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

        console.log(chalk.green('PROCESS COMPLETED WITH SUCCESS'));
    } catch (err) {
        console.error(chalk.red(err));
    }
})();

console.log(chalk.green('PROCESS BEGIN'));
