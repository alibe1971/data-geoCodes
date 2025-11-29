import { setupApp } from '../setupTests';
import {scripts} from "../../Data/built/node/scripts";

let defTranslation;
let defLang;
beforeAll(async () => {
    await setupApp();
    defLang = global.APP.config.settings.languages.default;
    defTranslation = global.APP.translations.scripts[defLang];
});

let uniqueKeysControl = new Set();

describe('Tests Language Scripts Structure', () => {
    test(`Test that Language Scripts structure is an array`, () => {
        console.info(Object.keys(global.APP.data.scripts).length);
        expect(
            typeof global.APP.data.scripts === 'object' &&
            global.APP.data.scripts !== null &&
            Array.isArray(global.APP.data.scripts)
        ).toBe(true);
    });
    test(`Test that Language Scripts entries number is correct`, () => {
        expect(Object.keys(global.APP.data.scripts).length).toEqual(global.APP.testConstants.scripts.count);
    });
    test(`Test that Language Scripts default translation structure is an object`, () => {
        expect(
            typeof defTranslation === 'object' &&
            defTranslation !== null &&
            !Array.isArray(defTranslation)
        ).toBe(true);
    });
    test(`Test that Language Scripts default translation entries number is correct`, () => {
        expect(Object.keys(defTranslation).length).toEqual(global.APP.testConstants.scripts.count);
    });
});

for (const script of Object.values(scripts)) {
    describe('Tests For Single Language Script', () => {
        /**
         * MAIN DATA
        */

        /** code **/
        test(`Test that the main key is present in the language script object '${JSON.stringify(script)}'`, () => {
            expect(script.hasOwnProperty('code')).toBe(
                true, `Missed Expectation for ${JSON.stringify(script)} property 'code' to be present`
            );
        });
        test(`Test that for the language script '${script.code}', 'code' is a 4 alphabetic (first capital) char string`, () => {
            expect(
                typeof script.code === 'string' &&
                /^[A-Z][a-z]{3}$/.test(script.code)
            ).toBe(true);
        });
        test(`Test that for the language script '${script.code}', 'code' is unique`, () => {
            expect(
                uniqueKeysControl.has(`isoCode_${script.code}`) === false
            ).toBe(true);
            uniqueKeysControl.add(`isoCode_${script.code}`);
        });

        /** numeric **/
        test(`Test that the language script '${script.code}' has the property 'numeric' as a 3 chars numeric string`, () => {
            expect(
                script.hasOwnProperty('numeric') &&
                (typeof script.numeric === 'string' && script.numeric.length === 3 && /^\d+$/.test(script.numeric))
            ).toBe(true);
        });
        test(`Test that for the language script '${script.code}', 'numeric' is unique`, () => {
            expect(
                uniqueKeysControl.has(`isoNumber_${script.numeric}`) === false
            ).toBe(true);
            uniqueKeysControl.add(`isoNumber_${script.numeric}`);
        });

        /** writingDirection **/
        test(`Test that the language script '${script.code}' has the property 'writingDirection' as null or not empty string`, () => {
            expect(
                script.hasOwnProperty('writingDirection') &&
                script.writingDirection === null ||
                (typeof script.writingDirection === 'string' && script.writingDirection.length !== 0)
            ).toBe(true);
        });

        /** unicode **/
        test(`Test that the language script '${script.code}' has the property 'unicode' as object`, () => {
            expect(
                script.hasOwnProperty('unicode') &&
                typeof script.unicode === 'object' && script.unicode !== null &&
                !Array.isArray(script.unicode)
            ).toBe(true);
        });
        test(`Test that the language script '${script.code}' has the property 'unicode.version' as a decimal numeric string (1 decimal)`, () => {
            expect(
                script.unicode.hasOwnProperty('version') &&
                script.unicode.version === null ||
                (typeof script.unicode.version === 'string' && /^[0-9]+\.[0-9]$/.test(script.unicode.version))
            ).toBe(true);
        });
        test(`Test that the language script '${script.code}' has the property 'unicode.ranges' as array`, () => {
            expect(
                script.unicode.hasOwnProperty('ranges') &&
                (typeof script.unicode.ranges === 'object' && Array.isArray(script.unicode.ranges))
            ).toBe(true);
        });
        test(`Test that the language script '${script.code}' has the elements inside 'unicode.ranges' as array of 1 or 2 elements`, () => {
            for (const range of script.unicode.ranges) {
                expect(
                    typeof range === 'object' && Array.isArray(range) && (range.length == 1 || range.length == 2)
                ).toBe(true);
            }
        });
        test(`Test that the language script '${script.code}' has the property 'unicode.totalCodePoints' as integer`, () => {
            expect(
                script.unicode.hasOwnProperty('totalCodePoints') &&
                (typeof script.unicode.totalCodePoints === 'number' && script.unicode.totalCodePoints === parseInt(script.unicode.totalCodePoints))
            ).toBe(true);
        });

        /**
         * DEFAULT TRANSLATION DATA
         */

        /** scripts has translation structure **/
        test(`Test that the language script '${script.code}' has the default translation structure`, () => {
            expect(
                defTranslation.hasOwnProperty(script.code) &&
                typeof defTranslation[script.code] === 'object' && defTranslation[script.code] !== null
            ).toBe(true);
        });

        /** name **/
        test(`Test that the language script '${script.code}' default translation has property 'name' as not empty string`, () => {
            expect(
                defTranslation[script.code].hasOwnProperty('name') &&
                typeof defTranslation[script.code].name === 'string' && defTranslation[script.code].name !== ''
            ).toBe(true);
        });
        test(`Test that for the language script '${script.code}', default translation 'name' is unique`, () => {
            expect(
                uniqueKeysControl.has(`trans_${defLang}_name_${defTranslation[script.code].name}`) === false
            ).toBe(true);
            uniqueKeysControl.add(`trans_${defLang}_name_${defTranslation[script.code].name}`);
        });
    });

}

