import "./webpackVars";
import * as socketTypes from "../../modules/textEditorCollaboration/socketTypes";
import Mousetrap from "mousetrap";
import { Socket } from "socket.io-client";

interface EnableCollaborationTextEditorInput {
    connectedUsersElement: HTMLElement
    connectedUsersList: HTMLUListElement
    textInput: HTMLTextAreaElement
}

let globalEnabled = false;
let globalSocket: Socket|undefined;
let globalOptions: EnableCollaborationTextEditorInput|undefined;

export const disable = (): void => {
    globalEnabled = false;
    if (globalSocket) {
        globalSocket.close();
    }
    if (globalOptions && globalOptions.connectedUsersElement) {
        globalOptions.connectedUsersElement.classList.add("invisible");
    }
};


export const enable = (
    socket: Socket, documentId: number, options: EnableCollaborationTextEditorInput
): void => {
    globalSocket = socket;
    globalEnabled = true;
    globalOptions = options;

    options.connectedUsersElement.classList.add("invisible");

    const prefixCollEditor = "collaboration_editor:client:";
    const clientNewUserRequest: socketTypes.NewUserClient = {
        caretPosEnd: options.textInput.selectionEnd,
        caretPosStart: options.textInput.selectionStart,
        content: options.textInput.value,
        documentId
    };
    socket.emit(`${prefixCollEditor}new_user`, clientNewUserRequest);

    socket.on("connection", (data: any) => { console.warn("new socket connection", data); });
    socket.on("disconnect", (data: any) => { console.warn("server has disconnected", data); });
    socket.on("message", (data: any) => { console.warn("new socket message", data); });

    interface User {
        accountId: number
        connectionId: string
        name: string
    }
    const connectedUsers: User[] = [];
    const prefixCollEditorServer = "collaboration_editor:server:";
    socket
        .on(`${prefixCollEditorServer}new_user`, (msg: socketTypes.NewUserServer) => {
            console.warn(`${prefixCollEditorServer}new_user`, msg);
            connectedUsers.push({
                accountId: msg.accountId,
                connectionId: msg.connectionId,
                name: msg.accountName
            });
            console.warn("connected users:", connectedUsers);
            options.connectedUsersList.innerHTML = connectedUsers
                .map(a => `<li><a href="/account/${a.accountId}">${a.name}</a></li>`).join("");
            options.connectedUsersElement.classList.remove("invisible");
        })
        .on(`${prefixCollEditorServer}remove_user`, (msg: socketTypes.RemoveUserServer) => {
            console.warn(`${prefixCollEditorServer}remove_user`, msg);
            const indexOfUser = connectedUsers.findIndex(a => a.connectionId === msg.connectionId);
            if (indexOfUser > -1) {
                connectedUsers.splice(indexOfUser, 1);
                console.warn("connected users:", connectedUsers);
                options.connectedUsersList.innerHTML = connectedUsers
                    .map(a => `<li><a href="/account/${a.accountId}">${a.name}</a></li>`).join("");
                if (connectedUsers.length === 0) {
                    options.connectedUsersElement.classList.add("invisible");
                }
            } else {
                console.error(`The connection ${msg.connectionId} was not found in user list`);
            }
        })
        .on(`${prefixCollEditorServer}content_update`, (msg: socketTypes.ContentUpdateServer) => {
            console.warn(`${prefixCollEditorServer}content_update`, msg);
            if (msg.content) {
                options.textInput.value = msg.content;
            }
            options.textInput.selectionStart = msg.caretPosStart;
            options.textInput.selectionEnd = msg.caretPosEnd;
            options.textInput.click();
        });

    const fixKeyToString = (key: string): (string|undefined) => {
        if (key === "Enter") {
            return "\n";
        } else if (key === "Tab") {
            return "\t";
        } else if (key === "Backspace") {
            return undefined;
        } else if (key === "Delete") {
            return undefined;
        }
        return key;
    };

    const keyPressEvent = (e: KeyboardEvent): void => {
        if (!globalEnabled) { return; }
        console.warn("Key input detected:", e.key);
        const key = fixKeyToString(e.key);
        if (options.textInput.selectionStart && key) {
            const request: socketTypes.ContentUpdateClient = {
                action: socketTypes.ContentUpdateClientAction.INSERT,
                documentId,
                insertedAtPos: options.textInput.selectionStart,
                insertedText: key
            };
            socket.emit(`${prefixCollEditor}content_update`, request);
        }
    };

    options.textInput.removeEventListener("keypress", keyPressEvent);
    options.textInput.addEventListener("keypress", keyPressEvent);
    options.textInput.addEventListener("selectionchange", event => {
        if (!globalEnabled) { return; }
        console.warn("Selection change detected:", options.textInput.selectionStart, options.textInput.selectionEnd);
        if (options.textInput.selectionStart) {
            const request: socketTypes.ContentUpdateClient = {
                action: socketTypes.ContentUpdateClientAction.ONLY_CARET,
                caretPosEnd: options.textInput.selectionEnd,
                caretPosStart: options.textInput.selectionStart,
                documentId
            };
            socket.emit(`${prefixCollEditor}content_update`, request);
        }
    });

    Mousetrap(options.textInput)
        .bind("backspace", () => {
            if (!globalEnabled) { return; }
            if (options.textInput.selectionStart) {
                const request: socketTypes.ContentUpdateClient = {
                    action: socketTypes.ContentUpdateClientAction.DELETE,
                    deletedAtPos: options.textInput.selectionStart - 1,
                    deletedLength: 1,
                    documentId
                };
                socket.emit(`${prefixCollEditor}content_update`, request);
            }
        })
        .bind("delete", () => {
            if (!globalEnabled) { return; }
            if (options.textInput.selectionStart) {
                const request: socketTypes.ContentUpdateClient = {
                    action: socketTypes.ContentUpdateClientAction.DELETE,
                    deletedAtPos: options.textInput.selectionStart,
                    deletedLength: 1,
                    documentId
                };
                socket.emit(`${prefixCollEditor}content_update`, request);
            }
        })
        .bind([ "paste", "ctrl+v" ], async () => {
            if (!globalEnabled) { return; }
            if (options.textInput.selectionStart) {
                try {
                    const getInsertedText = await window.navigator.clipboard.readText();
                    const request: socketTypes.ContentUpdateClient = {
                        action: socketTypes.ContentUpdateClientAction.INSERT,
                        documentId,
                        insertedAtPos: options.textInput.selectionStart - getInsertedText.length,
                        insertedText: getInsertedText
                    };
                    socket.emit(`${prefixCollEditor}content_update`, request);
                } catch (err) {
                    console.error(err);
                    return;
                }
            }
        })
        .bind("ctrl+z", () => {
            if (!globalEnabled) { return; }
            console.warn("undo");
            const clientUndoRequest: socketTypes.UndoClient = { documentId };
            socket.emit(`${prefixCollEditor}undo`, clientUndoRequest);
        })
        .bind("ctrl+y", () => {
            if (!globalEnabled) { return; }
            console.warn("redo");
            const clientRedoRequest: socketTypes.RedoClient = { documentId };
            socket.emit(`${prefixCollEditor}redo`, clientRedoRequest);
        });
};
