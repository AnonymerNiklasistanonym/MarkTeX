FROM alpine:3.11.3

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
COPY .eslintrc.js ./.eslintrc.js
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.internal.json ./tsconfig.internal.json
COPY webpack.config.js ./webpack.config.js

# Build files (but only when the container is run)
CMD [ "npm", "run", "build" ]
