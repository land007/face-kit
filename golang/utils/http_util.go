// file: utils/http_util.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * http请求工具类
 */

package utils

import (
	"log"
    "bytes"
    "time"
	"net/http"
	"io/ioutil"
	"../configs"
)

func HttpGet(url string) []byte {
	var body []byte
	timeout := time.Duration(time.Duration(configs.RemoteRestTimeout) * time.Millisecond)
	client := http.Client {
	    Timeout: timeout,
	}
//    resp, err := http.Get(url)
    resp, err := client.Get(url)
    defer resp.Body.Close()
    if err != nil {
        return body
    }
    body, err = ioutil.ReadAll(resp.Body)
    if err != nil {
        log.Println("httpGet err")
        return body
    }
    return body
}

func HttpPost(url string, jsonBuffer *bytes.Buffer) string {
	timeout := time.Duration(time.Duration(configs.RemoteRestTimeout) * time.Millisecond)
    client := &http.Client{
	    Timeout: timeout,
	}
	req, err := http.NewRequest("POST", url, jsonBuffer)
    if err != nil {
        // handle error
    }
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("version", "1.0.0")
    resp, err := client.Do(req)
    defer resp.Body.Close()
//			    resp, err := http.Post(grpcHttp1v1, "application/json", bytes.NewBuffer(jsonValue))
    if err != nil {
        log.Println("The HTTP request failed with error %s\n", err)
        return ""
    } else {
        data, _ := ioutil.ReadAll(resp.Body)
//        log.Println(string(data))
        return string(data)
    }
}