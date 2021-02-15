// file: utils/error_util.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * 文件工具类
 */

package utils

import (
	"log"
)

func CheckErr(err error) {
	if err != nil {
//		panic(err)
		log.Println(err)
	}
}