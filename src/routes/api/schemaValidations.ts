import * as expressValidator from "express-validator";
import api from "../../modules/api";
import { PdfOptions } from "src/modules/api/databaseManager/document";

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
                const documentExists = await api.database.document.exists(input.databasePath, input.accountId, { id });
                return documentExists !== undefined ? documentExists : false;
            }
        },
        errorMessage: "Must be an existing document id",
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
                const accountExists = await api.database.account.exists(input.databasePath, input.accountId, { id });
                return accountExists !== undefined ? accountExists : false;
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
        options: (pdfOptions: any): boolean => {
            // TODO
            return true;
        }
    },
    optional: true
});
