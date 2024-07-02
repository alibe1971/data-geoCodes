import { setupApp } from '../setupTests';
import {geoSets} from "../../Data/built/node/geoSets";

let defTranslation;
beforeAll(async () => {
    await setupApp();
    defTranslation = global.APP.translations.geoSets[global.APP.config.settings.languages.default];
});

let uniqueKeysControl = new Set();

describe('Tests geoSets Structure', () => {
    test(`Test that geoSets structure is an array`, () => {
        expect(
            typeof global.APP.data.geoSets === 'object' &&
            global.APP.data.geoSets !== null &&
            Array.isArray(global.APP.data.geoSets)
        ).toBe(true);
    });
    test(`Test that geoSets entries number is correct`, () => {
        expect(Object.keys(global.APP.data.geoSets).length).toEqual(global.APP.testConstants.geoSets.count);
    });
    test(`Test that geoSets default translation structure is an object`, () => {
        expect(
            typeof defTranslation === 'object' &&
            defTranslation !== null &&
            !Array.isArray(defTranslation)
        ).toBe(true);
    });
    test(`Test that geoSets entries number is correct`, () => {
        expect(Object.keys(defTranslation).length).toEqual(global.APP.testConstants.geoSets.count);
    });
});

for (const geoSet of Object.values(geoSets)) {
    describe('Tests For Single geoSet', () => {
        /**
         * MAIN DATA
        */

        /** internalCode **/
        test(`Test that the main key is present in the geoSet object '${JSON.stringify(geoSet)}'`, () => {
            expect(geoSet.hasOwnProperty('internalCode')).toBe(
                true, `Missed Expectation for ${JSON.stringify(geoSet)} property 'internalCode' to be present`
            );
        });
        test(`Test that for the geoSet '${geoSet.internalCode}', 'internalCode' is a string rightly formed`, () => {
            expect(
                typeof geoSet.internalCode === 'string' &&
                /^(?=.*[a-zA-Z0-9])[^-]+(-[^-]+){1,4}$/.test(geoSet.internalCode)
            ).toBe(true);
        });
        test(`Test that for the geoSet '${geoSet.internalCode}', 'internalCode' is unique`, () => {
            expect(
                uniqueKeysControl.has(geoSet.internalCode) === false
            ).toBe(true);
            uniqueKeysControl.add(geoSet.internalCode);
        });

        /** unM49 **/
        test(`Test that the geoSet '${geoSet.internalCode}' has the property 'unM49' as a 3 chars numeric string`, () => {
            expect(
                geoSet.hasOwnProperty('unM49') &&
                geoSet.unM49 === null ||
                (typeof geoSet.unM49 === 'string' && geoSet.unM49.length === 3 && /^\d+$/.test(geoSet.unM49))
            ).toBe(true);
        });
        test(`Test that for the geoSet '${geoSet.internalCode}', 'unM49' is unique`, () => {
            expect(
                uniqueKeysControl.has(geoSet.unM49) === false
            ).toBe(true);
            if (geoSet.unM49 !== null) {
                uniqueKeysControl.add(geoSet.unM49);
            }
        });

        /** tags **/
        test(`Test that the geoSet '${geoSet.internalCode}' has the property 'tags' as not empty array`, () => {
            expect(
                geoSet.hasOwnProperty('tags') &&
                typeof geoSet.tags === 'object' && geoSet.tags !== null &&
                Array.isArray(geoSet.tags) && geoSet.tags.length !== 0
            ).toBe(true);
        });

        /** countryCodes **/
        test(`Test that the geoSet '${geoSet.internalCode}' has the property 'countryCodes' as not empty array with proper value`, () => {
            expect(
                geoSet.hasOwnProperty('countryCodes') &&
                typeof geoSet.countryCodes === 'object' && geoSet.countryCodes !== null &&
                Array.isArray(geoSet.countryCodes) && geoSet.countryCodes.length !== 0
            ).toBe(true);
        });
        for (const country of geoSet.countryCodes) {
            test(`Test that for the geoSet '${geoSet.internalCode}', the code country ${country} inside the property 'geoSet.countryCodes' exists`, () => {
                expect(
                    typeof global.APP.data.countries.find(item => item['alpha2'] === country) !== 'undefined'
                ).toBe(true);
            });
        }

        /**
         * DEFAULT TRANSLATION DATA
         */

        /** geoSets has translation structure **/
        test(`Test that the geoSet '${geoSet.internalCode}' has the default translation structure`, () => {
            expect(
                defTranslation.hasOwnProperty(geoSet.internalCode) &&
                typeof defTranslation[geoSet.internalCode] === 'object' && defTranslation[geoSet.internalCode] !== null
            ).toBe(true);
        });

        /** name **/
        test(`Test that the geoSet '${geoSet.internalCode}' default translation has property 'name' as not empty string`, () => {
            expect(
                defTranslation[geoSet.internalCode].hasOwnProperty('name') &&
                typeof defTranslation[geoSet.internalCode].name === 'string' && defTranslation[geoSet.internalCode].name !== ''
            ).toBe(true);
        });
        test(`Test that for the geoSet '${geoSet.internalCode}', translation 'name' is unique`, () => {
            expect(
                uniqueKeysControl.has(defTranslation[geoSet.internalCode].name) === false
            ).toBe(true);
            uniqueKeysControl.add(defTranslation[geoSet.internalCode].name);
        });
    });

}

