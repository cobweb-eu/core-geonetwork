FROM  live_db

MAINTAINER doublebyte <joana.simoes@geocat.net>

#Workaround to overcome this issue https://github.com/docker/docker/issues/783#issuecomment-56013588
RUN mkdir /etc/ssl/private-copy; mv /etc/ssl/private/* /etc/ssl/private-copy/; \
 rm -r /etc/ssl/private; mv /etc/ssl/private-copy /etc/ssl/private; \
  chmod -R 0700 /etc/ssl/private; chown -R postgres /etc/ssl/private

USER postgres

RUN    /etc/init.d/postgresql start &&\
    psql --command "CREATE USER admin WITH SUPERUSER PASSWORD 'gnos';" &&\
    psql --command "CREATE USER geoserver WITH SUPERUSER PASSWORD 'geoserver';" &&\
    createdb -O admin geonetwork-private &&\
    createdb -O geoserver geoserver &&\
    createdb -O admin admin &&\
	psql --dbname=admin --command "create extension pg_stat_statements;" &&\
	psql --dbname=geoserver --command "create extension pg_stat_statements;" &&\
	psql --dbname=geonetwork-private --command "create extension pg_stat_statements;" &&\
	psql --dbname=geoserver --command "CREATE EXTENSION postgis;" &&\
	psql --dbname=geoserver --command "CREATE EXTENSION postgis_topology;" &&\
	psql --dbname=geonetwork-private --command "CREATE EXTENSION postgis;" &&\
	psql --dbname=geonetwork-private --command "CREATE EXTENSION postgis_topology;" 

USER root
