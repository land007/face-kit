// file: datamodels/library_res.go

package datamodels

import (
)

type LibrarysResBody struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data []ResOption `json:"data"`
}

type GetSyncBody struct {
	Code int            `json:"code"`
	Msg  string         `json:"msg"`
	SyncTime  int64 `json:"sync_time"`
	SyncCount int64 `json:"sync_count"`
}