import { Server as SocketServer } from "socket.io";
import { Server } from "http";

export const bindSocketServer = (httpServer: Server): void => {

    // set up socket.io and bind it to our
    // http server.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const io: SocketServer = require("socket.io")(httpServer);

    // whenever a user connects on port 3000 via
    // a websocket, log that a user has connected
    io.on("connection", socket => {
        // eslint-disable-next-line no-console
        console.log(`a user connected: ${socket.client.id}`);
    });
};
