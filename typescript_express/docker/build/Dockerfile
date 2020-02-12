FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .
RUN npm install

# Copy source files
COPY src .
COPY tools .

# Mark node build environment as production
ENV NODE_ENV="production"

# Build files
RUN npm run build

# docker cp foo.txt XYZ:/foo.txt
