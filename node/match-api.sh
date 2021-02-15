#!/bin/bash
kill -9 $(lsof -i tcp:50051 -t)
if [[ ${LEVEL} == "release" ]]; then
	cd /node/face-api.js/examples/examples-nodejs && node match_grpc2.js
else
	cd /node/face-api.js/examples/examples-nodejs && node match_grpc2.js | tee match-api.out
fi
