FROM node:5.6

ADD docker/scripts/start.sh /sbin/start.sh
RUN chmod +x /sbin/start.sh

CMD ["/sbin/start.sh"]

RUN npm install -g gulp

# Run npm install to cache modules when updating build
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /home/app/web && cp -a /tmp/node_modules /home/app/web

ADD . /home/app/web