#!/bin/bash

# Replace environment-specific variables in web.conf

sed -i "s/SERVER_NAME/$SERVER_NAME/g" /etc/nginx/sites-enabled/web.conf
sed -i "s/ENV/$NODE_ENV/g" /etc/nginx/sites-enabled/web.conf

# Call my_init

/sbin/my_init