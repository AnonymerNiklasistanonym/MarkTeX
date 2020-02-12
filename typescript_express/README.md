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
| `start` | Run the built application |
| `dev` | Run the application and restart it automatically if source code is updated |
| `clean` | Remove all built files |

## Dependencies

| Module | Description |
| ------ | ----------- |
| `ts-node` | Run TypeScript files directly (otherwise they must first be compiled to JavaScript files). |
| `shelljs` | Use to execute shell commands such as to copy files and remove directories. |
| `rimraf` | Use to recursively remove folders. |
| `npm-run-all` | Use to execute multiple npm scripts sequentially or in parallel. |
| `nodemon` | Nodemon watches files for changes and automatically restarts the Node.js application when changes are detected which is useful during the development. |

## Docker

Run docker file with: (`sudo`) `make`

| Command |  Description |
| ------- | ------------ |
| (`sudo`) `docker ps` | Get the container ID and port |
| (`sudo`) `docker inspect <CONTAINER_ID>` (`| grep IPAddress`) | Get IP address of docker machine |
