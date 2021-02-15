// file: utils/time_util.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * web工具类
 */

package utils

import (
	"time"
)

//	toBeCharge := "2015-01-01 00:00:00"                             //待转化为时间戳的字符串 注意 这里的小时和分钟还要秒必须写 因为是跟着模板走的 修改模板的话也可以不写
//	timeLayout := "2006-01-02 15:04:05.000"                         //转化所需模板
func ToTime(toBeCharge string, timeLayout string) int64 {
	loc, _ := time.LoadLocation("Local")                            //重要：获取时区
	theTime, _ := time.ParseInLocation(timeLayout, toBeCharge, loc) //使用模板在对应时区转化为time.time类型
	sr := theTime.UnixNano()/1e6                                    //转化为时间戳 类型是int64
	return sr
}

func GetStringTime(now time.Time, timeLayout string) string {
	return now.Format(timeLayout)
}