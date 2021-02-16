# face-kit
face-kit是一个人脸比对库，它使用node.js、golang编写，可以对接开源人脸识别库或商业人脸识别库。

![企业微信截图_16134590894855](https://raw.githubusercontent.com/land007/face-kit/master/image/企业微信截图_16134590894855.png)

整个程序由face_server、match_server、library_server、snapshot_server、start几部分组成。

| 序号 | 模块名称        | 模块功能                                     |
| ---- | --------------- | -------------------------------------------- |
| 1    | face_server     | 负责提取人脸特征                             |
| 2    | match_server    | 负责人脸特征比对                             |
| 3    | library_server  | 负责人脸图库管理以及grpc协议restfull协议转换 |
| 4    | node_server | 负责rtsp视频流处理                           |
| 5    | start | docker或本地进程守护         |

为了部署方便，程序由docker镜像提供，依赖镜像如下所示。

| 序号 | 镜像名称      | 镜像功能                            |
| ---- | --------------- | -------------------------------------------- |
| 1    | ubutnu:18.0.4 | 官方ubuntu镜像 |
| 2    | land007/ubuntu:18.0.4 | 安装常用工具                   |
| 3    | land007/ubuntu-build:18.0.4 | 安装gcc和g++编译器 |
| 4    | land007/golang:18.0.4 | 安装golang软件包                  |
| 5    | land007/golang-grpc:18.0.4 | 安装golang grpc依赖包 |
| 6    | land007/gocvc:18.0.4 | 安装gocv图像处理包 |
| 7    | land007/golang-web-old:latest | 安装golang web应用常用依赖包 |
| 8    | land007/golang-node:latest | 安装node.js软件包 |
| 9    | land007/golang-tfjs-face:latest | 安装tfjs软件包、face-api.js软件包 |
| 10   | land007/face-kit:latest | 安装face-kit软件包 |

程序代码主要部分包括。

| 序号 | 模块 | 代码路径                      |
| ---- | --------------- | -------------------------------------------- |
| 1    | face_server    | face-kit/node/face-api.js/examples/examples-nodejs/face_grpc2.js |
| 2    | match_server   | face-kit/node/face-api.js/examples/examples-nodejs/match_grpc2.js |
| 3    | library_server | face-kit/golang/main.go                                      |
| 4    | node_server    | face-kit/node/face/face.js                             |
| 5    | start          | face-kit/node/start/start.js                            |

node.js无需编译，golang编译在face-kit/golang/路径下执行go build main.go即可生成main可执行文件。

使用docker运行程序方法如下

```bash
#linux/amd64
docker rm -f face-kit ; docker run -it --rm --privileged --runtime nvidia -e "AdminPass=" -e "OldAlgoVersion=feature" -e "FaceAddress=127.0.0.1:50052" -e "FaceMatchAddress=127.0.0.1:50051" -e "DbHost=172.17.0.1" -e "Database=io-grpc_beta" -e "DbUsername=root" -e "DbPassword=gmtools" -e "LEVEL=beta" --log-opt max-size=1m --log-opt max-file=1 -p 8019:8080 -p 3201:3101 -p 8899:8899 -p 20119:20022 -e "REMOTE_SNAPSHOT_SERVER=127.0.0.1:50050" -e "MATCH_LIBRARY=Test" -p 50063:50053 -e "DOORMONITORS=" -e "WH=1280x720" -e "QUALITY=3" -e "TTS=" -p 5201:5101 -p 6201:6101 -p 7201:7101 -e "REDUCE_FRAME=16" -e "BLOCKSWITCHS=0" -e "VIDEOSWITCHS=0" -e "DbLoad=0" -e "SENDIMG=1" --name face-kit land007/face-kit:latest

#NVIDIA AGX Xavier(ARM 64bit)
docker rm -f l4t-face-kit ; docker run -it --rm --privileged --runtime nvidia -e "AdminPass=" -e "OldAlgoVersion=feature" -e "FaceAddress=127.0.0.1:50052" -e "FaceMatchAddress=127.0.0.1:50051" -e "DbHost=172.17.0.1" -e "Database=io-grpc_beta" -e "DbUsername=root" -e "DbPassword=gmtools" -e "LEVEL=beta" --log-opt max-size=1m --log-opt max-file=1 -p 8019:8080 -p 3201:3101 -p 8899:8899 -p 20119:20022 -e "REMOTE_SNAPSHOT_SERVER=127.0.0.1:50050" -e "MATCH_LIBRARY=Test" -p 50063:50053 -e "DOORMONITORS=" -e "WH=1280x720" -e "QUALITY=3" -e "TTS=" -p 5201:5101 -p 6201:6101 -p 7201:7101 -e "REDUCE_FRAME=16" -e "BLOCKSWITCHS=0" -e "VIDEOSWITCHS=0" -e "DbLoad=0" -e "SENDIMG=1" --name l4t-face-kit land007/l4t-face-kit:latest

```

