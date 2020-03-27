import { debuglog } from "util";
import { Server } from "http";
import { Server as SocketServer } from "socket.io";


const debug = debuglog("app-socketio");


export const bindSocketServer = (httpServer: Server): SocketServer => {

    // set up socket.io and bind it to our
    // http server.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const io: SocketServer = require("socket.io")(httpServer);

    // whenever a user connects on port 3000 via
    // a websocket, log that a user has connected
    io.on("connection", socket => {
        debug("'connection' event: new user (id='%s')", socket.client.id);
    });
    io.on("connect", socket => {
        debug("'connect' event: new user (id='%s')", socket.client.id);
    });
    return io;
};
