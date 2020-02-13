# Express server written in TypeScript

## Quickstart

- Server side entry point: `src/index.ts` (source files are in `src` without the directory `src/public/`)
  - Compiled to JavaScript via `ts-node`  (`dist/index.js`)
- Client side entry point: `src/public/scripts/index.ts` (source files are in `src/public/scripts`)
  - Compiled to JavaScript file via `webpack` (`dist/public/scripts/bundle.js`)

The server port can be configured by coping the file `.env.sample` to `.env` and customizing it.

---

Install all dependencies:

```sh
npm install
```

### Development

The following command automatically updates the server when you change something or you can do it manually be entering `rs` + `ENTER`:

```sh
npm run dev
```

### Production

The following command builds all files into the directory `dist`:

```sh
npm run build
```

Then optionally the `node_modules` directory can be removed and you can run `npm install --only=prod`.
Then the built files can be run with only a small amount of dependencies (for example on a web server):

```sh
# rm -rf node_modules
# npm install --only=prod
npm run start
```

## TODO list

- [x] Setup TypeScript (linting, auto fixing, error messaging, auto updater)
- [x] Express server (in TypeScript)
- [x] Client side independent usage of node modules (in TypeScript)
- [x] Documentation
- [x] Handlebar view rendering
- [ ] Client side keyboard controller with a list example (add new items and indent only using keyboard shortcuts)
- [ ] Include image resources (icons, fonts)
- [x] Implement socket connection
- [ ] Implement express session
- [ ] Add SQLite database
- [ ] Make final product runnable in Docker container
- [ ] Make final product build in Docker container and extract built files
- [x] Switch to eslint because tslint is seemingly deprecated

## Sources

- https://developer.okta.com/blog/2018/11/15/node-express-typescript
- https://webpack.js.org/concepts/

## Node Commands

Run commands via `npm run COMMAND_PLACEHOLDER`.

The built files can be found in the `dist` directory and the entry point is called `index.js`.

| Command |  Description |
| ------- | ------------ |
| `build` | Build the application |
| `clean` | Remove all built files |
| `copy-assets` | Copy any external resources to the `dist` directory |
| `dev:start` | Build the application and then run it |
| `dev` | Run the application and restart it automatically if source code is updated |
| `docs` | Create source code documentation in `docs/site` |
| `lint` | Lint TypeScript files for errors and code style (auto fixes all auto fixable problems) |
| `start` | Run the built application (requires an existing build) |
| `todo` | Create a TODO page over all source files to find open TODOs in`docs/todos.md` |
| `tsc` | Build server side part of the application (but don't copy external resources yet) |
| `webpack` | Build client side part of the application |

## Dependencies

| Module | Description |
| ------ | ----------- |
| `dotenv` | Read bash environment variables from an `.env` file. |
| `glob` | Get all files given a regex and directory |
| `handlebars` | Compile HTML code with different inputs quickly and simple |
| `leasot` | Find TODOs in files of different types |
| `nodemon` | Nodemon watches files for changes and automatically restarts the Node.js application when changes are detected which is useful during the development. |
| `npm-run-all` | Use to execute multiple npm scripts sequentially or in parallel. |
| `shelljs` | Use to execute shell commands such as to copy files and remove directories. |
| `ts-node` | Run TypeScript files directly (otherwise they must first be compiled to JavaScript files). |
| `typedoc` | Create HTML documentation of TypeScript files |
| `webpack` | Bundle node modules (and compile TypeScript files) for client side JavaScript usage |

## Docker

Run docker file with: (`sudo`) `make`

*Currently only `sudo make fallback` is working which builds locally the files for production and then creates a very lightweight image that can be hosted.*

| Command |  Description |
| ------- | ------------ |
| (`sudo`) `docker ps` | Get the container ID and port |
| (`sudo`) `docker inspect <CONTAINER_ID>` | Get IP address (`grep IPAddress`) and other information of docker machine |

TODO: Currently there is a problem when forwarding the port from the docker machine to the host computer.
Until this is resolved you can access the website via the IP address from `docker inspect <CONTAINER_ID> | grep IPAddress` and the original port (`8080`).

---

Clean docker files for the latest version if the normal way is always using the first build:

```sh
# Remove all stopped containers
sudo docker container prune -y
```

---

When you get an error like `Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?`,you can try the following command to start the docker daemon:

```sh
# Start docker daemon
sudo systemctl start docker
```
