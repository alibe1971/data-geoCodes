import chalk from 'chalk';
import { writeFile } from '../utils.js';


export const saveDataForJson = {
    save: async (destination, completeData) => {
        /** Configuration **/
        let jsonData = JSON.stringify(completeData.config, null, 4);
        let jsonMinData = JSON.stringify(completeData.config);
        await writeFile(destination + 'config.json', jsonData );
        await writeFile(destination + 'config.min.json', jsonMinData );

        /** Main Data **/
        for (const [key, data] of Object.entries(completeData.data)) {
            jsonData = JSON.stringify(data, null, 4);
            jsonMinData = JSON.stringify(data);
            await writeFile(destination + key + '.json', jsonData );
            await writeFile(destination + key + '.min.json', jsonMinData );
            console.log(chalk.cyan('         - Main data for `json` app for `' + key + '` has been written'));

            /** Translations Data **/
            for (const [lang, dataTrans] of Object.entries(completeData.translations[key])) {
                jsonData = JSON.stringify(dataTrans, null, 4);
                jsonMinData = JSON.stringify(dataTrans);
                await writeFile(destination + completeData.TranslationDir + lang + '/' + key + '.json', jsonData );
                await writeFile(
                    destination + completeData.TranslationDir + lang + '/' + key + '.min.json', jsonMinData
                );
                console.log(
                    chalk.cyan(
                        '         - Translations language data `' + lang +'` for `json` app for `' + key +
                        '` has been written'
                    )
                );
            }
        }
        return;
    }
};

