#!/usr/bin/env bash

# Create self signed SSL certificate for HTTP2 server

KEY_DIR="keys"
SSL_KEY="ssl.key"
SSL_CRT="ssl.crt"

mkdir -p $KEY_DIR
cd $KEY_DIR

openssl genrsa 2048 > $SSL_KEY
chmod 400 $SSL_KEY
openssl req -new -x509 -nodes -sha256 -days 365 -key $SSL_KEY -out $SSL_CRT
