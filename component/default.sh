#!/bin/bash
REPO_URL=$1
REPO_LOCATION=$2
REPO_VC_DIR="$REPO_LOCATION/.git"

mkdir -p $REPO_LOCATION

if [ ! -d $REPO_VC_DIR ]; then
    git clone $REPO_URL $REPO_LOCATION
else
    cd $REPO_LOCATION
    git fetch origin master
    git reset --hard origin/master
fi
