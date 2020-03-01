import * as user from "./user";

export enum DocumentNodeBaseType {
    MARKDOWN = 1,
    LATEX = 2
}

export interface DocumentNodeBase {
    /** Unique identifier for the database */
    id: number
    /** What is the type of this node */
    type: DocumentNodeBaseType
}

export interface DocumentNodeMarkdown extends DocumentNodeBase {
    content: string
}

export interface DocumentNodeLatex extends DocumentNodeBase {
    content: string
    imports: string[]
}

export interface DocumentInfoMetadata {
    title?: string
    authors?: string[]
    date?: Date
}

export interface DocumentInfoPermission {
    user: user.UserInfo
    read: boolean
    write: boolean
}

export interface DocumentInfo {
    /** Unique identifier for the database */
    id: number
    /** Account id of group owner */
    adminAccountId: number
    metadata: DocumentInfoMetadata
    usersWithPermission: DocumentInfoPermission[]
    dateLastEdit: Date
    dateCreation: Date
}

/**
 * A MarkTeX document has this format:
 * - A list of Markdown/LaTeX nodes
 */
export interface Document extends DocumentInfo {
    nodes: (DocumentNodeMarkdown | DocumentNodeLatex)[]
}
