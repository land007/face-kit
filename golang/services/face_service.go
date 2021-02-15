// file: services/face_service.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * 人脸服务类
 */

package services

import (
	"time"
	"log"
//    "math"
//	"fmt" 
	"path"
	"reflect"
	"os"
	"io"
	"strings"
	"strconv"
//	"net/url"
	"encoding/json"
	"encoding/base64"
	"encoding/hex"
	"io/ioutil"
	"crypto/sha1"
	"gocv.io/x/gocv"
	"google.golang.org/grpc"
	"golang.org/x/net/context"
	"github.com/kataras/iris"
	"github.com/satori/go.uuid"
	"../datamodels"
	"../configs"
	"../utils"
	"../repositories"
	pb "google.golang.org/grpc/eyecool/protos"
)


//图库对象
var LibraryFilesMap map[string]*utils.UploadedFiles

func init() {
	//图库初始化
	LibraryFilesMap = make(map[string]*utils.UploadedFiles)
	log.SetFlags(log.Lshortfile | log.LstdFlags)
}

type FaceService interface {
	Test(id int64) bool
}

func Test(id int64) bool {
//	log.Println("begin---------------------------------------\n")
//	repositories.ClearPersonnel()
//	repositories.ClearLibrary()
//	repositories.QueryPersonnel(0, 20)
//	log.Fatal("==================")
//	log.Println("end---------------------------------------\n")
	return false
}
//从文件夹加载全部用户特征数据
func LoadAllLibraryFeatures() {
	//初始化全库
	repositories.AddUdpLibrary("")
//	files0 := loadLibraryFeatures(configs.OriginalDir, "")
	files0 := loadLibraryFeatures(configs.PublicDir + configs.UploadsDir, "")
	LibraryFilesMap[""] = files0
	log.Println("初始化全库 ok")
	//提取Original文件夹图片
	log.Println("新建OriginalDir文件夹")
	err1 := os.MkdirAll(configs.OriginalDir, 0666)
	if err1 != nil {
		log.Println("新建OriginalDir文件夹失败", err1)
	}
	log.Println("提取OriginalDir开始")
	ufs := utils.ScanImages(configs.OriginalDir)
//	log.Println(ufs)
	originalSize := len(ufs)
	log.Println("originalSize=", originalSize)
	log.Println("configs.Multithreading=", configs.Multithreading)
	if originalSize > 0 && configs.Multithreading > 0 {
		ch := make(chan *datamodels.FileInfo, originalSize) // buffered
		var limit chan int
		fileInfos := []*datamodels.FileInfo{}
		limit = make(chan int, configs.Multithreading)
		for index := 0; index < originalSize; index++ {
			percentage := index * 100 / originalSize
			log.Println("OriginalDir提取进度", index, "/", originalSize, "=", percentage, "%")
			fileInfo := ufs[index]
//			log.Println(fileInfo)
			if configs.Multithreading > 1 {
				log.Println("进入协程操作")
				limit <- 1
				go func(fileInfo datamodels.FileInfo) {
					fileName := fileInfo.FileName
					fileSize := fileInfo.FileSize
					fileAdd(nil, "", fileName, "", configs.OriginalDir + fileName, fileSize, 0)
					ch <- &fileInfo
					<-limit
				}(fileInfo)
			} else {
				fileName := fileInfo.FileName
				fileSize := fileInfo.FileSize
				fileAdd(nil, "", fileName, "", configs.OriginalDir + fileName, fileSize, 0)
			}
		}
		if configs.Multithreading  > 1 {
			if configs.MultithreadingTimeOut > 1 {
				for {
					select {
						case r := <-ch:
							fileInfos = append(fileInfos, r)
							if len(fileInfos) == originalSize {
								log.Println("================ all request ================\n")
//								log.Println("fileInfos =", fileInfos)
								return
							}
						case <-time.After(time.Duration(configs.MultithreadingTimeOut) * time.Second):
							log.Printf("================ timeout ================\n")
							return
					}
				}
			} else {
				select {
					case r := <-ch:
						fileInfos = append(fileInfos, r)
						if len(fileInfos) == originalSize {
							log.Println("================ all request ================\n")
//								log.Println("fileInfos =", fileInfos)
							return
						}
				}
			}
		}
	}
	log.Println("提取Original文件夹图片完毕")
	//提取OldAlgoVersion特征文件
	if configs.OldAlgoVersion != "feature" {
		log.Println(configs.PublicDir + configs.UploadsDir)
		ufs2 := utils.ScanUploads(configs.PublicDir + configs.UploadsDir)//只重新提全部库中的特征
//		log.Println(ufs2)
		for index := 0; index < len(ufs2); index++ {
			fileInfo := ufs2[index]
			log.Println(fileInfo)
			fileName := fileInfo.FileName
			log.Println("fileName =", fileName)//f18b8e6f3514b5ad12b474008a0f9d6ce8179382.jpg
			filePath := fileInfo.FilePath
			log.Println("filePath =", filePath)//public/uploads/f1/f18b8e6f3514b5ad12b474008a0f9d6ce8179382.jpg
			fileSize := fileInfo.FileSize
			log.Println("fileSize =", fileSize)//2822
//			log.Fatal("==================")
			fileAdd(nil, "", fileName, "", "./" + filePath, fileSize, 0)//TODO 需完成重新提取不覆盖fileInfo信息
		}
		log.Println("提取OldAlgoVersion特征文件 ok")
	}
	if configs.DbLoad == "1" {
		log.Println("数据库加载人员库")
		//数据库加载人员库
		librarys := repositories.QueryLibrarys()
		librarysSize := len(librarys)
		log.Println("librarysSize", librarysSize)
		log.Println("----------------------------- faceMatchConn ------------------------------")
		//比对服务
		faceMatchConn, faceMatchConnErr := grpc.Dial(configs.FaceMatchAddress, grpc.WithInsecure())
		defer faceMatchConn.Close()
		if faceMatchConnErr != nil {
			log.Println("did not connect: %v", faceMatchConnErr)
		}
		fmsc := pb.NewFaceMatchServiceClient(faceMatchConn)
		ufcStream, ufcErr := fmsc.UpdateFaceFeatures(context.Background())
		if ufcErr != nil {
			log.Println(ufcErr)
		}
		for index := 0; index < librarysSize; index++ {
			library := librarys[index].Code
			allPersonnel := repositories.QueryAllPersonnel(library)
			allPersonnelSize := len(allPersonnel)
			log.Println("len(allPersonnel)", allPersonnelSize)
			if configs.SendMatch == "1" {
				for i := 0; i < allPersonnelSize; i++ {
					if i % 10 == 0 {
						log.Println("FeatureUpdate ", i)
					}
					personnel := allPersonnel[i]
					ff := pb.FaceFeature{Value: []byte(personnel.Feature), Version: configs.AlgoVersion}
					requestor := pb.Requestor{CompanyId: "", ApplicationId: "", DeviceId: "", AccessCode: "", UserId: "", Password: ""}
					fl := pb.FeatureLibrary{LibraryName: library}
					identityId := personnel.IdentityId
					featureId := personnel.FeatureId//utils.GenerateFileId(newFileName)
					identityName := personnel.Name
					fu := pb.FeatureUpdate{IdentityId: identityId, FeatureId: featureId, IdentityName: identityName, FaceFeature: &ff, FeatureLibrary: &fl, Requestor: &requestor}
					ufcStream.Send(&fu)
				}
			}
			Items := utils.Personnels_UploadedFiles(allPersonnel)
			ItemsSize := len(Items)
			log.Println("len(Items)", ItemsSize)
			var dir string
			if library == "" {
				dir = configs.PublicDir + configs.UploadsDir
			} else {
				dir = configs.PublicDir + configs.LibraryDir + library + "/"
			}
			files := utils.UploadedFiles {
				Dir: dir,
				Items: Items,
			}
			files.Sort()
			LibraryFilesMap[library] = &files
			log.Println("library", library, "load success")
//			log.Println("LibraryFilesMap[library]", LibraryFilesMap[library])
		}
		log.Println("数据库加载人员库完成")
		ufcStream.CloseAndRecv()
	} else {
		log.Println("文件加载人员库")
		//文件加载全库
//		repositories.AddUdpLibrary("")
		files := loadLibraryFeatures(configs.PublicDir + configs.UploadsDir, "")
		log.Println("files", files)
		LibraryFilesMap[""] = files
		log.Println("加载全库 ok")
		//加载图库
		log.Println(LibraryFilesMap)
		dirs := utils.GetDirNames(configs.PublicDir + configs.LibraryDir)
		log.Println("dirs", dirs)
		dirsSize := len(dirs);
		log.Println("dirsSize", dirsSize)
		for index := 0; index < dirsSize; index++ {
			log.Println("加载图库", dirs[index])
			repositories.AddUdpLibrary(dirs[index])
			_files := loadLibraryFeatures(configs.PublicDir + configs.LibraryDir + dirs[index], dirs[index])
			log.Println("加载图库", dirs[index] + " ok")
			LibraryFilesMap[dirs[index]] = _files
		}
		log.Println("加载全部图库 ok")
		err2 := os.MkdirAll(configs.TmpDir, 0666)
		if err2 != nil {
			log.Println("新建TMP文件夹失败", err2)
		}
		log.Println("文件加载人员库完成")
	}
}
//一比一页面渲染
func GetOnebyone(ctx iris.Context) {
	//    		log.Println("1")
	//    		log.Println(ctx.Params())
	//    		log.Println("2")
	lid := ctx.Params().Get("lid")
	log.Println(lid)
	cid := ctx.Params().Get("cid")
	log.Println(cid)
	haveId, identityId, featureId := utils.GetId(cid)
	if haveId {
		log.Println(identityId)
		log.Println(featureId)
		have, uploadedFile := utils.GetUploadedFile(LibraryFilesMap, lid, featureId)
		if have {
			uploadedFileJson, er := json.Marshal(uploadedFile)
			if er == nil {
				log.Println(string(uploadedFileJson))
			}
			fileDir := utils.GetFilePathDir(lid, cid)
			log.Println(fileDir)
			ctx.ViewData("lid", lid)
			ctx.ViewData("cid", cid)
			ctx.ViewData("identityId", identityId)
			ctx.ViewData("featureId", featureId)
			ctx.ViewData("fileDir", fileDir)
			ctx.ViewData("personnelInfo", uploadedFile)
			ctx.ViewData("personnelInfoJson", string(uploadedFileJson))
			ctx.ViewData("rootPath", configs.Root)
			ctx.ViewData("level", configs.LEVEL)
			ctx.View("onebyone.html")
		}
	}
}
//更新人员信息
func UpdatePersonnel(ctx iris.Context, lid string) {
	//log.Println(ctx.Params())
	log.Println("lid =", lid)
	cid := ctx.Params().Get("cid")
	log.Println("cid =", cid)
	haveId, identityId, featureId := utils.GetId(cid)
	if haveId {
		log.Println("identityId =", identityId)
		log.Println("featureId =", featureId)
		faceSeq, _ := ctx.URLParamInt("faceSeq")
		log.Println("faceSeq =", faceSeq)
//		if faceSeq < 0 {
//			faceSeq = 0
//		}
		have, uploadedFile := utils.GetUploadedFile(LibraryFilesMap, lid, featureId)
		if have {
			uploadedFileJson, er := json.Marshal(uploadedFile)
			if er == nil {
				log.Println("string(uploadedFileJson) =", string(uploadedFileJson))
			}
//			log.Println("featureId", featureId)
			fileDir := utils.GetFilePathDir(lid, featureId)
//			log.Println(fileName)
			fileName := utils.ReductionFileId(uploadedFile.FileId)
			log.Println("fileName =", fileName)//f18b8e6f3514b5ad12b474008a0f9d6ce8179382.jpg
			filePath := configs.PublicDir + fileDir + fileName
			log.Println("filePath =", filePath)//public/uploads/f1/f18b8e6f3514b5ad12b474008a0f9d6ce8179382.jpg
			fileAlias := ctx.URLParam("fileAlias")
			log.Println("fileAlias =", fileAlias)
			reFileName, _ := utils.GetFileName(filePath);
			log.Println("reFileName =", reFileName)
//			log.Println("reFileInfo =", reFileInfo)
			fileSuffix := path.Ext(fileName) //获取文件名后缀
			log.Println("fileSuffix =", fileSuffix)
			if fileAlias != "" {
				delFilePath := filePath + "_" + reFileName + "_"
				log.Println(delFilePath)
				files := make([]string, 1)
				files[0] = delFilePath
				utils.RemoveFiles(files)
				fileName = fileAlias + fileSuffix
				log.Println("fileName =", fileName)
			} else {
				fileName = reFileName + fileSuffix
			}
			fileSize := uploadedFile.FileSize
			log.Println("fileSize =", fileSize)//2822
			fileInfo := uploadedFile.FileInfo
			fileAdd(nil, lid, fileName, fileInfo, filePath, fileSize, faceSeq)
			ctx.JSON(&datamodels.ResBody{Code: 200, Msg: "ok"})
		} else {
			ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "No such person"})
		}
	}
}
//加载比对库特征数据
func loadLibraryFeatures(dir string, library string) *utils.UploadedFiles {
	ufs := new(utils.UploadedFiles)
	mkLibraryScanFeatures(ufs, dir, library)
	//转换成用户对象，存储到数据库中
//	if configs.DbSave == "1" {
//		pis := utils.UploadedFiles_Personnels(ufs.Items)
//		repositories.AddPersonnelBatch(pis, library)
//	}
	return ufs
}
// scan the ./public/uploads folder for any files
// add them to a new  uploadedFiles list.
func mkLibraryScanFeatures(ufs *utils.UploadedFiles, dir string, library string) {
	lindex := dir[len(dir)-1]
	if lindex != os.PathSeparator && lindex != '/' {
		dir += string(os.PathSeparator)
	}
	// create directories if necessary
	// and if, then return empty uploaded files; skipping the scan.
	if err := os.MkdirAll(dir, os.FileMode(0666)); err != nil {
		return
	}
	// otherwise scan the given "dir" for files.
	log.Println("dir =", dir)
	log.Println("library =", library)
	go ufs.ScanFeatures(dir, library, repositories.AddUdpPersonnel)
//	ufs.ScanFeatures(dir, library, repositories.AddUdpPersonnel)
}
//比对服务删除数据
func DeleteFaceMatch(identityId string, featureId string, library string) {
	log.Println("identityId =", identityId)
	log.Println("featureId =", featureId)
	log.Println("library =", library)
	//比对服务
	faceMatchConn, faceMatchConnErr := grpc.Dial(configs.FaceMatchAddress, grpc.WithInsecure())
	defer faceMatchConn.Close()
	if faceMatchConnErr != nil {
		log.Println("did not connect: %v", faceMatchConnErr)
		return
	}
	fmsc := pb.NewFaceMatchServiceClient(faceMatchConn)
	_ctx, cancel := context.WithTimeout(context.Background(), configs.ConnTimeout * time.Second)
	defer cancel()
	//删除这个人的所有特征
	ir := pb.IdentityRequest{IdentityId: []string{identityId}, FeatureLibrary: &pb.FeatureLibrary{LibraryName: library}}
	flus, flusErr := fmsc.DeleteFaceFeatures(_ctx, &ir)
	//删除这个人的某个特征
//	fr := pb.FeatureRequest{FeatureId: []string{featureId}, FeatureLibrary: &pb.FeatureLibrary{LibraryName: library}}
//	flus, flusErr := fmsc.DeleteFaceFeatureIds(_ctx, &fr)
	if flusErr != nil {
		log.Println("delete personnel error : %v", flusErr)
		// log.Println(flusErr)
	} else  {
		log.Println(flus)
	}
}

/**
* irisCtx
* library 库名
* featureStr 特征base64
* pictureExif 图片信息
* fileName 文件名
* fileInfo 文件信息
* fileId 文件ID
* size 文件大小
* modtime 特征修改时间
* expTime 特征过期时间
* threshold 阈值
* cid 比对ID
* filePath 文件路径
* isFile 后台管理接口开关
*/
//特征使用
func FeatureExec(ctx iris.Context, library string, featureStr string, pictureExif datamodels.PictureExif, fileName string, fileInfo string, fileId string, size int64, modtime int64, expTime int64, threshold float64, topN int32, cid string, filePath string, isFile bool) (bool, datamodels.PersonnelInfo) {
//                                 特征base64         图片信息json   临时存储图片   文件信息      文件id       文件大小            特征修改时间           特征过期时间            阈值                                   比对id       filePath待补充       后台管理接口开关
	log.Println("FeatureExec")
	var personnelInfo datamodels.PersonnelInfo
	_filePath := filePath
	if _filePath == "" {
		_filePath = configs.TmpDir + fileName
	}
	requestor := pb.Requestor{CompanyId: "", ApplicationId: "", DeviceId: "", AccessCode: "", UserId: "", Password: ""}
	faceFeature := &pb.FaceFeature{Value: []byte(featureStr), Version: configs.AlgoVersion}
	//比对服务
	faceMatchConn, faceMatchConnErr := grpc.Dial(configs.FaceMatchAddress, grpc.WithInsecure())
	defer faceMatchConn.Close()
	if faceMatchConnErr != nil {
		log.Println("did not connect match server: %v", faceMatchConnErr)
		ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "did not connect match server."})
		return false, personnelInfo
	}
	fmsc := pb.NewFaceMatchServiceClient(faceMatchConn)
//	log.Println(featureStr)
	// log.Println(ctx.PostValue("id"))
	// log.Println(ctx.GetHeader("Referer"))
	log.Println("cid=", cid)
	if cid != "" {//比对
		// cid = "all"
		matchType := ""
		matchData := ""
		if cid == "all" {//一比多
			matchType = "1vn"
			log.Println("one by many")
			//1:n比对
			//用算法比较特征向量
			fl := pb.FeatureLibrary{LibraryName: library}
			if topN <= 0 {
				topN = configs.TopN
			}
			
////			matchThreads := configs.Multithreading;
//			matchThreads := 2;
//			ch := make(chan []datamodels.ResOnebymany, matchThreads) // buffered
//			log.Println(ch)
//			var limit chan int
//			resOnebymanyList := [][]datamodels.ResOnebymany{}
//			log.Println(resOnebymanyList)
//			limit = make(chan int, matchThreads)
//			log.Println(limit)
//			for index := 0; index < matchThreads; index++ {
//				log.Println("进入协程操作")
//				limit <- 1
//				go func(numPieces int, pieceSequence int) {
//					fmo := pb.FaceMatchOptions{MatchThreshold: threshold, TopN: topN, FeatureLibrary: &fl, NumPieces: int32(numPieces), PieceSequence: int32(pieceSequence)}
//					fmr := pb.FaceMatchRequest{FaceFeature: faceFeature, FaceMatchOptions: &fmo, Requestor: &requestor}
//					_ctx, cancel := context.WithTimeout(context.Background(), configs.ConnTimeout * time.Second)
//					defer cancel()
//					mis, err := fmsc.GetIdentityID(_ctx, &fmr)
//					if err != nil {
//						resOnebymanys := make([]datamodels.ResOnebymany, 0)
//						ch <- resOnebymanys
//						<-limit
//					} else {
//						log.Println(mis)
//						log.Println(mis.MatchedIdentity)
//						count := len(mis.MatchedIdentity)
//						resOnebymanys := make([]datamodels.ResOnebymany, count)
//						for index := 0; index < count; index++ {
//							resOnebymanys[index] = datamodels.ResOnebymany{IdentityId: mis.MatchedIdentity[index].IdentityId, FeatureId: mis.MatchedIdentity[index].FeatureId, MatchScore: mis.MatchedIdentity[index].MatchScore, LibraryId: library}//PersonnelId: mis.MatchedIdentity[index].IdentityId, 
//						}
//						ch <- resOnebymanys
//						<-limit
//					}
//				}(matchThreads, index)
//			}
//			for {
//				select {
//					case r := <-ch:
//						resOnebymanyList = append(resOnebymanyList, r)
//						log.Println("len(resOnebymanyList) =", len(resOnebymanyList))
//						if len(resOnebymanyList) == matchThreads {
//							ctx.JSON(&datamodels.OnebymanyResBody{Code: 200, Msg: "", Data: resOnebymanyList[0]})
//					        matchDataByt, er := json.Marshal(resOnebymanyList[0])
//							if er != nil {
//								log.Println("Registration information failed", er)
//							}
//							matchData = string(matchDataByt)
//							log.Println("matchData", matchData)
//						}
//					case <-time.After(time.Duration(50) * time.Second):
//						ctx.JSON(&datamodels.OnebymanyResBody{Code: 200, Msg: "", Data: resOnebymanyList[0]})
//				        matchDataByt, er := json.Marshal(resOnebymanyList[0])
//						if er != nil {
//							log.Println("Registration information failed", er)
//						}
//						matchData = string(matchDataByt)
//						log.Println("matchData", matchData)
//				}
//			}
//			log.Println("搜索执行结束=========================================================================")

			
			fmo := pb.FaceMatchOptions{MatchThreshold: threshold, TopN: topN, FeatureLibrary: &fl, NumPieces: int32(0), PieceSequence: int32(0)}
			fmr := pb.FaceMatchRequest{FaceFeature: faceFeature, FaceMatchOptions: &fmo, Requestor: &requestor}
			_ctx, cancel := context.WithTimeout(context.Background(), configs.ConnTimeout * time.Second)
			defer cancel()
			mis, err := fmsc.GetIdentityID(_ctx, &fmr)
			if err != nil {
				log.Println("Comparison failure: %v", err)
				ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "Comparison failure."})
				return false, personnelInfo
			}
			log.Println(mis.MatchedIdentity)
			// // 转换成json
			// fmtjson, er := json.Marshal(mis.MatchedIdentity)
			// if er != nil {
			// 	log.Println(er)
			// }
			// ctx.Text(string(fmtjson))
			count := len(mis.MatchedIdentity)
			resOnebymanys := make([]datamodels.ResOnebymany, count)
			log.Println(mis)
			for index := 0; index < count; index++ {
				resOnebymanys[index] = datamodels.ResOnebymany{IdentityId: mis.MatchedIdentity[index].IdentityId, FeatureId: mis.MatchedIdentity[index].FeatureId, MatchScore: mis.MatchedIdentity[index].MatchScore, LibraryId: library}//PersonnelId: mis.MatchedIdentity[index].IdentityId, 
			}
			
			
			ctx.JSON(&datamodels.OnebymanyResBody{Code: 200, Msg: "", Data: resOnebymanys})
	        matchDataByt, er := json.Marshal(resOnebymanys)
			if er != nil {
				log.Println("Registration information failed", er)
			}
			matchData = string(matchDataByt)
		} else {//一比一
			matchType = "1v1L"
			log.Println("one by one")
			haveId, identityId, featureId := utils.GetCorrectId(cid, LibraryFilesMap, library)
			log.Println("haveId =", haveId)
			if !haveId {
				log.Println("This ID does not exist in the library")
				if ctx != nil {
					ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "This ID does not exist in the library"})
				}
				return false, personnelInfo
			}
			log.Println("identityId =", identityId)
			log.Println("featureId =", featureId)
//				identityId := cids[0]
//				featureId := utils.GenerateFileId(cids[1])
			//1:1比对
//				featureFile := utils.GetFilePath(library, featureId) + "." + configs.AlgoVersion + ".json"
//				b, err := ioutil.ReadFile(featureFile)
//				if err != nil {
//					log.Println(err)
//					ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "Cannot read feature"})
//					return
//				}
//				str := string(b)
////				log.Println(str)
//				if featureStr == str {
//					//特征完全一样
//					log.Println("featureStr == str")
//					matchScore = 100
////						ctx.Text("100分")
//				} else {
				//用算法比较特征向量
				fl := pb.FeatureLibrary{LibraryName: library}
				fmo := pb.FaceMatchOptions{MatchThreshold: float64(10), TopN: int32(1), FeatureLibrary: &fl, NumPieces: int32(0), PieceSequence: int32(0)}
				fmr := pb.FaceMatchRequest{FaceFeature: faceFeature, FaceMatchOptions: &fmo, IdentityId: identityId, Requestor: &requestor}
				_ctx, cancel := context.WithTimeout(context.Background(), configs.ConnTimeout * time.Second)
				defer cancel()
//					log.Println(fmr)
				mis, misErr := fmsc.GetIdentityID(_ctx, &fmr)
				if misErr != nil {
					log.Println("misErr =", misErr)
					ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "Comparison failure."})
					return false, personnelInfo
				} else {
					log.Println("mis =", mis)
				}
				length := len(mis.MatchedIdentity)
				if length <= 0 {
					log.Println("No comparison result.", mis.MatchedIdentity)
					if ctx != nil {
						ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "No comparison result."})
					}
					return false, personnelInfo
				}
				for index := 0; index < length; index++ {
					log.Println(mis.MatchedIdentity[index].FeatureId + "==" + utils.GenerateFileId(featureId) + " -- " + cid)
//							if mis.MatchedIdentity[index].FeatureId == utils.GenerateFileId(featureId) {
						ctx.JSON(&datamodels.OnebyoneResBody{Code: 200, Msg: "", MatchScore: mis.MatchedIdentity[index].MatchScore})
						matchData = "{\"combination_id\": \"" + mis.MatchedIdentity[index].IdentityId + ":" + mis.MatchedIdentity[index].FeatureId +"\", \"feature_id\": \"" + fileName +"\",\"match_score\": " + strconv.FormatFloat(mis.MatchedIdentity[index].MatchScore, 'f', 6, 64)  + ",\"library\": \"" + library + "\"}"
//							}
				}
//						log.Println(mis.MatchedIdentity[0].MatchScore)
//						if mis.MatchedIdentity[0].MatchScore < 90 {
//							// ctx.StatusCode(iris.StatusInternalServerError)
//							ctx.Text(strconv.FormatFloat(mis.MatchedIdentity[0].MatchScore, 'f', 6, 64) + "分")
//						} else {
//							ctx.Text(strconv.FormatFloat(mis.MatchedIdentity[0].MatchScore, 'f', 6, 64) + "分")
//						}
//				}
		}
		log.Println("matchData =", matchData)
		comparisonHistory := datamodels.ComparisonHistory{Personnel: datamodels.Personnel{
			IdentityId : fileName,
			FeatureId : fileId,
			Name : matchType,
			Feature : featureStr,
			AlgoVersion : configs.AlgoVersion,
			LibraryId : library,
		}, MatchData: matchData}
		repositories.AddUdpComparisonHistory(comparisonHistory)//增加到数据库
		return false, personnelInfo
	} else {//上传
		log.Println("update")
		_files := LibraryFilesMap[library]
		log.Println("fileName = ", fileName)
		fileSuffix := path.Ext(fileName) //获取文件名后缀
		log.Println("fileSuffix = ", fileSuffix)
		newFileName := ""//新文件名
		renameDir := ""//新文件夹
		if fileSuffix != "" {//图片提取的
			if fileId == "" {
				// 提取文件唯一识别信息
				file1, err1 := os.Open(_filePath)
				defer file1.Close()
				if err1 != nil {
					log.Println(err1)
					if ctx != nil {
						ctx.JSON(&datamodels.ResBody{Code: 500, Msg: err1.Error()})
					}
					return false, personnelInfo
				}
				h := sha1.New()
				// s := "sha1 this string"
				// h.Write([]byte(s))
				io.Copy(h, file1)
//				bs := h.Sum(nil)
//				log.Println("%x\n", bs)
				fileId = hex.EncodeToString(h.Sum(nil))
			}
			log.Println("fileId =", fileId)
			newFileName = fileId + fileSuffix
			log.Println("newFileName =", newFileName)
			renameDir = configs.PublicDir + utils.GetFilePathDir(library, newFileName)
			err1 := os.MkdirAll(renameDir, 0666)
			if err1 != nil {
				log.Println("Unable to create folder")
				if ctx != nil {
					ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "Unable to create folder"})
				}
				return false, personnelInfo
			}
			log.Println("filePath =", filePath)
			// 上传成功移动文件从/tmp到/upload
			if filePath == "" || strings.HasPrefix(filePath, "../public/original/") {// 如果是重新提取其他版本特征，不走拷贝
				log.Println("_filePath =", _filePath)
				log.Println("renameDir + newFileName =", renameDir + newFileName)
				err := os.Rename(_filePath, renameDir + newFileName)
				if err != nil {
//					panic(err)
					log.Println("File rename error")
					if ctx != nil {
						ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "File rename error"})
					}
					return false, personnelInfo
				}
			}
			// optionally, add that file to the list in order to be visible when refresh.
//			if _files == nil {
//				log.Fatal(configs.PublicDir + configs.LibraryDir + library)
//				_files = utils.MkLibraryScanFeatures(configs.PublicDir + configs.LibraryDir + library, library)
//				LibraryFilesMap[library] = _files
//			}
		} else {//特征传入的
			if fileId == "" {
				h := sha1.New()
				h.Write([]byte(featureStr))
				fileId = hex.EncodeToString(h.Sum(nil))
			}
			log.Println("fileId =", fileId)
			newFileName = fileId + fileSuffix
			log.Println(newFileName)
			renameDir = configs.PublicDir + utils.GetFilePathDir(library, newFileName)
			err := os.MkdirAll(renameDir, 0666)
			if err != nil {
				log.Println(err)
				if ctx != nil {
					ctx.JSON(&datamodels.ResBody{Code: 500, Msg: err.Error()})
				}
				return false, personnelInfo
			}
		}
		fileAlias := string([]byte(fileName)[:len(fileName) - len(fileSuffix)])//文件别名
		if strings.HasSuffix(fileAlias, configs.Separator) {//fileName = name_
			fileAlias = fileAlias + fileId//没有文件别名，把生成的id当文件别名
		}
		log.Println("fileAlias=", fileAlias)
//			modtime := time.Now().Format("2006-01-02 15:04:05")
//		modtime := time.Now().UnixNano()/1e6
		// 时间检测
		modtime = utils.If(modtime == 0, time.Now().UnixNano()/1e6, modtime).(int64)
		expTime = utils.If(expTime == 0, modtime + configs.FeaturePeriod, expTime).(int64)
		_fileSuffix := utils.GetFileSuffix(fileSuffix)//转换的后缀
		// 添加数据到内存中
		log.Println("fileId =", fileId)
		log.Println("_fileSuffix =", _fileSuffix)
		log.Println("library =", library)
		log.Println("fileAlias =", fileAlias)
		var uploadedFile datamodels.UploadedFile
//		if !strings.HasPrefix(filePath, "../public/original/") {//如果不是提取任务，添加数据到内存中 
			uploadedFile = _files.Add(fileId + _fileSuffix, featureStr, size, modtime, expTime, library, fileAlias, fileInfo)//新建文件对象并保持内存中
//		} else {
//			uploadedFile = _files.Gen(fileId + _fileSuffix, featureStr, size, modtime, expTime, library, fileAlias, fileInfo)//新建文件对象
//		}
//		log.Println(uploadedFile.Feature)
//		log.Println(len(uploadedFile.Feature))
//		if configs.DbSave == "1" && !strings.HasPrefix(filePath, "../public/original/") {//如果需要保存到数据库并且不是提取任务，增加到数据库
		if configs.DbSave == "1" {//如果需要保存到数据库，增加到数据库
			personnel := utils.UploadedFile_Personnel(uploadedFile)//转换成用户对象
			repositories.AddUdpPersonnel(personnel)//增加到数据库
		}
		log.Println("newFileName =", newFileName)
		log.Println("uploadedFile =", uploadedFile)
		// 按照人脸框截取头像、生成缩略图
//		if filePath == "" {// 如果是重新提取其他版本特征，不生成缩略图//TODO 更换人员后必须重新生成，所以关闭条件判断
//		if fileSuffix != "" && !strings.HasPrefix(filePath, "../public/original/") {//如果是图片提取的,且不是提取任务，那么提取头像并生成缩略图，淘汰参数configs.Multithreading == 0
		log.Println("fileSuffix =", fileSuffix)
		log.Println("configs.SaveThumbnail =", configs.SaveThumbnail)
		if fileSuffix != "" && configs.SaveThumbnail == "1" {//如果是图片提取的,并且要求保存缩略图
			log.Println("进入提取缩略图协程") 
			go _files.CreateThumbnail(uploadedFile, newFileName, pictureExif, fileAlias)
		}
//		}
		// 特征文件存放
		textFile, createErr1 := os.Create(renameDir + newFileName + "." + configs.AlgoVersion + ".json")
		if createErr1 != nil {
			log.Println(createErr1)
			if ctx != nil {
				ctx.JSON(&datamodels.ResBody{Code: 500, Msg: createErr1.Error()})
			}
			return false, personnelInfo
		}
		featureInfo := datamodels.FeatureInfo{Feature: featureStr, UpdateTime: modtime, ExpireTime: expTime}
//		log.Println(featureInfo)
		fjson, er := json.Marshal(featureInfo)
		if er == nil {
			log.Println("string(fjson) =", string(fjson))
		}
//		_, writeErr1 := textFile.Write([]byte(featureStr))
		_, writeErr1 := textFile.Write(fjson)
		if writeErr1 != nil {
			log.Println(writeErr1)
			if ctx != nil {
				ctx.JSON(&datamodels.ResBody{Code: 500, Msg: writeErr1.Error()})
			}
			return false, personnelInfo
		}
		closeErr1 := textFile.Close()
		if closeErr1 != nil {
			log.Println(closeErr1)
		}
		if &pictureExif != nil {
			faceJsonByt, er := json.Marshal(pictureExif)
			if er != nil {
				if ctx != nil {
					ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "Registration information failed"})
				}
				log.Println("Registration information failed", er)
				return false, personnelInfo
			}
			faceJsonStr := string(faceJsonByt)
//			if filePath == "" {// 如果是重新提取其他版本特征，不生保存info数据
				uploadedFile.Info = faceJsonStr
				// info文件存放
				jsonFile, createErr2 := os.Create(renameDir + newFileName + ".info.json")
				if createErr2 != nil {
					log.Println(createErr2)
					if ctx != nil {
						ctx.JSON(&datamodels.ResBody{Code: 500, Msg: createErr2.Error()})
					}
					return false, personnelInfo
				}
				// _, writeErr := file.Write([]byte("创建一个文件，并写入内容。"))
				_, writeErr2 := jsonFile.Write(faceJsonByt)
				if writeErr2 != nil {
					log.Println(writeErr2)
					if ctx != nil {
						ctx.JSON(&datamodels.ResBody{Code: 500, Msg: writeErr2.Error()})
					}
					return false, personnelInfo
				}
				closeErr2 := jsonFile.Close()
				if closeErr2 != nil {
					log.Println(closeErr2)
					if ctx != nil {
						ctx.JSON(&datamodels.ResBody{Code: 500, Msg: closeErr2.Error()})
					}
					return false, personnelInfo
				}
//			}
		}
		// name文件存放
//		if filePath == "" {// 如果是重新提取其他版本特征，不生保存name数据
			nameFile, createErr3 := os.Create(renameDir + newFileName + "_" + fileAlias + "_")
			if createErr3 != nil {
				log.Println(createErr3)
				if ctx != nil {
					ctx.JSON(&datamodels.ResBody{Code: 500, Msg: createErr3.Error()})
				}
				return false, personnelInfo
			}
			// _, writeErr := file.Write([]byte("创建一个文件，并写入内容。"))
			_, writeErr3 := nameFile.Write([]byte(fileInfo))
			if writeErr3 != nil {
				log.Println(writeErr3)
				if ctx != nil {
					ctx.JSON(&datamodels.ResBody{Code: 500, Msg: writeErr3.Error()})
				}
				return false, personnelInfo
			}
			closeErr3 := nameFile.Close()
			if closeErr3 != nil {
				log.Println(closeErr3)
				if ctx != nil {
					ctx.JSON(&datamodels.ResBody{Code: 500, Msg: closeErr3.Error()})
				}
				return false, personnelInfo
			}
			log.Println("fileName =", fileName)
//		}
//		if !strings.HasPrefix(filePath, "../public/original/") {//如果不是提取任务，进行grpc注册，淘汰参数configs.SendMatch == "1"
		if configs.SendMatch == "1" {//进行grpc注册
			// 调用grpc注册
			ufcStream, ufcErr := fmsc.UpdateFaceFeatures(context.Background())
			if ufcErr != nil {
				log.Println(ufcErr)
			}
			fl := pb.FeatureLibrary{LibraryName: library}
			log.Println("newFileName =", newFileName)
			log.Println("faceFeature =", faceFeature)
			log.Println("fl =",fl)
			log.Println("requestor =", requestor)
			personnelInfo := utils.UploadedFile_PersonnelInfo(uploadedFile)
			identityId := personnelInfo.IdentityId
			log.Println("identityId =", identityId)
			featureId := personnelInfo.FeatureId//utils.GenerateFileId(newFileName)
			log.Println("featureId =", featureId)
			identityName := personnelInfo.Name
			log.Println("identityName =", identityName)
			fu := pb.FeatureUpdate{IdentityId: identityId, FeatureId: featureId, IdentityName: identityName, FaceFeature: faceFeature, FeatureLibrary: &fl, Requestor: &requestor} //fileName
	//		log.Println(fu)
			ufcStream.Send(&fu)
			ufcStream.CloseAndRecv()
		}
		log.Println("ALL OK")
		log.Println("uploadedFile =", uploadedFile)
		if ctx != nil {
			if isFile {
				log.Println("isFile")
				ctx.JSON(&datamodels.UploadedResBody{Code: 200, Msg: "", Data: uploadedFile})
			} else {
				personnelInfo := utils.UploadedFile_PersonnelInfo(uploadedFile)
				ctx.JSON(&datamodels.PersonnelInfoBody{Code: 200, Msg: "", Data: personnelInfo})
			}
		} else {
			personnelInfo = utils.UploadedFile_PersonnelInfo(uploadedFile)
			log.Println("personnelInfo =", personnelInfo)
		}
		return true, personnelInfo
	}
}

/**
* 文件检测
* irisCtx
* library 库名
* fileName 文件名
* fileId 文件ID
* size 文件大小
* modtime 特征创建时间
* expTime 特征过期时间
* threshold阈值
* checkLive 是否检活
* cid 比对ID
* filePath 文件路径
* isFile 后台管理接口开关
* faceSeq 人脸序号
*/
func ImageTesting(ctx iris.Context, library string, fileName string, fileInfo string, fileId string, size int64, modtime int64, expTime int64, threshold float64, topN int32, checkLive int, cid string, filePath string, isFile bool, faceSeq int) (bool, datamodels.PersonnelInfo) {
	log.Println("ImageTesting(...")
	err, personnelInfo, pictureExif, featureStr := ExtractingFeatures(ctx, library, fileName, fileId, filePath, faceSeq)
	if !err {
		return err, personnelInfo
	}
	return FeatureExec(ctx, library, featureStr, pictureExif, fileName, fileInfo, fileId, size, modtime, expTime, threshold, topN, cid, filePath, isFile)
//                   特征base64 图片信息json 临时存储图片  文件id 文件大小  特征修改时间  特征过期时间  阈值 比对id 后台管理接口开关
}

/**
* 文件提取特征
* irisCtx
* library 库名
* fileName 文件名
* fileId 文件ID
* cid 比对ID
* filePath 文件路径
* faceSeq 人脸序号
* retrun
* ok,  人员信息，图片信息，特征base64
*/
func ExtractingFeatures(ctx iris.Context, library string, fileName string, fileId string, filePath string, faceSeq int) (bool, datamodels.PersonnelInfo, datamodels.PictureExif, string) {
	var personnelInfo datamodels.PersonnelInfo
	var pictureExif datamodels.PictureExif
	_filePath := filePath
	if _filePath == "" {
		_filePath = configs.TmpDir + fileName
	}
//	log.Println("threshold =", threshold)
//	log.Println("checkLive =", checkLive)
	log.Println("fileName =", fileName)
	// 提取特征流程
	// img := gocv.IMRead("images/1.jpeg", gocv.IMReadColor)
	img := gocv.IMRead(_filePath, gocv.IMReadColor)
	if img.Empty() {
		log.Println("Invalid read of Source Mat in LUT test ", _filePath)//TOCO ERR fileName=123123123.jpeg
		if ctx != nil {
			ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "Cannot read image"})
		}
		return false, personnelInfo, pictureExif, ""
	}
	foo := gocv.NewMat()
	gocv.CvtColor(img, &foo, gocv.ColorBGRToRGB)
	log.Println("foo.Rows() =", foo.Rows())
	log.Println("foo.Cols() =", foo.Cols())
	log.Println("reflect.TypeOf(foo.Cols()) =", reflect.TypeOf(foo.Cols()))
	gocv.IMWrite("foo.jpeg", foo)
	// Set up a connection to the server.
	// 预处理服务
	faceConn, faceConnErr := grpc.Dial(configs.FaceAddress, grpc.WithInsecure())
	defer faceConn.Close()
	if faceConnErr != nil {
		log.Println("did not connect:", faceConnErr)
		if ctx != nil {
			ctx.JSON(&datamodels.ResBody{Code: 500, Msg: faceConnErr.Error()})
		}
		return false, personnelInfo, pictureExif, ""
	}
	fsc := pb.NewFaceServiceClient(faceConn)

	// Contact the server and print out its response.
//	name := configs.DefaultName
//	if len(os.Args) > 1 {
//		name = os.Args[1]
//	}
//	log.Println("name =", name)
	_ctx, cancel := context.WithTimeout(context.Background(), configs.ConnTimeout * time.Second)
	defer cancel()
	im := pb.Image{ImageBytes: foo.ToBytes(), ImageParam: &pb.ImageParam{Width: int32(foo.Cols()), Height: int32(foo.Rows()), Channel: pb.ImageParam_RGB}}
	// 人脸检测
	fr1 := pb.FaceRequest{FaceDetection: true, Image: &im}
	rr1, err := fsc.FaceProcess(_ctx, &fr1)
	if err != nil {
		if ctx != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "FaceDetection error"})
		}
		log.Println("FaceDetection error:", err)
		if ctx != nil {
			ctx.JSON(&datamodels.ResBody{Code: 500, Msg: err.Error()})
		}
		return false, personnelInfo, pictureExif, ""
	}
	log.Println("rr1 =", rr1)
	if len(rr1.FaceParams.FaceParam) == 0 {
		if ctx != nil {
			ctx.StatusCode(iris.StatusInternalServerError)
			//     ctx.Application().Logger().Warnf("no face")
			// 	res := resBody{Code:  200, Msg: "no face"}
			//     ctx.JSON(res)
//			ctx.Text("no face")
			ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "No face"})
		}
		return false, personnelInfo, pictureExif, ""
	}
	log.Println("rr1.FaceParams.FaceParam[0] =", rr1.FaceParams.FaceParam[0])
	log.Println("rr1.FaceParams.FaceParam[0].CroppingBox.X =", rr1.FaceParams.FaceParam[0].CroppingBox.X)
	// 检测活体
	fr2 := pb.FaceRequest{LivenessDetection: true, Image: &pb.Image{ImageBytes: foo.ToBytes(), ImageParam: &pb.ImageParam{Width: int32(foo.Cols()), Height: int32(foo.Rows()), Channel: pb.ImageParam_RGB}}}
	rr2, err := fsc.FaceProcess(_ctx, &fr2)
	if err != nil {
		log.Println("Unable to detect living:", err)
	}
	log.Println("rr2 =", rr2)
	//TODO 使用checkLive检查活体
	fr3 := pb.FaceRequest{FeatureExtraction: true, FaceParams: rr1.FaceParams, Image: &im}
	// 提取特征
	rr3, err := fsc.FaceProcess(_ctx, &fr3)
	if err != nil {
		log.Println("Cannot mention features:", err)
		if ctx != nil {
			ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "Cannot mention features"})
		}
		return false, personnelInfo, pictureExif, ""
	}
//	log.Println(rr3)
	if rr3 == nil {
		if ctx != nil {
			ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "No feature"})
		}
		log.Println("No feature")
		return false, personnelInfo, pictureExif, ""
	}
	if len(rr3.FaceFeature) == 0 {
		if ctx != nil {
			ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "No feature"})
		}
		log.Println("No feature")
		return false, personnelInfo, pictureExif, ""
	}
	log.Println("Feature extraction succeeded ")
	
	//查原有记录，区别更新操作
	log.Println("faceSeq =", faceSeq)
	if faceSeq < 0 && library != "" {
		//	haveId, identityId, featureId := utils.GetCorrectId(fileId, LibraryFilesMap, library)
		fileSuffix := path.Ext(fileName) //获取文件名后缀
		log.Println("fileSuffix =", fileSuffix)
		_fileSuffix := utils.GetFileSuffix(fileSuffix)//转换的后缀
		log.Println("_fileSuffix =", _fileSuffix)
		haveId, identityId, featureId := utils.GetId(fileId + _fileSuffix)
		log.Println("haveId =", haveId)
		if haveId {//正确的id
			log.Println("identityId =", identityId)
			log.Println("featureId =", featureId)
			log.Println("library =", library)
//			haveInfo, personnelInfo := utils.GetPersonnelInfo(LibraryFilesMap, library, featureId)
//			have, uploadedFile := utils.GetUploadedFile(LibraryFilesMap, library, featureId)
			imageInfoFile := utils.GetFilePath(library, featureId) + ".info.json"
			log.Println("imageInfoFile =", imageInfoFile)
			b, err := ioutil.ReadFile(imageInfoFile)
			if err == nil {
				str := string(b)
				log.Println(str)
				var pictureExif datamodels.PictureExif
				json.Unmarshal(b, &pictureExif)
				faceSeq = pictureExif.FaceSeq
			}
		}
	}
	if faceSeq < 0 {
		log.Println("faceSeq < 0")
		faceSeq = 0
	}
	log.Println("faceSeq =", faceSeq)
	featureByte := rr3.FaceFeature[faceSeq].Value
	featureStr := base64.StdEncoding.EncodeToString(featureByte)
	// 转换成json
//	faceJsonByt, er := json.Marshal(rr3)
//	if er == nil {
//		log.Println(faceJsonByt)
//	}
	faceNum := len(rr3.FaceParams.FaceParam)
	faceInfos := make([]datamodels.FaceInfo, faceNum)
	for index := 0; index < faceNum; index++ {
//		log.Println(float32(rr3.FaceParams.FaceParam[0].CroppingBox.X) / float32(foo.Cols()))
//		log.Println(strconv.FormatFloat(float64(rr3.FaceParams.FaceParam[0].CroppingBox.X) / float64(foo.Cols()), 'E', -1, 32))
		uLft := float32(rr3.FaceParams.FaceParam[index].CroppingBox.X) / float32(foo.Cols())
		uTop := float32(rr3.FaceParams.FaceParam[index].CroppingBox.Y) / float32(foo.Rows())
		nWid := float32(rr3.FaceParams.FaceParam[index].CroppingBox.Width) / float32(foo.Cols())
		uHei := float32(rr3.FaceParams.FaceParam[index].CroppingBox.Height) / float32(foo.Rows())
		rcItem := make([]float32, 4)
		rcItem[0] = uLft
		rcItem[1] = uTop
		rcItem[2] = nWid
		rcItem[3] = uHei
		rcItemJsonByt, er := json.Marshal(rcItem)
		if er == nil {
			log.Println("rcItemJsonByt =", rcItemJsonByt)
		}
		faceInfos[index] = datamodels.FaceInfo{BlurType: "3", HeadPosi: "[-14,-64,8]", RcItem: string(rcItemJsonByt)}//"[0.74121094,0.5625,0.051757812,0.09201389]"
	}
	pictureExif = datamodels.PictureExif{FaceInfos: faceInfos, FaceSeq: faceSeq, Pin: fileId}
	log.Println("pictureExif =", pictureExif)
	return true, personnelInfo, pictureExif, featureStr
}

//文件上传
func FileUpload(ctx iris.Context) {
	// Get the file from the dropzone request
	file, info, err := ctx.FormFile("file")
	defer file.Close()
	log.Println(file)
	log.Println(reflect.TypeOf(file), reflect.ValueOf(file).Kind())
	if err != nil {
		ctx.StatusCode(iris.StatusInternalServerError)
		ctx.Application().Logger().Warnf("Error while uploading: %v", err.Error())
		return
	}
	fileName := info.Filename
	fileSize := info.Size
	// Create a file with the same name
	// assuming that you have a folder named 'uploads'
	out, err := os.OpenFile(configs.TmpDir + fileName,
		os.O_WRONLY|os.O_CREATE, 0666)
	defer out.Close()
	if err != nil {
		ctx.StatusCode(iris.StatusInternalServerError)
		ctx.Application().Logger().Warnf("Error while preparing the new file: %v", err.Error())
		return
	}
	io.Copy(out, file)
	lid := ""
	if ctx != nil {
		lid = ctx.Params().Get("lid")
	}
	log.Println("lid=", lid)
	library := ""
	if ctx != nil {
		library = ctx.GetHeader("library")
	}
	log.Println(library)
	if lid != "" {// /upload兼容/library/:library/personnels
		library = lid
	}
	fileAdd(ctx, library, fileName, "", "", fileSize, 0)
}

func fileAdd(ctx iris.Context, library string, fileName string, fileInfo string, filePath string, fileSize int64, faceSeq int) {
	log.Println("filePath", filePath)
	_filePath := filePath
	if _filePath == "" {
		_filePath = configs.TmpDir + fileName
	}
	log.Println("_filePath", _filePath)
	// 提取文件唯一识别信息
	file1, err1 := os.Open(_filePath)
	defer file1.Close()
	if err1 != nil {
		log.Println(err1)
		return
	}
	h := sha1.New()
	// s := "sha1 this string"
	// h.Write([]byte(s))
	io.Copy(h, file1)
	bs := h.Sum(nil)
	// log.Println(s)
	log.Println("bs =", bs)
	modtime := time.Now().UnixNano()/1e6
	expTime := modtime + configs.FeaturePeriod
	cid := ""
	if ctx != nil {
		cid = ctx.GetHeader("compare_id")
	}
	ImageTesting(ctx, library, fileName, fileInfo, hex.EncodeToString(bs), fileSize, modtime, expTime, 0, 0, 0, cid, filePath, true, faceSeq)
}

//获取同步信息
func GetSyncInfo(ctx iris.Context) (int64, int64) {
	var syncTime int64
	var syncCount int64
	
//	for k, v := range LibraryFilesMap {
//		log.Println("k =", k)
//		_files := v
//		itemsSize := len(_files.Items)
//		for index := 0; index < itemsSize; index++ {
////			percentage := math.Ceil(index*100/itemsSize)
//			percentage := index*100/itemsSize
//			log.Println("math.Ceil(index/itemsSize)", percentage)
//			syncCount++
//			if _files.Items[index].FileModtime > syncTime {
//				syncTime = _files.Items[index].FileModtime
//			}
//		}
//	}
	k := "Test"
	log.Println("k =", k)
//	_files := v
	_files := LibraryFilesMap[k]
	itemsSize := len(_files.Items)
	for index := 0; index < itemsSize; index++ {
		syncCount++
		if _files.Items[index].FileModtime > syncTime {
			syncTime = _files.Items[index].FileModtime
		}
	}
	return syncTime, syncCount
}

//获取人员特征相关文件
//使用 cursor limit
func GetUserFiles(ctx iris.Context) []datamodels.UploadedFile {
	lid := ctx.Params().Get("lid")
	log.Println("lid =", lid)
	_files := LibraryFilesMap[lid]
	if _files == nil {
		log.Println("_files == nil")
		_files := new(utils.UploadedFiles)
		mkLibraryScanFeatures(_files, configs.PublicDir + configs.LibraryDir + lid, lid)
		LibraryFilesMap[lid] = _files
//		ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Incorrect library"})
//		return nil
	}
	cursor := ctx.URLParam("cursor")
	limit := ctx.URLParam("limit")
	if limit == "" {
		limit = "50"
	}
	_limit, err := strconv.Atoi(limit)
	if err != nil {
		log.Println(err)
		ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Limit input format is incorrect"})
		return nil
	}
	if cursor == "" {
		cursor = "2006-01-02 15:04:05.000"
	}
	log.Println("cursor =", cursor)
	_cursor := utils.ToTime(cursor, "2006-01-02 15:04:05.000")
	log.Print("_cursor =", _cursor)
	if _cursor < 0 {
		ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Cursor input format is incorrect"})
		return nil
	}
	slice1 := make([]datamodels.UploadedFile, _limit)
	i := 0
	log.Println("_limit =", _limit)
	if _files != nil {
		log.Println("len(_files.Items) =", len(_files.Items))
		for index := 0; index < len(_files.Items); index++ {
	//		log.Println("_files.Items[index].FileModtime", _files.Items[index].FileModtime)
	//		log.Println("_cursor", _cursor)
			if i < _limit && _files.Items[index].FileModtime - _cursor > 0 {
	//			log.Println(_files.Items[index].FileModtime - _cursor)
				slice1[i] = _files.Items[index]
				i++
			}
		}
	}
//	log.Println("_cursor")
//	log.Println(_cursor)
	slice1=append(slice1[:i])
	return slice1
}
////使用 page pre_page
//func GetUserFiles(ctx iris.Context) []datamodels.UploadedFile {
//	lid := ctx.Params().Get("lid")
//	log.Println(lid)
//	_files := LibraryFilesMap[lid]
//	if _files == nil {
////			return []uploadedFile{}
//		_files = utils.MkLibraryScanFeatures(configs.PublicDir + configs.LibraryDir + lid, lid)
//		LibraryFilesMap[lid] = _files
//	}
//	page := ctx.URLParam("page")
//	// log.Println(page)
//	pre_page := ctx.URLParam("pre_page")
//	// log.Println(pre_page)
//	if pre_page == "" {
//		pre_page = "50"
//	}
//	if page == "" {
//		page = "1"
//	}
//	_pre_page, err := strconv.Atoi(pre_page)
//	_page, err := strconv.Atoi(page)
//	begin := (_page - 1) * _pre_page
//	end := (_page) * _pre_page
//	size := len(_files.Items)
//	// log.Println(size)
//	if begin > size {
//		begin = size
//	}
//	if end > size {
//		end = size
//	}
//	if err != nil {
//		log.Println(err)
//	}
//	length := end - begin
//	// log.Println(end)
//	// log.Println(begin)
//	// log.Println(length)
//	slice1 := make([]datamodels.UploadedFile, length)
//	for index := begin; index < end; index++ {
//		slice1[index-begin] = _files.Items[index]
//	}
//	return slice1
//}


//获取人员文件数据
func GetUserFileByFileAlias(ctx iris.Context) {
	cid := ctx.Params().Get("cid")
	log.Println("cid =", cid)
	lid := ctx.Params().Get("lid")
	log.Println("lid =", lid)
	haveId, _, featureId := utils.GetCorrectIdByFileAlias(cid, LibraryFilesMap, lid)
	if haveId {
		audo := ctx.URLParam("audo")
		log.Println("audo =", audo)
		if(audo == "") {
//			ctx.JSON(&datamodels.ResBody{Code: 200, Msg: featureId})
//			http://192.168.0.96:8019/eye/rest/library/Test/personnels/%E9%9F%A9%E6%95%AC%E8%B5%9B
//			http://192.168.0.96:8019/eye/public/library/Test/15/15118dd8bab4dacb0247318cf7c04f78cef56917.jpg
//			ctx.Redirect("http://" + configs.Host + ":" + configs.HostPort + configs.Root + "/public/library/" + lid + "/" + string([]byte(featureId)[:2]) + "/" + featureId)
			ctx.Redirect(configs.Root + "/public/library/" + lid + "/" + string([]byte(featureId)[:2]) + "/cropping_" + featureId)
		} else {
			ctx.Redirect(configs.Root + "/public/library/" + lid + "/" + string([]byte(featureId)[:2]) + "/" + featureId + ".wav")
		}
	}
}

//删除人员特征相关文件
func DeleteUserFile(ctx iris.Context) {
	cid := ctx.Params().Get("cid")
	log.Println(cid)
	lid := ctx.Params().Get("lid")
	log.Println(lid)
	haveId, identityId, featureId := utils.GetCorrectId(cid, LibraryFilesMap, lid)
	if haveId {
		DeleteFaceMatch(identityId, featureId, lid)//GRPC删除
		utils.DeleteFiles(cid, lid)//文件删除
		repositories.DelPersonnel(utils.GenerateFileId(cid), lid)//数据库删除
		_files := LibraryFilesMap[lid]
		_files.Del(cid);
		ctx.JSON(&datamodels.ResBody{Code: 200, Msg: ""})
	}
}

//清空人员特征相关文件
func ClearUserFile(ctx iris.Context) {
	all := ctx.GetHeader("all")
	log.Println(all)
	lid := ctx.Params().Get("lid")
	log.Println(lid)
	_files := LibraryFilesMap[lid]
	if all != "" {
		if all == configs.SecretKey {
			_items := _files.Items
			length := len(_items)
			cids := make([]string, length)
			for index := 0; index < length; index++ {
				_item := _items[index]
				cid :=_item.FileId
				cids[index] = cid
			}
			for index := 0; index < length; index++ {
				log.Println("index=")
				log.Println(index)
				cid := cids[index]
				haveId, identityId, featureId := utils.GetCorrectId(cid, LibraryFilesMap, lid)
				if haveId {
					DeleteFaceMatch(identityId, featureId, lid)//GRPC删除
					utils.DeleteFiles(featureId, lid)//文件删除
//					repositories.DelPersonnel(utils.GenerateFileId(featureId), lid)//数据库删除
					_files.Del(cid);
				}
			}
			repositories.ClearLibraryPersonnel(lid)
			ctx.JSON(&datamodels.ResBody{Code: 200, Msg: ""})
		} else {
			ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "Clearing the comparison library failed."})
		}
	} else {//清空
		var cids []datamodels.IdOption
		err := ctx.ReadJSON(&cids)
		if err != nil {
			log.Println(err)
		}
		log.Println(cids)
		length := len(cids)
		for index := 0; index < length; index++ {
			cid1 := cids[index].IdentityId + ":" + cids[index].FeatureId
//			log.Println(cid1)
//			haveId, identityId, featureId := utils.GetId(cid1)
//			haveId, identityId, featureId := utils.GetVerificationId(cid1, LibraryFilesMap, lid)
			haveId, identityId, featureId := utils.GetCorrectId(cid1, LibraryFilesMap, lid)
			log.Println(identityId)
			log.Println(featureId)
			if haveId {
				DeleteFaceMatch(identityId, featureId, lid)//GRPC删除
				utils.DeleteFiles(featureId, lid)//文件删除
				repositories.DelPersonnel(utils.GenerateFileId(featureId), lid)//数据库删除
				_files.Del(featureId);
			}
		}
		ctx.JSON(&datamodels.ResBody{Code: 200, Msg: ""})
	}
}

//人员添加或更新
func PersonnelsInsertOrUpdate(ctx iris.Context) {
	var personnelForms []datamodels.PersonnelForm
	err := ctx.ReadJSON(&personnelForms)
	if err != nil {
		log.Println("PersonnelsInsertOrUpdate err: %v", err)
		ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "Not JSON or data format is incorrect."})
		return
	}
	size := len(personnelForms)
	var _ctx iris.Context
//	if size == 1 {//全部走list，關閉這個口
//		_ctx = ctx
//	}
	personnelInfos := make([]datamodels.PersonnelInfo, size)
	lid := ""
	if ctx != nil {
		lid = ctx.Params().Get("lid")
	}
	log.Println("lid=", lid)
	for index := 0; index < size; index++ {
		pf := personnelForms[index]
		if len(pf.IdentityId) > 60 {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "IdentityId field length is limited to 60 characters"})
			return
		}
		if len(pf.FeatureId) > 60 {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "FeatureId field length is limited to 60 characters"})
			return
		}
		if len(pf.Name) > 60 {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Name field length is limited to 60 characters"})
			return
		}
		if len(pf.Info) > 120 {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Info field length is limited to 120 characters"})
			return
		}
		if len(pf.Feature) > 8500 {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Feature field length is limited to 8500 characters"})
			return
		}
		if pf.UpdateTime != 0 && (pf.UpdateTime < utils.ToTime("2006-01-02 15:04:05", "2006-01-02 15:04:05") ||  pf.UpdateTime > utils.ToTime("2206-01-02 15:04:05", "2006-01-02 15:04:05")) {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Please enter the UpdateTime"})
			return
		}
		if pf.ExpireTime != 0 && (pf.ExpireTime < utils.ToTime("2006-01-02 15:04:05", "2006-01-02 15:04:05") ||  pf.UpdateTime > utils.ToTime("2206-01-02 15:04:05", "2006-01-02 15:04:05")) {
			ctx.JSON(datamodels.ResBody{Code: 500, Msg: "Please enter the ExpireTime"})
			return
		}
	}
	for index := 0; index < size; index++ {
		pf := personnelForms[index]
		if pf.Feature != "" {
			var pictureExif datamodels.PictureExif
			success, personnelInfo := FeatureExec(_ctx, lid, pf.Feature, pictureExif, pf.Name + configs.Separator + pf.IdentityId, pf.Info, pf.FeatureId, 0, pf.UpdateTime, pf.ExpireTime, pf.Threshold, 0, "", "", false)
//                           特征base64 图片信息json 文件名  文件id 文件大小  特征修改时间  特征过期时间  阈值 比对id 后台管理接口开关
			if success {
				personnelInfos[index] = personnelInfo
			}
		} else {
			//转换对象
			uf := utils.PersonnelForm_UploadedFile(pf)
			fileAlias := uf.FileAlias
			if fileAlias == configs.Separator {
				fileAlias = uf.FileId
			}
			log.Println(fileAlias)
//			_fileSuffix := utils.GetFileSuffix(personnelFrom.ImageType)
//			log.Println(_fileSuffix)
			var save bool
			var msg string
			if pf.ImageType == "jpg" {
				save, msg = utils.Base64toJpg(pf.Image, configs.TmpDir + fileAlias + "." + pf.ImageType)//test.jpg
			} else if pf.ImageType == "png" {
				save, msg = utils.Base64toPng(pf.Image, configs.TmpDir + fileAlias + "." + pf.ImageType)//test.png
			} else if pf.ImageType == "jpeg" {
				save, msg = utils.Base64toJpg(pf.Image, configs.TmpDir + fileAlias + "." + pf.ImageType)//test.jpeg
			} else if pf.ImageType == "bmp" {
				save, msg = utils.Base64toBmp(pf.Image, configs.TmpDir + fileAlias + "." + pf.ImageType)//test.jpeg
			} else {
				save = false
				msg = "No specified image type or image type is not supported"
			}
			log.Println(save)
			if save {
				success, personnelInfo := ImageTesting(_ctx, lid, fileAlias + "." + pf.ImageType, uf.FileInfo, uf.FileId, uf.FileSize, uf.FileModtime, uf.ExpireTime, pf.Threshold, pf.TopN, pf.CheckLive, "", "", false, 0)
				if success {
					personnelInfos[index] = personnelInfo
				}
			} else {
				ctx.JSON(&datamodels.ResBody{Code: 500, Msg: msg})
				return
			}
		}
	}
	if size > 0 {
//		ctx.JSON(&datamodels.ResBody{Code: 200, Msg: ""})
		ctx.JSON(&datamodels.PersonnelInfosBody{Code: 200, Msg: "", Data: personnelInfos})
	} else if size == 0 {
		ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "size = 0"})
	}
}

//人员比较
func PersonnelsComparison(ctx iris.Context, cid string) {
	var pf datamodels.PersonnelForm
	err := ctx.ReadJSON(&pf)
	if err != nil {
		log.Println("PersonnelsInsertOrUpdate err: %v", err)
		ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "Not JSON or data format is incorrect."})
		return
	}
	lid := ""
	if ctx != nil {
		lid = ctx.Params().Get("lid")
	}
	log.Println("lid=", lid)
	if pf.Feature != "" {
		var pictureExif datamodels.PictureExif
		FeatureExec(ctx, lid, pf.Feature, pictureExif, pf.Name + configs.Separator + pf.IdentityId, "", pf.FeatureId, 0, pf.UpdateTime, pf.ExpireTime, pf.Threshold, pf.TopN, cid, "", false)
//                           特征base64 图片信息json 文件名  文件id 文件大小  特征修改时间  特征过期时间  阈值 比对id 后台管理接口开关
	} else {
		//转换对象
		uf := utils.PersonnelForm_UploadedFile(pf)
		fileAlias := uf.FileAlias
		if fileAlias == configs.Separator {
			fileAlias = uf.FileId
		}
		log.Println("fileAlias =", fileAlias)
		save, msg := utils.SaveBase64ImageToTmp(pf.ImageType, pf.Image, fileAlias)
		if save {
			ImageTesting(ctx, lid, fileAlias + "." + pf.ImageType, "", uf.FileId, uf.FileSize, uf.FileModtime, uf.ExpireTime, pf.Threshold, pf.TopN, pf.CheckLive, cid, "", false, 0)
		} else {
			ctx.JSON(&datamodels.ResBody{Code: 500, Msg: msg})
		}
	}
}

//图片特征比较
func ImageFeatureComparison(ctx iris.Context) {
	var pf datamodels.ImageFeatureForm
	err := ctx.ReadJSON(&pf)
	if err != nil {
		log.Println("PersonnelsInsertOrUpdate err: %v", err)
		ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "Not JSON or data format is incorrect."})
		return
	}
//	if pf.Feature != "" {
//		var pictureExif datamodels.PictureExif
//		FeatureExec(ctx, lid, pf.Feature, pictureExif, pf.Name + configs.Separator + pf.IdentityId, pf.FeatureId, 0, pf.UpdateTime, pf.ExpireTime, pf.Threshold, cid, "", false)
////                           特征base64 图片信息json 文件名  文件id 文件大小  特征修改时间  特征过期时间  阈值 比对id
//	} else {
		//转换对象
		fileAliasA := uuid.Must(uuid.NewV4()).String()
		saveA, msgA := utils.SaveBase64ImageToTmp(pf.ImageTypeA, pf.ImageA, fileAliasA)
		log.Println("saveA =", saveA)
		log.Println("msgA =", msgA)
		fileAliasB := uuid.Must(uuid.NewV4()).String()
		saveB, msgB := utils.SaveBase64ImageToTmp(pf.ImageTypeB, pf.ImageB, fileAliasB)
		log.Println("saveB =", saveB)
		log.Println("msgB =", msgB)
		if saveA && saveB {
//			ImageTesting(ctx, lid, fileAlias + "." + pf.ImageType, uf.FileId, uf.FileSize, uf.FileModtime, uf.ExpireTime, pf.Threshold, pf.CheckLive, cid, "", false, 0)
			ok1, personnelInfo1, pictureExif1, featureStr1 := ExtractingFeatures(ctx, "", fileAliasA + "." + pf.ImageTypeA, "", "", 0)
			ok2, personnelInfo2, pictureExif2, featureStr2 := ExtractingFeatures(ctx, "", fileAliasB + "." + pf.ImageTypeB, "", "", 0)
			//																													库名 文件名 文件ID 比对ID 文件路径 人脸序号
			if ok1 && ok2 {
				log.Println("personnelInfo1 =", personnelInfo1)
				log.Println("pictureExif1 =", pictureExif1)
				log.Println("featureStr1 =", featureStr1)
				log.Println("personnelInfo2 =", personnelInfo2)
				log.Println("pictureExif2 =", pictureExif2)
				log.Println("featureStr2 =", featureStr2)
				//比对服务
				faceMatchConn, faceMatchConnErr := grpc.Dial(configs.FaceMatchAddress, grpc.WithInsecure())
				defer faceMatchConn.Close()
				if faceMatchConnErr != nil {
					log.Println("did not connect: %v", faceMatchConnErr)
					return
				}
				fmsc := pb.NewFaceMatchServiceClient(faceMatchConn)
				//用算法比较特征向量
				faceFeature1 := &pb.FaceFeature{Value: []byte(featureStr1), Version: configs.AlgoVersion}
				faceFeature2 := &pb.FaceFeature{Value: []byte(featureStr2), Version: configs.AlgoVersion}
				requestor := pb.Requestor{CompanyId: "", ApplicationId: "", DeviceId: "", AccessCode: "", UserId: "", Password: ""}
				fmsr := pb.FeatureMatchScoreRequest{FaceFeature_1: faceFeature1, FaceFeature_2: faceFeature2, Requestor: &requestor}
				_ctx, cancel := context.WithTimeout(context.Background(), configs.ConnTimeout * time.Second)
				defer cancel()
				mis, misErr := fmsc.GetMatchScore(_ctx, &fmsr)
				if misErr != nil {
					log.Println("misErr =", misErr)
					ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "Comparison failure."})
					return
				} else {
					log.Println("mis =", mis)
				}
				ctx.JSON(&datamodels.OnebyoneResBody{Code: 200, Msg: "", MatchScore: mis.MatchScore})
				//保存比对结果到日志中
				matchData := "{\"feature_id_a\": \"" + fileAliasA + "." + pf.ImageTypeA +"\", \"feature_id_b\": \"" + fileAliasB + "." + pf.ImageTypeB +"\",\"match_score\": " + strconv.FormatFloat(mis.MatchScore, 'f', 6, 64)  + ", \"feature_a\": \"" + featureStr1 +"\", \"feature_b\": \"" + featureStr2 +"\"}"
				comparisonHistory := datamodels.ComparisonHistory{Personnel: datamodels.Personnel{
					IdentityId : fileAliasA + "." + pf.ImageTypeA,
					FeatureId : "",
					Name : "1v1P",
					Feature : featureStr1,
					AlgoVersion : configs.AlgoVersion,
					LibraryId : "",
				}, MatchData: matchData}
				repositories.AddUdpComparisonHistory(comparisonHistory)//增加到数据库
			} else {
				ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "No comparison result."})
			}
		} else {
			ctx.JSON(&datamodels.ResBody{Code: 500, Msg: msgA + msgB})
		}
//	}
}

//获取用户文件信息
func GetUserFile(ctx iris.Context) {
	cid := ctx.Params().Get("cid")
	log.Println("cid =", cid)
	lid := ctx.Params().Get("lid")
	log.Println("lid =", lid)
	haveId, _, featureId := utils.GetCorrectId(cid, LibraryFilesMap, lid)
	if haveId {
		have, personnel := utils.GetPersonnel(LibraryFilesMap, lid, featureId)
		if have {
			log.Println("have", personnel)
			ctx.JSON(&datamodels.PersonnelBody{Code: 200, Msg: "", Data: personnel})
		} else {
			log.Println("The user was not found")
			ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "The user was not found"})
		}
	} else {
		ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "Please confirm that you entered the correct identityId: FEATUREID"})
	}
}
