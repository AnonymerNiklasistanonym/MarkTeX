# MarkTeX

Webapp for Markdown notes and summaries with LaTeX math and `tikzpicture`s that can be publicly shared or be private.

## What problem does it solve

- Write notes, homework, summaries alone and together uncomplicated in Markdown syntax
- Insert complicated (`tikzpicture`) graphs and images based on existing `pandoc` integrations
- Easily collect/group notes and documents and thus find them quickly
- Export the documents for offline rendering to PDF using `pandoc` and a `Makefile`

## Current development state

Basic server is setup (logs, error page, scripts & styles).

The current features that are being developed are:

- Backend database integration
- Backend session integration
- Frontend Markdown renderer extension with LaTeX `tikzpicture`
- Frontend button to export to PDF

## Requirements

*(it could be that later versions are required, but the tested versions are guaranteed to work)*

| Program | Version required | Version tested |
| ------- | ---------------- | -------------- |
| `nodejs` | 13.9+ | 13.11.0 |
| `pandoc` | 2.9+ | 2.9.2 |
| `xetex`  | | 0.999991 |
| `inkscape` | 1.0+ (**1.0 did not hit stable yet!!!**) | 1.1.dev |

### Tested on

- Linux [5.5.11-1-MANJARO] (x64)
- Windows [10.0.18363] (x64)

## Quickstart

- Server side entry point: `src/index.ts` (source files are in `src` without the directory `src/public/`)
  - Compiled to JavaScript via `ts-node` (`dist/index.js`)
- Client side entry point: `src/public/scripts/index.ts` (source files are in `src/public/scripts`)
  - Compiled to JavaScript file via `webpack` (`dist/public/scripts/bundle.js`)

The server port can be configured by coping the file `.env.sample` to `.env` and customizing it.

---

Install all dependencies:

```sh
npm install
```

### Development

To see the debug output through the internal node util package run in the terminal:

```sh
export NODE_DEBUG=app*
# Executing the following command automatically does that for you
npm run dev
```

The following command automatically updates the server when you change something or you can do it manually by entering `rs` + `ENTER`:

```sh
npm run dev:watch
```

#### Custom types

Because currently the custom types are not correctly recognized via VSCode intellisense (but they are from the TypeScript compiler) you need to run a command to copy them to the `node_modules/@types` directory:

```sh
npm run vscodeTypeIntegration
```

#### Debug

- Nodejs server debugging works with VisualStudioCode (Insiders) when opening the repository as root directory
- Frontend debugging works with Mozilla Firefox (Nightly) but seemingly not out of the box in other browsers like Chromium

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

- [ ] Client side markdown rendering (math block, pandoc image, latex block)
- [ ] Convert documents to be printable by pandoc (with latex blocks)
- [ ] Implement socket connection with authorization through express session
- [ ] Implement express session
- [ ] Add SQLite database integration

## Sources

- https://developer.okta.com/blog/2018/11/15/node-express-typescript
- https://webpack.js.org/concepts/

## Node Commands

Run commands via `npm run COMMAND_PLACEHOLDER`.

The built files can be found in the `dist` directory and the entry point is called `index.js`.

| Command |  Description |
| ------- | ------------ |
| `build` | Build the application |
| `start` | Run the built application (requires a one time execution of `build`) |

| Command |  Description |
| ------- | ------------ |
| `clean` | Remove all temporary files created by running `build`, `docs` and `copy:assets` |
| `copy:assets` | Copy any external server resources to the `dist` directory (views, style sheets, ...) |
| `dev` | Build the application and then run it (with debug features for development) |
| `dev:watch` | Run the application and restart it automatically if source code is updated |
| `docs` | Create source code documentation in `docs/site` |
| `lint` | Lint Typescript files for errors and code style (auto fixes all auto fixable problems) |

## Dependencies

| Package | Description |
| --- | ------ |
| `archiver` | Create file archives |
| `body-parser` | Parse HTML forms |
| `compression` | Serve files compressed |
| `dotenv` | Read bash environment variables from an `.env` file |
| `express` | Server |
| `express-handlebars` | Render websites from handlebars templates |
| `express-session` | Connect website interactions to one session from one user |
| `express-validator` | Validate and sanitize server requests |
| `github-markdown-css` | GitHub like rendering for plain markdown elements |
| `handlebars` | Render websites from handlebars templates |
| `highlight.js` | Frontend rendering of code sections |
| `http-errors` | Generate http errors |
| `js-yaml` | Parse and create YAML files |
| `katex` | Frontend rendering of LaTeX math |
| `markdown-it` | Frontend rendering of Markdown text |
| `socket.io` | Websocket implementation for server backend |
| `socket.io-client` | Websocket implementation for client frontend |
| `spdy` | Http2 server for backend |
| `sqlite3` | Database integration for server backend |

### DevDependencies

These dependencies are not necessary to run this service but to build it or for example run tests.

| Dev | Module | Description |
| --- | ------ | ----------- |
| yes | `@types*` | Types for Typescript code for more type security and ease of use (when using an IDE like VSCode) |
| yes | `chai` | Write test cases |
| yes | `compression-webpack-plugin` | Compress webpack created JavaScript files |
| `cross-env` | Set environment variables cross platform in `npm run` commands |
| `eslint`, `eslint-plugin*` | Lint code for errors and code style |
| yes | `glob` | Get all files given a regex and directory |
| yes | `leasot` | Find TODOs in files of different types |
| yes | `mocha` | Perform and create tests |
| yes | `nodemon` | Nodemon watches files for changes and automatically restarts the Node.js application when changes are detected which is useful during the development |
| yes | `npm-run-all` | Use to execute multiple npm scripts sequentially or in parallel (only used in `package.json`)  |
| yes | `open` | Open files with their default application |
| yes | `shelljs` | Use to execute shell commands such as to copy files and remove directories |
| yes | `ts-node` | Run TypeScript files directly (otherwise they must first be compiled to JavaScript files) |
| yes | `typedoc` | Create HTML documentation of TypeScript files |
| yes | `webpack`, `webpack-cli` | Bundle node modules (and compile TypeScript files) for client side JavaScript usage |

## Docker

Run and build this project via docker with: (`sudo`) `make`

| Command |  Description |
| ------- | ------------ |
| (`sudo`) `docker ps` | Get the container ID and port |
| (`sudo`) `docker inspect <CONTAINER_ID>` | Get IP address (`grep IPAddress`) and other information of docker machine |

TODO: Currently there is a problem when forwarding the port from the docker machine to the host computer - some paths do not work and you get 404s everywhere.
Until this is resolved you can access the website via the IP address from `docker inspect <CONTAINER_ID> | grep IPAddress` and the original port (`8080`) [instead of `localhost:8080/xyz` visit `DOCKER_CONTAINER_IP_ADDRESS:8080/xyz`].

### Start/Stop docker service after installation

When you get an error like `Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?`,you can try the following command to start the docker daemon:

```sh
# Start docker daemon (if there is still an error try restarting your system)
sudo systemctl start docker
# Stop docker daemon
sudo systemctl stop docker
```

### Stop running container

```sh
# Get docker container id
sudo docker ps
# Stop running docker container
sudo docker stop CONTAINER_ID
```

### Clean **ALL** docker files

This gives you like 10GB or more free space but also **removes project unrelated docker files!**

```sh
# Remove all docker containers and images
sudo docker container prune -f
sudo docker image prune -af
```

## Http2

The server runs per default via Http1 but if the script [`create_ssl_certificate.sh`](create_ssl_certificate.sh) is run or the files `ssl.crt` and `ssl.key` can be found in the directory `keys` it automatically switches to the Http2 protocol.
