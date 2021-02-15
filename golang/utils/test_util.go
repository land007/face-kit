// file: utils/test_util.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * 测试工具类
 */

package utils

import (
//	"log"
	"fmt"
	"time"
	"github.com/kataras/iris"
    "github.com/kataras/iris/mvc"
	"github.com/kataras/iris/sessions"
    "gopkg.in/go-playground/validator.v9"
	"../middleware"
)

// >>常用方法<<

//测试依赖
func Test(to string) string {
	return "Hello " + to
}
//测试动态依赖
type LoginForm struct {
	Username string `json: "username"`
	Password string `json: "password"`
    Age      uint8  `json: "age"		validate:"gte=0,lte=130"`
}
func Login(form LoginForm) string {
	return "Hello " + form.Username
}
//验证
func LoginFormStructLevelValidation(sl validator.StructLevel) {
    loginForm := sl.Current().Interface().(LoginForm)
    if len(loginForm.Username) == 0 && len(loginForm.Password) == 0 {
        sl.ReportError(loginForm.Username, "Username", "Username1", "Username2", "Username3")
        sl.ReportError(loginForm.Password, "Password", "Password1", "Password2", "Password3")
    }
}
// Use a single instance of Validate, it caches struct info.
var Validate *validator.Validate
// >>MVC<<
func MyMVC(app *mvc.Application) {
	app.Router.Use(middleware.BasicAuth)
    // app.Register(...)
    // app.Router.Use/UseGlobal/Done(...)
    app.Handle(new(ExampleController))
}
type ExampleController struct {
	// the current request session,
	// its initialization happens by the dependency function that we've added to the `visitApp`.
	Session *sessions.Session

	// A time.time which is binded from the MVC,
	// order of binded fields doesn't matter.
	StartTime time.Time
}
func (m *ExampleController) BeforeActivation(b mvc.BeforeActivation) {
    // b.Dependencies().Add/Remove
    // b.Router().Use/UseGlobal/Done // and any standard API call you already know

    // 1-> Method
    // 2-> Path
    // 3-> The controller's function name to be parsed as handler
    // 4-> Any handlers that should run before the MyCustomHandler
    anyMiddlewareHere := func(ctx iris.Context) {
		ctx.Application().Logger().Warnf("Inside /custom_path")
		ctx.Next()
	}
    b.Handle("GET", "/something/{id:long}", "MyCustomHandler", anyMiddlewareHere)//, anyMiddleware...
}
// GET: http://localhost:8080/root
func (m *ExampleController) Get() string {
	return "Hey"
}
// GET: http://localhost:8080/root/something/{id:long}
func (m *ExampleController) MyCustomHandler(id int64) string { return "MyCustomHandler says Hey" }// GetPing serves
// Method:   GET
// Resource: http://localhost:8080/root/ping
func (c *ExampleController) GetPing() string {
	return "ping"
}
// GetHello serves
// Method:   GET
// Resource: http://localhost:8080/root/hello
func (c *ExampleController) GetHello() interface{} {
	return map[string]string{"message": "Hello Iris!"}
}
// >>Session<<
// VisitController handles the root route.
type VisitController struct {
	// the current request session,
	// its initialization happens by the dependency function that we've added to the `visitApp`.
	Session *sessions.Session

	// A time.time which is binded from the MVC,
	// order of binded fields doesn't matter.
	StartTime time.Time
}
// Get handles
// Method: GET
// Path: http://localhost:8080
func (c *VisitController) Get() string {
	// it increments a "visits" value of integer by one,
	// if the entry with key 'visits' doesn't exist it will create it for you.
	visits := c.Session.Increment("visits", 1)
	// write the current, updated visits.
	since := time.Now().Sub(c.StartTime).Seconds()
	return fmt.Sprintf("%d visit(s) from my current session in %0.1f seconds of server's up-time",
		visits, since)
}