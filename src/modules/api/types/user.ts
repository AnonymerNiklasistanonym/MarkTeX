export interface UserPassword {
    hash: string
    salt: string
}

export interface UserOptions {
    admin: boolean
    private: boolean
}

export interface UserInfo {
    /** Unique identifier for the database */
    id: number
    creationDate: Date
    lastOnline: Date
    currentlyOnline: boolean
    name: string
    status: string
}

export interface User extends UserInfo {
    password: UserPassword
    options: UserOptions
}
