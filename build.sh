#!/bin/bash
# 测试5
cd $GOPATH/src/google.golang.org/grpc/examples/helloworld && protoc -I helloworld/ helloworld/helloworld.proto --go_out=plugins=grpc:helloworld
# RUN ls $GOPATH/src/google.golang.org/grpc/examples/helloworld/helloworld
git config --global user.name "Jia Yiqiu"
git config --global user.email "yiqiujia@hotmail.com"
# 生成proto
#ADD examples/face_service5 $GOPATH/src/google.golang.org/grpc/examples/face_service
#rm -rf $GOPATH/src/google.golang.org/grpc/eyecool && mkdir $GOPATH/src/google.golang.org/grpc/eyecool && cd $GOPATH/src/google.golang.org/grpc/eyecool && git clone http://jiayiqiu:jiayq007@192.168.0.68:8090/gitlab/general-face-platform/protos.git
#RUN cd $GOPATH/src/google.golang.org/grpc/eyecool/protos && git checkout 8fa7d0e9c0ab09d360faf89334980df799367c46
#RUN cd $GOPATH/src/google.golang.org/grpc/eyecool/protos && git checkout 5f00b2ea04ba8fc35b93055dfafcb629572a06b3
#RUN cd $GOPATH/src/google.golang.org/grpc/examples/face_service/face_service_client && protoc -I ../face_service --go_out=plugins=grpc:../face_service ../face_service/face.proto
cd $GOPATH/src/google.golang.org/grpc/eyecool/protos && protoc -I ../protos --go_out=plugins=grpc:../protos ../protos/face.proto
# RUN cd $GOPATH/src/google.golang.org/grpc/examples/face_service/face_service_client && protoc -I ../face_service --go_out=plugins=grpc:../face_service ../face_service/parameter.proto
#RUN ls /usr/local/go/path/src/google.golang.org/grpc/examples/face_service/face_service
ls $GOPATH/src/google.golang.org/grpc/eyecool/protos
#RUN go run face_service_server/main.go
#RUN go run face_service_client/main.go
# 编译
#git clone http://jiayiqiu:jiayq007@10.2.0.10:8090/gitlab/jiayiqiu/golang-grpc.git /golang
#git clone http://jiayiqiu:jiayq007@192.168.0.68:8090/gitlab/jiayiqiu/golang-grpc.git /golang
#cd /golang && git checkout 295d19d55813b85277f6f9987025c4adfe04633c
#cd /golang && go build main.go
#rm -rf /golang/configs
#rm -rf /golang/controllers
#rm -rf /golang/datamodels
#rm -rf /golang/exiffix
#rm -rf /golang/middleware
#rm -rf /golang/repositories
#rm -rf /golang/services
#rm -rf /golang/utils
#rm -rf /golang/.git
#rm -f /golang/main.go
#rm -f /build.sh