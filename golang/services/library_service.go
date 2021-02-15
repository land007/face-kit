// file: services/library_service.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * 人脸服务类
 */

package services

import (
	"log"
//	"fmt"
	"os"
	"github.com/kataras/iris"
	"../datamodels"
	"../configs"
	"../utils"
	"../repositories"
)

func LibraryList(ctx iris.Context) {
	dirs := utils.GetDirNames(configs.PublicDir + configs.LibraryDir)
	count := len(dirs)
	options := make([]datamodels.ResOption, count+1)
	options[0] = datamodels.ResOption{Text: "全部", Value: ""}
	for index := 0; index < count; index++ {
		options[index+1] = datamodels.ResOption{Text: dirs[index] + "库", Value: dirs[index]}
	}
	ctx.JSON(&datamodels.LibrarysResBody{Code: 200, Msg: "", Data: options})
}

func LibraryDelete(ctx iris.Context) {
	lid := ctx.Params().Get("lid")
	log.Println(lid)
	_files := LibraryFilesMap[lid]
	log.Println(_files)
	if _files != nil && len(_files.Items) > 0 {
		ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "需要先清空该图库！"})
		return
	}
    err4 := os.RemoveAll(configs.PublicDir + configs.LibraryDir + lid);
    if err4 != nil {
        log.Println(err4);
    }
    repositories.DelLibrary(lid)
	ctx.JSON(&datamodels.ResBody{Code: 200, Msg: ""})
}

func LibraryAdd(ctx iris.Context) {
	var librarys []datamodels.ResOption
	err := ctx.ReadJSON(&librarys)
	if err != nil {
//			log.Println("app.Post(/rest/librarys err: %v", err)
		log.Println(err)
	}
	log.Println(librarys)
	for index := 0; index < len(librarys); index++ {
		library := librarys[index]
		value := library.Value
		err := os.MkdirAll(configs.PublicDir + configs.LibraryDir + value, 0666)
		if err != nil {
			log.Println("%s", err)
			ctx.JSON(&datamodels.ResBody{Code: 500, Msg: err.Error()})
			return
		}
		repositories.AddUdpLibrary(value)
	}
	ctx.JSON(&datamodels.ResBody{Code: 200, Msg: ""})
}

