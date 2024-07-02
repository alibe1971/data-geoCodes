import chalk from 'chalk';
import { readJsonFile, cleanDir } from './Lib/utils.js';
import { configBuild } from './Lib/configBuild.js';

let APP = {
    config: {},
    data: {},
    TranslationDir: configBuild.TranslationDir,
    translations: {}
};

(async function() {
    try {
        APP['config'] = await readJsonFile(configBuild.readPaths.origin + 'Config.json');
        console.log(chalk.yellow('   - DATA PARSING'));
        for (const [key, functions] of Object.entries(configBuild.appData)) {
            console.log(chalk.magenta('      - Begin to parse `' + key + '` data'));
            APP.data[key] = await functions.DataParse(await readJsonFile(configBuild.readPaths.origin + key + '.json'));
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

        console.log(chalk.green('PROCESS COMPLETED WITH SUCCESS'));
    } catch (err) {
        console.error(chalk.red(err));
    }
})();

console.log(chalk.green('PROCESS BEGIN'));
