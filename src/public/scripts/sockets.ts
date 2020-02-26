/* eslint-disable no-console */
import io from "socket.io-client";

export const connectToSocket = (): void => {

    const port = 8080;

    const socket = io(`http://localhost:${port}`);

    socket.on("connect", (clientSocket: SocketIO.Socket | undefined) => {
        console.log("Connected client on port %s.", port);
        if (clientSocket) {
            console.log(clientSocket);
            clientSocket.on("message", (m: string) => {
                console.log("[server](message): %s", JSON.stringify(m));
                socket.emit("message", m);
            });

            clientSocket.on("disconnect", () => {
                console.log("Client disconnected");
            });
        } else {
            console.error("Client socket is undefined?");
        }
    });

};
