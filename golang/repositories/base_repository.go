// file: repositories/base_repository.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * 持久化基础类
 */

package repositories

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"../utils"
	"../configs"
)

var db *sql.DB
var dberr error

func init() {
//	url := "root:1234567@tcp(192.168.0.96:3306)/test?charset=utf8&parseTime=true"
	url := configs.DbUsername + ":" + configs.DbPassword + "@tcp(" + configs.DbHost + ":" + configs.DbPort + ")/" + configs.Database + "?charset=" + configs.DbCharset
//	url := configs.DbUsername + ":" + configs.DbPassword + "@tcp(" + configs.DbHost + ":" + configs.DbPort + ")/" + configs.Database + "?charset=" + configs.DbCharset + "&parseTime=true"
	db, dberr = sql.Open(configs.DbDrive, url)//"mysql"
//  defer db.Close()
	utils.CheckErr(dberr)
}
