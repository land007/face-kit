// file: repositories/company__algorithm_repository.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * 持久化算法库类
 */

package repositories

import (
	"log"
//	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"../utils"
	"../datamodels"
)


//厂商算法对象
var CompanyAlgorithmMap map[string]*datamodels.CompanyAlgorithm

func init() {
	CompanyAlgorithmMap = queryCompanyAlgorithm()
	log.Println(CompanyAlgorithmMap)
}

func AddCompanyAlgorithm(company_name string, alg_version string, sdk_file_path string) int64 {
	//插入特征库数据
	if dberr == nil {
		stmt, err := db.Prepare("INSERT INTO `tab_company__algorithm` (`company_name`, `alg_version`, `sdk_file_path`) VALUES (?, ?, ?);")
		utils.CheckErr(err)
		log.Println(company_name)
		log.Println(alg_version)
		log.Println(sdk_file_path)
		res, err := stmt.Exec(company_name, alg_version, sdk_file_path)
		utils.CheckErr(err)
		id, err := res.LastInsertId()
		utils.CheckErr(err)
		log.Println(id)
		return id
	}
	return 0
}

func queryCompanyAlgorithm() map[string]*datamodels.CompanyAlgorithm {
	companyAlgorithmsMap := make(map[string]*datamodels.CompanyAlgorithm)
//	data := make([]datamodels.CompanyAlgorithm, 0)
	//查询数据
	if dberr == nil {
		rows, err := db.Query("SELECT company_algorithm_id, company_name, alg_version, sdk_file_path FROM tab_company__algorithm")
		utils.CheckErr(err)
		for rows.Next() {
			var company_algorithm_id int64
			var company_name string
			var alg_version string
			var sdk_file_path string
			err = rows.Scan(&company_algorithm_id, &company_name, &alg_version, &sdk_file_path)
			utils.CheckErr(err)
			log.Println(company_algorithm_id)
			log.Println(company_name)
			log.Println(alg_version)
			log.Println(sdk_file_path)
			companyAlgorithm := datamodels.CompanyAlgorithm{
				CompanyAlgorithmId : company_algorithm_id,
				CompanyName : company_name,
				AlgVersion : alg_version,
				SdkFilePath : sdk_file_path,
			}
			companyAlgorithmsMap[alg_version] = &companyAlgorithm
//			data = append(data, companyAlgorithm)
		}
	}
//	return data
	return companyAlgorithmsMap
}
