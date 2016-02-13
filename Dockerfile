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

# FROM phusion/passenger-nodejs:0.9.17

# # Install python 2.7
# RUN apt-get update -qq && apt-get install -y python python-pip python-dev

# # Set correct environment variables.
# ENV HOME /root

# # Run nginx script and use baseimage-docker's init process.
# CMD ["/sbin/init.sh"]

# EXPOSE 80

# # Enable nginx and passenger
# RUN rm -f /etc/service/nginx/down

# # Add bubble virtual host entry
# RUN rm /etc/nginx/sites-enabled/default
# ADD docker/conf/web.conf /etc/nginx/sites-enabled/web.conf

# # Expose environment variables through Nginx
# ADD docker/conf/env.conf /etc/nginx/main.d/env.conf

# # Add script to modify bubble virtual host entry
# ADD docker/scripts/init.sh /sbin/init.sh
# RUN chmod +x /sbin/init.sh

# # Run npm install to cache modules when updating build
# RUN npm install -g gulp
# ADD package.json /tmp/package.json
# RUN cd /tmp && npm install 
# RUN mkdir -p /home/app/web && cp -a /tmp/node_modules /home/app/web

# # Add source files
# RUN chown -R app:app /home/app/web
# ADD . /home/app/web

# # Build with gulp
# WORKDIR /home/app/web
# RUN gulp build

# # Clean
# RUN apt-get clean && rm -rf /var/lib/apt/lists/* 