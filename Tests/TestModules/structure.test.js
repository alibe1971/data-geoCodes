import fs from 'fs';
import { setupApp } from '../setupTests';

beforeAll(async () => {
    await setupApp();
});

describe('Files configuration for the applications', () => {
    for (const app of Object.keys(global.Applications)) {
        const path = `${global.builtPath}${app}/`;

        test(`Test that the application ${app} has config file`, () => {
            const file = `${path}config${global.Applications[app]}`;
            expect(fs.existsSync(file)).toBe(true);
        });

        for (const data of Object.keys(global.APP.data)) {
            test(`Test that the application ${app} has the ${data} file`, () => {
                const file = `${path}${data}${global.Applications[app]}`;
                expect(fs.existsSync(file)).toBe(true);

                for (const lang of Object.keys(global.APP.config.settings.languages.inPackage)) {
                    const langFile = `${path}${global.translationsDir}${lang}/${data}${global.Applications[app]}`;
                    expect(fs.existsSync(langFile)).toBe(true);
                }
            });
        }
    }
});

