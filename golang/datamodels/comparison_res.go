// file: datamodels/comparison_res.go

package datamodels


type OnebymanyResBody struct {
	Code int            `json:"code"`
	Msg  string         `json:"msg"`
	Data []ResOnebymany `json:"data"`
}
type ResOnebymany struct {
	IdentityId string  `json:"identity_id"`
	FeatureId string  `json:"feature_id"`
	MatchScore float64 `json:"match_score"`
	LibraryId    string  `json:"library"`
}
type OnebyoneResBody struct {
	Code int            `json:"code"`
	Msg  string         `json:"msg"`
	MatchScore float64 `json:"match_score"`
}
//比对历史
type ComparisonHistoryRes struct {
	Name   string    `json:"name"`
	MatchTime   int64    `json:"match_time"`
	MatchData   string    `json:"match_data"`
}
type CompareLogsResBody struct {
	Code int            `json:"code"`
	Msg  string         `json:"msg"`
	Data []ComparisonHistoryRes `json:"data"`
}
