import { setupApp } from '../setupTests';
import {countries} from "../../Data/built/node/countries";
// import {requirements} from "../../Lib/utils";
// import {configBuild} from "../../Lib/configBuild";

let defTranslation;
let defLang;
beforeAll(async () => {
    await setupApp();
    defLang = global.APP.config.settings.languages.default;
    defTranslation = global.APP.translations.countries[defLang];
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
                uniqueKeysControl.has(`alpha2_${country.alpha2}`) === false
            ).toBe(true);
            uniqueKeysControl.add(`alpha2_${country.alpha2}`);
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
                uniqueKeysControl.has(`alpha3_${country.alpha3}`) === false
            ).toBe(true);
            uniqueKeysControl.add(`alpha3_${country.alpha3}`);
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
                uniqueKeysControl.has(`unM49_${country.unM49}`) === false
            ).toBe(true);
            uniqueKeysControl.add(`unM49_${country.unM49}`);
        });
        test(`Test that for the country '${country.alpha2}', 'unM49' is not present in GeoSets`, () => {
            // Exception for Antartica (AQ - 010) that is also a continent
            if (country.alpha2 != 'AQ') {
                expect(
                    typeof global.APP.data.geoSets.find(item => item['unM49'] === country.unM49) !== 'undefined'
                ).toBe(false);
            }
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
            for (const [lang, name] of Object.entries(country.officialName)) {
                expect(uniqueKeysControl.has(`officialName_${lang}_${name}`)).toBe(false);
                uniqueKeysControl.add(`officialName_${lang}_${name}`);
            }
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
                typeof country.mottos === 'object' && country.mottos !== null &&
                Object.entries(country.mottos).length == Object.entries(global.APP.extra.countries.mottos.categories).length
            ).toBe(true);
        });
        test(`Test that the country '${country.alpha2}' has the property 'mottos' well formatted`, () => {
            for (const cat of global.APP.extra.countries.mottos.categories) {
                expect(
                    country.mottos.hasOwnProperty(cat) &&
                    typeof country.mottos[cat] == 'object' &&
                    country.mottos[cat] !== null &&
                    Array.isArray(country.mottos[cat])
                ).toBe(true);
                if (country.mottos[cat].length != 0) {
                    for (const mottosGr of country.mottos[cat]) {
                        expect(typeof mottosGr === 'object' && mottosGr !== null).toBe(true);
                        expect(
                            mottosGr.hasOwnProperty('text') &&
                            typeof mottosGr.text === 'object' && mottosGr.text !== null &&
                            Object.entries(mottosGr.text).length != 0
                        ).toBe(true);
                        for ( const [lang, motto] of Object.entries(mottosGr.text) ) {
                            expect(typeof motto === 'string' && motto.length != 0).toBe(true);
                        }
                    }
                }
            }
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
        test(`Test that the country '${country.alpha2}' has the property 'dialCodes.deJure' as array`, () => {
            expect(
                country.dialCodes.hasOwnProperty('deJure') && Array.isArray(country.dialCodes.deJure)
            ).toBe(true);
        });
        test(`Test that the country '${country.alpha2}' has the 'dialCodes.deJure' values with the right format`, () => {
            for (const phone of country.dialCodes.deJure) {
                expect(
                    typeof phone === 'string' && /^\+\d+$/.test(phone)
                ).toBe(true);
            }
        });
        test(`Test that the country '${country.alpha2}' has the property 'dialCodes.deFacto' as array`, () => {
            expect(
                country.dialCodes.hasOwnProperty('deFacto') && Array.isArray(country.dialCodes.deFacto)
            ).toBe(true);
        });
        test(`Test that the country '${country.alpha2}' has the 'dialCodes.deFacto' values with the right format`, () => {
            for (const phone of country.dialCodes.deFacto) {
                expect(
                    typeof phone === 'string' && /^\+\d+$/.test(phone)
                ).toBe(true);
            }
        });
        test(`Test that the country '${country.alpha2}' has the property 'dialCodes.exceptions' as array`, () => {
            expect(
                country.dialCodes.hasOwnProperty('exceptions') && Array.isArray(country.dialCodes.exceptions)
            ).toBe(true);
        });
        test(`Test that the country '${country.alpha2}' has the 'dialCodes.exceptions' values with the right format`, () => {
            for (const phoneExc of country.dialCodes.exceptions) {
                expect(typeof phoneExc === 'object' && phoneExc !== null ).toBe(true);
                expect(
                    phoneExc.hasOwnProperty('code') &&
                    typeof phoneExc.code === 'string' &&
                    /^(\d+)$/.test(phoneExc.code)
                ).toBe(true);
                expect(
                    phoneExc.hasOwnProperty('origin') &&
                    typeof phoneExc.origin === 'string' &&
                    /^[A-Z]{2}$/.test(phoneExc.origin) &&
                    typeof countries.find(item => item['alpha2'] === phoneExc.origin) !== 'undefined'
                ).toBe(true);
            }
        });

        /** ccTld **/
        test(`Test that the country '${country.alpha2}' has the property 'ccTld' as null or '.' plus 2 character string`, () => {
            expect(
                country.hasOwnProperty('ccTld') &&
                country.ccTld === null ||
                ( typeof country.ccTld === 'string' && /^\.[a-z]{2}$/.test(country.ccTld) )
            ).toBe(true);
        });

        /** ccIdn **/
        test(`Test that the country '${country.alpha2}' has the property 'ccIdn' as array`, () => {
            expect(Array.isArray(country.ccIdn)).toBe(true);
        });
        test(`Test that the country '${country.alpha2}' has the property 'ccIdn' well formatted`, () => {
            for (const ccIdnGr of Object.values(country.ccIdn)) {
                expect(
                    typeof ccIdnGr === 'object' && ccIdnGr !== null &&
                    !Array.isArray(ccIdnGr) && Object.entries(ccIdnGr).length !== 0
                ).toBe(true);
                for (const intVals of Object.values(global.APP.extra.countries.ccIdn.internalProperties)) {
                    expect(ccIdnGr.hasOwnProperty(intVals)).toBe(true);
                    switch (intVals) {
                    case 'unicode':
                    case 'punycode':
                    case 'language':
                        expect(
                            typeof ccIdnGr[intVals] === 'string' && ccIdnGr[intVals].length !=0
                        ).toBe(true);
                        break;
                    case 'regionsOfUse':
                        expect(Array.isArray(ccIdnGr[intVals]) && Object.entries(ccIdnGr[intVals]).length != 0)
                        break;
                    default:
                        // nothing
                    }
                }
            }
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
        test(`Test that the country '${country.alpha2}' has the property 'languages' as object`, () => {
            expect(
                country.hasOwnProperty('languages') &&
                typeof country.languages === 'object' && country.languages !== null &&
                Object.entries(country.languages).length == Object.entries(global.APP.extra.countries.languages.categories).length
            ).toBe(true);
        });
        test(`Test that the country '${country.alpha2}' has the property 'languages' well formatted`, () => {
            for (const cat of global.APP.extra.countries.languages.categories) {
                expect(
                    country.languages.hasOwnProperty(cat) &&
                    typeof country.languages[cat] == 'object' &&
                    country.languages[cat] !== null
                ).toBe(true);
                if (Object.prototype.hasOwnProperty.call(global.APP.extra.countries.languages.subCategories, cat)) {
                    for (const sub of Object.values(global.APP.extra.countries.languages.subCategories[cat])) {
                        expect(
                            country.languages[cat].hasOwnProperty(sub) &&
                            Array.isArray(country.languages[cat][sub])
                        ).toBe(true);
                        for (const lang of Object.values(country.languages[cat][sub])) {
                            expect(typeof lang === 'string' && lang.length != 0).toBe(true);
                        }
                    }
                } else {
                    expect(Array.isArray(country.languages[cat])).toBe(true);
                    for (const lang of Object.values(country.languages[cat])) {
                        expect(typeof lang === 'string' && lang.length != 0).toBe(true);
                    }
                }
            }
        });

        /** localesIcu **/
        test(`Test that the country '${country.alpha2}' has the property 'localesIcu' as array`, () => {
            expect(
                country.hasOwnProperty('localesIcu') &&
                typeof country.localesIcu === 'object' && country.localesIcu !== null &&
                Array.isArray(country.localesIcu)
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
        test(`Test that for the country '${country.alpha2}', 'otherAppsIds' has property 'wikiData' as null or string`, () => {
            expect(
                country.otherAppsIds.hasOwnProperty('wikiData') &&
                (
                    (
                        typeof country.otherAppsIds.wikiData === 'string' &&
                        /^Q[1-9][0-9]*$/.test(country.otherAppsIds.wikiData)
                    ) ||
                    country.otherAppsIds.wikiData === null
                )
            ).toBe(true);
        });
        test(`Test that for the country '${country.alpha2}', 'otherAppsIds' has property 'openStreetMap' as object`, () => {
            expect(
                country.otherAppsIds.hasOwnProperty('openStreetMap') &&
                typeof country.otherAppsIds.openStreetMap === 'object' &&
                country.otherAppsIds.openStreetMap !== null
            ).toBe(true);
        });
        test(`Test that for the country '${country.alpha2}', 'otherAppsIds.openStreetMap' is correctly formatted`, () => {
            expect(
                country.otherAppsIds.openStreetMap.hasOwnProperty('type') &&
                (
                    (
                        typeof country.otherAppsIds.openStreetMap.type === 'string' &&
                        /^(node|way|relation)$/.test(country.otherAppsIds.openStreetMap.type)
                    ) ||
                    country.otherAppsIds.openStreetMap.type === null
                )
            ).toBe(true);
            expect(
                country.otherAppsIds.openStreetMap.hasOwnProperty('id') &&
                (
                    (
                        Number.isInteger(country.otherAppsIds.openStreetMap.id) &&
                        country.otherAppsIds.openStreetMap.id != 0
                    ) ||
                    country.otherAppsIds.openStreetMap.id === null
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
        test(`Test that for the country '${country.alpha2}', default translation 'name' is unique`, () => {
            expect(
                uniqueKeysControl.has(`trans_${defLang}_name_${defTranslation[country.alpha2].name}`) === false
            ).toBe(true);
            uniqueKeysControl.add(`trans_${defLang}_name_${defTranslation[country.alpha2].name}`);
        });

        /** fullName **/
        test(`Test that the country '${country.alpha2}' default translation has property 'fullName' as not empty string`, () => {
            expect(
                defTranslation[country.alpha2].hasOwnProperty('fullName') &&
                typeof defTranslation[country.alpha2].fullName === 'string' && defTranslation[country.alpha2].fullName !== ''
            ).toBe(true);
        });
        test(`Test that for the country '${country.alpha2}', default translation 'fullName' is unique`, () => {
            expect(
                uniqueKeysControl.has(`trans_${defLang}_fullName_${defTranslation[country.alpha2].name}`) === false
            ).toBe(true);
            uniqueKeysControl.add(`trans_${defLang}_fullName_${defTranslation[country.alpha2].name}`);
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

