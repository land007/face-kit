#!/bin/bash
kill -9 $(lsof -i tcp:6101 -t)
if [[ ${LEVEL} == "release" ]]; then
	cd /node && node /node/face/face.js
else
	cd /node && node /node/face/face.js | tee face.out
fi
