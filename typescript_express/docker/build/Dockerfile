FROM alpine:latest

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
COPY .eslintrc.js ./.eslintrc.js
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.internal.json ./tsconfig.internal.json
COPY webpack.config.js ./webpack.config.js

# Build files
RUN npm run build

# docker cp foo.txt XYZ:/foo.txt
