#!/bin/bash
set -e

# Replace environment-specific variables in web.conf
sed -i "s#SERVER_NAME#$SERVER_NAME#g" /etc/nginx/nginx.conf

nginx -g "daemon off;"


