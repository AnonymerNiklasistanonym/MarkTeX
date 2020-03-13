
import * as group from "./types/groups";
import * as document from "./types/documents";


/**
 * REMOVE LATER WHEN IMPLEMENTATION FINISHED
 *
 * @param ms
 */
const timeout = async (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * @returns The document if existing and permission
 * @param accountId
 * @param documentId
 */
export const getDocument = async (accountId: number, documentId: number): Promise<document.DocumentInfo> => {
    // eslint-disable-next-line no-console
    console.log(`get document with accountId='${accountId}' and documentId='${documentId}'`);
    await timeout(10);
    return {
        id: 100,
        adminAccountId: 42,
        dateCreation: new Date(),
        dateLastEdit: new Date(),
        usersWithPermission: [],
        metadata: {}
    };
};

export const updateDocument = (): void => {
    // TODO accounts, permissions, content, metadata
};

export const createDocument = (): void => {
    // TODO User will be admin of document
};

export const removeDocument = (): void => {
    // TODO Only admin can do this
};

export const addDocumentResource = (): void => {
    // TODO images, pdf, text, ...
};

export const updateDocumentResource = (): void => {
    // TODO images, pdf, text, ...
};

export const removeDocumentResource = (): void => {
    // TODO images, pdf, text, ...
};

/**
 * @returns The document if existing and permission
 * @param accountId
 * @param groupId
 */
export const getGroup = async (accountId: number, groupId: number): Promise<group.GroupInfo> => {
    // eslint-disable-next-line no-console
    console.log(`get group with accountId='${accountId}' and groupId='${groupId}'`);
    await timeout(10);
    return {
        id: 100,
        adminAccountId: 42,
        dateCreation: new Date(),
        dateLastEdit: new Date(),
        usersWithPermission: [],
        documents: []
    };
};

export const updateGroup = (): void => {
    // TODO accounts, permissions, content, metadata
};

export const createGroup = (): void => {
    // TODO User will be admin of document
};

export const removeGroup = (): void => {
    // TODO Only admin can do this
};
