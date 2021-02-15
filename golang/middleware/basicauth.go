// file: middleware/basicauth.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * 登录验证类
 */

package middleware

import "github.com/kataras/iris/middleware/basicauth"

// BasicAuth middleware sample.
var BasicAuth = basicauth.New(basicauth.Config{
	Users: map[string]string{
		"admin": "1234567",
	},
})