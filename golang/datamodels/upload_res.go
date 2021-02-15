// file: datamodels/upload_res.go

package datamodels

import (
)

type UploadedsResBody struct {
	Code int            `json:"code"`
	Msg  string         `json:"msg"`
	Data []UploadedFile `json:"data"`
}
type UploadedResBody struct {
	Code int          `json:"code"`
	Msg  string       `json:"msg"`
	Data UploadedFile `json:"data"`
}
