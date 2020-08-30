FROM land007/golang-tfjs-face:latest

MAINTAINER Yiqiu Jia <yiqiujia@hotmail.com>


#cd ~/docker_golang && sudo docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t land007/golang --push . && cd ~/docker_golang-grpc && sudo docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t land007/golang-grpc --push . && cd ~/docker_gocv && sudo docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t land007/gocv --push . && cd ~/docker_golang-web && sudo docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t land007/golang-web --push . && cd ~/docker_golang-node && sudo docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t land007/docker_golang-node --push . && cd ~/docker_golang-tfjs-face && sudo docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t land007/golang-tfjs-face --push .
#docker build -t land007/face-kit:latest .
#docker rm -f face-kit ; docker run -it --rm --privileged --name face-kit land007/face-kit:latest
