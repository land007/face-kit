// file: repositories/personnel_repository.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * 持久化人员类
 */

package repositories

import (
	"log"
//	"fmt"
	"time"
	_ "github.com/go-sql-driver/mysql"
	"../utils"
	"../datamodels"
	"../configs"
)

func ClearPersonnel() {
	//清空全部数据
	if dberr == nil {
		stmt, err := db.Prepare("delete from tab_features")
		utils.CheckErr(err)
		res, err := stmt.Exec()
		utils.CheckErr(err)
		affect, err := res.RowsAffected()
		utils.CheckErr(err)
		log.Println(affect)
	}
}

func ClearLibraryPersonnel(libraryCode string) {
	//清空图库数据
	if dberr == nil {
		stmt, err := db.Prepare("delete from tab_features where library_code=?")
		utils.CheckErr(err)
		res, err := stmt.Exec(libraryCode)
		utils.CheckErr(err)
		affect, err := res.RowsAffected()
		utils.CheckErr(err)
		log.Println(affect)
	}
}

func AddPersonnelBatch(pis []datamodels.Personnel, library string) {
	//插入批量数据
	if dberr == nil {
		size := len(pis)
		log.Println(size)
		for i := 0; i < size; i++ {
			pi := pis[i]
			log.Println(i,"/" ,size)
			pi.LibraryId = library
			log.Println(pi)
			AddUdpPersonnel(pi)
		}
	}
}
//
//func AddPersonnel(pi datamodels.PersonnelInfo) int64 {
//	//插入数据
//	if dberr == nil {
//		stmt, err := db.Prepare("INSERT INTO `tab_features` (`identity_id`, `feature_id`, `name`, `feature`, `file_id`, `media_type_id`, `checksum`, `file_size`, `bio_type_id`, `create_time`, `update_time`, `expire_time`, `company_algorithm_id`, `library_code`, `status_id`) VALUES (?, ?, ?, ?, NULL, ?, NULL, NULL, ?, CURRENT_TIMESTAMP(3), ?, ?, ?, ?, ?);")
//		utils.CheckErr(err)
//		update_time := utils.If(pi.UpdateTime == 0, time.Now(), time.Unix(pi.UpdateTime)).(int64)
//		log.Println(update_time)
//		expire_time := time.Unix(update_time.Unix() + configs.FeaturePeriod, 0)//1480390585
//		log.Println(expire_time)
//		res, err := stmt.Exec(pi.IdentityId, pi.FeatureId, pi.Name, pi.Feature, "1", "2", update_time, expire_time, "1", pi.LibraryId, "1")
//		utils.CheckErr(err)
//		id, err := res.LastInsertId()
//		utils.CheckErr(err)
//		log.Println(id)
//		return id
//	} else {
//		return 0
//	}
//}

func AddUdpPersonnel(pi datamodels.Personnel) int64 {
	//插入数据
	if dberr == nil {
		if CompanyAlgorithmMap[pi.AlgoVersion] == nil {
			company_name := configs.CompanyName
			alg_version := pi.AlgoVersion
			sdk_file_path := ""//TODO 暂时没用
			company_algorithm_id := AddCompanyAlgorithm(company_name, alg_version, sdk_file_path)
			companyAlgorithm := datamodels.CompanyAlgorithm{
				CompanyAlgorithmId : company_algorithm_id,
				CompanyName : company_name,
				AlgVersion : alg_version,
				SdkFilePath : sdk_file_path,
			}
			CompanyAlgorithmMap[alg_version] = &companyAlgorithm
		}
		company_algorithm_id := CompanyAlgorithmMap[pi.AlgoVersion].CompanyAlgorithmId
		stmt, err := db.Prepare("INSERT INTO `tab_features` (`identity_id`, `feature_id`, `name`, `feature`, `file_id`, `media_type_id`, `checksum`, `info`, `file_size`, `bio_type_id`, `create_time`, `update_time`, `expire_time`, `company_algorithm_id`, `library_code`, `status_id`) VALUES (?, ?, ?, ?, NULL, ?, NULL, ?, ?, ?, CURRENT_TIMESTAMP(3), ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `identity_id` = ?, `feature_id` = ?, `name` = ?, `feature` = ?, `file_id` = NULL, `media_type_id` = ?, `checksum` = NULL, `info` = ?, `file_size` = ?, `bio_type_id` = ?, `update_time` = ?, `expire_time` = ? , `company_algorithm_id` = ?, `library_code` = ?, `status_id` = ?;")
		defer stmt.Close()
		utils.CheckErr(err)
		log.Println("pi =", pi)
		log.Println("pi.IdentityId =", pi.IdentityId)
		log.Println("pi.FeatureId =", pi.FeatureId)
		log.Println("pi.UpdateTime =", pi.UpdateTime)
		log.Println("pi.ExpireTime =", pi.ExpireTime)
		if pi.UpdateTime == 0 || pi.ExpireTime == 0 {
			return 0
		}
		update_time := time.Unix(pi.UpdateTime/1e3, pi.UpdateTime%1e3*1e6)
		log.Println("update_time =", update_time)
//			expire_time := time.Unix(update_time.Unix() + configs.FeaturePeriod, 0)//1480390585
		expire_time := time.Unix(pi.ExpireTime/1e3, pi.ExpireTime%1e3*1e6)
		log.Println("expire_time =", expire_time)
		res, err := stmt.Exec(pi.IdentityId, pi.FeatureId, pi.Name, pi.Feature, "1", pi.Info, pi.FileSize, "2", update_time, expire_time, company_algorithm_id, pi.LibraryId, "1",
								pi.IdentityId, pi.FeatureId, pi.Name, pi.Feature, "1", pi.Info, pi.FileSize, "2", update_time, expire_time, company_algorithm_id, pi.LibraryId, "1")
		utils.CheckErr(err)
		if err != nil {
			return 0
		}
		id, err := res.LastInsertId()
		utils.CheckErr(err)
		if err != nil {
			return 0
		}
//		log.Println("id =", id)
		return id
	}
	return 0
}

func UpdPersonnel(id int64) {
	//更新数据
//	stmt, err1 := db.Prepare("update userinfo set username=? where uid=?")
//	utils.CheckErr(err1)
//	res, err2 := stmt.Exec("astaxieupdate", id)
//	utils.CheckErr(err2)
//	affect, err3 := res.RowsAffected()
//	utils.CheckErr(err3)
//	log.Println(affect)
}

func DelPersonnel(featureId string, libraryCode string) {
//	删除数据
	if dberr == nil {
		log.Println("Del featureId")
		log.Println(featureId)
		log.Println(libraryCode)
		stmt, err := db.Prepare("delete from tab_features where feature_id=? and library_code=?")
		utils.CheckErr(err)
		defer stmt.Close()
		res, err := stmt.Exec(featureId, libraryCode)
		utils.CheckErr(err)
		affect, err := res.RowsAffected()
		utils.CheckErr(err)
		log.Println(affect)
	}
}

func QueryAllPersonnel(library string) []datamodels.Personnel {
	index := 0
	size := 1
	data := make([]datamodels.Personnel, 0)
	//查询数据
	if dberr == nil {
		for size > 0 {
			rows, err := db.Query("SELECT id, identity_id, feature_id, name, info, file_size, feature, library_code, update_time, expire_time FROM `tab_features` WHERE library_code = ? AND id > ? ORDER BY id LIMIT ?", library, index , configs.DbLoadLimit)
			utils.CheckErr(err)
			size = 0
			for rows.Next() {
				var id int
				var identity_id string
				var feature_id string
				var name string
				var info string
				var file_size int64
				var feature string
//				var create_time string
				var update_time string
				var expire_time string
				var library_code string
				err = rows.Scan(&id, &identity_id, &feature_id, &name, &info, &file_size, &feature, &library_code, &update_time, &expire_time)
				utils.CheckErr(err)
//				log.Println(id)
//				log.Println(identity_id)
//				log.Println(feature_id)
//				log.Println(name)
//				log.Println(feature)
//				log.Println(library_code)
//				log.Fatal(update_time)
				_update_time := utils.ToTime(update_time, "2006-01-02 15:04:05.000")
				_expire_time := utils.ToTime(expire_time, "2006-01-02 15:04:05")
				size++
				if id > index {
					index = id
				}
				personnel := datamodels.Personnel {
					IdentityId : identity_id,
					FeatureId : feature_id,
					Name: name,
					Info: info,
					FileSize: file_size, 
					Feature: feature,
					LibraryId: library_code,
					UpdateTime: _update_time,
					ExpireTime: _expire_time,
				}
				data = append(data, personnel)
			}
		}
	}
	return data
}

func QueryPersonnel(index int, limit int) []datamodels.Personnel {
	log.Println("index =", index)
	log.Println("limit =", limit)
	data := make([]datamodels.Personnel, 0)
	//查询数据
	if dberr == nil {
		//	rows, err := db.Query("SELECT identity_id, feature_id, name, info, file_size, feature, library_code FROM `tab_features`")
		rows, err := db.Query("SELECT id, identity_id, feature_id, name, info, file_size, feature, library_code FROM `tab_features` WHERE id > ? ORDER BY id LIMIT ?", index , limit)
		utils.CheckErr(err)
		for rows.Next() {
			var id int
			var identity_id string
			var feature_id string
			var name string
			var info string
			var file_size int64
			var feature string
	//		var create_time string
	//		var expire_time string
			var library_code string
			err = rows.Scan(&id, &identity_id, &feature_id, &name, &info, &file_size, &feature, &library_code)
			utils.CheckErr(err)
			log.Println(id)
			log.Println(identity_id)
			log.Println(feature_id)
			log.Println(name)
			log.Println(info)
			log.Println(file_size)
			log.Println(feature)
			log.Println(library_code)
			personnel := datamodels.Personnel {
				IdentityId : identity_id,
				FeatureId : feature_id,
				Name: name,
				Info: info,
				FileSize: file_size,
				Feature: feature,
				LibraryId: library_code,
			}
			data = append(data, personnel)
		}
	}
	return data
}