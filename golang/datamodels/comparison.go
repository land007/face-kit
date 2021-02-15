// file: datamodels/comparison.go

package datamodels

import (
)

//比对历史数据库对象
type ComparisonHistory struct {
	Personnel   Personnel    `json:"personnel"`
	MatchData   string    `json:"match_data"`
}
