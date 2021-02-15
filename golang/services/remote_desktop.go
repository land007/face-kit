// file: services/remote_desktop.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * 远程桌面服务类
 */

package services

import (
	"log"
    "bytes"
	"time"
	"encoding/json"
	"github.com/kataras/iris"
	"github.com/satori/go.uuid"
	"../datamodels"
	"../configs"
	"../utils"
)

//type HttpResponse struct {
//	url      string
//	response *http.Response
//	err      error
//}

//远程桌面人员比对 http://192.168.0.191:8009/eye/rest/library/Test/remote_desktop/getUserInfo
func GetUserInfo(ctx iris.Context) {
	lid := ctx.Params().Get("lid")
	log.Println("lid =", lid)
	var getUserInfo datamodels.GetUserInfo
	err := ctx.ReadJSON(&getUserInfo)
	if err != nil {
		log.Println("GetUserInfo err: %v", err)
		ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "Not JSON or data format is incorrect."})
		return
	}
	length := len(getUserInfo.VmArray)
//	ch := make(chan *HttpResponse, length) // buffered
//	responses := []*HttpResponse{}
	ch := make(chan *datamodels.UserInfo, length) // buffered
//	ch := make(chan *datamodels.UserInfo, 20) // buffered
	userInfos := []*datamodels.UserInfo{}
	for i, _ := range getUserInfo.VmArray {
		vmHost := getUserInfo.VmArray[i]
		log.Println("vmHost =", vmHost)
		log.Println("vmHost.Mac =", vmHost.Mac)
		go func(ip string, mac string, lid string, cid string) {
			log.Println("ip =", ip)
			log.Println("mac =", mac)
			log.Println("lid =", lid)
			log.Println("cid =", cid)
//			resp, err := http.Post(url, "application/json", bytes.NewBuffer(buf))
//			resp, err := http.Get(url)
//			if err == nil {
//				resp.Body.Close()
//			}
//			ch <- &HttpResponse{url, resp, err}
//			resRemoteDesktop := HttpGetRemoteDesktopStaffComparison(ip, mac, lid, cid)
			resRemoteDesktop := p1V1_p1Vn(ip, mac, lid, cid)
			image := ""
			if resRemoteDesktop.ImageURL != "" {
				image = "http://" + ctx.Host() + "/eye/public/tmp/" + resRemoteDesktop.ImageURL + ".jpg"
			}
			var userInfo datamodels.UserInfo
			userInfo = datamodels.UserInfo{Success: resRemoteDesktop.Code == 200 || resRemoteDesktop.Code == 300, Msg: resRemoteDesktop.Msg, Uid: resRemoteDesktop.IdentityId, VmMac: mac, Image: image}
			ch <- &userInfo
		}(vmHost.Ip, vmHost.Mac, lid, vmHost.Uid + ":")
	}
	for {
		select {
			case r := <-ch:
//				log.Printf("send a request to %s, status: %s\n", r.url, r.err)
//				responses = append(responses, r)
//				if len(responses) == length {
//					log.Printf("all request \n")
//					log.Println("responses =", responses)
////					ctx.JSON(&getUserInfo)
//					ctx.JSON(&responses)
//					return
//				}
				userInfos = append(userInfos, r)
				if len(userInfos) == length {
					log.Printf("all request \n")
					log.Println("userInfos =", userInfos)
					log.Println("ctx.Host() = ", ctx.Host())
					ctx.JSON(&datamodels.ResGetUserInfo{Data: datamodels.UserInfoArray{UserInfoArray: userInfos}})
					return
				}
			case <-time.After(time.Duration(configs.RemoteRestTimeout + 100000) * time.Millisecond):
				log.Printf("timeout\n")
//				ctx.JSON(&getUserInfo)
				log.Println("ctx.Host() = ", ctx.Host())
				ctx.JSON(&datamodels.ResGetUserInfo{Data: datamodels.UserInfoArray{UserInfoArray: userInfos}})
				return
		}
	}
}

func HttpGetRemoteDesktopStaffComparison(ip string, mac string, lid string, cid string) datamodels.ResRemoteDesktop {
//	url := "http://192.168.0.96:8019/eye/rest/librarys"
	url := "http://" + configs.GrpcHttpServer + ":" + configs.GrpcHttpPort + configs.RestUrl + lid + configs.RestP1vn + "?ip=" + ip + "&mac=" + mac + "&cid=" + cid
	log.Println("url =", url)
	body := utils.HttpGet(url)
	var resRemoteDesktop datamodels.ResRemoteDesktop
	err := json.Unmarshal(body, &resRemoteDesktop)
	if(err != nil) {
		resRemoteDesktop = datamodels.ResRemoteDesktop{Code: 500, Msg: err.Error()}
	}
	log.Println("resRemoteDesktop =", resRemoteDesktop)
	return resRemoteDesktop
}


//远程桌面人员比对 http://192.168.0.191:8009/eye/rest/library/Test/remote_desktop/P1vN?ip=192.168.0.69&mac=11-11-11-11-11-11&cid=jiayq:e57463be25ec17572b57f5886c924d1a9386c013%2e%6a%70%67
func RemoteDesktopStaffComparison(ctx iris.Context) {
	ipAddress := ctx.URLParam("ip")//192.168.0.69
	if ipAddress == "" {
		ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "Unable to get IP"})
		return
	}
	macAddress := ctx.URLParam("mac")//11-11-11-11-11-11
	if macAddress == "" {
		ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "Unable to get Mac"})
		return
	}
	lid := ctx.Params().Get("lid")
	cid := ctx.URLParam("cid")//jiayq:bf49a339c11bd2dd66a1e387af19b57bc9fd33cb%2e%6a%70%67
	if cid == "" {
		ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "cid cannot be empty"})
		return
	}
	resRemoteDesktop := p1V1_p1Vn(ipAddress, macAddress, lid, cid)
	ctx.JSON(&resRemoteDesktop)//{"identity_id": "jiayq","feature_id": "e57463be25ec17572b57f5886c924d1a9386c013%2e%6a%70%67","match_score": 65.02885574803149,"library": "Test"}
//	ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "Test"})
}

func p1V1_p1Vn(ipAddress string, macAddress string, lid string, cid string) datamodels.ResRemoteDesktop {
	var resRemoteDesktop datamodels.ResRemoteDesktop
	remoteUrl := "http://" + ipAddress + ":" + configs.RemotePort + configs.RemoteUrl + "&ip=" + ipAddress + "&mac=" + macAddress
	log.Println("remoteUrl =", remoteUrl)
	req := utils.HttpGet(remoteUrl)
//	log.Println("req =", req)
	var remoteDesktop datamodels.RemoteDesktop
	json.Unmarshal(req, &remoteDesktop)
//	log.Println("remoteDesktop =", remoteDesktop)
	length := len(remoteDesktop.Data)
	//有多张人脸处理第一个
	if length == 0 {
		resRemoteDesktop = datamodels.ResRemoteDesktop{Code: 500, Msg: "not face"}
		return resRemoteDesktop
	}
	base64 := remoteDesktop.Data[0].Image
	if base64 == "" {
		resRemoteDesktop = datamodels.ResRemoteDesktop{Code: 500, Msg: "not face"}
		return resRemoteDesktop
	}
	haveId, identityId, featureId := utils.GetId(cid)
	if !haveId {
		//错误的id
//		ctx.JSON(&datamodels.ResBody{Code: 500, Msg: "It's not the right cid"})
		resRemoteDesktop = datamodels.ResRemoteDesktop{Code: 500, Msg: "It's not the right cid"}
		return resRemoteDesktop
	}
	u1 := uuid.Must(uuid.NewV4()).String()
	log.Println("u1 =", u1)
	now := time.Now()
	date := utils.GetStringTime(now, "2006-01-02")
	log.Println("date =", date)
	time := utils.GetStringTime(now, "15:04:05")
	log.Println("time =", time)
	name := date + "_" + macAddress + "_" + time
	//1:1
	matchScore := p1V1(lid, cid, base64, name, u1)
	if matchScore > configs.Threshold {
		//达到阈值返回数据
//			ctx.JSON(&onebyoneResBody)//{"code":200,"msg":"","match_score":63.807013858267716}
		imageURL := name + configs.Separator + u1
		resRemoteDesktop = datamodels.ResRemoteDesktop{Code: 200, IdentityId: identityId, FeatureId: featureId, MatchScore: matchScore, LibraryId: lid, ImageURL: imageURL}//PersonnelId: mis.MatchedIdentity[index].IdentityId, 
	} else {
	    //没有达到阈值1：n ||库中没有数据的1：n
		resRemoteDesktop = p1Vn(lid, base64, name, u1)
	}
	return resRemoteDesktop
}

//一比一
func p1V1(lid string , cid string, base64 string, name string, identityId string) float64 {
	grpcHttp1v1 := "http://" + configs.GrpcHttpServer + ":" + configs.GrpcHttpPort + configs.RestUrl + lid + configs.Rest1v1 + cid
	log.Println("grpcHttp1v1 =", grpcHttp1v1)
	jsonData := map[string]string{"image": base64, "image_type": "jpg", "name": name, "identity_id": identityId}//, "check_live": "0"
//	log.Println("jsonData =", jsonData)
	jsonValue, _ := json.Marshal(jsonData)
	jsonBuffer := bytes.NewBuffer(jsonValue)
	data1v1 := utils.HttpPost(grpcHttp1v1, jsonBuffer)
	log.Println("data1v1 =", data1v1)
    var onebyoneResBody datamodels.OnebyoneResBody
	json.Unmarshal([]byte(data1v1), &onebyoneResBody)
    log.Println("onebyoneResBody.MatchScore =", onebyoneResBody.MatchScore)
    return onebyoneResBody.MatchScore
}

//一比多
func p1Vn(lid string, base64 string, name string, identityId string) datamodels.ResRemoteDesktop {
	var resRemoteDesktop datamodels.ResRemoteDesktop
	grpcHttp1vn := "http://" + configs.GrpcHttpServer + ":" + configs.GrpcHttpPort + configs.RestUrl + lid + configs.Rest1vn
    log.Println(grpcHttp1vn)
    jsonData := map[string]string{"image": base64, "image_type": "jpg", "name": name, "identity_id": identityId}//, "check_live": "0"
//	log.Println(jsonData)
	jsonValue, _ := json.Marshal(jsonData)
	jsonBuffer := bytes.NewBuffer(jsonValue)
	data1vn := utils.HttpPost(grpcHttp1vn, jsonBuffer)
	log.Println(data1vn)
	var onebymanyResBody datamodels.OnebymanyResBody
	json.Unmarshal([]byte(data1vn), &onebymanyResBody)
    log.Println(onebymanyResBody)
    imageURL := name + configs.Separator + identityId
    if len(onebymanyResBody.Data) > 0 {
        log.Println(onebymanyResBody.Data[0])
        if onebymanyResBody.Data[0].MatchScore > configs.Threshold {
//			ctx.JSON(&onebymanyResBody.Data[0])//{"identity_id": "jiayq","feature_id": "e57463be25ec17572b57f5886c924d1a9386c013%2e%6a%70%67","match_score": 60.354810787401576,"library": "Test"}
			resRemoteDesktop = datamodels.ResRemoteDesktop{Code: 300, IdentityId: onebymanyResBody.Data[0].IdentityId, FeatureId: onebymanyResBody.Data[0].FeatureId, MatchScore: onebymanyResBody.Data[0].MatchScore, LibraryId: lid, ImageURL: imageURL}//PersonnelId: mis.MatchedIdentity[index].IdentityId, 
        }
    } else {
	    resRemoteDesktop = datamodels.ResRemoteDesktop{Code: 500, Msg: "The user was not found", ImageURL: imageURL}//PersonnelId: mis.MatchedIdentity[index].IdentityId, 
    }
    return resRemoteDesktop
//	ctx.JSON(&resRemoteDesktop)//{"identity_id": "jiayq","feature_id": "e57463be25ec17572b57f5886c924d1a9386c013%2e%6a%70%67","match_score": 65.02885574803149,"library": "Test"}
}


