#! /bin/bash

cd /home/app/web
gulp build
node server/server.js