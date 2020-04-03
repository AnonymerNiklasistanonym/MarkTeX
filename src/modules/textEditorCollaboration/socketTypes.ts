export enum ContentUpdateClientAction {
    ONLY_CARET = "ONLY_CARET",
    INSERT = "INSERT",
    DELETE = "DELETE",
    REPLACE = "REPLACE"
}
export interface ContentUpdateClient {
    documentId: number
    action: ContentUpdateClientAction
    caretPosStart?: number
    caretPosEnd?: number
    insertedAtPos?: number
    insertedText?: string
    deletedAtPos?: number
    deletedLength?: number
}
export interface ContentUpdateServer {
    caretPosStart: number
    caretPosEnd: number
    content?: string
}
export interface NewUserClient {
    documentId: number
    content: string
    caretPosStart: number
    caretPosEnd: number
}

export interface NewUserServer {
    connectionId: string
    accountId: number
    accountName: string
}

export interface RemoveUserServer {
    connectionId: string
}
export interface UndoClient {
    documentId: number
}
export interface RedoClient {
    documentId: number
}
