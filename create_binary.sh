#!/usr/bin/env bash

# Create node binary

# BUG Currently pkg has problems using the latest version of node (13)
# BUG SQlite3 needs to be in the same directory as the resulting binary and be compiled by the same version of node

# TODO Remove "-t node12" as soon as pkg supports node13
# TODO Do this with docker, then everything should just work
NODE_VERSION=12
NODE_MODULE_VERSION=72

npx pkg -t node$NODE_VERSION .
cp node_modules/sqlite3/lib/binding/node-v$NODE_MODULE_VERSION-linux-x64/node_sqlite3.node .
