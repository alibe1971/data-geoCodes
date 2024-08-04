import { setupApp } from '../setupTests';
import {countries} from "../../Data/built/node/countries";

let defTranslation;
beforeAll(async () => {
    await setupApp();
    defTranslation = global.APP.translations.countries[global.APP.config.settings.languages.default];
});

let uniqueKeysControl = new Set();

describe('Tests Countries Structure', () => {
    test(`Test that Countries structure is an array`, () => {
        expect(
            typeof global.APP.data.countries === 'object' &&
            global.APP.data.countries !== null &&
            Array.isArray(global.APP.data.countries)
        ).toBe(true);
    });
    test(`Test that Countries entries number is correct`, () => {
        expect(Object.keys(global.APP.data.countries).length).toEqual(global.APP.testConstants.countries.count);
    });
    test(`Test that Countries default translation structure is an object`, () => {
        expect(
            typeof defTranslation === 'object' &&
            defTranslation !== null &&
            !Array.isArray(defTranslation)
        ).toBe(true);
    });
    test(`Test that Countries entries number is correct`, () => {
        expect(Object.keys(defTranslation).length).toEqual(global.APP.testConstants.countries.count);
    });
});

for (const country of Object.values(countries)) {
    describe('Tests For Single Country', () => {
        /**
         * MAIN DATA
        */

        /** alpha2 **/
        test(`Test that the main key is present in the country object '${JSON.stringify(country)}'`, () => {
            expect(country.hasOwnProperty('alpha2')).toBe(
                true, `Missed Expectation for ${JSON.stringify(country)} property 'alpha2' to be present`
            );
        });
        test(`Test that for the country '${country.alpha2}', 'alpha2' is a 2 chars string`, () => {
            expect(
                typeof country.alpha2 === 'string' && country.alpha2.length === 2
            ).toBe(true);
        });
        test(`Test that for the country '${country.alpha2}', 'alpha2' is unique`, () => {
            expect(
                uniqueKeysControl.has(country.alpha2) === false
            ).toBe(true);
            uniqueKeysControl.add(country.alpha2);
        });

        /** alpha3 **/
        test(`Test that the country '${country.alpha2}' has the property 'alpha3' as a 3 chars string`, () => {
            expect(
                country.hasOwnProperty('alpha3') &&
                typeof country.alpha3 === 'string' && country.alpha3.length === 3
            ).toBe(true);
        });
        test(`Test that for the country '${country.alpha2}', 'alpha3' is unique`, () => {
            expect(
                uniqueKeysControl.has(country.alpha3) === false
            ).toBe(true);
            uniqueKeysControl.add(country.alpha3);
        });

        /** unM49 **/
        test(`Test that the country '${country.alpha2}' has the property 'unM49' as a 3 chars numeric string`, () => {
            expect(
                country.hasOwnProperty('unM49') &&
                typeof country.unM49 === 'string' && country.unM49.length === 3 && /^\d+$/.test(country.unM49)
            ).toBe(true);
        });
        test(`Test that for the country '${country.alpha2}', 'unM49' is unique`, () => {
            expect(
                uniqueKeysControl.has(country.unM49) === false
            ).toBe(true);
            uniqueKeysControl.add(country.unM49);
        });

        /** flags **/
        test(`Test that the country '${country.alpha2}' has the property 'flags' as not empty object`, () => {
            expect(
                country.hasOwnProperty('flags') &&
                typeof country.flags === 'object' && country.flags !== null &&
                country.flags.length !== 0
            ).toBe(true);
        });
        test(`Test that for the country '${country.alpha2}', 'flags' has property 'svg' as string`, async () => {
            expect(
                country.flags.hasOwnProperty('svg') &&
                typeof country.flags.svg == 'string'
            ).toBe(true);
        });

        /** officialName **/
        test(`Test that the country '${country.alpha2}' has the property 'officialName' as not empty object`, () => {
            expect(
                country.hasOwnProperty('officialName') &&
                typeof country.officialName === 'object' && country.officialName !== null &&
                country.officialName.length !== 0
            ).toBe(true);
        });
        test(`Test that for the country '${country.alpha2}', 'officialName' is unique`, () => {
            expect(
                uniqueKeysControl.has(country.officialName) === false
            ).toBe(true);
            uniqueKeysControl.add(country.officialName);
        });

        /** dependency **/
        test(`Test that the country '${country.alpha2}' has the property 'dependency' as null or 2 character string`, () => {
            expect(
                country.hasOwnProperty('dependency') &&
                country.dependency === null ||
                (typeof country.dependency === 'string' && country.dependency.length === 2)
            ).toBe(true);
        });
        if(country.hasOwnProperty('dependency') && typeof country.dependency === 'string') {
            test(`Test that the country '${country.alpha2}' has the property 'dependency' related to a registered country`, () => {
                expect(
                    typeof countries.find(item => item['alpha2'] === country.dependency) !== 'undefined'
                ).toBe(true);
            });
        }

        /** mottos **/
        test(`Test that the country '${country.alpha2}' has the property 'mottos' as object`, () => {
            expect(
                country.hasOwnProperty('mottos') &&
                typeof country.mottos === 'object' && country.mottos !== null
            ).toBe(true);
        });

        /** currencies **/
        test(`Test that the country '${country.alpha2}' has the property 'currencies' as object`, () => {
            expect(
                country.hasOwnProperty('currencies') &&
                typeof country.currencies === 'object' && country.currencies !== null &&
                !Array.isArray(country.currencies)
            ).toBe(true);
        });
        test(`Test that the country '${country.alpha2}' has the property 'currencies.legalTenders' as array`, () => {
            expect(
                country.currencies.hasOwnProperty('legalTenders') && Array.isArray(country.currencies.legalTenders)
            ).toBe(true);
        });
        for (const cur of country.currencies.legalTenders) {
            test(`Test that for the country '${country.alpha2}', the value '${cur}' of 'currencies.legalTenders' exists in the currencies entries`, () => {
                expect(
                    typeof global.APP.data.currencies.find(item => item['isoAlpha'] === cur) !== 'undefined'
                ).toBe(true);
            });
        }
        test(`Test that the country '${country.alpha2}' has the property 'currencies.widelyAccepted' as array`, () => {
            expect(
                country.currencies.hasOwnProperty('widelyAccepted') && Array.isArray(country.currencies.widelyAccepted)
            ).toBe(true);
        });
        for (const cur of country.currencies.widelyAccepted) {
            test(`Test that for the country '${country.alpha2}', the value '${cur}' of 'currencies.widelyAccepted' exists in the currencies entries`, () => {
                expect(
                    typeof global.APP.data.currencies.find(item => item['isoAlpha'] === cur) !== 'undefined'
                ).toBe(true);
            });
        }
        test(`Test that for the country '${country.alpha2}', the properties 'currencies.legalTenders' and 'currencies.widelyAccepted' have no values in common`, () => {
            const legalTenders = new Set(country.currencies.legalTenders);
            const widelyAccepted = new Set(country.currencies.widelyAccepted);
            for (let item of legalTenders) {
                expect( widelyAccepted.has(item) ).toBe(false);
            }
        });

        /** dialCodes **/
        test(`Test that the country '${country.alpha2}' has the property 'dialCodes' as object`, () => {
            expect(
                country.hasOwnProperty('dialCodes') &&
                typeof country.dialCodes === 'object' && country.dialCodes !== null &&
                !Array.isArray(country.dialCodes)
            ).toBe(true);
        });
        test(`Test that the country '${country.alpha2}' has the property 'dialCodes.main' as array`, () => {
            expect(
                country.dialCodes.hasOwnProperty('main') && Array.isArray(country.dialCodes.main)
            ).toBe(true);
        });
        test(`Test that the country '${country.alpha2}' has the property 'dialCodes.exceptions' as array`, () => {
            expect(
                country.dialCodes.hasOwnProperty('exceptions') && Array.isArray(country.dialCodes.exceptions)
            ).toBe(true);
        });

        /** ccTld **/
        test(`Test that the country '${country.alpha2}' has the property 'ccTld' as null or '.' plus 2 character string`, () => {
            expect(
                country.hasOwnProperty('ccTld') &&
                country.ccTld === null ||
                ( typeof country.ccTld === 'string' && /^\.[a-z]{2}$/.test(country.ccTld) )
            ).toBe(true);
        });

        /** timeZones **/
        test(`Test that the country '${country.alpha2}' has the property 'timeZones' as not empty array`, () => {
            expect(
                country.hasOwnProperty('timeZones') &&
                typeof country.timeZones === 'object' && country.timeZones !== null &&
                Array.isArray(country.timeZones) && country.timeZones.length !== 0
            ).toBe(true);
        });

        /** languages **/
        // [TODO]

        /** locales **/
        test(`Test that the country '${country.alpha2}' has the property 'locales' as not empty array`, () => {
            expect(
                country.hasOwnProperty('locales') &&
                typeof country.locales === 'object' && country.locales !== null &&
                Array.isArray(country.locales) && country.locales.length !== 0
            ).toBe(true);
        });

        /** otherAppsIds **/
        test(`Test that the country '${country.alpha2}' has the property 'otherAppsIds' as not empty object`, () => {
            expect(
                country.hasOwnProperty('otherAppsIds') &&
                typeof country.otherAppsIds === 'object' && country.otherAppsIds !== null &&
                country.otherAppsIds.length !== 0
            ).toBe(true);
        });
        test(`Test that for the country '${country.alpha2}', 'otherAppsIds' has property 'geoNamesOrg' as null or integer`, () => {
            expect(
                country.otherAppsIds.hasOwnProperty('geoNamesOrg') &&
                (
                    (Number.isInteger(country.otherAppsIds.geoNamesOrg) && country.otherAppsIds.geoNamesOrg != 0) ||
                    country.otherAppsIds.geoNamesOrg === null
                )
            ).toBe(true);
        });

        /**
         * DEFAULT TRANSLATION DATA
         */

        /** Country has translation structure **/
        test(`Test that the country '${country.alpha2}' has the default translation structure`, () => {
            expect(
                defTranslation.hasOwnProperty(country.alpha2) &&
                typeof defTranslation[country.alpha2] === 'object' && defTranslation[country.alpha2] !== null
            ).toBe(true);
        });

        /** name **/
        test(`Test that the country '${country.alpha2}' default translation has property 'name' as not empty string`, () => {
            expect(
                defTranslation[country.alpha2].hasOwnProperty('name') &&
                typeof defTranslation[country.alpha2].name === 'string' && defTranslation[country.alpha2].name !== ''
            ).toBe(true);
        });
        test(`Test that for the country '${country.alpha2}', translation 'name' is unique`, () => {
            expect(
                uniqueKeysControl.has(defTranslation[country.alpha2].name) === false
            ).toBe(true);
            uniqueKeysControl.add(defTranslation[country.alpha2].name);
        });

        /** fullName **/
        test(`Test that the country '${country.alpha2}' default translation has property 'fullName' as not empty string`, () => {
            expect(
                defTranslation[country.alpha2].hasOwnProperty('fullName') &&
                typeof defTranslation[country.alpha2].fullName === 'string' && defTranslation[country.alpha2].fullName !== ''
            ).toBe(true);
        });

        /** demonyms **/
        test(`Test that the country '${country.alpha2}' has the property 'demonyms' as an array`, () => {
            expect(
                defTranslation[country.alpha2].hasOwnProperty('demonyms') &&
                typeof defTranslation[country.alpha2].demonyms === 'object' &&
                defTranslation[country.alpha2].demonyms !== null &&
                Array.isArray(defTranslation[country.alpha2].demonyms)
            ).toBe(true);
        });

        /** keywords **/
        test(`Test that the country '${country.alpha2}' has the property 'keywords' as an array`, () => {
            expect(
                defTranslation[country.alpha2].hasOwnProperty('keywords') &&
                typeof defTranslation[country.alpha2].keywords === 'object' &&
                defTranslation[country.alpha2].keywords !== null &&
                Array.isArray(defTranslation[country.alpha2].keywords)
            ).toBe(true);
        });

    });

}

