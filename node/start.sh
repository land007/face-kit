#!/bin/bash
#/usr/bin/nohup supervisor -w /node/ /node/main.js > /node/node.out 2>&1 & bash
chmod +x /node/start.sh
chmod +x /node/face.sh
#chmod +x /node/rtsp.sh
chmod +x /golang/stop.sh
chmod +x /golang/stop.sh
if [[ "${LEVEL}" == "release" ]]; then
	echo "Release level"
	supervisor -w /node/start/ -x /root/.nvm/versions/node/v9.11.2/bin/node -i /node/data /node/start/start.js
else
	echo "Test level"
	/root/.nvm/versions/node/v9.11.2/bin/node /node/start/start.js
fi