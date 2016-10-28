#!/bin/bash

set -e

/usr/local/tomcat/bin/catalina.sh start

#Wait for Tomcat to start
until $(curl --output /dev/null --silent --head --fail http://localhost:8009); do
    printf '.'
    sleep 5
done

echo "Tomcat has started"

#Change default password
cp /usr/local/tomcat/users.xml /usr/local/geoserver-live/data/security/usergroup/default/users.xml && \
sed -i -e \
's#<passwordEncoderName>pbePasswordEncoder</passwordEncoderName>#<passwordEncoderName>digestPasswordEncoder</passwordEncoderName>#g' \
/usr/local/geoserver-live/data/security/usergroup/default/config.xml && \
echo "Using admin password: YY8jDj6FpB"

exec tail -f /dev/null "$@"
