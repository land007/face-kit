#!/bin/bash
kill -9 $(lsof -i tcp:7101 -t)
if [[ ${LEVEL} == "release" ]]; then
	cd /node && node /node/rtsp/rtsp.js
else
	cd /node && node /node/rtsp/rtsp.js | tee rtsp.out
fi
