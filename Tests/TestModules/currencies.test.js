import { setupApp } from '../setupTests';
import {currencies} from "../../Data/built/node/currencies";

let defTranslation;
let defLang;
beforeAll(async () => {
    await setupApp();
    defLang = global.APP.config.settings.languages.default;
    defTranslation = global.APP.translations.currencies[defLang];
});

let uniqueKeysControl = new Set();

describe('Tests Currencies Structure', () => {
    test(`Test that Currencies structure is an array`, () => {
        expect(
            typeof global.APP.data.currencies === 'object' &&
            global.APP.data.currencies !== null &&
            Array.isArray(global.APP.data.currencies)
        ).toBe(true);
    });
    test(`Test that Currencies entries number is correct`, () => {
        expect(Object.keys(global.APP.data.currencies).length).toEqual(global.APP.testConstants.currencies.count);
    });
    test(`Test that Currencies default translation structure is an object`, () => {
        expect(
            typeof defTranslation === 'object' &&
            defTranslation !== null &&
            !Array.isArray(defTranslation)
        ).toBe(true);
    });
    test(`Test that Currencies entries number is correct`, () => {
        expect(Object.keys(defTranslation).length).toEqual(global.APP.testConstants.currencies.count);
    });
});

for (const currency of Object.values(currencies)) {
    describe('Tests For Single currency', () => {
        /**
         * MAIN DATA
        */

        /** isoAlpha **/
        test(`Test that the main key is present in the currency object '${JSON.stringify(currency)}'`, () => {
            expect(currency.hasOwnProperty('isoAlpha')).toBe(
                true, `Missed Expectation for ${JSON.stringify(currency)} property 'isoAlpha' to be present`
            );
        });
        test(`Test that for the currency '${currency.isoAlpha}', 'isoAlpha' is a 3 alphabetic char string`, () => {
            expect(
                typeof currency.isoAlpha === 'string' &&
                /^[A-Z]{3}$/.test(currency.isoAlpha)
            ).toBe(true);
        });
        test(`Test that for the currency '${currency.isoAlpha}', 'isoAlpha' is unique`, () => {
            expect(
                uniqueKeysControl.has(`isoAlpha_${currency.isoAlpha}`) === false
            ).toBe(true);
            uniqueKeysControl.add(`isoAlpha_${currency.isoAlpha}`);
        });

        /** isoNumber **/
        test(`Test that the currency '${currency.isoAlpha}' has the property 'isoNumber' as a 3 chars numeric string`, () => {
            expect(
                currency.hasOwnProperty('isoNumber') &&
                currency.isoNumber === null ||
                (typeof currency.isoNumber === 'string' && currency.isoNumber.length === 3 && /^\d+$/.test(currency.isoNumber))
            ).toBe(true);
        });
        test(`Test that for the currency '${currency.isoAlpha}', 'isoNumber' is unique`, () => {
            expect(
                uniqueKeysControl.has(`isoNumber_${currency.isoNumber}`) === false
            ).toBe(true);
            uniqueKeysControl.add(`isoNumber_${currency.isoNumber}`);
        });

        /** symbol **/
        test(`Test that the currency '${currency.isoAlpha}' has the property 'symbol' as null or not empty string`, () => {
            expect(
                currency.hasOwnProperty('symbol') &&
                currency.symbol === null ||
                (typeof currency.symbol === 'string' && currency.symbol.length !== 0)
            ).toBe(true);
        });

        /** decimal **/
        test(`Test that the currency '${currency.isoAlpha}' has the property 'decimal' as null or not empty string`, () => {
            expect(
                currency.hasOwnProperty('decimal') &&
                currency.decimal === null ||
                (typeof currency.decimal === 'number' && /^\d$/.test(currency.decimal))
            ).toBe(true);
        });

        /**
         * DEFAULT TRANSLATION DATA
         */

        /** currencies has translation structure **/
        test(`Test that the currency '${currency.isoAlpha}' has the default translation structure`, () => {
            expect(
                defTranslation.hasOwnProperty(currency.isoAlpha) &&
                typeof defTranslation[currency.isoAlpha] === 'object' && defTranslation[currency.isoAlpha] !== null
            ).toBe(true);
        });

        /** name **/
        test(`Test that the currency '${currency.isoAlpha}' default translation has property 'name' as not empty string`, () => {
            expect(
                defTranslation[currency.isoAlpha].hasOwnProperty('name') &&
                typeof defTranslation[currency.isoAlpha].name === 'string' && defTranslation[currency.isoAlpha].name !== ''
            ).toBe(true);
        });
        test(`Test that for the country '${currency.isoAlpha}', default translation 'name' is unique`, () => {
            expect(
                uniqueKeysControl.has(`trans_${defLang}_name_${defTranslation[currency.isoAlpha].name}`) === false
            ).toBe(true);
            uniqueKeysControl.add(`trans_${defLang}_name_${defTranslation[currency.isoAlpha].name}`);
        });
    });

}

