// file: datamodels/personnel.go

package datamodels

import (
)

//人员列表对象
type PersonnelInfo struct {
	IdentityId string `json:"identity_id"`
	FeatureId string `json:"feature_id"`
	Name  string `json:"name"`
	Info  string `json:"info"`
	FileSize  int64 `json:"file_size"`
	Feature string `json:"feature"`//`json:"-"`
	LibraryId string `json:"library"`
	UpdateTime int64 `json:"update_time"`
}
//人员数据库对象
type Personnel struct {
	IdentityId string `json:"identity_id"`
	FeatureId string `json:"feature_id"`
	Name   string    `json:"name"`
	Info  string `json:"info"`
	FileSize  int64 `json:"file_size"`
	Feature   string    `json:"feature"`
	AlgoVersion string `json:"algo_versio"`
	LibraryId   string    `json:"library"`
	UpdateTime int64 `json:"update_time"`
	ImageUrl   string    `json:"image_url"`
	ExpireTime   int64    `json:"expire_time"`
}
//人员表单对象
type PersonnelForm struct {
	IdentityId string `json:"identity_id"`
	FeatureId string `json:"feature_id"`
	Name   string    `json:"name"`
	Info  string `json:"info"`
	FileSize  int64 `json:"file_size"`
	Feature   string    `json:"feature"`
	AlgoVersion string `json:"algo_versio"`
	LibraryId   string    `json:"library"`
	UpdateTime int64 `json:"update_time"`
	Image   string    `json:"image"`
	ImageType   string    `json:"image_type"`
	ExpireTime   int64    `json:"expire_time"`
	Threshold float64 `json:"threshold"`
	TopN int32 `json:"top_n"`
	CheckLive int `json:"check_live"`
}
//人员表单对象
type ImageFeatureForm struct {
	ImageA   string    `json:"image_a"`
	ImageB   string    `json:"image_b"`
	ImageTypeA   string    `json:"image_type_a"`
	ImageTypeB   string    `json:"image_type_b"`
	FeatureA   string    `json:"feature_a"`
	FeatureB   string    `json:"feature_b"`
	CheckLiveA int `json:"check_live_a"`
	CheckLiveB int `json:"check_live_b"`
}
//人员ID对象
type IdOption struct {
	IdentityId string `json:"identity_id"`
	FeatureId string `json:"feature_id"`
}
