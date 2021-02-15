// file: repositories/comparison_history_repository.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * 持久化比对历史类
 */

package repositories

import (
	"log"
//	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"../utils"
	"../datamodels"
//	"../configs"
)

func ClearComparisonHistory() {
	//清空数据
	if dberr == nil {
		stmt, err := db.Prepare("delete from tab_comparison_history")
		utils.CheckErr(err)
		res, err := stmt.Exec()
		utils.CheckErr(err)
		affect, err := res.RowsAffected()
		utils.CheckErr(err)
		log.Println(affect)
	}
}

func AddComparisonHistoryBatch(chs []datamodels.ComparisonHistory, library string) {
	//插入批量数据
	if dberr == nil {
		size := len(chs)
		log.Println(size)
		for i := 0; i < size; i++ {
			ch := chs[i]
			log.Println(chs)
			AddUdpComparisonHistory(ch)
		}
	}
}

func AddUdpComparisonHistory(ch datamodels.ComparisonHistory) int64 {
	//插入数据
	if dberr == nil {
		pi := ch.Personnel
		stmt, err := db.Prepare("INSERT INTO `tab_comparison_history` (`identity_id`, `feature_id`, `name`, `feature`, `file_id`, `media_type_id`, `checksum`, `file_size`, `bio_type_id`, `create_time`, `company_algorithm_id`, `library_code`, `match_data`) VALUES (?, ?, ?, ?, NULL, ?, NULL, NULL, ?, CURRENT_TIMESTAMP(3), ?, ?, ?) ON DUPLICATE KEY UPDATE `identity_id` = ?, `feature_id` = ?, `name` = ?, `feature` = ?, `file_id` = NULL, `media_type_id` = ?, `checksum` = NULL, `file_size` = NULL, `bio_type_id` = ?, `company_algorithm_id` = ?, `library_code` = ?, `match_data` = ?;")
		utils.CheckErr(err)
		res, err := stmt.Exec(pi.IdentityId, pi.FeatureId, pi.Name, pi.Feature, "1", "2", "1", pi.LibraryId, ch.MatchData,
								pi.IdentityId, pi.FeatureId, pi.Name, pi.Feature, "1", "2", "1", pi.LibraryId, ch.MatchData)
		utils.CheckErr(err)
		id, err := res.LastInsertId()
		utils.CheckErr(err)
		log.Println(id)
		return id
	} else {
		return 0
	}
}

func QueryComparisonHistoryRes(cursor string, limit int) []datamodels.ComparisonHistoryRes {
	log.Println("cursor =", cursor)
	log.Println("limit =", limit)
	data := make([]datamodels.ComparisonHistoryRes, 0)
	//查询数据
	if dberr == nil {
		rows, err := db.Query("SELECT identity_id, feature_id, name, feature, library_code, create_time, match_data  FROM `tab_comparison_history` WHERE create_time <= ? ORDER BY create_time DESC LIMIT ?", cursor , limit)//2010-12-01 07:03:16.233
		utils.CheckErr(err)
		for rows.Next() {
			var identityId string
			var featureId string
			var name string
			var feature string
			var libraryId string
			var matchTime string
			var matchData string
			err = rows.Scan(&identityId, &featureId, &name, &feature, &libraryId, &matchTime, &matchData)
			utils.CheckErr(err)
			log.Println("identityId =", identityId)
			log.Println("featureId =", featureId)
			log.Println("name =", name)
			log.Println("feature =", feature)
			log.Println("libraryId =", libraryId)
			log.Println("matchTime =", matchTime)
			log.Println("matchData =", matchData)
//			comparisonHistory := datamodels.ComparisonHistory{Personnel: datamodels.Personnel{
//				IdentityId : identityId,
//				FeatureId : featureId,
//				Name : name,
//				Feature : feature,
//				AlgoVersion : configs.AlgoVersion,
//				LibraryId : libraryId,
//			}, MatchData: matchData}
			_matchTime := utils.ToTime(matchTime, "2006-01-02 15:04:05.000")
			comparisonHistoryRes := datamodels.ComparisonHistoryRes{
				Name : name,
				MatchTime : _matchTime,
				MatchData: matchData,
			}
			data = append(data, comparisonHistoryRes)
		}
	}
	return data
}