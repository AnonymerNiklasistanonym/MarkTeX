import * as document from "./documents";
import * as user from "./user";

export interface GroupInfoPermission {
    user: user.UserInfo
    read: boolean
    write: boolean
}

export interface GroupInfo {
    /** Unique identifier for the database */
    id: number
    /** Account id of group owner */
    adminAccountId: number
    /** Document metadata */
    documents: document.DocumentInfo[]
    usersWithPermission: GroupInfoPermission[]
    dateLastEdit: Date
    dateCreation: Date
}

/**
 * A MarkTeX group has this format:
 * - A list of Documents
 */
export interface Group {
    /** Unique identifier for the database */
    id: number
    /** Document metadata */
    documents: document.DocumentInfo[]
}
