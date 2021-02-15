// file: datamodels/file.go

package datamodels

import (
)

type FileInfo struct {
	FileName  string `json:"name"`
	FileInfo  string `json:"info"`
	FileSize int64 `json:"size"`
	FilePath string `json:"dir"`
}
