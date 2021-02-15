// file: datamodels/algorithm.go

package datamodels

import (
)

type CompanyAlgorithm struct {
	CompanyAlgorithmId  int64 `json:"company_algorithm_id"`
	CompanyName string `json:"company_name"`
	AlgVersion string `json:"alg_version"`
	SdkFilePath string `json:"sdk_file_path"`
}
