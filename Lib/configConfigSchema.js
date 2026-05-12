export const configSchemaConfig = {
    root: {
        required: true,
        kind: 'object',
        cannotBeEmpty: true
    },
    settings: {
        required: true,
        kind: 'object',
        cannotBeEmpty: true
    },
    languages: {
        required: true,
        kind: 'object',
        cannotBeEmpty: true
    },
    fields: {
        inPackage: {
            required: true,
            kind: 'array',
            itemFormat: 'bcp47',
            itemMustBeSupportedByIntl: true
        },
        default: {
            required: true,
            kind: 'string',
            format: 'bcp47',
            mustBeSupportedByIntl: true,
            mustBeIn: 'inPackage'
        }
    }
};
