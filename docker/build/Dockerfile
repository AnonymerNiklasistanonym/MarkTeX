FROM pandoc/latex:2.9.2

# Install npm/nodejs
RUN apk add --update npm

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .
RUN npm install

# Mark node build environment as production
ENV NODE_ENV="production"

# Copy source files
COPY src ./src
COPY tools ./tools
COPY res ./res
COPY tests ./tests
COPY types ./types
COPY .eslintrc.js ./.eslintrc.js
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.internal.json ./tsconfig.internal.json
COPY webpack.config.js ./webpack.config.js

# Run tests to be sure that everything will work
# >> Update as soon as alpine has inkscape v1.x to also execute shell tests
# RUN npm test
RUN npm run tests:general

# Build files (but only when the container is run)
ENTRYPOINT [ "npm" ]
CMD [ "run", "build" ]
