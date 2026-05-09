import path from 'path';
import { createDir, writeFile } from '../../utils.js';
import { xsdSchemaConfig } from './schemaConfig.js';

const LIST_KEYS = ['config', 'countries', 'currencies', 'geoSets', 'languages', 'scripts'];
const SINGLE_KEYS = ['country', 'currency', 'geoSet', 'language', 'script'];

export function buildXsdSchemas() {
    const result = {};
    for (const [filename, renderer] of Object.entries(xsdSchemaConfig)) {
        if (typeof renderer !== 'function') {
            continue;
        }
        result[filename] = renderer();
    }
    return result;
}

export async function writeXsdSchemas(basePath) {
    await createDir(basePath);
    const schemas = buildXsdSchemas();
    for (const [filename, xsd] of Object.entries(schemas)) {
        await writeFile(path.join(basePath, filename), xsd);
    }
}

export function getXmlAppXsdMap(schemas) {
    const map = {};
    for (const key of LIST_KEYS) {
        const filename = `${key}.xsd`;
        if (schemas[filename]) {
            map[key] = schemas[filename];
        }
    }
    return map;
}

export function getSingleXsdMap(schemas) {
    const map = {};
    for (const key of SINGLE_KEYS) {
        const filename = `${key}.xsd`;
        if (schemas[filename]) {
            map[key] = schemas[filename];
        }
    }
    return map;
}
