import * as textEditorCollaboration from "../modules/textEditorCollaboration";
import { debuglog } from "util";
import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";
import { Response } from "express";
import { SessionInfo } from "../middleware/expressSession";
import socketIo from "socket.io";


const debug = debuglog("app-socketio");


export interface BindSocketServerMiddlewareOptions {
    sessionMiddleware: (socket: socketIo.Socket, next: (err?: any) => void) => void
    socketOptions: textEditorCollaboration.SocketOptions
}

export interface SocketRequestInfo {
    session?: SessionInfo
    sessionID?: string
    res: Response<any>
}

export const bindSocketServer = (
    httpServer: (HttpServer|HttpsServer), middlewareOptions: BindSocketServerMiddlewareOptions
): socketIo.Server => {

    // Set up socket.io and bind it to http server
    const io = socketIo(httpServer);

    // Add socket server middleware
    io.use(middlewareOptions.sessionMiddleware);

    // Register when new socket clients are connected
    io.on("connection", socket => {
        const socketRequest = socket.request as SocketRequestInfo;
        if (socket.request === undefined ||
            socketRequest.session === undefined || socketRequest.sessionID === undefined) {
            debug("do nothing because socket is missing session information [socket=%s,session=%s]",
                socket.client.id, socketRequest.sessionID);
            return;
        }
        const currentAccountId: undefined | number = socketRequest.session?.accountId;
        debug("new connection [socket=%s,session=%s,accountId=%s]",
            socket.client.id, socketRequest.sessionID, currentAccountId);
        socket.on("disconnect", () => {
            debug("disconnect [socket=%s,session=%s]", socket.client.id, socketRequest.sessionID);
            textEditorCollaboration.removeUser(socket, middlewareOptions.socketOptions);
        });

        const prefixCollEditor = "collaboration_editor:client:";
        socket
            .on("message", (msg: any) => {
                debug(`message: ${JSON.stringify(msg)}`);
            })
            .on(`${prefixCollEditor}new_user`, async (msg: textEditorCollaboration.socketTypes.NewUserClient) => {
                debug(`${prefixCollEditor}new_user: ${JSON.stringify(msg)}`);
                await textEditorCollaboration.registerNewUser(socket, msg, middlewareOptions.socketOptions);
            })
            .on(`${prefixCollEditor}content_update`, (msg: textEditorCollaboration.socketTypes.ContentUpdateClient) => {
                debug(`${prefixCollEditor}content_update: ${JSON.stringify(msg)}`);
                textEditorCollaboration.contentUpdate(socket, msg, middlewareOptions.socketOptions);
            })
            .on(`${prefixCollEditor}undo`, (msg: textEditorCollaboration.socketTypes.UndoClient) => {
                debug(`${prefixCollEditor}undo: ${JSON.stringify(msg)}`);
                textEditorCollaboration.undo(socket, msg, middlewareOptions.socketOptions);
            })
            .on(`${prefixCollEditor}redo`, (msg: textEditorCollaboration.socketTypes.RedoClient) => {
                debug(`${prefixCollEditor}redo: ${JSON.stringify(msg)}`);
                textEditorCollaboration.redo(socket, msg, middlewareOptions.socketOptions);
            });

    });
    return io;
};
