FROM tomcat:7.0

MAINTAINER doublebyte <joana.simoes@geocat.net>

ENV VERSION=2.8.5

RUN apt-get update -q && apt-get install -yq wget && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

#copy server configuration file
COPY ./server.xml /usr/local/tomcat/conf/server.xml

WORKDIR /usr/local/tomcat/

#####################################################################

#Grab the latest version of Geoserver
WORKDIR /usr/local/tomcat/webapps
RUN wget -O geoserver.zip \
    https://sourceforge.net/projects/geoserver/files/GeoServer/${VERSION}/geoserver-${VERSION}-war.zip/download

#Unzip Geoserver
RUN unzip geoserver.zip && rm geoserver.zip

RUN mkdir -p geoserver && \
    unzip geoserver.war -d /usr/local/tomcat/webapps/geoserver/ && \
    rm geoserver.war

#Set Geoserver default dirs
RUN sed -i '$d' /usr/local/tomcat/bin/setclasspath.sh && \
    echo "CATALINA_OPTS=\"\$CATALINA_OPTS -DGEOSERVER_DATA_DIR=/usr/local/geoserver-live/data\"" >> /usr/local/tomcat/bin/setclasspath.sh && \
    echo "fi" >> /usr/local/tomcat/bin/setclasspath.sh

COPY ./users.xml /usr/local/tomcat/users.xml

# The default processes to run when start the container, are launched by a script
COPY ./entry-point.sh  /usr/local/tomcat/entry-point.sh
CMD ["/usr/local/tomcat/entry-point.sh"]

