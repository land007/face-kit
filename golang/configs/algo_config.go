// file: configs/algo_config.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 *  算法配置类
 */

package configs

import (
)

//常量
var CompanyName string = GetString("CompanyName", "EYE")// 厂商
var OldAlgoVersion string = GetString("OldAlgoVersion", "feature")// 老算法版本：算法升级后，重新提取特征用
//var OldAlgoVersion string = "1005"// 老算法版本：算法升级后，重新提取特征用
var AlgoVersion string = GetString("AlgoVersion", "1005")// 算法版本：修改并重启可影响加载的算法版本(Test:feature, Release:1005)
var Threshold float64 = GetFloat64("Threshold", "90.0")// 阈值
var TopN int32 = GetInt32("TopN", "20")// TopN
const FeaturePeriod int64 = 10 * 365 * 24 * 60 * 60//特征有效期10年
