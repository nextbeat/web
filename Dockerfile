FROM node:0.10

ENV NODE_PATH /install

# Run npm install to cache modules when updating build
RUN mkdir -p /install /home/app/web
ADD package.json /install/package.json
RUN cd /install && npm install 

WORKDIR /home/app/web
ENTRYPOINT npm
CMD start