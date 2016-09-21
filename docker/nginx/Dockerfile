FROM nginx:1.10

COPY web.conf /etc/nginx/nginx.conf
COPY .htpasswd /etc/nginx/.htpasswd

COPY init.sh init.sh
RUN chmod +x init.sh

CMD ./init.sh

