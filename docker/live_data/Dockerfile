FROM ubuntu:wily
MAINTAINER doublebyte <joana.simoes@geocat.net>

RUN apt-get update && \
    apt-get install -y postgresql-client

#expose data dirs as external volumes
RUN mkdir -p /usr/local/geoserver-live/data && \
    mkdir -p /usr/local/geonetwork-live/data && \
    mkdir -p /usr/local/postgresql-live/data

#enabling logging on Geoserver
RUN mkdir -p /usr/local/geoserver-live/data/logs
COPY ./logging.xml   /usr/local/geoserver-live/data/logging.xml
COPY ./PRODUCTION_LOGGING.properties   /usr/local/geoserver-live/data/logs/PRODUCTION_LOGGING.properties

#Create default workspace and datastore for Geoserver
RUN mkdir -p /usr/local/geoserver-live/data/workspaces && \
    mkdir -p /usr/local/geoserver-live/data/workspaces/myworkspace && \
    mkdir -p /usr/local/geoserver-live/data/workspaces/myworkspace/mydatastore

COPY ./default.xml   /usr/local/geoserver-live/data/workspaces/default.xml
COPY ./namespace.xml /usr/local/geoserver-live/data/workspaces/myworkspace/namespace.xml
COPY ./workspace.xml /usr/local/geoserver-live/data/workspaces/myworkspace/workspace.xml
COPY ./datastore.xml /usr/local/geoserver-live/data/workspaces/myworkspace/mydatastore/datastore.xml

#export backed  volumes 
VOLUME ["/usr/local/geoserver-live/data", "/usr/local/geonetwork-live/data", \
"/usr/local/postgresql-live/data", "/var/log/postgresql"]

CMD ["tail","-f","/dev/null"]
