// file: configs/server_config.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 *  主机配置类
 */

package configs

import (
)

//常量
var LocalPort = "8080"
//var Host = GetString("Host", "172.17.0.17")
//var HostPort = GetString("HostPort", "8008")
var Root = GetString("Root", "/eye")
var SecretKey = GetString("SecretKey", "eyecool")
var LEVEL = GetString("LEVEL", "release")
var EyecoolPass = GetString("EyecoolPass", "1234567")
var AdminPass = GetString("AdminPass", "")

var Multithreading int = GetInt("Multithreading", "1")
var MultithreadingTimeOut int = GetInt("MultithreadingTimeOut", "0")
