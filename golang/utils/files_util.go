// file: utils/files_util.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * 文件列表工具类
 */

package utils

import (
	"sync"
	"os"
	"log"
//	"fmt"
	"strings"
	"path"
	"sort"
//	"reflect"
    "regexp"
	"path/filepath"
	"net/url"
	"io/ioutil"
	"encoding/json"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
	"../configs"
	"../datamodels"
	pb "google.golang.org/grpc/eyecool/protos"
)


// >>结构体<<
type UploadedFiles struct {
	Dir   string
	Items []datamodels.UploadedFile
	mu    sync.RWMutex // slices are safe but RWMutex is a good practise for you.
}

// >>排序接口<<
//定义interface{},并实现sort.Interface接口的三个方法
func (u UploadedFiles) Len() int {
	return len(u.Items)
}
func (u UploadedFiles) Swap(i, j int) {
	u.Items[i], u.Items[j] = u.Items[j], u.Items[i]
}
func (u UploadedFiles) Less(i, j int) bool {
	return u.Items[i].FileModtime < u.Items[j].FileModtime
}
// >>常用方法<<
//按时间排序文件
func (u *UploadedFiles) Sort() {
	if !sort.IsSorted(u) {
//		log.Println("UploadedFiles.Sort() begin")
		sort.Sort(u)
//		log.Println("UploadedFiles.Sort() end")
	}
}
//搜索文件算法json文件
func (f *UploadedFiles) ScanFeatures(dir string, library string, addUdpPersonnel func(datamodels.Personnel) int64) {
	f.Dir = dir
	log.Println("f.Dir", f.Dir)
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
	index := 1
//	limit = make(chan int, configs.Multithreading)
	filepath.Walk(dir, func(path string, fileInfo os.FileInfo, err error) error {
		// if it's directory or a thumbnail we saved earlier, skip it.
		if fileInfo.IsDir() || strings.HasPrefix(fileInfo.Name(), "thumbnail_") {
			return nil
		}
		infoName := fileInfo.Name()
//		if !(strings.HasSuffix(infoName, ".info.json") || strings.HasSuffix(infoName, "." + configs.AlgoVersion + ".json") || strings.HasSuffix(infoName, "_")) {
		if strings.HasSuffix(infoName, "." + configs.AlgoVersion + ".json") {
//			limit <- 1
//			go func(path string, fileInfo os.FileInfo) {
				log.Println("Push FaceMatch", index)
				index++
				name, info := GetFileName(path[0 : len(path) - len("." + configs.AlgoVersion + ".json")])
	//			log.Println("name =", name)
				infoName = infoName[0 : len(infoName) - len("." + configs.AlgoVersion + ".json")]
	//			log.Println("infoName =", infoName)
				fileDir := GetFileDir(infoName)
				b, err := ioutil.ReadFile(dir + fileDir + infoName + "." + configs.AlgoVersion + ".json")//TODO 启动没有特征的重新提取特征
				if err != nil {
					log.Println(err)
				}
				var featureInfo datamodels.FeatureInfo
			    json.Unmarshal(b, &featureInfo)
	//			str := string(b)
				str := featureInfo.Feature
	//			log.Println("-----------------------------Load files completion------------------------------")
	//			log.Println(str)
	//			log.Println("fileInfo.ModTime()")
	//			log.Println(fileInfo.ModTime().UnixNano()/1e6)
	//			log.Println(reflect.TypeOf(fileInfo.ModTime().UnixNano()/1e6))
	//			modtime := fileInfo.ModTime().Format("2006-01-02 15:04:05")
	//			modtime := fileInfo.ModTime().UnixNano()/1e6
				modTime := featureInfo.UpdateTime
				expTime := featureInfo.ExpireTime
	//			log.Println(modtime)
	//			log.Println(reflect.TypeOf(modtime))
				uploadedFile := f.Add(infoName, str, fileInfo.Size(), modTime, expTime, library, name, info)//恢复
				if configs.DbSave == "1" { 
					personnel := UploadedFile_Personnel(uploadedFile)
					addUdpPersonnel(personnel)
				}
				if configs.SendMatch == "1" {
					personnelInfo := UploadedFile_PersonnelInfo(uploadedFile)
					ff := pb.FaceFeature{Value: []byte(featureInfo.Feature), Version: configs.AlgoVersion}
					requestor := pb.Requestor{CompanyId: "", ApplicationId: "", DeviceId: "", AccessCode: "", UserId: "", Password: ""}
					fl := pb.FeatureLibrary{LibraryName: library}
		//			log.Println("infoName========================" + infoName)
		//			log.Println(&ff)
		//			log.Println(fl)
		//			log.Println(requestor)
		//			identityId := GenerateFileId(infoName)//30b43bfdef42dd7c1c2c57250091e2331bcc0f61.jpg
					identityId := personnelInfo.IdentityId
					featureId := personnelInfo.FeatureId//utils.GenerateFileId(newFileName)
					identityName := personnelInfo.Name
					fu := pb.FeatureUpdate{IdentityId: identityId, FeatureId: featureId, IdentityName: identityName, FaceFeature: &ff, FeatureLibrary: &fl, Requestor: &requestor}
					ufcStream.Send(&fu)
	//				<-limit
				}
//			}(path, fileInfo)
		}
		return nil
	})
	ufcStream.CloseAndRecv()
	f.Sort()
	log.Println("----------------------------- faceMatchConn close ------------------------------")
}
// add the file's Name and Size to the uploadedFiles memory list
func (f *UploadedFiles) Add(fileId string, feature string, fileSize int64, fileModtime int64, expireTime int64, libraryId string, fileAlias string, fileInfo string) datamodels.UploadedFile {
	have := false
	index := 0
	for i := 0; i < len(f.Items); i++ {
		if f.Items[i].FileId == fileId {
			have = true
			index = i
			break
		}
	}
	// 获取文件名后缀
	fileSuffix := path.Ext(fileId) //获取文件后缀
//	log.Println("fileSuffix =", fileSuffix)
	_fileAlias := string([]byte(fileId)[:len(fileId) - len(fileSuffix)])
//	log.Println("_fileAlias =", _fileAlias)
	_fileSuffix := GetFileSuffix(fileSuffix)
	_fileId := _fileAlias + _fileSuffix
	uf := datamodels.UploadedFile {
		FileId:    		_fileId,
		Feature: 		feature,
		FileSize:   	fileSize,
		FileModtime: 	fileModtime,
		ExpireTime: 	expireTime,
		LibraryId: 		libraryId,
		FileAlias:  	fileAlias,
		FileInfo:  	fileInfo,
	}
	f.mu.Lock()
	if have {
		f.Items=append(f.Items[:index],f.Items[index+1:]...)
	}
	f.Items = append(f.Items, uf)
	f.mu.Unlock()
	f.Sort()
	return uf
}
// add the file's Name and Size to the uploadedFiles memory list
func (f *UploadedFiles) Gen(fileId string, feature string, fileSize int64, fileModtime int64, expireTime int64, libraryId string, fileAlias string, fileInfo string) datamodels.UploadedFile {
	// 获取文件名后缀
	fileSuffix := path.Ext(fileId) //获取文件后缀
	log.Println("fileSuffix =", fileSuffix)
	_fileAlias := string([]byte(fileId)[:len(fileId) - len(fileSuffix)])
	log.Println("_fileAlias =", _fileAlias)
	_fileSuffix := GetFileSuffix(fileSuffix)
	_fileId := _fileAlias + _fileSuffix
	uf := datamodels.UploadedFile {
		FileId:    		_fileId,
		Feature: 		feature,
		FileSize:   	fileSize,
		FileModtime: 	fileModtime,
		ExpireTime: 	expireTime,
		LibraryId: 		libraryId,
		FileAlias:  	fileAlias,
		FileInfo:  	fileInfo,
	}
	return uf
}
// 获取人员id
func (f *UploadedFiles) GetUploadedFile(fileId string) (bool, datamodels.UploadedFile) {
	var uploadedFile datamodels.UploadedFile
	for i := 0; i < len(f.Items); i++ {
		_fileId,_ := url.QueryUnescape(f.Items[i].FileId) // 兼容性查找
		if f.Items[i].FileId == fileId || _fileId == fileId {
			uploadedFile = f.Items[i]
			return true, uploadedFile
		}
	}
	return false, uploadedFile
}
// 获取人员id
func (f *UploadedFiles) GetUploadedFileByFileAlias(fileAlias string) (bool, datamodels.UploadedFile) {
	var uploadedFile datamodels.UploadedFile
	for i := 0; i < len(f.Items); i++ {
//		log.Println("f.Items[i].FileAlias =", f.Items[i].FileAlias)
//		log.Println("fileAlias =", fileAlias)
//		if f.Items[i].FileAlias == fileAlias {
		if f.Items[i].FileAlias == fileAlias || strings.HasSuffix(f.Items[i].FileAlias, "_" + fileAlias) {//TODO 逻辑不严谨,比如人id有下划线将出乱
			log.Println("fileAlias =", fileAlias)
			uploadedFile = f.Items[i]
			return true, uploadedFile
		}
	}
	return false, uploadedFile
}
// del the file's Name and Size to the uploadedFiles memory list
func (f *UploadedFiles) Del(fileId string) {
	have := false
	index := 0
	for i := 0; i < len(f.Items); i++ {
		_fileId,_ := url.QueryUnescape(f.Items[i].FileId) // 兼容性删除
		if f.Items[i].FileId == fileId || _fileId == fileId {
			have = true
			index = i
			break
		}
	}
	if have {
		f.mu.Lock()
	    f.Items=append(f.Items[:index],f.Items[index+1:]...)
	    f.mu.Unlock()
	    log.Println("after delete")
	}
}
// 缩略图
// create thumbnail 100x100
// and save that to the ./public/uploads/thumbnail_$FILENAME
func (f *UploadedFiles) CreateThumbnail(uf datamodels.UploadedFile, fileId string, pictureExif datamodels.PictureExif, text string) {
	log.Println("fileId =", fileId) 
//	faceJsonByt1, er := json.Marshal(pictureExif)
//	if er == nil {
//		log.Println("faceJsonStr =", string(faceJsonByt1))
//		//: faceJsonStr = {"faceInfos":[{"blurType":"3","headPosi":"[-14,-64,8]","rcItem":"[0.40390626,0.36875,0.13203125,0.17604166]"}],"pin":"04ef5d7758916a5e84b294a5417fc662d22a1d29","faceSeq":0}
//	}
	fileDir := GetFileDir(fileId)
	log.Println("fileDir =", fileDir)
	log.Println("f.Dir + fileDir =", f.Dir + fileDir)
	imagePath := path.Join(f.Dir + fileDir, fileId)
	log.Println("imagePath =", imagePath)
	//按照人脸框截取头像
	croppingPath := f.Dir + fileDir + "cropping_" + fileId
	log.Println("croppingPath =", croppingPath)
	rcItems := pictureExif.FaceInfos[pictureExif.FaceSeq].RcItem
	log.Println("rcItems =", rcItems)
	var rcItem [4]float64
	json.Unmarshal([]byte(rcItems), &rcItem)
	log.Println("rcItem =", rcItem)
	ClipFile(imagePath, croppingPath, rcItem, configs.Quality, configs.Ratio)
	//保存缩略图
	name := strings.ToLower(fileId)
	log.Println("name =", name)
	thumbnailPath := f.Dir + fileDir + "thumbnail_" + fileId
	log.Println("thumbnailPath =", thumbnailPath)
	SaveThumbnail(name, imagePath, thumbnailPath)
	// and so on... you got the point, this code can be simplify, as a practise.
	faceJsonByt, er := json.Marshal(pictureExif)
	if er != nil {
		log.Println(er)
		return
	}
	artist := string(faceJsonByt)
	UpdateArtist(thumbnailPath, artist)
	if configs.TTS != "" {
		var digitsRegexp = regexp.MustCompile(`[^\x00-\xff]+`)
	    submatch := digitsRegexp.FindStringSubmatch(text)
	    if len(submatch) > 0 {
			data := HttpGet("http://192.168.0.69:8080/?text=" + url.QueryEscape(submatch[0]))
			if len(data) > 0 {
//			    data := []byte("hello\ngo\n")
				wavPath := f.Dir + fileDir + fileId + ".wav"
			    err := ioutil.WriteFile(wavPath, data, 0644)
			    if err != nil {
			        log.Println(err)
					return
			    }
			    log.Println(text + " wav save to " + wavPath)
			}
	    }
	}
	
	
}
