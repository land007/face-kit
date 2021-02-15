#!/bin/bash
kill -9 $(lsof -i tcp:3101 -t)
if [[ ${LEVEL} == "release" ]]; then
	cd /node && node /node/cmbc_agent/main.js
else
	cd /node && node /node/cmbc_agent/main.js | tee cmbc_agent.out
fi
