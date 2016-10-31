FROM ubuntu:wily

MAINTAINER doublebyte <joana.simoes@geocat.net>

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends apache2

COPY ./apache2.conf /etc/apache2/apache2.conf
COPY ./index.html /var/www/html/index.html
COPY ./gn-docker.png /var/www/html/gn-docker.png

RUN echo "ServerName localhost" | tee /etc/apache2/conf-available/servername.conf
RUN a2enconf servername

# The default processes to run when start the container, are launched by a script
CMD ["apache2ctl","-DFOREGROUND"]
