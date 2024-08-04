import chalk from 'chalk';

let Languages = [];
let Translations = {};

export const languagesFunctions = {
    DataParse: async (data, dataDir) => {
        // eslint-disable-next-line no-unused-vars
        const unusedData = data;
        // eslint-disable-next-line no-unused-vars
        const unusedDir = dataDir;

        console.log(chalk.cyan('         - Main data for `Languages` parsed'));
        return Languages;
    },

    DataTranslations: async (data, defaultLanguage = 'en') => {
        // eslint-disable-next-line no-unused-vars
        const unused = defaultLanguage;

        for (const [lang, langObjs] of Object.entries(data)) {
            Translations[lang] = langObjs.name;
            console.log(chalk.cyan('         - Translation language `' + lang + '` data for `languages` parsed'));
        }
        return Translations;
    }
};

