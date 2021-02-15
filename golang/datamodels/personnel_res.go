// file: datamodels/personnel_res.go

package datamodels

import (
)

type PersonnelInfosBody struct {
	Code int            `json:"code"`
	Msg  string         `json:"msg"`
	Data []PersonnelInfo `json:"data"`
}
type PersonnelInfoBody struct {
	Code int          `json:"code"`
	Msg  string       `json:"msg"`
	Data PersonnelInfo `json:"data"`
}
type PersonnelsBody struct {
	Code int            `json:"code"`
	Msg  string         `json:"msg"`
	Data []Personnel `json:"data"`
}
type PersonnelBody struct {
	Code int          `json:"code"`
	Msg  string       `json:"msg"`
	Data Personnel `json:"data"`
}