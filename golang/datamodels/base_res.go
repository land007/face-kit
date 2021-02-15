// file: datamodels/base_res.go

package datamodels

import (
)

type ResBody struct {
	Code int    `json:"code"`
	Msg  string `json:"msg"`
}
type ResOption struct {
	Text  string `json:"text"`
	Value string `json:"value"`
}