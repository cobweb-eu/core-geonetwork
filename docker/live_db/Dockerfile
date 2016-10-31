FROM  doublebyte/docker-postgis:squash

MAINTAINER doublebyte <joana.simoes@geocat.net>

# Adjust PostgreSQL configuration so that remote connections to the
# database are possible.
COPY ./pg_hba.conf /etc/postgresql/9.3/main/pg_hba.conf

# And add ``listen_addresses`` to ``/etc/postgresql/9.3/main/postgresql.conf``
RUN echo "listen_addresses='*'" >> /etc/postgresql/9.3/main/postgresql.conf

#Workaround to overcome this issue https://github.com/docker/docker/issues/783#issuecomment-56013588
RUN mkdir /etc/ssl/private-copy; mv /etc/ssl/private/* /etc/ssl/private-copy/; \
 rm -r /etc/ssl/private; mv /etc/ssl/private-copy /etc/ssl/private; \
  chmod -R 0700 /etc/ssl/private; chown -R postgres /etc/ssl/private; 

RUN chown -R postgres /var/lib/postgresql/9.3/main

USER postgres

RUN    /etc/init.d/postgresql start &&\
    psql --command "CREATE USER admin WITH SUPERUSER PASSWORD 'gnos';" &&\
    psql --command "CREATE USER geoserver WITH SUPERUSER PASSWORD 'geoserver';" && \
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

CMD ["/usr/lib/postgresql/9.3/bin/postgres", "-D", "/var/lib/postgresql/9.3/main", "-c", "config_file=/etc/postgresql/9.3/main/postgresql.conf"]

