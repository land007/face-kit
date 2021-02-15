// file: datamodels/feature.go

package datamodels

import (
)

type FeatureInfo struct {
	Feature  string `json:"feature"`
	UpdateTime int64 `json:"update_time"`
	ExpireTime   int64    `json:"expire_time"`
}
