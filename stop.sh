#!/bin/bash
#kill -9 `ps -ec | grep "go"$ | awk '{print $1}' | grep -v PID`
kill -9 $(lsof -i tcp:8080 -t)
