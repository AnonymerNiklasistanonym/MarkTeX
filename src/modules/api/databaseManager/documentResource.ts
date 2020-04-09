import * as account from "./account";
import * as database from "../../database";
import * as document from "./document";


/** Errors that can happen during a document resource creation */
export enum CreateError {}

/** Errors that can happen during document resource requests */
export enum GeneralError {
    NO_ACCESS = "DOCUMENT_RESOURCE_NO_ACCESS",
    NOT_EXISTING = "DOCUMENT_RESOURCE_NOT_EXISTING"
}

/** Information about the SQlite table for document resources */
export const table = {
    /** SQlite column names for document resources table */
    column: {
        /** Is the data text or binary */
        binary: "binary",
        /** The data of the document resource */
        data: "data",
        /** The id of the document that this document resource belongs to */
        documentId: "document_id",
        /** The unique document resource id */
        id: "id",
        /** The name of the resource */
        name: "name"
    },
    /** SQlite table name for document resources */
    name: "document_resource"
} as const;
