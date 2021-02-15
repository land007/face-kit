// file: datamodels/remote_desktop.go

package datamodels

import (
)

type GetUserInfo struct {
	VmArray []VmHost `json:"vm_array"`
}

type VmHost struct {
	Uid  string `json:"uid"`
    Ip string `json:"ip"`
    Mac string `json:"mac"`
}

type ResGetUserInfo struct {
//	BaseUrl string `json:"base_url"`
	Data UserInfoArray `json:"data"`
}

type UserInfoArray struct {
	UserInfoArray []*UserInfo `json:"user_info_array"`
}

type UserInfo struct {
	Success  bool `json:"success"`
	Msg string `json:"msg"`
    Uid string `json:"uid"`
    VmMac string `json:"vm_mac"`
    Image string `json:"image"`
}

type RemoteData struct {
    Image string `json:"image"`
}

type RemoteDesktop struct {
//	code string  `json:"_"`
	code  int `json:"code"`
    Msg string `json:"msg"`
    Time string `json:"time"`
    Data []RemoteData `json:"data"`
}

type ResRemoteDesktop struct {
	Code  int `json:"code"`
    Msg string `json:"msg"`
	IdentityId string  `json:"identity_id"`
	FeatureId string  `json:"feature_id"`
	Name string  `json:"name"`
	MatchScore float64 `json:"match_score"`
	LibraryId    string  `json:"library"`
	ImageURL    string  `json:"image_url"`
}