import chalk from 'chalk';
import { cloneFile, createDir, writeFile } from '../utils.js';
import { js2xml } from 'xml-js';
import { join, resolve } from 'path';
import { writeXsdSchemas } from './Xsd/generateXsd.js';
import { configBuild } from '../configBuild.js';

const CONTRACT_XSD_FILES = [
    'countries.xsd',
    'country.xsd',
    'currencies.xsd',
    'currency.xsd',
    'geoSets.xsd',
    'geoSet.xsd',
    'languages.xsd',
    'language.xsd',
    'scripts.xsd',
    'script.xsd'
];

/**
 * Map for the XML creation
 */
const xmlMap = {
    settings: {
        languages: {
            inPackage: {
                "@tag": "language"
            }
        }
    },
    currencies: {
        "@tag": "currency",
        "@attribute": "index",
        currency: {
            decimal: {
                "@custom": "NULLABLEINTEGER"
            }
        }
    },
    geoSets: {
        "@tag": "geoSet",
        "@attribute": "index",
        geoSet: {
            tags: {
                "@tag": "tag"
            },
            countryCodes: {
                "@tag": "cc"
            }
        }
    },
    languages: {
        "@tag": "language",
        "@attribute": "index",
        language: {
            scripts: {
                "@tag": "script"
            }
        }
    },
    scripts: {
        "@tag": "script",
        "@attribute": "index",
        script: {
            ranges: {
                "@tag": "range",
                "@childtag": "edge"
            }
        }
    },
    countries: {
        "@tag": "country",
        "@attribute": "index",
        country: {
            officialName: {
                "@tag": "name",
                "@attribute": "lang",
            },
            flags: {
                "@type": {
                    svg: "CDATA"
                }
            },
            mottos: {
                official: {
                    "@tag": "entry",
                    text: {
                        "@tag": "motto",
                        "@attribute": "lang",
                    }
                },
                popular: {
                    "@tag": "entry",
                    text: {
                        "@tag": "motto",
                        "@attribute": "lang",
                    }
                },
                founding: {
                    "@tag": "entry",
                    text: {
                        "@tag": "motto",
                        "@attribute": "lang",
                    }
                },
                royal: {
                    "@tag": "entry",
                    text: {
                        "@tag": "motto",
                        "@attribute": "lang",
                    }
                },
                presidential: {
                    "@tag": "entry",
                    text: {
                        "@tag": "motto",
                        "@attribute": "lang",
                    }
                },
                military: {
                    "@tag": "entry",
                    text: {
                        "@tag": "motto",
                        "@attribute": "lang",
                    }
                },
                historical: {
                    "@tag": "entry",
                    text: {
                        "@tag": "motto",
                        "@attribute": "lang",
                    }
                }
            },
            currencies: {
                legalTenders: {
                    "@tag": "currency"
                },
                widelyAccepted: {
                    "@tag": "currency"
                }
            },
            ccIdn: {
                "@tag": "idn",
                regionsOfUse: {
                    "@tag": "region"
                }
            },
            dialCodes: {
                deJure: {
                    "@tag": "dial"
                },
                deFacto: {
                    "@tag": "dial"
                },
                exceptions: {
                    "@tag": "dial"
                }
            },
            timeZones: {
                "@tag": "tz"
            },
            localesIcu: {
                "@tag": "locale"
            },
            languages: {
                official: {
                    deJure: {
                        "@tag": "language"
                    },
                    deFacto: {
                        "@tag": "language"
                    }
                },
                regional: {
                    "@tag": "language"
                },
                widelySpoken: {
                    "@tag": "language"
                },
                localCommunities: {
                    "@tag": "language"
                },
                extraTerritorialCommunities: {
                    "@tag": "language"
                },
                dialects: {
                    "@tag": "language"
                },
                signs: {
                    deJure: {
                        "@tag": "language"
                    },
                    recognized: {
                        "@tag": "language"
                    },
                    used: {
                        "@tag": "language"
                    }
                }
            }
        }
    },
    translationsCountries: {
        "@tag": "country",
        demonyms: {
            "@tag": "demonym"
        },
        keywords: {
            "@tag": "keyword"
        },
    },
    translationsGeoSets: {
        "@tag": "geoSet"
    },
    translationsCurrencies: {
        "@tag": "currency"
    },
    translationsLanguages: {
        "@tag": "language"
    },
    translationsScripts: {
        "@tag": "script"
    },
};

export const saveDataForXml = {
    save: async (destination, completeData) => {
        let dataBuilt;
        let keyCap;
        const declaration = {
            "_declaration": {
                "_attributes": {
                    version: "1.0",
                    encoding: "UTF-8"
                }
            }
        };
        const builtXsdPath = join(resolve(destination, '..'), 'xsd');
        const builtXsdOriginPath = join(builtXsdPath, 'origin');
        const builtXsdContractsPath = join(builtXsdPath, 'contracts');
        const builtXsdTranslationsPath = join(builtXsdOriginPath, 'Translations');
        const builtXsdTranslationsCategoriesPath = join(builtXsdTranslationsPath, 'Categories');
        const contractsPath = join(resolve(configBuild.readPaths.origin), 'XsdContracts') + '/';
        const translationsXsdPath = join(resolve(configBuild.readPaths.origin), 'XsdTranslations');
        const translationsCategoriesXsdPath = join(translationsXsdPath, 'Categories');
        await writeXsdSchemas(builtXsdOriginPath);
        await createDir(builtXsdContractsPath);
        await createDir(builtXsdTranslationsPath);
        await createDir(builtXsdTranslationsCategoriesPath);
        for (const contractXsdFile of CONTRACT_XSD_FILES) {
            await cloneFile(
                contractsPath + contractXsdFile,
                builtXsdContractsPath + '/' + contractXsdFile
            );
        }

        /** Configuration **/
        completeData.config = {...declaration, ...completeData.config};
        dataBuilt = createXmlFromMap(completeData.config, 'settings', xmlMap);
        let xmlData = js2xml(dataBuilt, { compact: true, spaces: 4 });
        let xmlMinData = js2xml(dataBuilt, { compact: true, spaces: 0 });

        await writeFile(destination + 'config.xml', xmlData);
        await writeFile(destination + 'config.min.xml', xmlMinData);

        /** Main Data **/
        for (let [key, data] of Object.entries(completeData.data)) {
            keyCap = key.charAt(0).toUpperCase() + key.slice(1);
            dataBuilt = {
                ...declaration,
                [key]: {
                    "_attributes": {
                        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"
                    },
                    ...createXmlFromMap(data, key, xmlMap)
                }
            };

            xmlData = js2xml(dataBuilt, { compact: true, spaces: 4 });
            xmlMinData = js2xml(dataBuilt, { compact: true, spaces: 0 })
                .replace(/<!\[CDATA\[(.*?)]]>/gs, (match, cdataContent) => {
                    const minimizedContent = cdataContent.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
                    return `<![CDATA[${minimizedContent}]]>`;
                });

            await writeFile(destination + key + '.xml', xmlData);
            await writeFile(destination + key + '.min.xml', xmlMinData);
            await cloneFile(
                join(translationsXsdPath, key + '.xsd'),
                builtXsdTranslationsPath + '/' + key + '.xsd'
            );
            console.log(chalk.cyan(`         - Main data for 'xml' app for '${key}' has been written`));

            /** Translations Data **/
            for (const [lang, dataTrans] of Object.entries(completeData.translations[key] || {})) {
                dataBuilt = {
                    ...declaration,
                    ['translations'+keyCap]: {
                        "_attributes": {
                            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                            "language": lang
                        },
                        ...createXmlFromMap(refactorTranslationObj(dataTrans), 'translations'+keyCap, xmlMap)
                    }
                };
                xmlData = js2xml(dataBuilt, { compact: true, spaces: 4 });
                xmlMinData = js2xml(dataBuilt, { compact: true, spaces: 0 });
                await writeFile(destination + completeData.TranslationDir + lang + '/' + key + '.xml',
                    xmlData);
                await writeFile(
                    destination + completeData.TranslationDir + lang + '/' + key + '.min.xml',
                    xmlMinData
                );
                console.log(
                    chalk.cyan(
                        `         - Translations language data '${lang}' for 'xml' app for '${key}' has been written`
                    )
                );
            }

            /** Translations Categories Data **/
            if (Object.prototype.hasOwnProperty.call(completeData.translationsCategories, key)) {
                for (const [lang, dataCatTrans] of Object.entries(completeData.translationsCategories[key] || {})) {
                    dataBuilt = {
                        ...declaration,
                        ['translationsCategories'+keyCap]: {
                            "_attributes": {
                                "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                                "language": lang
                            },
                            ...createXmlFromMap(dataCatTrans,  'translationsCategories'+keyCap, xmlMap)
                        }
                    };
                    xmlData = js2xml(dataBuilt, { compact: true, spaces: 4 });
                    xmlMinData = js2xml(dataBuilt, { compact: true, spaces: 0 });
                    await writeFile(destination + completeData.TranslationDir + lang + '/'
                        + completeData.TranslationCategoriesDir + key + '.xml', xmlData );
                    await writeFile(destination + completeData.TranslationDir + lang + '/'
                        + completeData.TranslationCategoriesDir + key + '.min.xml', xmlMinData );
                    await cloneFile(
                        join(translationsCategoriesXsdPath, key + '.xsd'),
                        builtXsdTranslationsCategoriesPath + '/' + key + '.xsd'
                    );
                    console.log(
                        chalk.cyan(
                            '         - Translations Categories language data `' + lang +'` for `xml` app for `'
                            + key + '` has been written'
                        )
                    );
                }
            }
        }
    }
};

/**
 * Creation of the JSON for the XML transformation
 */
const createXmlFromMap = (data, rootElement, map) => {
    let tagKey = null;
    let attributeKey = null;
    let typeKey = null;
    let xmlObject = {};

    if (map[rootElement] && typeof map[rootElement] === 'object') {
        map = map[rootElement];
        if ('@tag' in map) {
            tagKey = map['@tag'];
        }
        if ('@attribute' in map) {
            attributeKey = map['@attribute'];
            if (typeof attributeKey !== 'string') {
                attributeKey = null;
            }
        }
        if ('@type' in map) {
            typeKey = map['@type'];
            if (typeof typeKey !== 'object') {
                typeKey = null;
            }
        }
        if (tagKey && (tagKey in map)) {
            map = map[tagKey];
        }
    }

    if (Array.isArray(data) && map && map['@childtag']) {
        const childTag = map['@childtag'];
        const parentTag = tagKey || rootElement;

        const xmlObject = {};
        xmlObject[parentTag] = data.map(item => {
            const rangeObj = {};

            if (Array.isArray(item)) {
                rangeObj[childTag] = item.map(val => ({ _text: val }));
            } else if (typeof item === 'object' && item !== null) {
                rangeObj[childTag] = Object.values(item).map(val => (
                    typeof val === 'object' ? val : { _text: val }
                ));
            } else {
                rangeObj[childTag] = [{ _text: item }];
            }
            return rangeObj;
        });

        return xmlObject;
    }


    if (typeof data === 'object' && data !== null) {
        for (let key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                let customKey = null;
                if (map[key] && '@custom' in map[key]) {
                    customKey = map[key]['@custom'];
                }

                let element = data[key];

                const isAnObject = (typeof element === 'object' && element !== null);
                if(isAnObject) {
                    element = createXmlFromMap(element, key, map);
                }
                if (tagKey) {
                    if (!xmlObject[tagKey]) {
                        xmlObject[tagKey] = [];
                    }
                    if(isAnObject) {
                        xmlObject[tagKey].push({
                            _attributes: attributeKey ? { [attributeKey]: key.toString() } : {},
                            ...element
                        });
                    } else {
                        if (typeKey && typeKey[key] === 'CDATA') {
                            xmlObject[tagKey].push({
                                _attributes: attributeKey ? { [attributeKey]: key.toString() } : {},
                                _cdata: element
                            });
                        } else if (customKey && customKey === 'NULLABLEINTEGER' && element === null) {
                            xmlObject[tagKey].push({
                                _attributes: { 'xsi:nil': 'true' }
                            });
                        } else {
                            xmlObject[tagKey].push({
                                _attributes: attributeKey ? { [attributeKey]: key.toString() } : {},
                                _text: element
                            });
                        }
                    }
                } else {
                    if (!xmlObject[key]) {
                        xmlObject[key] = [];
                    }
                    if (typeKey && typeKey[key] === 'CDATA') {
                        xmlObject[key] = { _cdata: element };
                    } else if (customKey && customKey === 'NULLABLEINTEGER' && element === null) {
                        xmlObject[key].push({
                            _attributes: { 'xsi:nil': 'true' }
                        });
                    } else {
                        xmlObject[key] = element;
                    }
                }
            }
        }
    } else {
        if (typeKey && typeKey[rootElement] === 'CDATA') {
            xmlObject = { _cdata: data };
        } else {
            xmlObject = data;
        }
    }

    return xmlObject;
};

/**
 * Refactoring of the Translation object for the XML mapping
 */
const refactorTranslationObj = (data) => {
    let refactored = [];
    for (let key in data) {
        let value = typeof data[key] === 'string' ? { "_text": data[key] } : { ...data[key] };
        refactored.push({
            "_attributes": {
                key: key
            },
            ...value
        });
    }
    return refactored;
};
