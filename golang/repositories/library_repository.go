// file: repositories/library_repository.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * 持久化比对库类
 */

package repositories

import (
	"log"
//	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"../utils"
	"../datamodels"
)

func ClearLibrary() {
	//清空数据
	if dberr == nil {
		stmt, err := db.Prepare("delete from tab_library")
		utils.CheckErr(err)
		res, err := stmt.Exec()
		utils.CheckErr(err)
		affect, err := res.RowsAffected()
		utils.CheckErr(err)
		log.Println(affect)
	}
}

func AddLibraryBatch(libs []string) {
	//批量插入特征库数据
	if dberr == nil {
		stmt, err := db.Prepare("INSERT INTO `tab_library` (`library_code`, `library_name`) VALUES (?, ?);")
		utils.CheckErr(err)
		size := len(libs)
		log.Println(size)
		for i := 0; i < size; i++ {
			lib := libs[i]
			log.Println(lib)
			res, err := stmt.Exec(lib, lib)
			utils.CheckErr(err)
			id, err := res.LastInsertId()
			utils.CheckErr(err)
			log.Println(id)
		}
	}
}

func AddLibrary(lib string) {
	//插入特征库数据
	if dberr == nil {
		sql := "INSERT INTO `tab_library` (`library_code`, `library_name`) VALUES (?, ?);";
		log.Println(sql)
		stmt, err := db.Prepare(sql)
		utils.CheckErr(err)
		log.Println(lib)
		res, err := stmt.Exec(lib, lib)
		utils.CheckErr(err)
		id, err := res.LastInsertId()
		utils.CheckErr(err)
		log.Println(id)
	}
}

func AddUdpLibrary(lib string) {
	//插入特征库数据
	if dberr == nil {
		sql := "INSERT INTO `tab_library` (`library_code`, `library_name`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `library_code` = ?, `library_name` = ?;";
		log.Println(sql)
		stmt, err := db.Prepare(sql)
		utils.CheckErr(err)
		log.Println(lib)
		res, err := stmt.Exec(lib, lib, lib, lib)
		utils.CheckErr(err)
		id, err := res.LastInsertId()
		utils.CheckErr(err)
		log.Println(id)
	}
}

func DelLibrary(lib string) {
//	删除数据
	if dberr == nil {
		log.Println("Del Library")
		log.Println(lib)
		stmt, err := db.Prepare("delete from tab_library where library_code=?")
		utils.CheckErr(err)
		res, err := stmt.Exec(lib)
		utils.CheckErr(err)
		affect, err := res.RowsAffected()
		utils.CheckErr(err)
		log.Println(affect)
	}
}

func QueryLibrarys() []datamodels.Library {
	data := make([]datamodels.Library, 0)
	//查询数据
	if dberr == nil {
		//	rows, err := db.Query("SELECT identity_id, feature_id, name, feature, library_code FROM `tab_features`")
		rows, err := db.Query("SELECT library_id, library_code, library_name FROM `tab_library`")
		utils.CheckErr(err)
		for rows.Next() {
			var library_id int
			var library_code string
			var library_name string
			err = rows.Scan(&library_id, &library_code, &library_name)
			utils.CheckErr(err)
			log.Println(library_id)
			log.Println(library_code)
			log.Println(library_name)
			library := datamodels.Library {
				Code : library_code,
				Name : library_name,
				Id: library_id,
			}
			data = append(data, library)
		}
	}
	return data
}
