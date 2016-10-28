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
This is a generic image which instantiates PostgreSQL. The shipped services are:

* PostgreSQLv9.3/PostGISv2.1

This image is meant to be used with the live_compose and live_geonetwork multi-container apps.

![](https://eos.geocat.net/gitlab/live/live_db/raw/master/postgres.png)

AUTHORS
=======
This work was originally created and maintained by @doublebyte1, who can be contacted at: joana.simoes@geocat.net

INSTALL
=======
BUILD
-----
This image can be build like this:

```bash
docker build -t live_db .
```

This will create an image on your system called live_gn.

Default Configuration
---------------------
By default we allow peer authentication from postgres, locally.
We also listen to all addresses, and allow authenticated non-local database connections.

Using PostgreSQL Live
--------------------
After building the image, you can spin a container (this syntax will publish the exposed port 5432 on the host):

```bash
docker run --name postgis -p 5432:5432 -d live_db
```

By default, we don't create any database users on this image.
If you want to connect to the database, you will have to enter the running container and create users, using the passwordless postgres login, from the postgres user:

```bash
docker exec -it postgis /bin/bash
sudo -u postgres psql -U postgres
```
In alternative, use this image as a base for your another image, in which you create users.

After running this container and creating user [myuser], you can access PostgreSQL on this address:

```bash
psql -h [replace_me] -U [myuser] postgres
```
If you are running docker on Linux, just replace [replace_me] by _localhost_ (e.g.: 127.0.0.1). Otherwise, replace it by the address of your docker machine. You can find this address, by typing:

```bash
docker-machine ip
```

Please note that **if you want to derive a container from this image to use with geonetwork or geoserver, you will need to create the relevant databases first**. You can do so manually, or by creating a new image, derived from this base image, which adds the relevant instructions (see for instance [this](https://eos.geocat.net/gitlab/live/live_geonetwork/blob/master/live_db/Dockerfile) example).

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

![](https://eos.geocat.net/gitlab/live/live_db/raw/cobweb/heckert_gnu.small.png)
