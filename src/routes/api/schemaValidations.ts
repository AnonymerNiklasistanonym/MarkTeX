import * as expressValidator from "express-validator";
import { PdfOptions, PdfOptionsPaperSize } from "../../modules/api/databaseManager/documentPdfOptions";
import api from "../../modules/api";
import { debuglog } from "util";


const debug = debuglog("app-express-route-api-schema-validation");

export interface InputSchemaValidationExistingDocumentId {
    databasePath: string
    accountId: number
}

export const getDocumentIdExists = (
    input: InputSchemaValidationExistingDocumentId
): expressValidator.ValidationParamSchema => {
    return {
        custom: {
            options: async (id: number): Promise<boolean> => {
                const exists = await api.database.document.exists(input.databasePath, { id });
                debug(`Document id exists: ${exists}`);
                return exists;
            }
        },
        errorMessage: "Must be an existing document id",
        isInt: true
    };
};

export interface InputSchemaValidationExistingGroupId {
    databasePath: string
    accountId: number
}

export const getGroupIdExists = (
    input: InputSchemaValidationExistingGroupId
): expressValidator.ValidationParamSchema => {
    return {
        custom: {
            options: async (id: number): Promise<boolean> => {
                const exists = await api.database.group.exists(input.databasePath, { id });
                debug(`Group id exists: ${exists}`);
                return exists;
            }
        },
        errorMessage: "Must be an existing group id",
        isInt: true
    };
};

export interface InputSchemaValidationExistingAccountFriendId {
    databasePath: string
    accountId: number
}

export const getAccountFriendIdExists = (
    input: InputSchemaValidationExistingAccountFriendId
): expressValidator.ValidationParamSchema => {
    return {
        custom: {
            options: async (id: number): Promise<boolean> => {
                const exists = await api.database.accountFriend.exists(input.databasePath, { id });
                debug(`Account friend id exists: ${exists}`);
                return exists;
            }
        },
        errorMessage: "Must be an existing group id",
        isInt: true
    };
};

export interface InputSchemaValidationExistingAccountId {
    databasePath: string
    accountId: number
}

export const getAccountIdExists = (
    input: InputSchemaValidationExistingAccountId
): expressValidator.ValidationParamSchema => {
    return {
        custom: {
            options: async (id: number): Promise<boolean> => {
                const exists = await api.database.account.exists(input.databasePath, { id });
                debug(`Group id exists: ${exists}`);
                return exists;
            }
        },
        errorMessage: "Must be an existing account id",
        isInt: true
    };
};

export interface GetApiVersionSupportedOptions {
    couldBeString?: boolean
    supportedApiVersions?: number[]
}

export const getApiVersionSupported = (
    options: GetApiVersionSupportedOptions = {}
): expressValidator.ValidationParamSchema => ({
    custom: {
        options: (apiVersion: number): boolean => {
            const supportedApiVersions = options.supportedApiVersions ? options.supportedApiVersions : [1];
            if (options.couldBeString) {
                if (isNaN(apiVersion)) {
                    throw new Error("API version was not a string or number");
                }
                apiVersion = Number(apiVersion);
            }
            if (supportedApiVersions.includes(apiVersion)) {
                return true;
            }
            throw new Error(`API version ${apiVersion} is not supported (${supportedApiVersions.join(",")})`);
        }
    },
    isInt: options.couldBeString ? undefined : true
});

export const getDocumentPdfOptions = (): expressValidator.ValidationParamSchema => ({
    custom: {
        // eslint-disable-next-line complexity
        options: (pdfOptions: PdfOptions): boolean => {
            const supportedKeys = [
                "footer", "header", "pageNumbers", "paperSize", "tableOfContents",
                "useAuthors", "useDate", "useTitle", "isPresentation", "landscape",
                "twoColumns"
            ];
            if (pdfOptions === undefined) {
                return true;
            }
            if (typeof pdfOptions !== "object") {
                throw Error(`Pdf options must be an object (is=${typeof pdfOptions})`);
            }
            for (const key of Object.keys(pdfOptions)) {
                if (!supportedKeys.includes(key)) {
                    throw Error(`The key '${key}' is not a supported pdf option`);
                }
            }
            if (pdfOptions.useDate !== undefined && typeof pdfOptions.useDate !== "boolean") {
                throw Error(`The key 'useDate' must be a boolean (is=${typeof pdfOptions.useDate})`);
            }
            if (pdfOptions.useAuthors !== undefined && typeof pdfOptions.useAuthors !== "boolean") {
                throw Error(`The key 'useAuthors' must be a boolean (is=${typeof pdfOptions.useAuthors})`);
            }
            if (pdfOptions.useTitle !== undefined && typeof pdfOptions.useTitle !== "boolean") {
                throw Error(`The key 'useDate' must be a boolean (is=${typeof pdfOptions.useTitle})`);
            }
            if (pdfOptions.pageNumbers !== undefined && typeof pdfOptions.pageNumbers !== "boolean") {
                throw Error(`The key 'pageNumbers' must be a boolean (is=${typeof pdfOptions.pageNumbers})`);
            }
            if (pdfOptions.paperSize !== undefined && pdfOptions.paperSize !== PdfOptionsPaperSize.A4) {
                throw Error(`The key 'paperSize' has an unsupported value (is=${pdfOptions.paperSize},supported=[${
                    PdfOptionsPaperSize.A4}])`);
            }
            if (pdfOptions.paperSize !== undefined && pdfOptions.paperSize !== PdfOptionsPaperSize.A4) {
                throw Error(`The key 'paperSize' has an unsupported value (is=${pdfOptions.paperSize},supported=[${
                    PdfOptionsPaperSize.A4}])`);
            }
            if (pdfOptions.tableOfContents !== undefined && typeof pdfOptions.tableOfContents !== "object") {
                throw Error(`The key 'tableOfContents' must be an object (is=${typeof pdfOptions.tableOfContents})`);
            }
            if (pdfOptions.footer !== undefined) {
                if (typeof pdfOptions.footer !== "object") {
                    throw Error(`The key 'footer' must be an object (is=${typeof pdfOptions.footer})`);
                }
                if (pdfOptions.footer.enabled !== undefined && typeof pdfOptions.footer.enabled !== "boolean") {
                    throw Error(`The key 'footer.enabled' must be a boolean (is=${typeof pdfOptions.footer.enabled})`);
                }
                if (pdfOptions.footer.text !== undefined && typeof pdfOptions.footer.text !== "string") {
                    throw Error(`The key 'footer.text' must be a text (is=${typeof pdfOptions.footer.text})`);
                }
            }
            if (pdfOptions.header !== undefined) {
                if (typeof pdfOptions.header !== "object") {
                    throw Error(`The key 'header' must be an object (is=${typeof pdfOptions.header})`);
                }
                if (pdfOptions.header.enabled !== undefined && typeof pdfOptions.header.enabled !== "boolean") {
                    throw Error(`The key 'header.enabled' must be a boolean (is=${typeof pdfOptions.header.enabled})`);
                }
                if (pdfOptions.header.text !== undefined && typeof pdfOptions.header.text !== "string") {
                    throw Error(`The key 'header.text' must be a text (is=${typeof pdfOptions.header.text})`);
                }
            }
            if (pdfOptions.tableOfContents !== undefined) {
                if (typeof pdfOptions.tableOfContents !== "object") {
                    throw Error(`The key 'tableOfContents' must be an object (is=${
                        typeof pdfOptions.tableOfContents})`);
                }
                if (pdfOptions.tableOfContents.enabled !== undefined
                    && typeof pdfOptions.tableOfContents.enabled !== "boolean") {
                    throw Error(`The key 'tableOfContents.enabled' must be a boolean (is=${
                        typeof pdfOptions.tableOfContents.enabled})`);
                }
                if (pdfOptions.tableOfContents.depth !== undefined
                    && typeof pdfOptions.tableOfContents.depth !== "number") {
                    throw Error(`The key 'tableOfContents.depth' must be a number (is=${
                        typeof pdfOptions.tableOfContents.depth})`);
                }
            }
            if (pdfOptions.isPresentation !== undefined && typeof pdfOptions.isPresentation !== "boolean") {
                throw Error(`The key 'isPresentation' must be a boolean (is=${typeof pdfOptions.isPresentation})`);
            }
            if (pdfOptions.twoColumns !== undefined && typeof pdfOptions.twoColumns !== "boolean") {
                throw Error(`The key 'twoColumns' must be a boolean (is=${typeof pdfOptions.twoColumns})`);
            }
            if (pdfOptions.landscape !== undefined && typeof pdfOptions.landscape !== "boolean") {
                throw Error(`The key 'landscape' must be a boolean (is=${typeof pdfOptions.landscape})`);
            }
            return true;
        }
    },
    optional: true
});
