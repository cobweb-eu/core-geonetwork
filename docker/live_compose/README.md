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
===================
This is a MVP, that instantiates an SDI through a composition of dockerized services. The shipped services are:

* Apachev2.4.12
* Tomcatv7-jre8/Cobweb GN
* Tomcatv7/Geoserverv2.8.5
* PostgreSQLv9.3/PostGISv2.1

While storage is persisted in **volumes** associated to a data container, the services are *volatile*, in the sense that it is relatively *cheap* to kill them and create them again.

AUTHORS
=======
This work was originally created and maintained by @doublebyte1, who can be contacted at: joana.simoes@geocat.net

INSTALL
=======
REQUIREMENTS & INSTALLATION
---------------------------
For supporting version '2' of the compose syntax, you will need docker-compose >= 1.6 and docker >= 1.10.0
Instructions for installing the docker engine on different OS and flavours can be found here:

https://docs.docker.com/engine/installation/

Instructions for installing docker-compose can be found here:

https://docs.docker.com/compose/install/

Note that if you are a non-Linux user, you will need to install docker-machine in addition to docker and compose.
You may check the requirements section first. After that, to build and run the system for the first time you want to go to the root directory and run _docker-compose_.

The compose configuration is in file; _docker-compose.yml_. If you run the system on your local machine, you can type:

```bash
docker-compose up
```
Running the above, with the _-d_ flag, will cause it to run the containers as daemons. In that case the output will not be redirected to stdout, but you may acccess it with:

```bash
docker logs [container-name]
```
To follow the logs in real time, use the _--follow_ flag:

```bash
docker logs --follow [container-name]
```

This will download and compile the necessary images, and start the services.
Each service is wrapped into its own container: one for GeoNetwork, other for GeoServer and another for database. They are binded to the same host, and they are assigned fixed ports on startup.

You can stop the system, just by typing:

```bash
docker-compose stop
```
After creating the containers, you can start the system at any time with:

```bash
docker-compose start
```
The current version of this system, uses a base image for the database, which is **not** available on the public Docker Hub repository. Before calling _docker-compose_, you need to **ensure that this image is built on your system**. You can build it manually with:

```bash
docker build -t live_db https://$gitlab_user:$gitlab_pass@eos.geocat.net/gitlab/live/live_db.git#master
```
For convenience, a script is provided, which will check if this image is present, and build it otherwise, before launching the compose. To build & run the system, type:

```bash
./run.sh
```
Data Container
--------------
As mentioned before, the _data volumes_ are dettached from the containers and mounted in a data container. This allows the service containers to be stopped, restarted or killed, without any loss of data.
The volumes being exported include the data directories from GeoNetwork and GeoServer, as well as their PostgreSQL databases and the DB logs.

Network and Security
--------------------
Docker creates an internal network, which is then used to communicate between containers. All containers are binded to the same host, which is _localhost_ on Linux and the address of the docker machine on OsX and Windows.
Only two ports are exposed outside this internal network: 80 and 443 on the apache container.
The data container exposes port 9102, which is used by the bacula-client to communicate with the server. If you want to take advantage of the backup funcionality, be sure to open this port in any firewall.

The PostgreSQL DB accepts passwordless local conections from _postgres_ user. It also accepts authenticated remote connections, but these are limited to the internal network, as we do not expose the PostgreSQL port.
Currently, we use a set of default username and passwords, which should be *changed* for increased security:

(Username,password)

**PostgreSQL**:

* admin, gnos
* geoserver, geoserver

**GeoNetwork, GeoServer**:
* admin, YY8jDj6FpB

The Cobweb version of GeoNetwork relies on [Shibboleth](https://en.wikipedia.org/wiki/Shibboleth) authentication. Some extra effort will be required in order to setup and use a Shibboleth image whithin this composition, but without it the authentication will not work.

Default Configuration
---------------------
The instantiated SDI has a default configuration, provided for ease of usage.
Both GeoNetwork and GeoServer are configured, by default, to use PostgreSQL/PostGIS.
PostgreSQL is provided with PostGIS installed, and the GeoNetwork and GeoServer databases are created during installation.

*GeoNetwork DBs*:

* geonetwork-private (spatial DB)
* admin

*GeoServer DBs*:

* geoserver (spatial DB)

Using GeoCat Live
-----------------
When the system is up and running, you can access GeoNetwork on this address:

 http://[replace_me]/geonetwork

Likewise you can access GeoServer on this address:

 https//[replace_me]/geoserver

If you are running docker on Linux, just replace [replace_me] by _localhost_ (_e.g._: 127.0.0.1). Otherwise, replace it by the address of your docker machine. You can find this address, by typing:

```bash
docker-machine ip
```

Recreating Containers
=====================
For recreating a multi-container system, launched with docker compose, you must stop it first. Then you can remove the containers with:

```bash
docker-compose rm
```
Or to do it in one go:

```bash
docker-compose stop && docker-compose rm -f
```
And then build them again with:

```bash
docker-compose up
```
Recreating Images
=================

For recreating images, you must remove each image individually with:

```bash
docker rmi [some-image]
```
In order to remove an image, you must ensure *there are no containers created from this image*. If there are any containers instantiated from this image, you must stop & delete them first.

Then you can rebuild the system with:

```bash
docker-compose up
```

License
========
This software is released under the GPL v2 license and can be used and modified free of charge. A complete copy of the license can be found on [this](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html) link.

![](https://eos.geocat.net/gitlab/live/live_gn/raw/cobweb/heckert_gnu.small.png)
