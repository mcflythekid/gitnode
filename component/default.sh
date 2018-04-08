#!/bin/bash
REPO_URL=$1
REPO_LOCATION=$2
REPO_VC_DIR="$REPO_LOCATION/.git"

mkdir -p $REPO_LOCATION

if [ ! -d $REPO_VC_DIR ]; then
    rm -rf $REPO_LOCATION
    mkdir -p $REPO_LOCATION
    git clone $REPO_URL $REPO_LOCATION
else
    cd $REPO_LOCATION
    git fetch origin master
    git reset --hard origin/master
fi
