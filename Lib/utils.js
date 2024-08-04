import chalk from 'chalk';
import fs from 'fs';
import fsExtra from 'fs-extra';
import path from 'path';
import { parseString } from 'xml2js';
import {optimize} from "svgo";


export function readJsonFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(path.resolve(filePath), 'utf-8', (err, data) => {
            if (err) {
                reject(chalk.red(`Error reading file ${filePath}: ${err}`));
            } else {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (err) {
                    reject(chalk.red(`Error parsing JSON file ${filePath}: ${err}`));
                }
            }
        });
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

export function sortList(list, key) {
    list.sort((a, b) => {
        const aKey = a[key] || '';
        const bKey = b[key] || '';
        return aKey.localeCompare(bKey);
    });
    return list;
}

export function checkDir(directoryPath) {
    return new Promise((resolve) => {
        fs.access(directoryPath, fs.constants.F_OK, (err) => {
            if (err) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

export async function cleanDir(directoryPath, translationsDir, languages) {
    await deleteDir(directoryPath);
    await createDir(directoryPath);
    await createDir(directoryPath + translationsDir);
    for (let i = 0; i < languages.length; i++) {
        await createDir(directoryPath + translationsDir + languages[i]);
    }
    return;
}


export async function cloneDir(source, destination) {
    await deleteDir(destination);
    await fsExtra.copy(source, destination);
    return;
}

export async function deleteDir(directoryPath) {
    try {
        const resolvedPath = path.resolve(directoryPath);
        if (fs.existsSync(resolvedPath)) {
            await fs.rmSync(resolvedPath, {recursive: true, force: true});
        }
    } catch (err) {
        throw new Error('utils/deleteDir reported ' + err);
    }

    return;
}

export async function createDir(directoryPath) {
    try {
        const resolvedPath = path.resolve(directoryPath);
        if (!fs.existsSync(resolvedPath)){
            await fs.mkdirSync(resolvedPath, { recursive: true });
        }
    } catch (err) {
        throw new Error('utils/createDir reported ' + err);
    }
    return;
}


export function checkForTranslationString(mainKey, currentObj, lang, defaultLanguage, prop) {
    if (!Object.prototype.hasOwnProperty.call(currentObj, mainKey)) {
        if (lang === defaultLanguage) {
            throw new Error(
                'Translation language: `' + lang + '`. Country: `' + mainKey + '`. Property: `' + prop
                + '`. Mandatory for language `' + defaultLanguage + '`'
            );
        }
        return false;
    }
    if (typeof currentObj[mainKey] !== 'string') {
        throw new Error(
            'Translation language: `' + lang + '`. Country: `' + mainKey + '`. Property: `' + prop
            + '`. It must be a string'
        );
    }
    if (currentObj[mainKey].length === 0) {
        if (lang === defaultLanguage) {
            throw new Error(
                'Translation language: `' + lang + '`. Country: `' + mainKey + '`. Property: `' + prop
                + '`. Mandatory for language `' + defaultLanguage + '`'
            );
        }
        return false;
    }
    return true;
}

export function getMinimizedSvg(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(path.resolve(filePath), 'utf-8', (err, data) => {
            if (err) {
                reject(chalk.red(`Error reading file ${filePath}: ${err}`));
                return;
            }

            parseSvg(data)
                .then(() => {
                    const optimizationResult = optimize(data, { path: filePath });
                    if (optimizationResult.error) {
                        reject(chalk.red(`Error optimizing SVG file ${filePath}: ${optimizationResult.error}`));
                    } else {
                        // console.log(chalk.green(`Successfully optimized SVG file ${filePath}`));
                        resolve(optimizationResult.data);
                    }
                })
                .catch(error => {
                    reject(chalk.red(`Error parsing SVG: ${error}`));
                });
        });
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
