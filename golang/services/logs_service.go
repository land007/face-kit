// file: services/logs_service.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * 日志服务类
 */

package services

import (
	"log"
	"time"
//	"strconv"
	"github.com/kataras/iris"
	"../datamodels"
	"../repositories"
	"../utils"
)

func CompareLogList(ctx iris.Context) {
	params := ctx.URLParams()
	log.Println("params",params)
//	cursor := params["cursor"]
	cursor := ctx.URLParam("cursor")
	log.Println("cursor =", cursor)
//	limit := params["limit"]
	limit, err := ctx.URLParamInt("limit")
	log.Println("limit =", limit)
//	if limit == "" {
//		limit = "50"
//	}
//	_limit, err := strconv.Atoi(limit)
	if err != nil {
		limit = 50
//		log.Println(err)
//		ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Limit input format is incorrect"})
//		return
	}
	if cursor == "" {
		now := time.Now()
		cursor = utils.GetStringTime(now, "2006-01-02 15:04:05.000");
	}
	log.Println("cursor =", cursor)
	_cursor := utils.ToTime(cursor, "2006-01-02 15:04:05.000")
	log.Print("_cursor =", _cursor)
	if _cursor < 0 {
		ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Cursor input format is incorrect"})
		return
	}
	data := repositories.QueryComparisonHistoryRes(cursor, limit)
	ctx.JSON(&datamodels.CompareLogsResBody{Code: 200, Msg: "", Data: data})
}

