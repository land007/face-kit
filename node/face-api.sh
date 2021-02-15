#!/bin/bash
kill -9 $(lsof -i tcp:50052 -t)
if [[ ${LEVEL} == "release" ]]; then
	cd /node/face-api.js/examples/examples-nodejs && node face_grpc2.js
else
	cd /node/face-api.js/examples/examples-nodejs && node face_grpc2.js | tee face-api.out
fi
