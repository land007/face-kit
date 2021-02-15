// file: utils/test_util.go

package utils

import (
	"log"
	"strings"
//	"net/url"
	"../datamodels"
)

// >>常用方法<<

// 获取人员ID
func GetId(cid string) (bool, string, string) {
//	cids := strings.Split(url.QueryEscape(cid), ":")
	cids := strings.Split(cid, ":")
	if len(cids) == 1 {
		featureId := GenerateFileId(cids[0])
		return true, "", featureId
	} else if len(cids) == 2 {
		identityId := cids[0]
//		url.QueryUnescape(featureId)
		featureId := GenerateFileId(cids[1])
		return true, identityId, featureId
	} else {
		return false, "", ""
	}
}

// 获取验证后的人员ID
func GetVerificationId(cid string, libraryFilesMap map[string]*UploadedFiles ,library string) (bool, string, string) {
	haveId, identityId, featureId := GetId(cid)
	if haveId {
		log.Println("identityId =", identityId)
		log.Println("featureId =", featureId)
		have, personnelInfo := GetPersonnelInfo(libraryFilesMap, library, featureId)
		if have {
			_identityId := personnelInfo.IdentityId
			log.Println("_identityId =", _identityId)
			if _identityId == identityId {
				return true, _identityId, featureId
			}
		}
	}
	return false, "", ""
}

// 获取修正后的人员ID
func GetCorrectId(cid string, libraryFilesMap map[string]*UploadedFiles ,library string) (bool, string, string) {
	haveId, identityId, featureId := GetId(cid)
	if haveId {
		log.Println("identityId =", identityId)
		log.Println("featureId =", featureId)
		have1, personnelInfo1 := GetPersonnelInfo(libraryFilesMap, library, featureId)
		if have1 {
			_identityId := personnelInfo1.IdentityId
			return true, _identityId, featureId
		}
		have2, personnelInfo2 := GetPersonnelInfoByFileAlias(libraryFilesMap, library, identityId)
		if have2 {
			_identityId := personnelInfo2.IdentityId
			log.Println("_identityId =", _identityId)
			_featureId := personnelInfo2.FeatureId
			log.Println("_featureId =", _featureId)
			return true, _identityId, _featureId
		}
	}
	return false, "", ""
}

// 获取修正后的人员ID
func GetCorrectIdByFileAlias(fileAlias string, libraryFilesMap map[string]*UploadedFiles ,library string) (bool, string, string) {
	log.Println(fileAlias)
	have, personnelInfo := GetPersonnelInfoByFileAlias(libraryFilesMap, library, fileAlias)
	if have {
		_identityId := personnelInfo.IdentityId
		_featureId := personnelInfo.FeatureId
		return true, _identityId, _featureId
	}
	return false, "", ""
}

// 获取人员简要信息
func GetPersonnelInfo(libraryFilesMap map[string]*UploadedFiles ,library string, featureId string) (bool, datamodels.PersonnelInfo) {
	var personnelInfo datamodels.PersonnelInfo
	have, uploadedFile := GetUploadedFile(libraryFilesMap, library, featureId)
	if have {
		personnelInfo = UploadedFile_PersonnelInfo(uploadedFile)
		return true, personnelInfo
	}
	return false, personnelInfo
}

// 获取人员详细信息
func GetPersonnel(libraryFilesMap map[string]*UploadedFiles ,library string, featureId string) (bool, datamodels.Personnel) {
	var personnel datamodels.Personnel
	have, uploadedFile := GetUploadedFile(libraryFilesMap, library, featureId)
	if have {
		personnel = UploadedFile_Personnel(uploadedFile)
		return true, personnel
	}
	return false, personnel
}

// 获取人员简要信息
func GetPersonnelInfoByFileAlias(libraryFilesMap map[string]*UploadedFiles ,library string, fileAlias string) (bool, datamodels.PersonnelInfo) {
	var personnelInfo datamodels.PersonnelInfo
	files := libraryFilesMap[library]
	if files != nil {
		have, uploadedFile := files.GetUploadedFileByFileAlias(fileAlias)
		if have {
			personnelInfo = UploadedFile_PersonnelInfo(uploadedFile)
			return true, personnelInfo
		}
	}
	return false, personnelInfo
}

