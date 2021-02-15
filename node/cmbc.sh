#!/bin/bash
kill -9 $(lsof -i tcp:3101 -t)
if [[ ${LEVEL} == "release" ]]; then
	cd /node && node /node/cmbc/main.js
else
	cd /node && node /node/cmbc/main.js | tee cmsb.out
fi
