#!/bin/sh

java -Xmx128m -jar ./res/service/Server.jar &

sleep 10

npm run js