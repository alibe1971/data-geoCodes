import { configBuild } from '../../configBuild.js';

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const SCHEMA_OPEN = '<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" elementFormDefault="qualified">';
const SCHEMA_CLOSE = '</xs:schema>';

function wrapSchema(content) {
    return `${XML_HEADER}\n${SCHEMA_OPEN}\n${content}\n${SCHEMA_CLOSE}\n`;
}

function renderCollectionSchema(collection, item, body, attributeType = null) {
    const indexAttribute = attributeType
        ? `\n                        <xs:attribute name="index" type="${attributeType}" use="optional"/>`
        : '';
    return wrapSchema(`    <xs:element name="${collection}">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="${item}" maxOccurs="unbounded">
                    <xs:complexType>
                        <xs:sequence>
${body}
                        </xs:sequence>${indexAttribute}
                    </xs:complexType>
                </xs:element>
            </xs:sequence>
        </xs:complexType>
    </xs:element>`);
}

function buildCountriesModel() {
    const mottoNodes = configBuild.extra.countries.mottos.categories
        .map(cat => `                                        <xs:element name="${cat}">
                                            <xs:complexType>
                                                <xs:group ref="MottoCategoryGroup"/>
                                            </xs:complexType>
                                        </xs:element>`)
        .join('\n');

    const languageNodes = configBuild.extra.countries.languages.categories
        .map(cat => {
            if (cat === 'official') {
                return '                                        <xs:element name="official" type="OfficialLanguages"/>';
            }
            if (cat === 'signs') {
                return '                                        <xs:element name="signs" type="SignLanguages"/>';
            }
            return `                                        <xs:element name="${cat}" type="LanguageList"/>`;
        })
        .join('\n');

    const signsNodes = configBuild.extra.countries.languages.subCategories.signs
        .map(cat => `            <xs:element name="${cat}" type="LanguageList"/>`)
        .join('\n');

    const countryBody = `                <xs:element name="officialName">
                    <xs:complexType>
                        <xs:sequence>
                            <xs:element name="name" maxOccurs="unbounded" minOccurs="0">
                                <xs:complexType>
                                    <xs:simpleContent>
                                        <xs:extension base="xs:string">
                                            <xs:attribute name="lang" type="xs:string" use="required"/>
                                        </xs:extension>
                                    </xs:simpleContent>
                                </xs:complexType>
                            </xs:element>
                        </xs:sequence>
                    </xs:complexType>
                </xs:element>
                <xs:element name="alpha2" type="xs:string"/>
                <xs:element name="alpha3" type="xs:string"/>
                <xs:element name="unM49" type="xs:string"/>
                <xs:element name="flags">
                    <xs:complexType>
                        <xs:sequence>
                            <xs:element name="emoji" type="xs:string"/>
                            <xs:element name="svg" type="xs:string"/>
                        </xs:sequence>
                    </xs:complexType>
                </xs:element>
                <xs:element name="dependency" type="xs:string" nillable="true"/>
                <xs:element name="mottos">
                    <xs:complexType>
                        <xs:sequence>
${mottoNodes}
                        </xs:sequence>
                    </xs:complexType>
                </xs:element>
                <xs:element name="currencies">
                    <xs:complexType>
                        <xs:sequence>
                            <xs:element name="legalTenders">
                                <xs:complexType>
                                    <xs:sequence>
                                        <xs:element
                                            name="currency"
                                            type="xs:string"
                                            minOccurs="0"
                                            maxOccurs="unbounded"
                                        />
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>
                            <xs:element name="widelyAccepted">
                                <xs:complexType>
                                    <xs:sequence>
                                        <xs:element
                                            name="currency"
                                            type="xs:string"
                                            minOccurs="0"
                                            maxOccurs="unbounded"
                                        />
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>
                        </xs:sequence>
                    </xs:complexType>
                </xs:element>
                <xs:element name="dialCodes">
                    <xs:complexType>
                        <xs:sequence>
                            <xs:element name="deJure">
                                <xs:complexType>
                                    <xs:sequence>
                                        <xs:element name="dial" type="xs:string" minOccurs="0" maxOccurs="unbounded"/>
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>
                            <xs:element name="deFacto">
                                <xs:complexType>
                                    <xs:sequence>
                                        <xs:element name="dial" type="xs:string" minOccurs="0" maxOccurs="unbounded"/>
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>
                            <xs:element name="exceptions">
                                <xs:complexType>
                                    <xs:sequence>
                                        <xs:element name="dial" minOccurs="0" maxOccurs="unbounded">
                                            <xs:complexType>
                                                <xs:sequence>
                                                    <xs:element name="code" type="xs:string"/>
                                                    <xs:element name="origin" type="xs:string"/>
                                                </xs:sequence>
                                            </xs:complexType>
                                        </xs:element>
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>
                        </xs:sequence>
                    </xs:complexType>
                </xs:element>
                <xs:element name="ccIdn">
                    <xs:complexType>
                        <xs:sequence>
                            <xs:element name="idn" minOccurs="0" maxOccurs="unbounded">
                                <xs:complexType>
                                    <xs:sequence>
                                        <xs:element name="unicode" type="xs:string"/>
                                        <xs:element name="punycode" type="xs:string"/>
                                        <xs:element name="language" type="xs:string"/>
                                        <xs:element name="regionsOfUse">
                                            <xs:complexType>
                                                <xs:sequence>
                                                    <xs:element
                                                        name="region"
                                                        type="xs:string"
                                                        minOccurs="0"
                                                        maxOccurs="unbounded"
                                                    />
                                                </xs:sequence>
                                            </xs:complexType>
                                        </xs:element>
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>
                        </xs:sequence>
                    </xs:complexType>
                </xs:element>
                <xs:element name="timeZones">
                    <xs:complexType>
                        <xs:sequence>
                            <xs:element name="tz" type="xs:string" minOccurs="0" maxOccurs="unbounded"/>
                        </xs:sequence>
                    </xs:complexType>
                </xs:element>
                <xs:element name="languages">
                    <xs:complexType>
                        <xs:sequence>
${languageNodes}
                        </xs:sequence>
                    </xs:complexType>
                </xs:element>
                <xs:element name="localesIcu">
                    <xs:complexType>
                        <xs:sequence>
                            <xs:element name="locale" type="xs:string" minOccurs="0" maxOccurs="unbounded"/>
                        </xs:sequence>
                    </xs:complexType>
                </xs:element>
                <xs:element name="otherAppsIds">
                    <xs:complexType>
                        <xs:sequence>
                            <xs:element name="geoNamesOrg" type="xs:int" nillable="true"/>
                            <xs:element name="wikiData" type="xs:string" nillable="true"/>
                            <xs:element name="openStreetMapRelation" type="xs:int" nillable="true"/>
                        </xs:sequence>
                    </xs:complexType>
                </xs:element>`;

    const sharedDefs = `    <xs:group name="MottoCategoryGroup">
        <xs:sequence>
            <xs:element name="entry" minOccurs="0" maxOccurs="unbounded">
                <xs:complexType>
                    <xs:sequence>
                        <xs:element name="motto" minOccurs="0" maxOccurs="unbounded">
                            <xs:complexType>
                                <xs:simpleContent>
                                    <xs:extension base="xs:string">
                                        <xs:attribute name="lang" type="xs:string" use="required"/>
                                    </xs:extension>
                                </xs:simpleContent>
                            </xs:complexType>
                        </xs:element>
                    </xs:sequence>
                </xs:complexType>
            </xs:element>
        </xs:sequence>
    </xs:group>

    <xs:complexType name="LanguageList">
        <xs:sequence>
            <xs:element name="language" type="xs:string" minOccurs="0" maxOccurs="unbounded"/>
        </xs:sequence>
    </xs:complexType>

    <xs:complexType name="OfficialLanguages">
        <xs:sequence>
            <xs:element name="deJure" type="LanguageList"/>
            <xs:element name="deFacto" type="LanguageList"/>
        </xs:sequence>
    </xs:complexType>

    <xs:complexType name="SignLanguages">
        <xs:sequence>
${signsNodes}
        </xs:sequence>
    </xs:complexType>`;

    return { countryBody, sharedDefs };
}

function renderCountriesCollectionXsd() {
    const { countryBody, sharedDefs } = buildCountriesModel();
    return wrapSchema(`    <xs:element name="countries">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="country" maxOccurs="unbounded">
                    <xs:complexType>
                        <xs:sequence>
${countryBody}
                        </xs:sequence>
                        <xs:attribute name="index" type="xs:int" use="optional"/>
                    </xs:complexType>
                </xs:element>
            </xs:sequence>
        </xs:complexType>
    </xs:element>

${sharedDefs}`);
}

const configSchema = wrapSchema(`    <xs:element name="settings">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="languages">
                    <xs:complexType>
                        <xs:sequence>
                            <xs:element name="default" type="xs:string"/>
                            <xs:element name="inPackage">
                                <xs:complexType>
                                    <xs:sequence>
                                        <xs:element
                                            name="language"
                                            type="xs:string"
                                            minOccurs="0"
                                            maxOccurs="unbounded"
                                        />
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>
                        </xs:sequence>
                    </xs:complexType>
                </xs:element>
            </xs:sequence>
        </xs:complexType>
    </xs:element>`);

const currenciesBody = `                            <xs:element name="isoAlpha" type="xs:string"/>
                            <xs:element name="isoNumber" type="xs:string"/>
                            <xs:element name="symbol" type="xs:string" nillable="true"/>
                            <xs:element name="decimal" type="xs:int" nillable="true"/>
                            <xs:element name="scope">
                                <xs:complexType>
                                    <xs:sequence>
                                        <xs:element name="code" type="xs:string"/>
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>`;

const geoSetsBody = `                            <xs:element name="internalCode" type="xs:string"/>
                            <xs:element name="unM49" type="xs:string" nillable="true"/>
                            <xs:element name="scope">
                                <xs:complexType>
                                    <xs:sequence>
                                        <xs:element name="code" type="xs:string"/>
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>
                            <xs:element name="tags">
                                <xs:complexType>
                                    <xs:sequence>
                                        <xs:element name="tag" type="xs:string" maxOccurs="unbounded"/>
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>
                            <xs:element name="countryCodes">
                                <xs:complexType>
                                    <xs:sequence>
                                        <xs:element name="cc" type="xs:string" maxOccurs="unbounded"/>
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>`;

const languagesBody = `                            <xs:element name="isoCode" type="xs:string" minOccurs="0"/>
                            <xs:element name="part2b" type="xs:string" minOccurs="0" nillable="true"/>
                            <xs:element name="part2t" type="xs:string" minOccurs="0" nillable="true"/>
                            <xs:element name="part1" type="xs:string" minOccurs="0" nillable="true"/>
                            <xs:element name="glottoCode" type="xs:string" minOccurs="0" nillable="true"/>
                            <xs:element name="scope">
                                <xs:complexType>
                                    <xs:sequence>
                                        <xs:element name="code" type="xs:string"/>
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>
                            <xs:element name="type">
                                <xs:complexType>
                                    <xs:sequence>
                                        <xs:element name="code" type="xs:string"/>
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>
                            <xs:element name="macroLanguageRef" type="xs:string" minOccurs="0" nillable="true"/>
                            <xs:element name="scripts">
                                <xs:complexType>
                                    <xs:sequence>
                                        <xs:element name="script" type="xs:string" maxOccurs="unbounded" minOccurs="0"/>
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>`;

const scriptsBody = `                            <xs:element name="code" type="xs:string" minOccurs="0"/>
                            <xs:element name="numeric" type="xs:string" minOccurs="0"/>
                            <xs:element name="writingDirection">
                                <xs:complexType>
                                    <xs:sequence>
                                        <xs:element name="code" type="xs:string"/>
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>
                            <xs:element name="unicode">
                                <xs:complexType>
                                    <xs:sequence>
                                        <xs:element name="version" type="xs:string"/>
                                        <xs:element name="ranges">
                                            <xs:complexType>
                                                <xs:sequence>
                                                    <xs:element name="range" maxOccurs="unbounded" minOccurs="0">
                                                        <xs:complexType>
                                                            <xs:sequence>
                                                                <xs:element name="edge" maxOccurs="2" minOccurs="1"/>
                                                            </xs:sequence>
                                                        </xs:complexType>
                                                    </xs:element>
                                                </xs:sequence>
                                            </xs:complexType>
                                        </xs:element>
                                        <xs:element name="totalCodePoints" type="xs:int"/>
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>`;

export const xsdSchemaConfig = {
    'config.xsd': () => configSchema,
    'countries.xsd': () => renderCountriesCollectionXsd(),
    'currencies.xsd': () => renderCollectionSchema('currencies', 'currency', currenciesBody, 'xs:int'),
    'geoSets.xsd': () => renderCollectionSchema('geoSets', 'geoSet', geoSetsBody, 'xs:string'),
    'languages.xsd': () => renderCollectionSchema('languages', 'language', languagesBody, 'xs:int'),
    'scripts.xsd': () => renderCollectionSchema('scripts', 'script', scriptsBody, 'xs:int')
};

const renderSimpleTranslationsSchema = (datasetPlural, itemTag) => `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema attributeFormDefault="unqualified" elementFormDefault="qualified" xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <xs:element name="translations${datasetPlural}">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="${itemTag}" maxOccurs="unbounded" minOccurs="0">
                    <xs:complexType>
                        <xs:sequence>
                            <xs:element type="xs:string" name="name" minOccurs="0"/>
                        </xs:sequence>
                        <xs:attribute type="xs:string" name="key" use="required"/>
                    </xs:complexType>
                </xs:element>
            </xs:sequence>
            <xs:attribute type="xs:string" name="language"/>
        </xs:complexType>
    </xs:element>
</xs:schema>`;

const renderCountriesTranslationsSchema = () => `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema attributeFormDefault="unqualified" elementFormDefault="qualified" xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <xs:element name="translationsCountries">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="country" maxOccurs="unbounded" minOccurs="0">
                    <xs:complexType>
                        <xs:sequence>
                            <xs:element type="xs:string" name="name" minOccurs="0"/>
                            <xs:element type="xs:string" name="fullName" minOccurs="0"/>
                            <xs:element name="demonyms" minOccurs="0">
                                <xs:complexType mixed="true">
                                    <xs:sequence>
                                        <xs:element
                                            type="xs:string"
                                            name="demonym"
                                            maxOccurs="unbounded"
                                            minOccurs="0"
                                        />
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>
                            <xs:element name="keywords" minOccurs="0">
                                <xs:complexType mixed="true">
                                    <xs:sequence>
                                        <xs:element
                                            type="xs:string"
                                            name="keyword"
                                            maxOccurs="unbounded"
                                            minOccurs="0"
                                        />
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>
                        </xs:sequence>
                        <xs:attribute type="xs:string" name="key" use="required"/>
                    </xs:complexType>
                </xs:element>
            </xs:sequence>
            <xs:attribute type="xs:string" name="language"/>
        </xs:complexType>
    </xs:element>
</xs:schema>`;

const renderEnumNodeElements = entries => entries
    .map(value => `                            <xs:element name="${value}" type="xs:string" minOccurs="0"/>`)
    .join('\n');

const renderTranslationsCategoriesSchema = (datasetPlural, sections) => {
    const sectionsXml = sections.map(section => `                <xs:element name="${section.name}" minOccurs="0">
                    <xs:complexType>
                        <xs:sequence>
${renderEnumNodeElements(section.values)}
                        </xs:sequence>
                    </xs:complexType>
                </xs:element>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" elementFormDefault="qualified">
    <xs:element name="translationsCategories${datasetPlural}">
        <xs:complexType>
            <xs:sequence>
${sectionsXml}
            </xs:sequence>
            <xs:attribute name="language" type="xs:string" use="required"/>
        </xs:complexType>
    </xs:element>
</xs:schema>`;
};

export const xsdOriginTranslationsSchemaConfig = {
    'countries.xsd': () => renderCountriesTranslationsSchema(),
    'currencies.xsd': () => renderSimpleTranslationsSchema('Currencies', 'currency'),
    'geoSets.xsd': () => renderSimpleTranslationsSchema('GeoSets', 'geoSet'),
    'languages.xsd': () => renderSimpleTranslationsSchema('Languages', 'language'),
    'scripts.xsd': () => renderSimpleTranslationsSchema('Scripts', 'script')
};

export const xsdOriginTranslationsCategoriesSchemaConfig = {
    'currencies.xsd': () => renderTranslationsCategoriesSchema('Currencies', [
        { name: 'scope', values: configBuild.extra.currencies.scopes }
    ]),
    'geoSets.xsd': () => renderTranslationsCategoriesSchema('GeoSets', [
        { name: 'scope', values: configBuild.extra.geoSets.internalCode }
    ]),
    'languages.xsd': () => renderTranslationsCategoriesSchema('Languages', [
        { name: 'scope', values: configBuild.extra.languages.scopes },
        { name: 'type', values: configBuild.extra.languages.types }
    ]),
    'scripts.xsd': () => renderTranslationsCategoriesSchema('Scripts', [
        { name: 'writingDirection', values: configBuild.extra.scripts.direction }
    ])
};
