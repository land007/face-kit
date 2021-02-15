// file: main.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * 启动类
 */
package main

import (
	"log"
//	"fmt" 
	"io"
	"os"
	"syscall"
	"time"
	"net/http"
	_ "net/http/pprof"
	"./datamodels"
	"./services"
	"./controllers"
	"./utils"
	"./configs"
	"github.com/robfig/cron"
	"github.com/kataras/iris"
    "github.com/kataras/iris/mvc"
	"github.com/kataras/iris/hero"
	"github.com/kataras/iris/sessions"
    "github.com/kataras/iris/middleware/basicauth"
    "github.com/kataras/iris/middleware/recover"
    "github.com/kataras/iris/middleware/logger"
    "github.com/iris-contrib/middleware/cors"
    "gopkg.in/go-playground/validator.v9"
)
//	log.Fatal("==================")
// >>常量<< configs包中

// >>结构体<< datamodels包中

// >>对象转换器<< utils包中

// >>常用方法<< utils包中

// >>集合对象<< utils包中

func init() {
	//设置日志行号
	log.SetFlags(log.Lshortfile | log.LstdFlags)
	go func() {
	    http.ListenAndServe("0.0.0.0:8899", nil)
	}()
}

//测试静态依赖
type Service interface {
	SayHello(to string) string
}
type MyTestService struct {
	prefix string
}
func(s *MyTestService) SayHello(to string) string {
	return s.prefix + " " + to
}
func HelloService(to string, service Service) string {
	return service.SayHello(to)
}


func main() {
	//设置Umask
	mask := syscall.Umask(0)
    defer syscall.Umask(mask)
	//日志文件
	f := utils.NewLogFile()
    defer f.Close()
	//TODO
	services.Test(1)
	//验证
	utils.Validate = validator.New()
    // Register validation for 'User'
    // NOTE: only have to register a non-pointer type for 'User', validator
    // interanlly dereferences during it's type checks.
    utils.Validate.RegisterStructValidation(utils.LoginFormStructLevelValidation, utils.LoginForm{})
	
//	requestor := pb.Requestor{CompanyId: "", ApplicationId: "", DeviceId: "", AccessCode: "", UserId: "", Password: ""}
	app := iris.New()
	// >>BASIC认证<<
	if configs.AdminPass != "" {
		authConfig := basicauth.Config{
	        Users:   map[string]string{"eyecool": configs.EyecoolPass, "admin": configs.AdminPass},
	        Realm:   "Authorization Required", // 默认表示域 "Authorization Required"
	        Expires: time.Duration(30) * time.Minute,
	    }
	    authentication := basicauth.New(authConfig)
		app.Use(authentication)
	}
	// >>MVC<<
	mvc.Configure(app.Party("/root"), utils.MyMVC)
	// Serve our controllers.
	mvc.New(app.Party("/hello")).Handle(new(controllers.HelloController))
    visitApp  := mvc.New(app.Party("/app"))
    // >>Session<<
	sess := sessions.New(sessions.Config{Cookie: "mysession_cookie_name"})
	// bind the current *session.Session, which is required, to the `VisitController.Session`
	// and the time.Now() to the `VisitController.StartTime`.
	visitApp.Register(
		// if dependency is a function which accepts
		// a Context and returns a single value
		// then the result type of this function is resolved by the controller
		// and on each request it will call the function with its Context
		// and set the result(the *sessions.Session here) to the controller's field.
		//
		// If dependencies are registered without field or function's input arguments as
		// consumers then those dependencies are being ignored before the server ran,
		// so you can bind many dependecies and use them in different controllers.
		sess.Start,
		time.Now(),
	)
	visitApp.Handle(new(utils.VisitController))
    //日志
	// Attach the file as logger, remember, iris' app logger is just an io.Writer.
    // Use the following code if you need to write the logs to file and console at the same time.
    // app.Logger().SetOutput(io.MultiWriter(f, os.Stdout))
//    app.Logger().SetOutput(f)
    app.Logger().SetOutput(io.MultiWriter(f, os.Stdout))
	// Recover middleware recovers from any panics and writes a 500 if there was one.
    app.Use(recover.New())
    //请求日志
    requestLogger := logger.New(logger.Config{
        // Status displays status code
        Status: true,
        // IP displays request's remote address
        IP: true,
        // Method displays the http method
        Method: true,
        // Path displays the request path
        Path: true,
        // Query appends the url query to the Path.
        Query: true,

        // if !empty then its contents derives from `ctx.Values().Get("logger_message")
        // will be added to the logs.
        MessageContextKeys: []string{"logger_message"},

        // if !empty then its contents derives from `ctx.GetHeader("User-Agent")
        MessageHeaderKeys: []string{"User-Agent"},
    })
    app.Use(requestLogger)
	//动态页面
	app.RegisterView(iris.HTML("./views", ".html"))
	//ROOT
	eye := app.Party(configs.Root)//"/eye"
	//静态资源
	eye.StaticWeb("/", "./static")
	eye.StaticWeb("/public", configs.PublicDir)
	//加载全部用户特征数据
	services.LoadAllLibraryFeatures()
	// >>↓WEB页面<<
	//测试依赖
	testHandler := hero.Handler(utils.Test)
	app.Get("/test/{to:string}", testHandler)
	//测试静态依赖
	hero.Register(&MyTestService {
		prefix: "Service: Hello",
	})
	helloHandler := hero.Handler(HelloService)
	app.Get("/test/hello/{to:string}", helloHandler)
	//测试动态依赖
	hero.Register(func(ctx iris.Context) (form utils.LoginForm) {
		form.Age = 200
//		form.Username="1234"
//		form.Password="1234"
		log.Println(form)
		log.Println("hero.Register")
		err := utils.Validate.Struct(form)
		log.Println(err)
		if err != nil {
			log.Println(err)
		}
		ctx.ReadForm(&form)
		return
	})
	loginHandler := hero.Handler(utils.Login)
	app.Post("/test/login", loginHandler)
	//测试POST
	/**
	 * POST /post?id=1234&page=1 HTTP/1.1
	 * Content-Type: application/x-www-form-urlencoded
	 * name=manu&message=this_is_great
	 */
	app.Post("/test/post", func(ctx iris.Context) {
        id := ctx.URLParam("id")
        page := ctx.URLParamDefault("page", "0")
        name := ctx.FormValue("name")
        message := ctx.FormValue("message")
        // or `ctx.PostValue` for POST, PUT & PATCH-only HTTP Methods.
        app.Logger().Infof("id: %s; page: %s; name: %s; message: %s", id, page, name, message)
    })
	//首页
	app.Get("/", func(ctx iris.Context) {
		ctx.Redirect(configs.Root)
	})
	eye.Get("/", func(ctx iris.Context) {
		ctx.Application().Logger().Infof("SelfLog Request path: %s", ctx.Path())
		ctx.ViewData("rootPath", configs.Root)
		ctx.ViewData("level", configs.LEVEL)
		ctx.View("upload.html")
	})
	//比对库页面
	eye.Get("/library/{lid:string}", func(ctx iris.Context) {
		lid := ctx.Params().Get("lid")
		log.Println(lid)
		ctx.ViewData("lid", lid)
		ctx.ViewData("rootPath", configs.Root)
		ctx.ViewData("level", configs.LEVEL)
		ctx.View("upload.html")
	})
	//全库一比一页面
	eye.Get("/onebyone/{cid:string}", func(ctx iris.Context) {
		services.GetOnebyone(ctx)
	})
	//比对库一比一页面
	eye.Get("/onebyone/library/{lid:string}/{cid:string}", func(ctx iris.Context) {
		services.GetOnebyone(ctx)
	})
	//全库一比多页面
	eye.Get("/onebymany", func(ctx iris.Context) {
		ctx.ViewData("cid", "all")
		ctx.ViewData("rootPath", configs.Root)
		ctx.ViewData("level", configs.LEVEL)
		ctx.View("onebymany.html")
	})
	//比对库一比多页面
	eye.Get("/onebymany/library/{lid:string}", func(ctx iris.Context) {
		ctx.ViewData("cid", "all")
		lid := ctx.Params().Get("lid")
		log.Println(lid)
		ctx.ViewData("lid", lid)
		ctx.ViewData("rootPath", configs.Root)
		ctx.ViewData("level", configs.LEVEL)
		ctx.View("onebymany.html")
	})
	//远程桌面页面
	eye.Get("/remote_desktop", func(ctx iris.Context) {
		ctx.ViewData("rootPath", configs.Root)
		ctx.ViewData("level", configs.LEVEL)
		ctx.View("remote_desktop.html")
	})
	// >>↓REST接口<<
//	rest_v1 := eye.Party("/rest")// /v1
//	crs := cors.New(cors.Options{
//		AllowedOrigins:   []string{"*"}, // allows everything, use that to change the hosts.
//		AllowCredentials: true,
//	})
//	crs := func(ctx iris.Context) {
//        ctx.Header("Access-Control-Allow-Origin", "*")
//        ctx.Header("Access-Control-Allow-Credentials", "true")
//        ctx.Header("Access-Control-Allow-Headers",
//            "Access-Control-Allow-Origin,Content-Type")
//        ctx.Next()
//    }
	crs := cors.New(cors.Options{
//        AllowedOrigins:   []string{"*"}, // allows everything, use that to change the hosts.
//        AllowCredentials: true,
        AllowedMethods:   []string{"PUT", "PATCH", "GET", "POST", "OPTIONS", "DELETE"},
        AllowedHeaders:   []string{
//        	"Origin", "Authorization",
        	"Access-Control-Allow-Origin", "*",
        	"Access-Control-Allow-Credentials", "true",
        	"Access-Control-Allow-Headers", "Access-Control-Allow-Origin,Content-Type",
        },
        ExposedHeaders:   []string{"Accept", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"},
    })
	rest_v1 := eye.Party("/rest", crs).AllowMethods(iris.MethodOptions) // <- important for the preflight. 
	log.Println(iris.MethodOptions)
	//一 1.获取全库人员列表 http://192.168.0.96:8008/rest/personnels?page=1
//	rest_v1.Get("/personnels", func(ctx iris.Context) {
//		slice1 := services.GetUserFiles(ctx)
//		ctx.JSON(&datamodels.PersonnelsResBody{Code: 200, Msg: "", Data: utils.UploadedFiles_personnelInfos(slice1)})
//	})
	//一 2.获取全库人员详细信息 http://192.168.0.96:8008/rest/personnel/0116000d4151abe2af7af4fb01b56e663fc4469a.jpg
//	rest_v1.Get("/personnel/{cid:string}", func(ctx iris.Context) {
//		services.GetUserFile(ctx)
//	})
	//一 4.清空全库人员列表
//	rest_v1.Delete("/personnels", func(ctx iris.Context) {
//		services.ClearUserFile(ctx);
//	})
	//一 5.新增或更新全库人员
//	rest_v1.Post("/personnels", func(ctx iris.Context) {
//		services.PersonnelsInsertOrUpdate(ctx, "");
//	})
	//一 6.全库人员“1比1”比对
//	rest_v1.Post("/comparison/1v1/{cid:string}", func(ctx iris.Context) {
//		cid := ctx.Params().Get("cid")
//		services.PersonnelsInsertOrUpdate(ctx, cid);
//	})
	//一 6.全库人员“1比n”比对
//	rest_v1.Post("/comparison/1vN", func(ctx iris.Context) {
//		services.PersonnelsInsertOrUpdate(ctx, "all");
//	})
	//一 7.获取比对库人员列表 http://192.168.0.96:8008/rest/getSync
	rest_v1.Get("/getSync", func(ctx iris.Context) {
		SyncTime, SyncCount := services.GetSyncInfo(ctx)
		ctx.JSON(&datamodels.GetSyncBody{Code: 200, Msg: "", SyncTime: SyncTime, SyncCount: SyncCount})
	})
	//一 7.获取比对库人员列表 http://192.168.0.96:8008/rest/library/Test/personnels?page=1
	rest_v1.Get("/library/{lid:string}/personnels", func(ctx iris.Context) {
		version := ctx.GetHeader("version")
		if version == "" {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Please enter the correct version value"})
			return
		}
		if len(version) > 15 {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Version field length is limited to 15 characters"})
			return
		}
		slice1 := services.GetUserFiles(ctx)
		if slice1 != nil {
			ctx.JSON(&datamodels.PersonnelInfosBody{Code: 200, Msg: "", Data: utils.UploadedFiles_PersonnelInfos(slice1)})
		}
	})
	//一 9.获取比对库人员详细信息 http://192.168.0.96:8008/rest/library/Test/personnel/51_837_2112248792075_medium:30b43bfdef42dd7c1c2c57250091e2331bcc0f61%2e%6a%70%67
	rest_v1.Get("/library/{lid:string}/personnel/{cid:string}", func(ctx iris.Context) {
		version := ctx.GetHeader("version")
		if version == "" {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Please enter the correct version value"})
			return
		}
		if len(version) > 15 {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Version field length is limited to 15 characters"})
			return
		}
		services.GetUserFile(ctx)
	})
	//一 10.清空比对库人员列表
	rest_v1.Delete("/library/{lid:string}/personnels", func(ctx iris.Context) {
		version := ctx.GetHeader("version")
		if version == "" {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Please enter the correct version value"})
			return
		}
		if len(version) > 15 {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Version field length is limited to 15 characters"})
			return
		}
		services.ClearUserFile(ctx)
	})
	//一 11.新增或更新比对库人员
	rest_v1.Post("/library/{lid:string}/personnels", func(ctx iris.Context) {
		version := ctx.GetHeader("version")
		if version == "" {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Please enter the correct version value"})
			return
		}
		if len(version) > 15 {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Version field length is limited to 15 characters"})
			return
		}
		services.PersonnelsInsertOrUpdate(ctx)
	})
	//一 12.比对库人员“1比1”比对
	rest_v1.Post("/library/{lid:string}/comparison/1v1/{cid:string}", func(ctx iris.Context) {
		version := ctx.GetHeader("version")
		if version == "" {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Please enter the correct version value"})
			return
		}
		if len(version) > 15 {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Version field length is limited to 15 characters"})
			return
		}
		cid := ctx.Params().Get("cid")
		services.PersonnelsComparison(ctx, cid)
	})
	//一 12.人员“1比1”比对
	rest_v1.Post("/comparison/1v1", func(ctx iris.Context) {
		version := ctx.GetHeader("version")
		if version == "" {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Please enter the correct version value"})
			return
		}
		if len(version) > 15 {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Version field length is limited to 15 characters"})
			return
		}
		services.ImageFeatureComparison(ctx)
	})
	//一 12.更新比对库人员
	rest_v1.Get("/library/{lid:string}/updatePersonnel/{cid:string}", func(ctx iris.Context) {
		version := ctx.GetHeader("version")
		if version == "" {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Please enter the correct version value"})
			return
		}
		if len(version) > 15 {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Version field length is limited to 15 characters"})
			return
		}
		lid := ctx.Params().Get("lid")
		services.UpdatePersonnel(ctx, lid)
	})
	//一 12.更新比对库人员
	rest_v1.Get("/updatePersonnel/{cid:string}", func(ctx iris.Context) {
		version := ctx.GetHeader("version")
		if version == "" {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Please enter the correct version value"})
			return
		}
		if len(version) > 15 {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Version field length is limited to 15 characters"})
			return
		}
		services.UpdatePersonnel(ctx, "")
	})
	//获取人员图片
	rest_v1.Get("/library/{lid:string}/personnels/{cid:string}", func(ctx iris.Context) {
		services.GetUserFileByFileAlias(ctx)
	})
	//一 12.比对库人员“1比n”比对
	rest_v1.Post("/library/{lid:string}/comparison/1vN", func(ctx iris.Context) {
		version := ctx.GetHeader("version")
		if version == "" {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Please enter the correct version value"})
			return
		}
		if len(version) > 15 {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Version field length is limited to 15 characters"})
			return
		}
		services.PersonnelsComparison(ctx, "all")
	})
	//五 1.远程桌面拍照比对
	rest_v1.Post("/library/{lid:string}/remote_desktop/getUserInfo", func(ctx iris.Context) {
//		version := ctx.GetHeader("version")
//		if version == "" {
//			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Please enter the correct version value"})
//			return
//		}
//		if len(version) > 15 {
//			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Version field length is limited to 15 characters"})
//			return
//		}
		services.GetUserInfo(ctx)
	})
	//五 2.远程桌面拍照比对
	rest_v1.Get("/library/{lid:string}/remote_desktop/P1vN", func(ctx iris.Context) {
//		version := ctx.GetHeader("version")
//		if version == "" {
//			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Please enter the correct version value"})
//			return
//		}
//		if len(version) > 15 {
//			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Version field length is limited to 15 characters"})
//			return
//		}
		services.RemoteDesktopStaffComparison(ctx)
	})
	//二 1.全库图片上传+比对
	rest_v1.Post("/uploads", iris.LimitRequestBodySize(10<<20), services.FileUpload)
	//二 2.获取所有上传图片/uploads
	rest_v1.Get("/uploads", func(ctx iris.Context) {
		slice1 := services.GetUserFiles(ctx)
		ctx.JSON(&datamodels.UploadedsResBody{Code: 200, Msg: "", Data: slice1})
	})
	//二 3.获取比对库所有上传图片
	rest_v1.Get("/library/{lid:string}/uploads", func(ctx iris.Context) {
		slice1 := services.GetUserFiles(ctx)
		ctx.JSON(&datamodels.UploadedsResBody{Code: 200, Msg: "", Data: slice1})
	})
	//二 4.删除图片
	rest_v1.Delete("/upload/{cid:string}", services.DeleteUserFile)
	//二 5.删除比对库图片
	rest_v1.Delete("/library/{lid:string}/upload/{cid:string}", services.DeleteUserFile)
	//二 6.清空图片列表
	rest_v1.Delete("/uploads", services.ClearUserFile)
	//二 7.清空比对库图片列表
	rest_v1.Delete("/library/{lid:string}/uploads", services.ClearUserFile)
	//二 8.比对库图片上传+比对
	rest_v1.Post("/library/{lid:string}/uploads", iris.LimitRequestBodySize(10<<20), services.FileUpload)
	//三 1.获取比对库列表
	rest_v1.Get("/librarys", func(ctx iris.Context) {
		version := ctx.GetHeader("version")
		if version == "" {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Please enter the correct version value"})
			return
		}
		if len(version) > 15 {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Version field length is limited to 15 characters"})
			return
		}
		services.LibraryList(ctx)
	})
	//三 3.删除比对库
	rest_v1.Delete("/library/{lid:string}", services.LibraryDelete)
	//三 4.添加比对库
	rest_v1.Post("/librarys", services.LibraryAdd)
	//四 1.比对历史查询
	rest_v1.Get("/compare_logs", func(ctx iris.Context) {
		version := ctx.GetHeader("version")
		if version == "" {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Please enter the correct version value"})
			return
		}
		if len(version) > 15 {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Version field length is limited to 15 characters"})
			return
		}
		services.CompareLogList(ctx)
	})
	utils.GenerateFileId("abc.jpg")
	utils.ReductionFileId("abc%2e%6a%70%67")
	// app.Get("/librarys", func(ctx iris.Context) {
	// 	dirs := getDirNames(libraryDir)
	// 	log.Println(dirs)
	// 	ctx.ViewData("dirs", dirs)
	// 	ctx.View("librarys.html")
	// })
	// start the server at http://localhost:8080
	addr := ":" + configs.LocalPort
//	addr := ":8888"
	go runTask()
	app.Run(iris.Addr(addr))
}

func runTask() {
    i := int64(0)
    c := cron.New()
    c.AddFunc(configs.SPEC, func() {
        i++
        log.Println("cron running:", i)
        utils.RemoveTimeoutFile(configs.TmpDir, configs.ImageFileTimeOut, []string{".jpg", ".jpeg", ".png", ".bmp"})
        utils.RemoveTimeoutFile("./", configs.ImageFileTimeOut, []string{".log"})
    })
    c.Start()
    select{}
}
