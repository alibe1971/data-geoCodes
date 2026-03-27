import chalk from 'chalk';
import { writeFile } from '../utils.js';
import yaml from 'js-yaml';

/**
 * Options for the YAML creation
 */
const yamlOptions = {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false
};

export const saveDataForYaml = {

    save: async (destination, completeData) => {
        /** Configuration **/
        let yamlData = yaml.dump(completeData.config, yamlOptions);
        await writeFile(destination + 'config.yaml', yamlData );

        /** Main Data **/
        for (const [key, data] of Object.entries(completeData.data)) {
            yamlData = yaml.dump(data, yamlOptions);
            await writeFile(destination + key + '.yaml', yamlData );
            console.log(chalk.cyan('         - Main data for `yaml` app for `' + key + '` has been written'));

            /** Translations Data **/
            for (const [lang, dataTrans] of Object.entries(completeData.translations[key])) {
                yamlData = yaml.dump(dataTrans, yamlOptions);
                await writeFile(destination + completeData.TranslationDir + lang + '/' + key + '.yaml', yamlData);
                console.log(
                    chalk.cyan(
                        '         - Translations language data `' + lang + '` for `yaml` app for `' + key +
                        '` has been written'
                    )
                );
            }

            /** Translations Categories Data **/
            if (Object.prototype.hasOwnProperty.call(completeData.translationsCategories, key)) {
                for (const [lang, dataCatTrans] of Object.entries(completeData.translationsCategories[key])) {
                    yamlData = yaml.dump(dataCatTrans, yamlOptions);
                    await writeFile(destination + completeData.TranslationDir + lang + '/'
                        + completeData.TranslationCategoriesDir + key + '.yaml', yamlData );
                    console.log(
                        chalk.cyan(
                            '         - Translations Categories language data `' + lang +'` for `yaml` app for `'
                            + key + '` has been written'
                        )
                    );
                }
            }
        }
    },
};

