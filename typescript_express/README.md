# Express server written in TypeScript

## Sources

- https://developer.okta.com/blog/2018/11/15/node-express-typescript

## Node Commands

Run commands via `npm run COMMAND_PLACEHOLDER`.

The built files can be found in the `dist` directory and the entry point is called `index.js`.

| Command |  Description |
| ------- | ------------ |
| `dev:start` | Build the application and then run it |
| `build` | Build the application |
| `start` | Run the built application (requires an existing build) |
| `dev` | Run the application and restart it automatically if source code is updated |
| `clean` | Remove all built files |

## Dependencies

| Module | Description |
| ------ | ----------- |
| `dotenv` | Read bash environment variables from an `.env` file. |
| `nodemon` | Nodemon watches files for changes and automatically restarts the Node.js application when changes are detected which is useful during the development. |
| `npm-run-all` | Use to execute multiple npm scripts sequentially or in parallel. |
| `shelljs` | Use to execute shell commands such as to copy files and remove directories. |
| `ts-node` | Run TypeScript files directly (otherwise they must first be compiled to JavaScript files). |

## Docker

Run docker file with: (`sudo`) `make`

| Command |  Description |
| ------- | ------------ |
| (`sudo`) `docker ps` | Get the container ID and port |
| (`sudo`) `docker inspect <CONTAINER_ID>` | Get IP address (`grep IPAddress`) and other information of docker machine |

TODO: Currently there is a problem when forwarding the port from the docker machine to the host computer.
Until this is resolved you can access the website via the IP address from `docker inspect <CONTAINER_ID> | grep IPAddress` and the original port (`8080`).

TODO: Move docker file in directory `docker` for a better structure.
