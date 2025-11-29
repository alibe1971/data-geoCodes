import chalk from 'chalk';
import fs from 'fs';
import fsExtra from 'fs-extra';
import path from 'path';
import { parseString } from 'xml2js';
import { optimize } from 'svgo';
import * as tags from 'language-tags';
import { parse as parseBcp47 } from 'bcp-47';
import isValidDomain from 'is-valid-domain';


export function readJsonFile(filePath) {
    return new Promise((resolve, reject) => {
        try {
            const data = fs.readFileSync(path.resolve(filePath), 'utf-8');
            const jsonData = JSON.parse(data);
            resolve(jsonData);
        } catch (err) {
            reject(chalk.red(`Error reading or parsing JSON file ${filePath}: ${err}`));
        }
    });
}

export function writeFile(filePath, data) {
    try {
        fs.writeFileSync(path.resolve(filePath), data, 'utf8');
        return chalk.green(`File ${filePath} has been successfully written.`);
    } catch (err) {
        throw new Error(chalk.red(`Error writing file ${filePath}: ${err}`));
    }
}

export function cloneFile(filePath, destination) {
    try {
        fs.copyFileSync(filePath, destination);
        return chalk.green(`File ${filePath} has been successfully cloned.`);
    } catch (err) {
        throw new Error(chalk.red(`Error cloning file ${filePath}: ${err}`));
    }

}

export function sortList(list, key) {
    list.sort((a, b) => {
        const aKey = a[key] || '';
        const bKey = b[key] || '';
        return aKey.localeCompare(bKey);
    });
    return list;
}

export function checkFile(filePath) {
    return fs.existsSync(filePath);
}

export function checkDir(directoryPath) {
    return new Promise((resolve) => {
        fs.access(directoryPath, fs.constants.F_OK, (err) => {
            resolve(!err);
        });
    });
}

export async function cleanDir(directoryPath, translationsDir, languages) {
    await deleteDir(directoryPath);
    await createDir(directoryPath);
    await createDir(path.join(directoryPath, translationsDir));
    for (const lang of languages) {
        await createDir(path.join(directoryPath, translationsDir, lang));
    }
}

export async function cloneDir(source, destination) {
    await deleteDir(destination);
    await fsExtra.copy(source, destination);
}

export async function deleteDir(directoryPath) {
    try {
        const resolvedPath = path.resolve(directoryPath);
        if (fs.existsSync(resolvedPath)) {
            fs.rmSync(resolvedPath, { recursive: true, force: true });
        }
    } catch (err) {
        throw new Error('utils/deleteDir reported ' + err);
    }
}

export async function createDir(directoryPath) {
    try {
        const resolvedPath = path.resolve(directoryPath);
        if (!fs.existsSync(resolvedPath)) {
            fs.mkdirSync(resolvedPath, { recursive: true });
        }
    } catch (err) {
        throw new Error('utils/createDir reported ' + err);
    }
}

export function errorMessage(type, collection, item, mainKey, prop, message, lang= null) {
    const typeObj =  {
        main: 'Main data: ',
        trans: 'Translation language: `' + lang + '`. '
    };
    let throwMessage = typeObj[type] + message + "\n"
        + ' - Collection: `' +  collection + '`' + "\n";
    if (item !== null) {
        throwMessage += ' - ' + item + ': `' + mainKey + '`'  + "\n";
    }
    throwMessage += ' - Property: `' + prop + '`';
    throw new Error(throwMessage);
}

export function getTranslationMandatoryString(
    collection,
    collectionItem,
    mainKey,
    currentObj,
    lang,
    defaultLanguage,
    prop
) {
    if(!Object.prototype.hasOwnProperty.call(currentObj, prop)) {
        if (lang === defaultLanguage) {
            throw new Error(
                errorMessage('trans', collection, collectionItem, mainKey, prop,
                    'Missing mandatory property for language `' + lang + '` (default language)',
                    lang
                )
            );
        } else {
            currentObj[prop] = null;
        }
    }
    if (currentObj[prop] !== null) {
        if (
            !requirements(currentObj[prop], 'mustBeString') ||
            !requirements(currentObj[prop], 'cannotBeEmpty')
        ) {
            throw new Error(
                errorMessage( 'trans', collection, collectionItem, mainKey, prop,
                    'The property must be a not empty string',
                    lang
                )
            );
        }
    }

    return currentObj[prop];
}

export function getMinimizedSvg(filePath) {
    return new Promise((resolve, reject) => {
        try {
            const data = fs.readFileSync(path.resolve(filePath), 'utf-8');

            parseSvg(data)
                .then(() => {
                    const optimizationResult = optimize(data, { path: filePath });
                    if (optimizationResult.error) {
                        reject(chalk.red(`Error optimizing SVG file ${filePath}: ${optimizationResult.error}`));
                    } else {
                        resolve(optimizationResult.data);
                    }
                })
                .catch(error => {
                    reject(chalk.red(`Error parsing SVG: ${error}`));
                });

        } catch (err) {
            reject(chalk.red(`Error reading file ${filePath}: ${err}`));
        }
    });
}

export function parseSvg(data) {
    return new Promise((resolve, reject) => {
        parseString(data, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

export function refactorLanguages(lang) {
    lang = lang.replace(/_/g, "-");
    try {
        return new Intl.Locale(lang).toString();
    } catch (err) {
        return 'error';
    }

}

export function requirements(prop, rule, regex=null) {
    switch (rule) {
    case 'mustBeObject':
        return ( typeof prop == 'object' && prop !== null && !Array.isArray(prop) );

    case 'mustBeArray':
        return ( typeof prop == 'object' && prop !== null && Array.isArray(prop) );

    case 'mustBeString':
        return ( typeof prop == 'string' );

    case 'mustBeStringOrNull':
        return ( (typeof prop == 'object' && prop === null) || typeof prop == 'string' );

    case 'mustBePositiveIntegerNotZero':
        return ( Number.isInteger(prop) && prop > 0);

    case 'mustBePositiveIntegerOrZero':
        return ( Number.isInteger(prop) && prop >= 0);

    case 'cannotBeEmpty': {
        let count = 0;
        if (typeof prop == 'object') {
            if (!Array.isArray(prop)) {
                count = Object.keys(prop).length;
            } else {
                count = prop.length;
            }
        } else if (typeof prop == 'string') {
            count = prop.replace(/ /g, '').length;
        } else {
            return false;
        }
        return (count !== 0);
    }
    case 'regex':
        return regex.test(prop);

    case 'bcp47': {
        const ast = parseBcp47(prop);
        if (!ast) return false;
        if (!tags.check(prop)) return false;
        if (!tags.language(ast.language)) return false;
        if (ast.script && !tags.type(ast.script, 'script')) return false;
        if (ast.region && !tags.region(ast.region)) return false;
        return true;
    }
    case 'validDomain': {
        const tld = prop.startsWith('.') ? prop.slice(1) : prop;
        return isValidDomain('example.' + tld, {
            subdomain: false,
            wildcard: false,
            allowUnicode: true
        });
    }
    default:
        //nothing
    }
}

/**
 * Check that the ranges do not overlap and calculate the total number of code points covered (inclusive ranges).
 *
 * @param {Array<{ start: number, end: number }>} normalizedRanges
 * @returns {{ overlaps: Array<object>, totalCodePoints: number }}
 */
export function checkRangesAndTotal(normalizedRanges) {
    const ranges = [...normalizedRanges].sort((a, b) => a.start - b.start);
    let lastEnd = null;
    let overlaps = [];
    let totalCodePoints = 0;

    for (let i = 0; i < ranges.length; i++) {
        const { start, end } = ranges[i];

        if (lastEnd !== null && start <= lastEnd) {
            overlaps.push({
                index: i,
                current: { start, end },
                previous: { end: lastEnd }
            });
        }

        totalCodePoints += (end - start + 1);

        lastEnd = Math.max(lastEnd ?? end, end);
    }

    return { overlaps, totalCodePoints };
}
