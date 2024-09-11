import chalk from 'chalk';
import { writeFile } from '../utils.js';
import { js2xml } from 'xml-js';

/**
 * Map for the XML creation
 */
const xmlMap = {
    settings: {
        languages: {
            inPackage: {
                "@tag": "locale",
                "@attribute": "language",
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
                    "@tag": "motto",
                    "@attribute": "lang",
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
            dialCodes: {
                main: {
                    "@tag": "dial"
                },
                exceptions: {
                    "@tag": "dial"
                }
            },
            timeZones: {
                "@tag": "tz"
            },
            locales: {
                "@tag": "locale"
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
                .replace(/<!\[CDATA\[(.*?)\]\]>/gs, (match, cdataContent) => {
                    const minimizedContent = cdataContent.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
                    return `<![CDATA[${minimizedContent}]]>`;
                });

            await writeFile(destination + key + '.xml', xmlData);
            await writeFile(destination + key + '.min.xml', xmlMinData);
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
        }
    }
};

/**
 * Creation of the json for the xml transformation
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
 * Refactoring of the Translation object for the xml mapping
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
