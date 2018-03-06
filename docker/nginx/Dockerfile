FROM nginx:1.10

COPY web.conf /etc/nginx/nginx.conf

RUN ln -sf /dev/stdout /var/log/nginx/access.log && ln -sf /dev/stderr /var/log/nginx/error.log

COPY init.sh init.sh
RUN chmod +x init.sh

CMD ./init.sh

