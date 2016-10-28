FROM  doublebyte/docker-postgis:squash

MAINTAINER doublebyte <joana.simoes@geocat.net>

# Adjust PostgreSQL configuration so that remote connections to the
# database are possible.
COPY ./pg_hba.conf /etc/postgresql/9.3/main/pg_hba.conf

# And add ``listen_addresses`` to ``/etc/postgresql/9.3/main/postgresql.conf``
RUN echo "listen_addresses='*'" >> /etc/postgresql/9.3/main/postgresql.conf
