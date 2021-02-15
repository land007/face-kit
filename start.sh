#!/bin/bash
/golang/stop.sh
if [[ "${LEVEL}" == "release" ]]; then
	echo "Release level"
	if [[ "${GolangGitUrl}" == "" ]]; then
		cd /golang && ./main
	else
		cd /golang && go run main.go | tee main.out
	fi
else
	echo "Test level"
	if [[ "${GolangGitUrl}" == "" ]]; then
		cd /golang && ./main
	else
		cd /golang && realize start | tee main.out
	fi
fi