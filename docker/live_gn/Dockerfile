FROM tomcat:7-jre8

MAINTAINER doublebyte <joana.simoes@geocat.net>

ENV GN_DOWNLOAD_MD5 3dd5e671bddafd72ce56f8c80126f57e

RUN  mv /etc/apt/sources.list.d/* /tmp  #We need to do this, to remove malfunctioning backport mirrors
RUN apt-get update && \
    apt-get install -y wget && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY ./server.xml /usr/local/tomcat/conf/server.xml

WORKDIR /usr/local/tomcat/

#####################################################################
#Grab the latest version of GN
WORKDIR /usr/local/tomcat/webapps

RUN wget -O geonetwork-cobweb.war \
     https://eos.geocat.net/gitlab/joana.simoes/cobweb-gn/raw/master/geonetwork-cobweb.war
RUN  echo "$GN_DOWNLOAD_MD5 *geonetwork-cobweb.war" | md5sum -c

RUN mkdir -p /usr/local/tomcat/webapps/geonetwork && \
    unzip -e /usr/local/tomcat/webapps/geonetwork-cobweb.war -d /usr/local/tomcat/webapps/geonetwork && \
    rm geonetwork-cobweb.war

COPY  ./data-db-default.sql /usr/local/tomcat/webapps/geonetwork/WEB-INF/classes/setup/sql/data/data-db-default.sql
RUN echo "Using admin password: YY8jDj6FpB"

#Set geonetwork default dirs
RUN sed -i '$d' /usr/local/tomcat/bin/setclasspath.sh && \
    echo "CATALINA_OPTS=\"\$CATALINA_OPTS -Dgeonetwork.dir=/usr/local/geonetwork-live/data\"" \
        >> /usr/local/tomcat/bin/setclasspath.sh && \
    echo "fi" >> /usr/local/tomcat/bin/setclasspath.sh

COPY ./jdbc.properties /usr/local/tomcat/webapps/geonetwork/WEB-INF/config-db/jdbc.properties
