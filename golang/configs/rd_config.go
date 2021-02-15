// file: configs/rd_config.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 *  远程桌面配置类
 */

package configs

import (
)

//常量
var RemotePort string = GetString("RemotePort", "7999")// 远程取图端口
var RemoteUrl string = GetString("RemoteUrl", "/rest/personnels?actived=2&timeout=5")// 远程取图URL
var GrpcHttpServer string = GetString("HttpServer", "127.0.0.1")// Http接口服务
var GrpcHttpPort string = GetString("HttpPort", LocalPort)// Http接口服务端口
var RestUrl string = GetString("RestUrl", "/eye/rest/library/")// 比对库接口
const Rest1v1 string = "/comparison/1v1/"// 一比一接口
const Rest1vn string = "/comparison/1vN"// 一比多接口
const RestP1vn string = "/remote_desktop/P1vN"// 远程桌面人员比对接口
const ImageFileTimeOut int64 = int64(15*24*60*60*1000)// 远程桌面人员照片存放时间
var RemoteRestTimeout int = GetInt("RemoteRestTimeout", "28000")// 远程桌面接口超时时间
var SPEC string = GetString("SPEC", "*/30 * * * * ?")// 计划任务
