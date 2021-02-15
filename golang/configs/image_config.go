// file: configs/image_config.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * 图片配置类
 */

package configs

import (
)

//常量
var Ratio = GetFloat64("Ratio", "2.5")
var Quality = GetInt("Quality", "100")
var TTS = GetString("TTS", "")
var SaveThumbnail = GetString("SaveThumbnail", "1")
