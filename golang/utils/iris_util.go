// file: utils/iris_util.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * web工具类
 */

package utils

import (
	"time"
	"os"
//	"log"
//	"fmt"
//	"github.com/kataras/iris"
)

// >>常用方法<<
//写日志
// Get a filename based on the date, just for the sugar.
func todayFilename() string {
    today := time.Now().Format("2006-01-02")
    return today + ".log"
}
func NewLogFile() *os.File {
    filename := todayFilename()
    // Open the file, this will append to the today's file if server restarted.
    f, err := os.OpenFile(filename, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
    if err != nil {
        panic(err)
    }
    return f
}

// >>Context方法<<
