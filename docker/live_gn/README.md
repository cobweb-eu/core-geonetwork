    /***************************************************************************************/

    88888888ba  88888888888        db        88888888ba,   88b           d88 88888888888
    88      "8b 88                d88b       88      `"8b  888b         d888 88
    88      ,8P 88               d8'`8b      88        `8b 88`8b       d8'88 88
    88aaaaaa8P' 88aaaaa         d8'  `8b     88         88 88 `8b     d8' 88 88aaaaa
    88""""88'   88"""""        d8YaaaaY8b    88         88 88  `8b   d8'  88 88"""""
    88    `8b   88            d8""""""""8b   88         8P 88   `8b d8'   88 88
    88     `8b  88           d8'        `8b  88      .a8P  88    `888'    88 88
    88      `8b 88888888888 d8'          `8b 88888888Y"'   88     `8'     88 88888888888

GENERAL INFORMATION
============
This is a generic image which instantiates GeoNetwork. The shipped services are:

* Tomcatv7-jre8/Cobweb GN

This image is meant to be used with the live_compose and live_geonetwork multi-container apps.

![](https://eos.geocat.net/gitlab/live/live_gn/raw/cobweb/gn-docker.png)

AUTHORS
=======
This work was originally created and maintained by @doublebyte1, who can be contacted at: joana.simoes@geocat.net

INSTALL
=======
BUILD
-----
Example of the build syntax:

```bash
docker build -t live_gn .
```

This will create an image on your system called live_gn.

Default Configuration
---------------------
The instantiated GeoNetwork has a default configuration, provided for ease of usage. It is configured to use PostgreSQL/PostGIS. The database is provided in a different image; please make sure to build & run it, if you want to make use of this image of GeoNetwork. You can read more about creating database images and running database containers, on [this](https://eos.geocat.net/gitlab/live/live_db/blob/master/README.md) link.
These are the default administrator credentials:

* admin, YY8jDj6FpB

There is no SSL layer on Tomcat, as this should be handled on the Apache layer. Tomcat is configured to run on port 8009.

Version of GeoNetwork
---------------------
This image uses the COBWEB version, of GeoNetwork, hosted on this repository:

http://eos.geocat.net/gitlab/joana.simoes/cobweb-gn.git

And available through this link:

https://eos.geocat.net/gitlab/joana.simoes/cobweb-gn/raw/master/geonetwork-cobweb.war

Using GeoNetwork Live
--------------------
After building the image, you can spin a container:

```bash
docker run --name geonetwork -p 80:8009 --link postgis:db -d live_gn
```
The _--link_ flag will create an internal link between this container, and a postgres container running the geonetwork databases. In the example, the database container was called _postgis_, and it should be always mapped to "db".
Note that this syntax will publish port 8009 on port 80 of the host.
After running the database container, you can access GeoNetwork on this address:

 http://[replace_me]/geonetwork

If you are running docker on Linux, just replace [replace_me] by _localhost_ (_e.g._: 127.0.0.1). Otherwise, replace it by the address of your docker machine. You can find this address, by typing:

```bash
docker-machine ip
```

Recreating Container
=====================

For recreating a container, launched with docker run, you must stop it first.

```bash
docker stop [container-name]
```

Then you can remove the container with:

```bash
docker rm [container-name]
```

Or to do it in one go:

```bash
docker stop [container-name] && docker rm -f [container-name]
```

Recreating Image
=================

For recreating an image, you must remove it first:

```bash
docker rmi [some-image]
```

In order to remove an image, you must ensure *there are no containers created from this image*. If there are any containers instantiated from this image, you must stop & delete them first.

Then you can rebuild it, following the instructions on section _build_.

License
========
This software is released under the GPL v2 license and can be used and modified free of charge. A complete copy of the license can be found on [this](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html) link.

![](https://eos.geocat.net/gitlab/live/live_gn/raw/cobweb/heckert_gnu.small.png)
