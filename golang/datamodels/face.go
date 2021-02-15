// file: datamodels/face.go

package datamodels

import (
)

type FaceInfo struct {
	BlurType  string `json:"blurType"`
	HeadPosi string `json:"headPosi"`
	RcItem   string    `json:"rcItem"`
}

type PictureExif struct {
	FaceInfos  []FaceInfo `json:"faceInfos"`
	Pin string `json:"pin"`
	FaceSeq   int    `json:"faceSeq"`
}
