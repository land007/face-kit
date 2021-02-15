// file: utils/file_util.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * 文件工具类
 */

package utils

import (
	"os"
	"log"
//	"fmt"
	"strings"
	"path"
	"time"
	"net/url"
	"path/filepath"
	"io/ioutil"
	"../datamodels"
	"../configs"
)

func If(condition bool, trueVal, falseVal interface{}) interface{} {
    if condition {
        return trueVal
    }
    return falseVal
}

// >>对象转换器<<
//转换文件对象到用户显示对象
func UploadedFile_PersonnelInfo(uf datamodels.UploadedFile) datamodels.PersonnelInfo {
	var name string
	var identityId string
	fileAlias := strings.Split(uf.FileAlias, configs.Separator)
	length := len(fileAlias)
	if length == 1 {
		name = ""
		identityId = fileAlias[0]
	} else if(length == 2) {
		name = fileAlias[0]
		identityId = fileAlias[1]
	} else {
		name = fileAlias[0]
		identityId = string([]byte(uf.FileAlias)[len(name + configs.Separator): len(uf.FileAlias)])
	}
	info := uf.FileInfo;
	if info == "" {
		info = "{}";
	}
	pi := datamodels.PersonnelInfo {
		IdentityId:    identityId,
		FeatureId:    uf.FileId,
		Name:  name,
		Info:  info,
		FileSize:  uf.FileSize,
		LibraryId: uf.LibraryId,
		Feature: uf.Feature,
		UpdateTime: uf.FileModtime,
	}
	return pi
}
//转换文件列表对象到用户列表显示对象
func UploadedFiles_PersonnelInfos(ufs []datamodels.UploadedFile) []datamodels.PersonnelInfo {
	size := len(ufs)
	pis := make([]datamodels.PersonnelInfo, size)
	for i := 0; i < size; i++ {
		pis[i] = UploadedFile_PersonnelInfo(ufs[i])
	}
	return pis
}
//转换文件对象到用户数据库对象
func UploadedFile_Personnel(uf datamodels.UploadedFile) datamodels.Personnel {
	var imageUrl string
	if uf.LibraryId == "" {
//		imageUrl = "http://" + configs.Host + ":" + configs.HostPort + configs.Root + "/public/update/" + GetFileDir(uf.FileId) + ReductionFileId(uf.FileId)
		imageUrl = configs.Root + "/public/update/" + GetFileDir(uf.FileId) + ReductionFileId(uf.FileId)
	} else {
//		imageUrl = "http://" + configs.Host + ":" + configs.HostPort + configs.Root + "/public/library/" + uf.LibraryId + "/" + GetFileDir(uf.FileId) + ReductionFileId(uf.FileId)
		imageUrl = configs.Root + "/public/library/" + uf.LibraryId + "/" + GetFileDir(uf.FileId) + ReductionFileId(uf.FileId)
	}
	var name string
	var identityId string
	fileAlias := strings.Split(uf.FileAlias, configs.Separator)
	length := len(fileAlias)
	if length == 1 {
		name = ""
		identityId = fileAlias[0]
	} else if(length == 2) {
		name = fileAlias[0]
		identityId = fileAlias[1]
	} else {
		name = fileAlias[0]
		identityId = string([]byte(uf.FileAlias)[len(name + configs.Separator): len(uf.FileAlias)])
	}
	info := uf.FileInfo;
	if info == "" {
		info = "{}";
	}
	pi := datamodels.Personnel {
		IdentityId:    identityId,
		FeatureId:    uf.FileId,
		Name:  name,
		Info:  info,
		FileSize:  uf.FileSize,
		LibraryId: uf.LibraryId,
		Feature: uf.Feature,
		UpdateTime: uf.FileModtime,
		ExpireTime: uf.ExpireTime,
		ImageUrl: imageUrl,
		AlgoVersion: configs.AlgoVersion,
	}
	return pi
}
//转换文件列表对象到用户列表数据库对象
func UploadedFiles_Personnels(ufs []datamodels.UploadedFile) []datamodels.Personnel {
	size := len(ufs)
	pis := make([]datamodels.Personnel, size)
	for i := 0; i < size; i++ {
		pis[i] = UploadedFile_Personnel(ufs[i])
	}
	return pis
}
//转换数据库对象到文件对象
func Personnel_UploadedFile(p datamodels.Personnel) datamodels.UploadedFile {
	uf := datamodels.UploadedFile {
		FileId:    p.FeatureId,
		FileAlias:  p.Name + configs.Separator + p.IdentityId,
		FileInfo:  p.Info,
		FileSize:  p.FileSize,
		FileModtime: p.UpdateTime,
		ExpireTime: p.ExpireTime,
		Feature: p.Feature,
		LibraryId: p.LibraryId,
	}
	return uf
}
//转换表单对象到文件对象
func PersonnelForm_UploadedFile(p datamodels.PersonnelForm) datamodels.UploadedFile {
	uf := datamodels.UploadedFile {
		FileId:    p.FeatureId,
		FileAlias:  p.Name + configs.Separator + p.IdentityId,
		FileInfo:  p.Info,
		FileSize:  p.FileSize,
		FileModtime: p.UpdateTime,
		ExpireTime: p.ExpireTime,
		Feature: p.Feature,
		LibraryId: p.LibraryId,
	}
	return uf
}
//转换数据库对象列表到文件对象列表
func Personnels_UploadedFiles(ps []datamodels.Personnel) []datamodels.UploadedFile {
	size := len(ps)
	ufs := make([]datamodels.UploadedFile, size)
	for i := 0; i < size; i++ {
		ufs[i] = Personnel_UploadedFile(ps[i])
	}
	return ufs
}
// >>常用方法<<
// 获取文件对象
func GetUploadedFile(libraryFilesMap map[string]*UploadedFiles ,library string, fileId string) (bool, datamodels.UploadedFile) {
	var uploadedFile datamodels.UploadedFile
	files := libraryFilesMap[library]
	if files != nil {
		return files.GetUploadedFile(fileId)
	}
	return false, uploadedFile
}
//搜索特征文件
func ScanUploads(dir string) []datamodels.FileInfo {
	files := make([]datamodels.FileInfo, 0)
	houzhui := "." + configs.OldAlgoVersion + ".json"
	log.Println(houzhui)
	filepath.Walk(dir, func(_path string, fileInfo os.FileInfo, err error) error {
		infoName := fileInfo.Name()
		if strings.HasSuffix(infoName, houzhui) {
//			log.Println(infoName)
			imagePath := _path[0 : len(_path) - len("." + configs.OldAlgoVersion + ".json")]
			fileSuffix := path.Ext(imagePath)
			name, info := GetFileName(imagePath) 
//			log.Println(name)
			file := datamodels.FileInfo {
				FileName:    		name + fileSuffix,
				FileInfo:    		info,
				FileSize: 		fileInfo.Size(),
				FilePath:   	imagePath,
			}
			files = append(files, file)
//			log.Println(files)
		}
		return nil
	})
	return files
}
//搜索文件图像文件
func ScanImages(dir string) []datamodels.FileInfo {
	files := make([]datamodels.FileInfo, 0)
	filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		infoName := info.Name()
		if ((infoName != ".jpg" && infoName != ".png") && (strings.HasSuffix(infoName, ".jpg") || strings.HasSuffix(infoName, ".png") || strings.HasSuffix(infoName, ".bmp"))) {
			file := datamodels.FileInfo {
				FileName:    		infoName,
				FileSize: 		info.Size(),
				FilePath:   	path,
			}
			files = append(files, file)
		}
		return nil
	})
	return files
}
//文件后缀名隐藏
func GetFileSuffix(fileSuffix string) string {
	_fileSuffix := ""
	if fileSuffix == "jpg" {
		_fileSuffix = "%2e%6a%70%67"
	} else if fileSuffix == "png" {
		_fileSuffix = "%2e%70%6e%67"
	} else if fileSuffix == "jpeg" {
		_fileSuffix = "%2e%6a%70%65%67"
	} else if fileSuffix == "bmp" {
		_fileSuffix = "%2e%62%6d%70"
	} else if fileSuffix == ".jpg" {
		_fileSuffix = "%2e%6a%70%67"
	} else if fileSuffix == ".png" {
		_fileSuffix = "%2e%70%6e%67"
	} else if fileSuffix == ".jpeg" {
		_fileSuffix = "%2e%6a%70%65%67"
	} else if fileSuffix == ".bmp" {
		_fileSuffix = "%2e%62%6d%70"
	}
	return _fileSuffix;
}
//获取文件ID
func GenerateFileId(filePath string) string {
	log.Println("filePath =", filePath)
	_fileSuffix := ""
	if strings.HasSuffix(filePath, ".jpg") {
		_fileSuffix = "%2e%6a%70%67"
	} else if strings.HasSuffix(filePath, ".png") {
		_fileSuffix = "%2e%70%6e%67"
	} else if strings.HasSuffix(filePath, ".jpeg") {
		_fileSuffix = "%2e%6a%70%65%67"
	} else if strings.HasSuffix(filePath, ".bmp") {
		_fileSuffix = "%2e%62%6d%70"
	}
	fileName := filePath
	if _fileSuffix != "" {
		fileName = string([]rune(filePath)[:len(filePath) - len(_fileSuffix)/3])
	}
	log.Println("fileName + _fileSuffix =", fileName + _fileSuffix)
	return fileName + _fileSuffix;
}
//还原文件ID
func ReductionFileId(filePath string) string {
	_fileSuffix := ""
	if strings.HasSuffix(filePath, "%2e%6a%70%67") {
		_fileSuffix = ".jpg"
	} else if strings.HasSuffix(filePath, "%2e%70%6e%67") {
		_fileSuffix = ".png"
	} else if strings.HasSuffix(filePath, "%2e%6a%70%65%67") {
		_fileSuffix = ".jpeg"
	} else if strings.HasSuffix(filePath, "%2e%62%6d%70") {
		_fileSuffix = ".bmp"
	}
	fileName := filePath
	if _fileSuffix != "" {
		fileName = string([]rune(filePath)[:len(filePath) - len(_fileSuffix)*3])
	}
//	log.Println("fileName + _fileSuffix =", fileName + _fileSuffix)
	return fileName + _fileSuffix;
}
// 删除文件组
func RemoveFiles(files []string) {
	for i := 0; i < len(files); i++ {
		err := os.Remove(files[i])
		if err != nil {
			log.Println(err)
		}
	}
}
//获取指定_名字_的文件和内容
func GetFileName(filepath string) (string, string) {
	_filepath,_ := url.QueryUnescape(filepath)
	dirs := FindNameFiles(_filepath)
	file := ""
	info := ""
	for i := 0; i < len(dirs); i++ {
//		println("dirs[i] = " + dirs[i])
		havename := strings.HasSuffix(dirs[i], "_")
		if havename && strings.Index(dirs[i], _filepath + "_") == 0 {
//			file = dirs[i]
			file = dirs[i][len(_filepath)+1:len(dirs[i])-1]
//		    println("file = " + file)
			b, err := ioutil.ReadFile(dirs[i])
		    if err != nil {
		        return "", ""
		    }
		    info = string(b)
//		    println("info = " + info)
		}
	}
	return file, info
}
//获取文件夹下所有文件
func FindAllFileInfos(filepath string) []os.FileInfo {
	_filepath,_ := url.QueryUnescape(filepath)
	dir := _filepath[0:strings.LastIndex(_filepath, "/")]
	files, _ := ioutil.ReadDir(dir)
	size := 0
	for _, f := range files {
		if !f.IsDir() {
			// log.Println(f.Name())
			size++
		}
	}
	dirs := make([]os.FileInfo, size)
	index := 0
	for _, f := range files {
		if !f.IsDir() {
			dirs[index] = f
			index++
		}
	}
	return dirs
}
//获取文件夹下所有文件名
func FindAllFileNames(filepath string) []string {
	_filepath,_ := url.QueryUnescape(filepath)
	dir := _filepath[0:strings.LastIndex(_filepath, "/")]
	files, _ := ioutil.ReadDir(dir)
	size := 0
	for _, f := range files {
		if !f.IsDir() {
			// log.Println(f.Name())
			size++
		}
	}
	dirs := make([]string, size)
	index := 0
	for _, f := range files {
		if !f.IsDir() {
			dirs[index] = dir + "/" + f.Name()
			index++
		}
	}
	return dirs
}
//获取具有相同开头的文件
func FindNameFiles(filepath string) []string {
	_filepath,_ := url.QueryUnescape(filepath)
//	log.Println(_filepath)
	dir := _filepath[0:strings.LastIndex(_filepath, "/")]
	files, _ := ioutil.ReadDir(dir)
	size := 0
	for _, f := range files {
		if !f.IsDir() {
			filePath := dir + "/" + f.Name()
			if strings.Index(filePath, _filepath) == 0 {
				size++
			}
		}
	}
	dirs := make([]string, size)
	index := 0
	for _, f := range files {
		if !f.IsDir() {
			filePath := dir + "/" + f.Name()
			if strings.Index(filePath, _filepath) == 0 {
				dirs[index] = filePath
				index++
			}
		}
	}
	return dirs
}
//string([]byte(cid)[:2]) + "/"
func GetFileDir(filename string) string {
	fileDir := string([]byte(filename)[:2]) + "/"
	return fileDir
}
//"uploads/" + string([]byte(cid)[:2]) + "/"
func GetFileRelativelyDir(library string, filename string) string {
	fileDir := GetFileDir(filename)
	fileRelativelyDir := ""
	if library != "" {
		fileRelativelyDir = (library + "/") + fileDir
	} else {
		fileRelativelyDir = fileDir
	}
	return fileRelativelyDir
}
//uploadsDir + "uploads/" + string([]byte(cid)[:2]) + "/"
func GetFilePathDir(library string, filename string) string {
	fileRelativelyDir := GetFileRelativelyDir(library, filename)
	filePathDir := ""
	if library != "" {
		filePathDir = configs.LibraryDir + fileRelativelyDir
	} else {
		filePathDir = configs.UploadsDir + fileRelativelyDir
	}
	return filePathDir
}
//publicDir + uploadsDir + "uploads/" + string([]byte(cid)[:2]) + "/" + filename
func GetFilePath(library string, filename string) string {
	_filename := ReductionFileId(filename)
	return configs.PublicDir + GetFilePathDir(library, _filename) + _filename
}
//获得文件组
func GetDirNames(dir string) []string {
	_files, _ := ioutil.ReadDir(dir)
	size := 0
	for _, f := range _files {
		if f.IsDir() {
			// log.Println(f.Name())
			size++
		}
	}
	dirs := make([]string, size)
	index := 0
	for _, f := range _files {
		if f.IsDir() {
			dirs[index] = f.Name()
			index++
		}
	}
	return dirs
}
//删除用户文件组
func DeleteFiles(cid string, lid string) {
	filePath := GetFilePath(lid, cid)
	log.Println("filePath")
	log.Println(filePath)
	files := FindNameFiles(filePath)
	log.Println("files")
	log.Println(files)
	RemoveFiles(files);
	log.Println("removeFiles ok")
}
//删除过期文件树
func RemoveTimeoutFileTree(dir string, timeout int64, suffixs []string) {
//	dir := "/public/tmp/"
//	timeout := int64(0.5*60*60*1000)
	now := time.Now()
//	log.Println("timeout =", timeout)
	size := len(suffixs)
	filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		// if it's directory or a thumbnail we saved earlier, skip it.
//		if info.IsDir() || strings.HasPrefix(info.Name(), "thumbnail_") {
//			return nil
//		}
		infoName := info.Name()
		if size > 0 {
		    	for j := 0; j < size; j++ {
				suffix := suffixs[j]
				if strings.HasSuffix(infoName, suffix) {
//					log.Println("infoName =", infoName)
//					log.Println("infoName =", info.ModTime())
					timecha := (now.UnixNano() - info.ModTime().UnixNano()) / 1000000
//					log.Println("timecha =", timecha)
					if timecha > timeout {
						log.Println("remove begin ",  infoName)
						err := os.Remove(dir + infoName)
						if err != nil {
							log.Println("remove err ",  err)
						}
						log.Println("remove ok ", infoName)
					}
				}
		    	}
		} else {
//			log.Println("infoName =", infoName)
//			log.Println("infoName =", info.ModTime())
			timecha := (now.UnixNano() - info.ModTime().UnixNano()) / 1000000
//			log.Println("timecha =", timecha)
			if timecha > timeout {
				log.Println("remove begin ",  infoName)
				err := os.Remove(dir + infoName)
				if err != nil {
					log.Println("remove err ",  err)
				}
				log.Println("remove ok ", infoName)
			}
		}
		return nil
	})
}
//删除过期文件
func RemoveTimeoutFile(dir string, timeout int64, suffixs []string) {
//	log.Println("dir =", dir)
//	dir := "/public/tmp/"
//	timeout := int64(0.5*60*60*1000)
	now := time.Now()
//	log.Println("timeout =", timeout)
    infos := FindAllFileInfos(dir)
    size := len(suffixs)
    for i := 0; i < len(infos); i++ {
	    	info := infos[i]
	    	infoName := info.Name()
	    	if size > 0 {
		    	for j := 0; j < size; j++ {
				suffix := suffixs[j]
				if strings.HasSuffix(infoName, suffix) {
//					log.Println("infoName =", infoName)
//					log.Println("infoName =", info.ModTime())
					timecha := (now.UnixNano() - info.ModTime().UnixNano()) / 1000000
//					log.Println("timecha =", timecha)
					if timecha > timeout {
						log.Println("remove begin ",  infoName)
						err := os.Remove(dir + infoName)
						if err != nil {
							log.Println("remove err ",  err)
						}
						log.Println("remove ok ", infoName)
					}
				}
			}
	    	} else {
			timecha := (now.UnixNano() - info.ModTime().UnixNano()) / 1000000
//			log.Println("timecha =", timecha)
			if timecha > timeout {
				log.Println("remove begin ",  infoName)
				err := os.Remove(dir + infoName)
				if err != nil {
					log.Println("remove err ",  err)
				}
				log.Println("remove ok ", infoName)
			}
	    	}
    }
}
