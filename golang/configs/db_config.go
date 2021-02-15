// file: configs/db_config.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 *  数据库配置类
 */

package configs

import (
)

//常量
var DbDrive = GetString("DbDrive", "mysql")
var DbHost = GetString("DbHost", "172.17.0.17")
var DbPort = GetString("DbPort", "3306")
//const Database = "test"
var Database = GetString("Database", "io-grpc")
var DbUsername = GetString("DbUsername", "root")
var DbPassword = GetString("DbPassword", "ys1234567")
var DbCharset = GetString("DbCharset", "utf8")

var DbSave = GetString("DbSave", "1")
var DbLoad = GetString("DbLoad", "1")
//var DbLoad = "1"
var DbLoadLimit int = GetInt("DbLoadLimit", "100")
