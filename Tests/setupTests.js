

const rootDir = process.cwd();
global.builtPath = rootDir + '/Data/built/';
global.Applications = {
    node: '.js',
    php: '.php',
    json: '.json'
};
const dataPath = global.builtPath + 'node/';
global.translationsDir = 'Translations/';

global.APP = {
    testConstants: {
        countries: {
            count: 250
        },
        currencies: {
            count: 180
        },
        geoSets: {
            count: 62
        }
    },
    config: {},
    data: {
        countries: {},
        currencies: {},
        geoSets: {}
    },
    translations: {
        countries: {},
        currencies: {},
        geoSets: {}
    }
};

export async function setupApp() {
    try {
        let moduleLoad = await import(`${dataPath}config.js`);
        global.APP.config = moduleLoad.config;

        for (const key of Object.keys(global.APP.data)) {
            moduleLoad = await import(`${dataPath}${key}.js`);
            global.APP.data[key] = moduleLoad[key];

            for (const lang of Object.keys(global.APP.config.settings.languages.inPackage)) {
                moduleLoad = await import(`${dataPath}${global.translationsDir}${lang}/${key}.js`);
                global.APP.translations[key][lang] = moduleLoad[key];
            }
        }
    } catch (error) {
        console.log(error);
        throw error;
    }

    return global;
}
