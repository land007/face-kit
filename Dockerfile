#FROM land007/golang-tfjs-face:latest
FROM land007/l4t-golang-tfjs-face:latest
#docker build -t land007/l4t-face-kit:latest .
#cd ~/docker_build/l4t-golang-node && docker build -t land007/l4t-golang-node . && cd ~/docker_build/l4t-golang-tfjs && docker build -t land007/l4t-golang-tfjs-face . && cd ~/docker_build/l4t-face-kit && docker build -t land007/face-kit .
#docker rm -f face-kit ; docker run -it --rm --privileged --runtime nvidia --name face-kit land007/l4t-face-kit:latest

MAINTAINER Yiqiu Jia <yiqiujia@hotmail.com>

ADD Image-ExifTool-11.16.tar.gz /tmp
RUN cd /tmp/Image-ExifTool-11.16 && perl Makefile.PL && make test && make install
ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib
#快捷方式
RUN ln -s $GOPATH/src/google.golang.org/grpc ~/ && \
	ln -s $GOPATH/src/google.golang.org/grpc /home/land007
#添加代码，设置工作目录
ADD build.sh /
ADD protos $GOPATH/src/google.golang.org/grpc/eyecool/protos
ADD golang /golang
RUN chmod +x /build.sh && /build.sh && ls -la /golang && \
    ln -s /golang ~/ && \
	ln -s /golang /home/land007
ENV FACE_CONTAINER_NAME=eyecool-cpp-grpc_ \
	MATCH_CONTAINER_NAME=eyecool-cpp-grpc_ \
	SNAPSHOT_CONTAINER_NAME=eyecool-cpp-grpc_ \
	GOLANG_CONTAINERNAME=eyecool-golang-grpc_ \
	NODE_CONTAINER_NAME=eyecool-golang-grpc_ \
	LEVEL=release \
	WaitTime=1000
#工作目录持久化
RUN mv /golang /golang_
VOLUME ["/golang"]
ADD check.sh /
ADD checkOne.sh /
ADD start.sh /golang_/start.sh
ADD stop.sh /golang_/stop.sh
RUN sed -i 's/\r$//' /check.sh && \
	chmod a+x /check.sh && \
	sed -i 's/\r$//' /checkOne.sh && \
	chmod a+x /checkOne.sh && \
	chmod +x /golang_/start.sh && \
	chmod +x /golang_/stop.sh
VOLUME ["/public"]
ENV CompanyName=眼神科技 \
	OldAlgoVersion=feature \
	AlgoVersion=1030 \
	DbDrive=mysql \
	DbHost=172.17.0.1 \
	DbPort=3306 \
	Database=io-grpc \
	DbUsername=root \
	DbPassword=1234567 \
	DbCharset=utf8 \
	FaceAddress=172.17.0.1:50052 \
	FaceMatchAddress=172.17.0.1:50051 \
	DbCharset=utf8 \
	Root=/eye \
	SecretKey=eyecool \
	Threshold=90.0 \
	TopN=20 \
	AdminPass="" \
#华夏远程桌面自调用接口配置
	GrpcHttpServer=127.0.0.1 \
	HttpPort=8080 \
	RestUrl=/eye/rest/library/ \
	RemoteRestTimeout=18000 \
	SPEC="*/30 * * * * ?" \
#调试
	GODEBUG="gctrace=1" \
#保存到数据库
	DbSave=1 \
#通过数据库加载
	DbLoad=1 \
#通过数据库一次加载量
	DbLoadLimit=100 \
#特征发送到比对服务器
	SendMatch=1 \
#GRPC连接超时时间
	ConnTimeout=50 \
#保存截后人脸图
	SaveThumbnail=1 \
#提取特征最大线程数(0不提取)
	Multithreading=1 \
#多线程(大于等于2线程)提取特征时候，提取超时时间(秒)，设置为0则没有超时时间
	MultithreadingTimeOut=0 \
#图片提特征开启多线程阈值
	OriginalMaxSize=10000
ADD heap.sh /golang_
ADD heap_svg.sh /golang_
RUN chmod +x /golang_/heap.sh && \
	chmod +x /golang_/heap_svg.sh
#node.js
RUN apt-get install -y pkg-config && \
    . $HOME/.nvm/nvm.sh && cd / && npm install -g node-pre-gyp && npm install @tensorflow/tfjs@1.5.1 @tensorflow/tfjs-node@1.5.1 face-api.js axios soap easy-soap-request xml-js && \
    . $HOME/.nvm/nvm.sh && cd /node_modules/@tensorflow/tfjs-node && node-pre-gyp install --build-from-source && \
    rm -rf /node_/node_modules
#face
ADD node/face/node_modules/bitmap-js /node_/face/node_modules/bitmap-js
ADD node/face/protos /node_/face/protos
ADD node/public /node_/public
ADD node/face/face.js /node_/face/
ADD node/face/aesutil.js /node_/face/
RUN mkdir /node_/data
ADD node/face.sh /node_
RUN chmod +x /node_/face.sh
ADD node/cmbc_agent/main.js /node_/cmbc_agent/
ADD node/cmbc_agent/converter.js /node_/cmbc_agent/
ADD node/cmbc_agent/rest_util.js /node_/cmbc_agent/
ADD node/cmbc_agent/time_util.js /node_/cmbc_agent/
ADD node/cmbc_agent/node_modules /node_/cmbc_agent/node_modules
ADD node/cmbc_agent.sh /node_
RUN chmod +x /node_/cmbc_agent.sh

ADD node/cmbc/converter.js /node_/cmbc/
ADD node/cmbc/main.js /node_/cmbc/
ADD node/cmbc/rest_util.js /node_/cmbc/
ADD node/cmbc/time_util.js /node_/cmbc/
ADD node/syncPersonInfo.wsdl /node_/
ADD node/cmbc.sh /node_
RUN chmod +x /node_/cmbc.sh

ENV REMOTE_SNAPSHOT_SERVER=172.17.0.1:50050 \
	MATCH_SERVER=172.17.0.1:50051 \
	MATCH_LIBRARY=Test
#rtsp
ADD node/rtsp/rtsp.js /node_/rtsp
ADD node/rtsp.sh /node_
RUN chmod +x /node_/rtsp.sh
#node视频尺寸1024x576
ENV WH="1280x720" \
#node视频清晰度
	QUALITY=1 \
#语音服务器地址
	TTS=""\
#node的rtsp地址
	RTSPURLS="" \
#视频尺寸废弃
#	WHS="" \
#ffmpeg日志级别
	FFMPEG_LOGLEVEL=0 \
#降频帧数
	REDUCE_FRAME=20 \
#气象局http://10.20.73.118:8080/doorManager/b/monitor/openDoor?user_no={{user_no}}&device_no={{device_no}}
	DOORMONITORS="" \
#民生银行http://127.0.0.1:3101/cmbc
#node视频开关
	VIDEOSWITCHS=1 \
#node人脸画框开关
	BLOCKSWITCHS=1 \
#识别结果是否合并开关
	ALLINONE=1 \
#陌生人超时推送(秒) cpp=minimum_dedupe_time
	STRANGERS_SEND_OUT_OVERTIME=10 \
#陌生人记忆时间(秒)
	EXPIRE_OUT_TIME=100 \
#清理时间(秒)
	CLEAR_TIME=180 \
#门禁写死的设备号/设备唯一编号
	DEVICE_NO="" \
#设备IP
	DEVICE_IP="" \
#门禁写死的用户号
	USER_NO="" \
#民生银行对接SOAP接口
	AXISURL="" \
#是否推送现场照
	SENDIMG=0 \
#eye http代理服务
	PROXYTARGET="http://127.0.0.1:8080"

#http://192.168.0.69:8080/?text=
EXPOSE 6101/tcp 7101/tcp 8101/tcp 50053/tcp

RUN rm -f /node_/main.js && \
	rm -f /node_/server.js && \
	useradd -s /bin/bash -m eyecool && \
	echo "eyecool:1234567" | /usr/sbin/chpasswd && \
	sed -i "s/^eyecool:x.*/eyecool:x:0:1000::\/home\/eyecool:\/bin\/bash/g" /etc/passwd && \
	cp -R /home/land007/* /home/eyecool
ENV PATH=$PATH:/usr/local/go/bin:/usr/local/go/path/bin \
    ZENITH_URL="" \
#1,马坡，2安外 ,
	LOCATION="" \
#抓拍机专用属性,人员点位，从哪儿进的(北门进入)
	POSITION="" \
#比对模式1刷卡2刷脸3卡或人脸4卡和人脸5刷身份证6身份证或人脸7身份证和人脸8卡或人脸或身份证
	PASSMODE="2" \
#显示注册照
	SHOW_REGISTRATION=1 \
#相机组，排列组合相机显示界面
	RTSPXS=""
#	RTSPXS="x1|x1|x1|x1"
#	RTSPXS="x1,x2|x1,x2|x1|x1"
#face-api.js
RUN cd /node_/face-api.js/examples/examples-nodejs && tsc --skipLibCheck faceRecognition.ts
ADD node/face-api.js/examples/examples-nodejs/face_grpc2.js /node_/face-api.js/examples/examples-nodejs/
ADD node/face-api.js/examples/examples-nodejs/match_grpc2.js /node_/face-api.js/examples/examples-nodejs/
ADD node/face-api.js/examples/examples-nodejs/commons/faceDetection.js /node_/face-api.js/examples/examples-nodejs/commons/
ADD node/face-api.js/examples/examples-nodejs/protos/ /node_/face-api.js/examples/examples-nodejs/protos/
ADD node/face-api.js/examples/examples-nodejs/output_1554197462330_96_133.jpg.bmp /node_/face-api.js/examples/examples-nodejs/
ADD node/face-api.sh /node_

# ADD protos /protos
RUN cd /usr/local/go/path/src/google.golang.org/grpc/eyecool/ && protoc -I protos/ protos/face.proto --go_out=plugins=grpc:protos && \
    ls /usr/local/go/path/src/google.golang.org/grpc/eyecool/protos

ADD node/face-api.sh /node_
RUN sed -i 's/\r$//' /node_/face-api.sh && chmod +x /node_/face-api.sh
ADD node/match-api.sh /node_
RUN sed -i 's/\r$//' /node_/match-api.sh && chmod +x /node_/match-api.sh

#start
ADD node/start/start.js /node_/start/
ADD node/store.json /node_
ADD node/start.sh /node_
RUN chmod +x /node_/start.sh

#RUN cd /node_modules/grpc && node-pre-gyp install --build-from-source
#RUN cd /node_/face-api.js/node_modules/@tensorflow/tfjs-node && node-pre-gyp install --build-from-source
#RUN cd /node_/face-api.js/node_modules/canvas && node-pre-gyp install --build-from-source
RUN cd / && npm install bitmaps
ADD pty.js /node_modules/pty.js

CMD /check.sh /node; /checkOne.sh /golang; /etc/init.d/ssh start; /node/start.sh

#无视频
#docker rm -f face-kit; rm -rf ~/docker/node_kit; rm -rf ~/docker/golang_kit; rm -rf ~/docker/golang-public_kit; docker run --runtime nvidia -it -e "AdminPass=" -e "AlgoVersion=1030" -e "OldAlgoVersion=feature" -v ~/docker/golang_kit:/golang -v ~/docker/golang-public_kit:/public -v ~/docker/node_kit:/node -e "FaceAddress=127.0.0.1:50052" -e "FaceMatchAddress=127.0.0.1:50051" -e "DbHost=" -e "Database=" -e "DbUsername=" -e "DbPassword=" -e "LEVEL=beta" --name face-kit --log-opt max-size=1m --log-opt max-file=1 -p 8019:8080 -p 3201:3101 -p 8899:8899 -p 20119:20022 -e "REMOTE_SNAPSHOT_SERVER=eyecool-cpp-grpc_beta:50050" -e "MATCH_LIBRARY=Test" -p 50063:50053 -e "DOORMONITORS=" -e "WH=1280x720" -e "QUALITY=3" -e "TTS=" -p 5201:5101 -p 6201:6101 -p 7201:7101 -e "REDUCE_FRAME=16" -e "BLOCKSWITCHS=0" -e "VIDEOSWITCHS=0" -e "DbLoad=1" -e "SENDIMG=1" land007/face-kit:latest
#有视频
#docker rm -f face-kit; docker run -it --label=com.centurylinklabs.watchtower.enable=true --volumes-from x11-bridge -e DISPLAY=:14 -v /:/host --link eyecool-cpp-grpc_beta:eyecool-cpp-grpc_beta --link mysql:mysql --privileged -e "AdminPass=" -e "AlgoVersion=1030" -e "OldAlgoVersion=feature" -e "GitUser=jiayiqiu" -e "GitPass=jiayq007" -v ~/docker/golang_beta:/golang -v ~/docker/golang-public_beta:/public -v ~/docker/node_beta:/node -v ~/docker/cpp_beta:/cpp -e "FaceAddress=eyecool-cpp-grpc_beta:50052" -e "FaceMatchAddress=eyecool-cpp-grpc_beta:50051" -e "DbHost=mysql" -e "Database=io-grpc_beta" -e "DbUsername=root" -e "DbPassword=ys1234567" -e "LEVEL=beta" --name face-kit --log-opt max-size=1m --log-opt max-file=1 -p 8019:8080 -p 3201:3101 -p 8899:8899 -p 20019:20022 -e "REMOTE_SNAPSHOT_SERVER=eyecool-cpp-grpc_beta:50050" -e "MATCH_LIBRARY=Test" -p 50063:50053 -e "RTSPURLS=rtsp://admin:admin@192.168.0.99:8557/h264|rtsp://admin:admin@192.168.0.203:8557/h264" -e "ZENITH_URL=zenith://192.168.0.99|zenith://192.168.0.203" -e "DOORMONITORS=" -e "WH=1280x720" -e "QUALITY=3" -e "TTS=" -p 5201:5101 -p 6201:6101 -p 7201:7101 -e "REDUCE_FRAME=16" -e "BLOCKSWITCHS=0" -e "VIDEOSWITCHS=0" -e "DbLoad=1" -e "SENDIMG=1" -e "AXISURL=http://wrt.qhkly.com:13080/test" -e "RTSPXS=x1|x1" registry.eyecool.cn:5080/eyecool-golang-grpc:v15
#访问
#http://192.168.0.96:8008

#cd ~/docker_golang && sudo docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t land007/golang --push . && cd ~/docker_golang-grpc && sudo docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t land007/golang-grpc --push . && cd ~/docker_gocv && sudo docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t land007/gocv --push . && cd ~/docker_golang-web && sudo docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t land007/golang-web --push . && cd ~/docker_golang-node && sudo docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t land007/docker_golang-node --push . && cd ~/docker_golang-tfjs-face && sudo docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t land007/golang-tfjs-face --push .
#docker build -t land007/face-kit:latest .
#docker rm -f face-kit ; docker run -it --rm --privileged --runtime nvidia --name face-kit land007/face-kit:latest
