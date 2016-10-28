#!/bin/bash

# Check if environmental variables are set
: "${gitlab_user:?gitlab_user needs to be set and non-empty && exit}"
: "${gitlab_pass:?gitlab_pass needs to be set and non-empty && exit}"

# Rationale:
# - If base images exist, we reuse them.
# - If we build a base image, we redo the derived image.

# Build live_db
if [[ "$(docker images -q live_db:latest 2> /dev/null)" == "" ]]; then

   echo -e "\e[91mBuilding live_db\e[96m"
   docker build -t live_db https://$gitlab_user:$gitlab_pass@eos.geocat.net/gitlab/live/live_db.git#master

   if [[ "$(docker images -q livecompose_db:latest 2> /dev/null)" != "" ]]; then

     echo -e "\e[91mderived live_db image exists; removing...\e[96m"
      docker rmi livecompose_db

   fi

else
 echo -e "\e[91mlive_db image exists. Not building\e[96m"
fi;

echo -e "\e[91mBuild and run compose\e[96m";

docker-compose up -d
