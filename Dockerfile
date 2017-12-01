FROM node:8.6

RUN npm install -g gulp

# Run npm install to cache modules when updating build
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /home/app/web && cp -a /tmp/node_modules /home/app/web

ADD . /home/app/web
WORKDIR /home/app/web

ARG env
RUN NODE_ENV=${env} npm run build
CMD node dist/bundle.js