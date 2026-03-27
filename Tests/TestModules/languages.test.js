import { setupApp } from '../setupTests';
import {languages} from "../../Data/built/node/languages";

let defTranslation;
let defLang;
beforeAll(async () => {
    await setupApp();
    defLang = global.APP.config.settings.languages.default;
    defTranslation = global.APP.translations.languages[defLang];
});

let uniqueKeysControl = new Set();

describe('Tests Languages Structure', () => {
    test(`Test that Languages structure is an array`, () => {
        expect(
            typeof global.APP.data.languages === 'object' &&
            global.APP.data.languages !== null &&
            Array.isArray(global.APP.data.languages)
        ).toBe(true);
    });
    test(`Test that Languages entries number is correct`, () => {
        expect(Object.keys(global.APP.data.languages).length).toEqual(global.APP.testConstants.languages.count);
    });
    test(`Test that Languages default translation structure is an object`, () => {
        expect(
            typeof defTranslation === 'object' &&
            defTranslation !== null &&
            !Array.isArray(defTranslation)
        ).toBe(true);
    });
    test(`Test that Languages default translation entries number is correct`, () => {
        expect(Object.keys(defTranslation).length).toEqual(global.APP.testConstants.languages.count);
    });
});

for (const language of Object.values(languages)) {
    describe('Tests For Single Language', () => {
        /**
         * MAIN DATA
        */

        /** isoCode **/
        test(`Test that the main key is present in the language object '${JSON.stringify(language)}'`, () => {
            expect(language.hasOwnProperty('isoCode')).toBe(
                true, `Missed Expectation for ${JSON.stringify(language)} property 'isoCode' to be present`
            );
        });
        test(`Test that for the language '${language.isoCode}', 'isoCode' is a 3 alphabetic lowercase char string`, () => {
            expect(
                typeof language.isoCode === 'string' && /^[a-z]{3}$/.test(language.isoCode)
            ).toBe(true);
        });
        test(`Test that for the language '${language.isoCode}', 'isoCode' is unique`, () => {
            expect(
                uniqueKeysControl.has(`isoCode_${language.isoCode}`) === false
            ).toBe(true);
            uniqueKeysControl.add(`isoCode_${language.isoCode}`);
        });

        /** part2b **/
        test(`Test that for the language '${language.isoCode}', 'part2b' is null or a 3 alphabetic lowercase char string`, () => {
            expect(
                language.hasOwnProperty('part2b') &&
                (
                    language.part2b === null ||
                    (typeof language.part2b === 'string' && /^[a-z]{3}$/.test(language.part2b))
                )
            ).toBe(true);
        });
        test(`Test that for the language '${language.isoCode}', 'part2b' is unique`, () => {
            expect(
                uniqueKeysControl.has(`part2b_${language.part2b}`) === false
            ).toBe(true);
            if (language.part2b !== null) {
                uniqueKeysControl.add(`part2b_${language.part2b}`);
            }
        });

        /** part2t **/
        test(`Test that for the language '${language.isoCode}', 'part2t' is null or a 3 alphabetic lowercase char string`, () => {
            expect(
                language.hasOwnProperty('part2t') &&
                (
                    language.part2t === null ||
                    (typeof language.part2t === 'string' && /^[a-z]{3}$/.test(language.part2t))
                )
            ).toBe(true);
        });
        test(`Test that for the language '${language.isoCode}', 'part2t' is unique`, () => {
            expect(
                uniqueKeysControl.has(`part2t_${language.part2t}`) === false
            ).toBe(true);
            if (language.part2t !== null) {
                uniqueKeysControl.add(`part2t_${language.part2t}`);
            }
        });

        /** part1 **/
        test(`Test that for the language '${language.isoCode}', 'part1' is null or a 2 alphabetic lowercase char string`, () => {
            expect(
                language.hasOwnProperty('part1') &&
                (
                    language.part1 === null ||
                    (typeof language.part1 === 'string' && /^[a-z]{2}$/.test(language.part1))
                )
            ).toBe(true);
        });
        test(`Test that for the language '${language.isoCode}', 'part1' is unique`, () => {
            expect(
                uniqueKeysControl.has(`part1_${language.part1}`) === false
            ).toBe(true);
            if (language.part1 !== null) {
                uniqueKeysControl.add(`part1_${language.part1}`);
            }
        });

        /** glottoCode **/
        test(`Test that for the language '${language.isoCode}', 'glottoCode' is null or 4 chars length and 4 numbers length string`, () => {
            expect(
                language.hasOwnProperty('glottoCode') &&
                (
                    language.glottoCode === null ||
                    (typeof language.glottoCode === 'string' && /^[a-z]{4}\d{4}$/.test(language.glottoCode))
                )
            ).toBe(true);
        });

        /** scope **/
        test(`Test that the language '${language.isoCode}' has the property 'scope' as not empty object`, () => {
            expect(
                language.hasOwnProperty('scope') &&
                typeof language.scope === 'object' && language.scope !== null &&
                Object.entries(language.scope).length !== 0
            ).toBe(true);
        });
        test(
            `Test that for the language '${language.isoCode}', 'scope.code' is ` +
            `1 uppercase chars length string, and it is inside the list of the available scopes`, () => {
                expect(
                    language.scope.hasOwnProperty('code') &&
                    typeof language.scope.code === 'string' &&
                    /^[A-Z]{1}$/.test(language.scope.code) &&
                    global.APP.extra.languages.scopes.includes(language.scope.code)
                ).toBe(true);
            });

        /** type **/
        test(`Test that the language '${language.isoCode}' has the property 'type' as not empty object`, () => {
            expect(
                language.hasOwnProperty('type') &&
                typeof language.type === 'object' && language.type !== null &&
                Object.entries(language.type).length !== 0
            ).toBe(true);
        });
        test(
            `Test that for the language '${language.isoCode}', 'type.code' is ` +
            `1 uppercase chars length string, and it is inside the list of the available types`, () => {
                expect(
                    language.type.hasOwnProperty('code') &&
                    typeof language.type.code === 'string' &&
                    /^[A-Z]{1}$/.test(language.type.code) &&
                    global.APP.extra.languages.types.includes(language.type.code)
                ).toBe(true);
            });

        /** macroLanguageRef **/
        test(`Test that the language '${language.isoCode}' has the property 'macroLanguageRef' as null or 3 character string`, () => {
            expect(
                language.hasOwnProperty('macroLanguageRef') &&
                language.macroLanguageRef === null ||
                (typeof language.macroLanguageRef === 'string' && language.macroLanguageRef.length === 3)
            ).toBe(true);
        });
        if(typeof language.macroLanguageRef === 'string') {
            test(`Test that the language '${language.isoCode}' has the property 'macroLanguageRef' related to a registered language`, () => {
                expect(
                    typeof languages.find(item => item['isoCode'] === language.macroLanguageRef) !== 'undefined'
                ).toBe(true);
            });
        }


        /** scripts **/
        test(`Test that the language '${language.isoCode}' has the property 'scripts' as not empty array with proper value`, () => {
            expect(
                language.hasOwnProperty('scripts') &&
                typeof language.scripts === 'object' && language.scripts !== null &&
                Array.isArray(language.scripts)
            ).toBe(true);
        });
        for (const script of language.scripts) {
            test(`Test that for the language '${language.scripts}', the code country ${script} inside the property 'language.scripts' exists`, () => {
                expect(
                    typeof global.APP.data.scripts.find(item => item['code'] === script) !== 'undefined'
                ).toBe(true);
            });
        }

        /**
         * DEFAULT TRANSLATION DATA
         */

        /** languages has translation structure **/
        test(`Test that the language '${language.isoCode}' has the default translation structure`, () => {
            expect(
                defTranslation.hasOwnProperty(language.isoCode) &&
                typeof defTranslation[language.isoCode] === 'object' && defTranslation[language.isoCode] !== null
            ).toBe(true);
        });

        /** name **/
        test(`Test that the language '${language.isoCode}' default translation has property 'name' as not empty string`, () => {
            expect(
                defTranslation[language.isoCode].hasOwnProperty('name') &&
                typeof defTranslation[language.isoCode].name === 'string' && defTranslation[language.isoCode].name !== ''
            ).toBe(true);
        });
        test(`Test that for the language '${language.isoCode}', default translation 'name' is unique`, () => {
            expect(
                uniqueKeysControl.has(`trans_${defLang}_name_${defTranslation[language.isoCode].name}`) === false
            ).toBe(true);
            uniqueKeysControl.add(`trans_${defLang}_name_${defTranslation[language.isoCode].name}`);
        });
    });

}

/**
 * DEFAULT TRANSLATION CATEGORIES
 */
describe('Tests `languages` Categories (scope and type) description translation', () => {
    for (const scope of Object.values(global.APP.extra.languages.scopes)) {
        test(
            `Test that the languages scope '${scope}' is present in the default translation structure as not empty string`,
            () => {
                expect(
                    global.APP.translationsCategories.languages[defLang].scope.hasOwnProperty(scope) &&
                    typeof global.APP.translationsCategories.languages[defLang].scope[scope] === 'string' &&
                    global.APP.translationsCategories.languages[defLang].scope[scope] !== ''
                ).toBe(true);
            });
    }
    for (const type of Object.values(global.APP.extra.languages.types)) {
        test(
            `Test that the languages scope '${type}' is present in the default translation structure as not empty string`,
            () => {
                expect(
                    global.APP.translationsCategories.languages[defLang].type.hasOwnProperty(type) &&
                    typeof global.APP.translationsCategories.languages[defLang].type[type] === 'string' &&
                    global.APP.translationsCategories.languages[defLang].type[type] !== ''
                ).toBe(true);
            });
    }
});