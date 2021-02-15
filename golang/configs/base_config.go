// file: configs/base_config.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 *  配置基础类
 */

package configs

import (
	"os"
	"strconv"
)

func If(condition bool, trueVal, falseVal interface{}) interface{} {
    if condition {
        return trueVal
    }
    return falseVal
}

func GetString(env string, def string) string {
	return If(os.Getenv(env) == "", def, os.Getenv(env)).(string)
}

func GetInt(env string, def string) int {
	value := GetString(env, def)
	_int, err := strconv.Atoi(value)
	if err != nil {
		return 0;
	}
	return _int;
}

func GetInt32(env string, def string) int32 {
	value := GetString(env, def)
	_int32, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return 0;
	}
	return int32(_int32);
}

func GetInt64(env string, def string) int64 {
	value := GetString(env, def)
	_int64, err := strconv.ParseInt(value, 10, 64)
	if err != nil {
		return 0;
	}
	return _int64;
}

func GetFloat64(env string, def string) float64 {
	value := GetString(env, def)
	_float64, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return 0;
	}
	return _float64
}
