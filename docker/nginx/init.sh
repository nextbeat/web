#!/bin/bash
set -e

# Replace environment-specific variables in web.conf
echo "$SERVER_NAME"
sed -i "s/SERVER_NAME/$SERVER_NAME/g" /etc/nginx/nginx.conf

nginx -g "daemon off;"


