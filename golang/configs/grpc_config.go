// file: configs/grpc_config.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * GRPC配置类
 */

package configs

import (
	"time"
)

//常量
var FaceAddress      = GetString("FaceAddress", "172.17.0.17:50052")
//var FaceAddress      = "192.168.0.225:50052"
//var FaceAddress      = "127.0.0.1:50052"
//var FaceAddress      = "192.168.0.69:50052"
var FaceMatchAddress = GetString("FaceMatchAddress", "172.17.0.17:50051")
//var FaceMatchAddress      = "192.168.0.225:50051"
//var FaceMatchAddress      = "127.0.0.1:50051"      
//var FaceAddress      = GetString("FaceAddress", "192.168.1.218:50052")
//var FaceMatchAddress = GetString("FaceMatchAddress", "192.168.1.218:50051")
var DefaultName      = "world"

var SendMatch = GetString("SendMatch", "1")
var ConnTimeout = time.Duration(GetInt("ConnTimeout", "50"))
