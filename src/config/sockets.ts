import socketIo, { Server as SocketServer } from "socket.io";
import { debuglog } from "util";
import { Http2Server } from "http2";
import { Server } from "http";



const debug = debuglog("app-socketio");


export interface BindSocketServerMiddlewareOptions {
    sessionMiddleware: (socket: socketIo.Socket, next: (err?: any) => void) => void
}

export const bindSocketServer = (
    httpServer: (Server|Http2Server), middlewareOptions: BindSocketServerMiddlewareOptions
): SocketServer => {

    // Set up socket.io and bind it to http server
    const io: SocketServer = socketIo(httpServer);

    // Add socket server middleware
    io.use(middlewareOptions.sessionMiddleware);

    // Register when new socket clients are connected
    io.on("connection", socket => {
        const currentAccountId: undefined|number = socket.request.session.accountId;
        debug("new connection [socket=%s,session=%s,accountId=%s]",
            socket.client.id, socket.request.sessionID, currentAccountId);
        socket.on("disconnect", () => {
            debug("disconnect [socket=%s,session=%s]", socket.client.id, socket.request.sessionID);
        });
    });
    return io;
};
