#!/bin/sh
docker stop idp
docker rm idp
docker rmi node/mashery-oauth-idp:latest

