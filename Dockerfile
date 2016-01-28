FROM node:0.10

# Run npm install to cache modules when updating build
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /home/app/web && cp -a /tmp/node_modules /home/app/web

ADD . /home/app/web

WORKDIR /home/app/web
ENTRYPOINT ["npm"]
CMD ["run", "start"]