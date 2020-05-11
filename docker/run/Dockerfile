FROM alpine:edge

# Install programs
# TODO Should version numbers be included?
# TODO Remove python3 as soon as sqlite3 npm install is fixed
RUN apk update

RUN apk search --no-cache make
RUN apk search --no-cache python3
RUN apk search --no-cache npm
RUN apk search --no-cache inkscape
RUN apk search --no-cache pandoc
RUN apk search --no-cache -X http://dl-cdn.alpinelinux.org/alpine/edge/testing pandoc
RUN apk search --no-cache texlive-full

RUN apk add make=4.3-r0 python3=3.8.2-r7 npm==12.16.3-r0 inkscape==1.0-r0 texlive-full==20190410-r12
# TODO When pandoc is in stable/edge add to previous command
RUN apk add --no-cache -X http://dl-cdn.alpinelinux.org/alpine/edge/testing pandoc==2.9.2.1-r0

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies (only the production ones)
# (copy package.json AND package-lock.json)
COPY package.json .
RUN npm install --only=production

# Mark node build environment as production
ENV NODE_ENV="production"

# Copy built files
COPY dist .
COPY .env.docker .env

# Expose server port
EXPOSE 8080

# Run server (but only when the container is run)
ENTRYPOINT [ "npm" ]
CMD [ "run", "start" ]
