#!/bin/bash
DIR=$1
if [[ "$(ls -A ${DIR})" ]]; then
	echo "${DIR} is not Empty"
else
	echo "${DIR} is Empty"
	if [[ "${GolangGitUrl}" == "" ]]; then
		echo "cp -R ${DIR}_/* ${DIR}"
		cp -R ${DIR}_/* ${DIR}
	else
		echo "git clone http://192.168.0.68:8090/gitlab/jiayiqiu/golang-grpc.git"
		#git clone http://${GitUser}:${GitPass}@192.168.0.68:8090/gitlab/jiayiqiu/golang-grpc.git /golang && mkdir /golang/public/tmp
		git clone ${GolangGitUrl} /golang
		cp ${DIR}_/start.sh ${DIR}
		if [[ "${RTSPURL}" == "" ]]; then
			cp ${DIR}_/.realize.yaml ${DIR}
			#cp ${DIR}_/.realize.yaml ${DIR}/realize
		fi
	fi
fi
chmod -R 777 ${DIR}