// file: datamodels/upload.go

package datamodels

import (
)

type UploadedFile struct {
	// {name: "", size: } are the dropzone's only requirements.
	FileAlias  string `json:"file_alias"`
	FileId    string `json:"file_id"`
	FileInfo    string `json:"file_info"`
	Feature string `json:"-"`
	FileSize    int64  `json:"file_size"`
	FileModtime int64  `json:"file_modtime"`
	ExpireTime int64  `json:"expire_time"`
	LibraryId string `json:"library"`
	Info string `json:"info"`
}