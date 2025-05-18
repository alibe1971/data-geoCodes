import chalk from 'chalk';
import { writeFile } from '../utils.js';
import yaml from 'js-yaml';

export const saveDataForYaml = {
    save: async (destination, completeData) => {
        /** Configuration **/
        let yamlData = yaml.dump(completeData.config);
        await writeFile(destination + 'config.yaml', yamlData );

        /** Main Data **/
        for (const [key, data] of Object.entries(completeData.data)) {
            // yamlData = saveDataForYaml.build(key, data);
            yamlData = yaml.dump(data);
            await writeFile(destination + key + '.yaml', yamlData );
            console.log(chalk.cyan('         - Main data for `yaml` app for `' + key + '` has been written'));

            /** Translations Data **/
            for (const [lang, dataTrans] of Object.entries(completeData.translations[key])) {
                // yamlData = saveDataForYaml.build(key, dataTrans);
                yamlData = yaml.dump(dataTrans);
                await writeFile(destination + completeData.TranslationDir + lang + '/' + key + '.yaml', yamlData);
                console.log(
                    chalk.cyan(
                        '         - Translations language data `' + lang + '` for `yaml` app for `' + key +
                        '` has been written'
                    )
                );
            }
        }
        return;
    },
};

