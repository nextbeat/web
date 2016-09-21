#!/bin/bash
set -e

# Replace environment-specific variables in web.conf
sed -i "s/SERVER_NAME/$SERVER_NAME/g" /etc/nginx/nginx.conf

# If in development environment, add password auth
if [[ $REQUIRE_AUTH == "true" ]]; then
    sed -i "/location \/ {/a \
\            auth_basic \"Restricted Content\";\n\
\            auth_basic_user_file /etc/nginx/.htpasswd;" /etc/nginx/nginx.conf
fi

nginx -g "daemon off;"


