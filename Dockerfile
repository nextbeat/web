FROM phusion/passenger-nodejs:0.9.17

# Install python 2.7
RUN apt-get update -qq && apt-get install -y python python-pip python-dev

# Set correct environment variables.
ENV HOME /root

# Use baseimage-docker's init process.
CMD ["/sbin/my_init"]

EXPOSE 80

# Enable nginx and passenger
RUN rm -f /etc/service/nginx/down

# Add bubble virtual host entry
RUN rm /etc/nginx/sites-enabled/default
ADD docker/conf/web.conf /etc/nginx/sites-enabled/web.conf

# Expose environment variables through Nginx
ADD docker/conf/env.conf /etc/nginx/main.d/env.conf

# Run npm install to cache modules when updating build
RUN npm install -g mocha
ADD package.json /tmp/package.json
RUN cd /tmp && npm install 
RUN mkdir -p /home/app/web && cp -a /tmp/node_modules /home/app/web

# Add source files
RUN chown -R app:app /home/app/web
ADD . /home/app/web

# Clean
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*