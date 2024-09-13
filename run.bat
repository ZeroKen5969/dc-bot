@echo off

java -Xmx128m -jar ./res/service/Server.jar &
sleep 10

rmdir /S /Q built 1> nul

call npm run build 
call npm run js