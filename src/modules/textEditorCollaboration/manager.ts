import * as socketTypes from "./socketTypes";
import { debuglog } from "util";
import socketIo from "socket.io";
import { SocketRequestInfo } from "src/config/sockets";


const debug = debuglog("app-text-editor-collaboration-manager");

export interface SocketOptions {
    getAccountName?: (accountId?: number) => Promise<string|undefined>
}

interface TodoInterfaceUser {
    name: string
    socket: socketIo.Socket
    caretPosStart: number
    caretPosEnd: number
}
interface TodoInterfaceContentHistoryEntryUserPosition {
    socket: socketIo.Socket
    caretPosStart: number
    caretPosEnd: number
}
interface TodoInterfaceContentHistoryEntry {
    time: Date
    content: string
    userPositions: TodoInterfaceContentHistoryEntryUserPosition[]
}
interface TodoInterface {
    documentId: number
    content: string
    historyUndo: TodoInterfaceContentHistoryEntry[]
    historyRedo: TodoInterfaceContentHistoryEntry[]
    connectedUsers: TodoInterfaceUser[]
}

const documents: TodoInterface[] = [];

const addUndoHistoryElement = (documentId: number, options: SocketOptions): void => {
    debug(`add undo history element: documentId=${documentId}`);
    const indexOfDocument = documents.findIndex(a => a.documentId === documentId);
    if (indexOfDocument === -1) {
        console.error(`Document ${documentId} was not found for new undo history element`);
        return;
    }
    documents[indexOfDocument].historyUndo.push({
        content: documents[indexOfDocument].content,
        time: new Date(),
        userPositions: documents[indexOfDocument].connectedUsers.map(a => ({
            caretPosEnd: a.caretPosEnd,
            caretPosStart: a.caretPosStart,
            socket: a.socket
        }))
    });
};

const addRedoHistoryElement = (documentId: number, options: SocketOptions): void => {
    debug(`add redo history element: documentId=${documentId}`);
    const indexOfDocument = documents.findIndex(a => a.documentId === documentId);
    if (indexOfDocument === -1) {
        console.error(`Document ${documentId} was not found for new redo history element`);
        return;
    }
    documents[indexOfDocument].historyRedo.push({
        content: documents[indexOfDocument].content,
        time: new Date(),
        userPositions: documents[indexOfDocument].connectedUsers.map(a => ({
            caretPosEnd: a.caretPosEnd,
            caretPosStart: a.caretPosStart,
            socket: a.socket
        }))
    });
};

export const registerNewUser = async (
    socket: socketIo.Socket, newUserInfo: socketTypes.NewUserClient, options: SocketOptions = {}
): Promise<void> => {
    debug(`register user: socketId=${socket.id},newUserInfo=${JSON.stringify(newUserInfo)}`);
    const socketRequest = socket.request as unknown as SocketRequestInfo;
    if (socketRequest.session?.accountId === undefined) {
        debug("do not register user because session is not authenticated");
        return;
    }
    let indexOfDocument = documents.findIndex(a => a.documentId === newUserInfo.documentId);
    if (indexOfDocument === -1) {
        debug("add new document entry");
        documents.push({
            connectedUsers: [],
            content: newUserInfo.content,
            documentId: newUserInfo.documentId,
            historyRedo: [],
            historyUndo: []
        });
        indexOfDocument = documents.findIndex(a => a.documentId === newUserInfo.documentId);
    } else {
        // Send existing progress to user
        const responseExistingProgress: socketTypes.ContentUpdateServer = {
            caretPosEnd: newUserInfo.caretPosEnd,
            caretPosStart: newUserInfo.caretPosStart,
            content: documents[indexOfDocument].content
        };
        socket.emit("collaboration_editor:server:content_update", responseExistingProgress);
    }
    const name = options.getAccountName ? await options.getAccountName(socketRequest?.session?.accountId) : "NONE";
    // Send to all connected sockets
    for (const connectedUser of documents[indexOfDocument].connectedUsers) {
        const response: socketTypes.NewUserServer = {
            accountId: socketRequest?.session?.accountId,
            accountName: name ? name : "ERROR",
            connectionId: socket.id
        };
        connectedUser.socket.emit("collaboration_editor:server:new_user", response);
    }
    // Send all existing user to socket
    for (const connectedUser of documents[indexOfDocument].connectedUsers) {
        const connectedUserSocketRequest = connectedUser.socket.request as unknown as SocketRequestInfo;
        if (connectedUserSocketRequest.session?.accountId === undefined) {
            throw Error("This should never be happening because the user should be authenticated");
        }
        const response: socketTypes.NewUserServer = {
            accountId: connectedUserSocketRequest?.session?.accountId,
            accountName: connectedUser.name,
            connectionId: connectedUser.socket.id
        };
        socket.emit("collaboration_editor:server:new_user", response);
    }
    // Add user
    documents[indexOfDocument].connectedUsers.push({
        caretPosEnd: newUserInfo.caretPosEnd,
        caretPosStart: newUserInfo.caretPosStart,
        name: name ? name : "ERROR",
        socket
    });
};

export const removeUser = (socket: socketIo.Socket, options: SocketOptions = {}): void => {
    debug(`remove user: socketId=${socket.id}`);
    const documentsToRemove: number[] = [];
    documents.forEach(document => {
        // Remove user
        const indexOfSocket = document.connectedUsers.findIndex(a => a.socket.id === socket.id);
        if (indexOfSocket > -1) {
            document.connectedUsers.splice(indexOfSocket, 1);
            // Send to all connected sockets that user was removed
            for (const connectedUser of document.connectedUsers) {
                const response: socketTypes.RemoveUserServer = {
                    connectionId: socket.id
                };
                connectedUser.socket.emit("collaboration_editor:server:remove_user", response);
            }
            // Check if the document has any connected users left, and if no remove it
            if (document.connectedUsers.length === 0) {
                debug("remove document too because no connected users left");
                documentsToRemove.push(document.documentId);
            } else {
                debug(`still connected users: [${
                    document.connectedUsers.map(a => (
                        a.socket.request as unknown as SocketRequestInfo
                    )?.session?.accountId).join(",")}]`);
            }
        }
    });
    for (const documentToRemove of documentsToRemove) {
        const indexOfDocument = documents.findIndex(a => a.documentId === documentToRemove);
        if (indexOfDocument > -1) {
            documents.splice(indexOfDocument, 1);
        }
    }
};

// eslint-disable-next-line complexity
export const contentUpdate = (
    socket: socketIo.Socket, contentUpdateInfo: socketTypes.ContentUpdateClient, options: SocketOptions = {}
): void => {
    debug(`content update: socketId=${socket.id},contentUpdateInfo=${JSON.stringify(contentUpdateInfo)}`);
    const indexOfDocument = documents.findIndex(a => a.documentId === contentUpdateInfo.documentId);
    if (indexOfDocument === -1) {
        console.error(`Document ${contentUpdateInfo.documentId} was not found for content update`);
        return;
    }
    const indexOfUser = documents[indexOfDocument].connectedUsers.findIndex(a => a.socket.id === socket.id);
    if (indexOfUser === -1) {
        console.error(`Document user ${socket.id} was not found for content update`);
        return;
    }
    if (contentUpdateInfo.action === socketTypes.ContentUpdateClientAction.ONLY_CARET) {
        if (contentUpdateInfo.caretPosStart && contentUpdateInfo.caretPosEnd) {
            documents[indexOfDocument].connectedUsers[indexOfUser].caretPosEnd = contentUpdateInfo.caretPosEnd;
            documents[indexOfDocument].connectedUsers[indexOfUser].caretPosStart = contentUpdateInfo.caretPosStart;
        }
    } else if (contentUpdateInfo.action === socketTypes.ContentUpdateClientAction.DELETE) {
        if (contentUpdateInfo.caretPosStart && contentUpdateInfo.caretPosEnd) {
            documents[indexOfDocument].connectedUsers[indexOfUser].caretPosEnd = contentUpdateInfo.caretPosEnd;
            documents[indexOfDocument].connectedUsers[indexOfUser].caretPosStart = contentUpdateInfo.caretPosStart;
        }
        if (contentUpdateInfo.deletedAtPos && contentUpdateInfo.deletedLength) {
            addUndoHistoryElement(contentUpdateInfo.documentId, options);
            documents[indexOfDocument].content = documents[indexOfDocument].content.substring(
                0,
                contentUpdateInfo.deletedAtPos
            ) + documents[indexOfDocument].content.substring(
                contentUpdateInfo.deletedAtPos + contentUpdateInfo.deletedLength,
                documents[indexOfDocument].content.length
            );
            // Send to all connected sockets
            for (const connectedUser of documents[indexOfDocument].connectedUsers) {
                const response: socketTypes.ContentUpdateServer = {
                    caretPosEnd: documents[indexOfDocument].connectedUsers[indexOfUser].caretPosEnd,
                    caretPosStart: documents[indexOfDocument].connectedUsers[indexOfUser].caretPosStart,
                    content: documents[indexOfDocument].content
                };
                connectedUser.socket.emit("collaboration_editor:server:content_update", response);
            }
        }
    } else if (contentUpdateInfo.action === socketTypes.ContentUpdateClientAction.INSERT) {
        if (contentUpdateInfo.caretPosStart && contentUpdateInfo.caretPosEnd) {
            documents[indexOfDocument].connectedUsers[indexOfUser].caretPosEnd = contentUpdateInfo.caretPosEnd;
            documents[indexOfDocument].connectedUsers[indexOfUser].caretPosStart = contentUpdateInfo.caretPosStart;
        }
        if (contentUpdateInfo.insertedAtPos && contentUpdateInfo.insertedText) {
            addUndoHistoryElement(contentUpdateInfo.documentId, options);
            documents[indexOfDocument].content = documents[indexOfDocument].content.substring(
                0,
                contentUpdateInfo.insertedAtPos
            ) + contentUpdateInfo.insertedText + documents[indexOfDocument].content.substring(
                contentUpdateInfo.insertedAtPos,
                documents[indexOfDocument].content.length
            );
            // Send to all connected sockets
            for (const connectedUser of documents[indexOfDocument].connectedUsers) {
                const response: socketTypes.ContentUpdateServer = {
                    caretPosEnd: documents[indexOfDocument].connectedUsers[indexOfUser].caretPosEnd
                        + contentUpdateInfo.insertedText.length,
                    caretPosStart: documents[indexOfDocument].connectedUsers[indexOfUser].caretPosStart
                        + contentUpdateInfo.insertedText.length,
                    content: documents[indexOfDocument].content
                };
                connectedUser.socket.emit("collaboration_editor:server:content_update", response);
            }
        }
    } else if (contentUpdateInfo.action === socketTypes.ContentUpdateClientAction.REPLACE) {
        // TODO
    }
};

export const undo = (
    socket: socketIo.Socket, undoInfo: socketTypes.UndoClient, options: SocketOptions = {}
): void => {
    debug(`undo: socketId=${socket.id},undoInfo=${JSON.stringify(undoInfo)}`);
    const indexOfDocument = documents.findIndex(a => a.documentId === undoInfo.documentId);
    if (indexOfDocument === -1) {
        console.error(`Document ${undoInfo.documentId} was not found for undo`);
        return;
    }
    const historyUndoElement = documents[indexOfDocument].historyUndo.pop();
    if (historyUndoElement) {
        addRedoHistoryElement(undoInfo.documentId, options);
        documents[indexOfDocument].content = historyUndoElement.content;
        const userSavePoint = historyUndoElement.userPositions.find(a => a.socket.id === socket.id);
        // Send to all connected sockets
        for (const connectedUser of documents[indexOfDocument].connectedUsers) {
            const response: socketTypes.ContentUpdateServer = {
                caretPosEnd: userSavePoint ? userSavePoint.caretPosEnd : 0,
                caretPosStart: userSavePoint ? userSavePoint.caretPosStart : 0,
                content: documents[indexOfDocument].content
            };
            connectedUser.socket.emit("collaboration_editor:server:content_update", response);
        }
    }
};

export const redo = (
    socket: socketIo.Socket, redoInfo: socketTypes.RedoClient, options: SocketOptions = {}
): void => {
    debug(`redo: socketId=${socket.id},redoInfo=${JSON.stringify(redoInfo)}`);
    const indexOfDocument = documents.findIndex(a => a.documentId === redoInfo.documentId);
    if (indexOfDocument === -1) {
        console.error(`Document ${redoInfo.documentId} was not found for redo`);
        return;
    }
    const historyRedoElement = documents[indexOfDocument].historyRedo.pop();
    if (historyRedoElement) {
        addUndoHistoryElement(redoInfo.documentId, options);
        documents[indexOfDocument].content = historyRedoElement.content;
        const userSavePoint = historyRedoElement.userPositions.find(a => a.socket.id === socket.id);
        // Send to all connected sockets
        for (const connectedUser of documents[indexOfDocument].connectedUsers) {
            const response: socketTypes.ContentUpdateServer = {
                caretPosEnd: userSavePoint ? userSavePoint.caretPosEnd : 0,
                caretPosStart: userSavePoint ? userSavePoint.caretPosStart : 0,
                content: documents[indexOfDocument].content
            };
            connectedUser.socket.emit("collaboration_editor:server:content_update", response);
        }
    }
};
