// file: utils/image_util.go
/**
 * @author Jia Yiqiu <yiqiujia@hotmail.com>
 * 图像工具类
 */

package utils

import (
    "image"
	"log"
	"io"
    "strings"
	"runtime"
//	"fmt"
	"os"
    "errors"
//	"exiffix"
    "io/ioutil"
    "os/exec"
	"image/jpeg"
	"image/png"
//	"image/gif"
	"encoding/base64"
	"golang.org/x/image/bmp"
	"github.com/disintegration/imaging"
	"github.com/rwcarlsen/goexif/exif"
	"github.com/nfnt/resize" // $ go get -u github.com/nfnt/resize
	"../configs"
)

// >>常用方法<<
func UpdateArtist(filepath string, artist string) {
	// 执行系统命令
    // 第一个参数是命令名称
    // 后面参数可以有多个，命令参数
//    cmd := exec.Command("ls", "-a", "-l")
    cmd := exec.Command("exiftool", "-artist=" + artist, filepath)
    // 获取输出对象，可以从该对象中读取输出结果
    stdout, err := cmd.StdoutPipe()
    // 保证关闭输出流
    defer stdout.Close()
    if err != nil {
        log.Println(err)
    }
    // 运行命令
    if err := cmd.Start(); err != nil {
        log.Println(err)
    }
    // 读取输出结果
    opBytes, err := ioutil.ReadAll(stdout)
    if err != nil {
        log.Println(err)
    }
    log.Println(string(opBytes))
}
//Given a base64 string of a JPEG, encodes it into an JPEG image test.jpg
func Base64toJpg(data string, filePath string) (bool, string) {
	if r := recover(); r != nil {
      const size = 64 << 10
      buf := make([]byte, size)
      buf = buf[:runtime.Stack(buf, false)]
      log.Printf("panic : %v\n%s", r, buf)
    }
    reader := base64.NewDecoder(base64.StdEncoding, strings.NewReader(data))
    m, formatString, err := image.Decode(reader)
    if err != nil {
        log.Println(err)
        return false, "Cannot store images"
    }
    bounds := m.Bounds()
    log.Println("base64toJpg", bounds, formatString)
    if formatString != "jpeg" {
    	return false, "Upload photo as " + formatString + " format, can't store image"
    }
    //Encode from image format to writer
    filename := filePath
    f, err := os.OpenFile(filename, os.O_WRONLY|os.O_CREATE, 0777)
    if err != nil {
        log.Println(err)
        return false, "Cannot store images"
    }
    err = jpeg.Encode(f, m, &jpeg.Options{Quality: 75})
    if err != nil {
        log.Println(err)
        return false, "Cannot store images"
    }
    log.Println("Jpg file", filename, "created")
    return true, ""
}

func Base64toPng(data string, filePath string) (bool, string) {
    reader := base64.NewDecoder(base64.StdEncoding, strings.NewReader(data))
    m, formatString, err := image.Decode(reader)
    if err != nil {
        log.Println(err)
        return false, "Cannot store images"
    }
    bounds := m.Bounds()
    log.Println("base64toPng", bounds, formatString)
    if formatString != "png" {
    	return false, "Upload photo as " + formatString + " format, can't store image"
    }
    //Encode from image format to writer
    pngFilename := filePath
    f, err := os.OpenFile(pngFilename, os.O_WRONLY|os.O_CREATE, 0777)
    if err != nil {
        log.Println(err)
        return false, "Cannot store images"
    }
    err = png.Encode(f, m)
    if err != nil {
        log.Println(err)
        return false, "Cannot store images"
    }
    log.Println("Png file", pngFilename, "created")
    return true, ""
}

func Base64toBmp(data string, filePath string) (bool, string) {
    reader := base64.NewDecoder(base64.StdEncoding, strings.NewReader(data))
    m, formatString, err := image.Decode(reader)
    if err != nil {
        log.Println(err)
        return false, "Cannot store images"
    }
    bounds := m.Bounds()
    log.Println("base64toBmp", bounds, formatString)
    if formatString != "bmp" {
    	return false, "Upload photo as " + formatString + " format, can't store image"
    }
    //Encode from image format to writer
    filename := filePath
    f, err := os.OpenFile(filename, os.O_WRONLY|os.O_CREATE, 0777)
    if err != nil {
        log.Println(err)
        return false, "Cannot store images"
    }
    err = bmp.Encode(f, m)
    if err != nil {
        log.Println(err)
        return false, "Cannot store images"
    }
    log.Println("Bmp file", filename, "created")
    return true, ""
}

//保存缩略图
func SaveThumbnail(name string, imagePath string, thumbnailPath string) {
    log.Println("name= ", name)
    log.Println("imagePath= ", imagePath)
    log.Println("thumbnailPath= ", thumbnailPath)
	file, err := os.Open(imagePath)
	defer file.Close()
	if err != nil {
		log.Println(err)
		return
	}
	out, err := os.OpenFile(thumbnailPath,
		os.O_WRONLY|os.O_CREATE, 0666)
	defer out.Close()
	if err != nil {
		log.Println(err)
		return
	}
	if strings.HasSuffix(name, ".jpg") || strings.HasSuffix(name, ".jpeg") {
		// decode jpeg into image.Image
//		img, err := jpeg.Decode(file)
//		img, _, err := exiffix.Decode(file)
//		log.Fatal(err)
		img, _, err := Decode(file)
//		log.Fatal(err)
		if err != nil {
			log.Println(err)
			return
		}
		// write new image to file
		resized := resize.Thumbnail(180, 180, img, resize.Lanczos3)
		jpeg.Encode(out, resized,
			&jpeg.Options{Quality: jpeg.DefaultQuality})
	} else if strings.HasSuffix(name, ".png") {
		img, err := png.Decode(file)
		if err != nil {
			log.Println(err)
			return
		}
		// write new image to file
		resized := resize.Thumbnail(180, 180, img, resize.Lanczos3) // slower but better res
		png.Encode(out, resized)
	} else if strings.HasSuffix(name, ".bmp") {
		//return errors.New("ERROR FORMAT")
		img, _, err := image.Decode(file)
		if err != nil {
			log.Println(err)
			return
		}
		// write new image to file
		resized := resize.Thumbnail(180, 180, img, resize.Lanczos3) // slower but better res
		bmp.Encode(out, resized)
	}
}

/*
* 图片裁剪
* 入参:
* 规则:如果精度为0则精度保持不变
*
* 返回:error
 */
func ClipFile(src string, dst string, rcItem [4]float64, quality int, ratio float64) error {
//	dst := strings.Replace(src, ".", "_small.", 1)
//	dst := src + ".bak.jpg"
    log.Println("src=", src, " dst=", dst)
    fIn, _ := os.Open(src)
    defer fIn.Close()
    fOut, _ := os.Create(dst)
    defer fOut.Close()
    err := clip(fIn, fOut, rcItem[0], rcItem[1], rcItem[2], rcItem[3], quality, ratio)//2.0
    if err != nil {
		log.Println("clipFile ", err)
    }
    log.Println("src=", src, " dst=", dst)
    return err
}

/*
* 图片裁剪
* 入参:
* 规则:如果精度为0则精度保持不变
*
* 返回:error
 */
func clip(in io.ReadSeeker, out io.Writer, _x0 float64, _y0 float64, _x1 float64, _y1 float64, quality int, ratio float64) error {
	log.Println("clip")
    origin, fm, err := image.Decode(in)
    if err != nil {
	    log.Println("err", err)
    	return err;
    }
    log.Println("in", in)
    in.Seek(0, io.SeekStart)
    orientation := getOrientation(in)
    log.Println("orientation", orientation)
//    if orientation == "-1" {
//    	return err
//    }
    log.Println("orientation", orientation)
	switch orientation {
	case "1":
	case "2":
		origin = imaging.FlipV(origin)
	case "3":
		origin = imaging.Rotate180(origin)
	case "4":
		origin = imaging.Rotate180(imaging.FlipV(origin))
	case "5":
		origin = imaging.Rotate270(imaging.FlipV(origin))
	case "6":
		origin = imaging.Rotate270(origin)
	case "7":
		origin = imaging.Rotate90(imaging.FlipV(origin))
	case "8":
		origin = imaging.Rotate90(origin)
	}
    width := origin.Bounds().Max.X
    height := origin.Bounds().Max.Y
    log.Println("width=", width, " height=", height)
    imgWith := int(_x1 * float64(width))
    imgHeight := int(_y1 * float64(height))
    x0 := int(_x0 * float64(width))
    y0 := int(_y0 * float64(height))
    x1 := x0 + imgWith
    y1 := y0 + imgHeight
    log.Println("x0=", x0, " y0=", y0, "x1=", x1, " y1=", y1)
    x0, y0, imgWith, imgHeight = ExpandingFace(x0, y0, imgWith, imgHeight, width, height, ratio)
    x1 = x0 + imgWith
    y1 = y0 + imgHeight
    log.Println("x0=", x0, " y0=", y0, "x1=", x1, " y1=", y1)
//    if err != nil {
//        return err
//    }
    switch fm {
    case "jpeg":
	    switch origin.(type) {
        case *image.YCbCr:
            img := origin.(*image.YCbCr)
            subImg := img.SubImage(image.Rect(x0, y0, x1, y1)).(*image.YCbCr)
            ss := jpeg.Encode(out, subImg, &jpeg.Options{quality})
	        return ss
        case *image.NRGBA:
            img := origin.(*image.NRGBA)
            subImg := img.SubImage(image.Rect(x0, y0, x1, y1)).(*image.NRGBA)
	        return jpeg.Encode(out, subImg, &jpeg.Options{quality})
        case *image.RGBA:
			img := origin.(*image.RGBA)
            subImg := img.SubImage(image.Rect(x0, y0, x1, y1)).(*image.RGBA)
	        return jpeg.Encode(out, subImg, &jpeg.Options{quality})
        }
    case "png":
        switch origin.(type) {
        case *image.NRGBA:
            img := origin.(*image.NRGBA)
            subImg := img.SubImage(image.Rect(x0, y0, x1, y1)).(*image.NRGBA)
            return png.Encode(out, subImg)
        case *image.RGBA:
			img := origin.(*image.RGBA)
            subImg := img.SubImage(image.Rect(x0, y0, x1, y1)).(*image.RGBA)
            return png.Encode(out, subImg)
        }
//    case "gif":
//        img := origin.(*image.Paletted)
//        subImg := img.SubImage(image.Rect(x0, y0, x1, y1)).(*image.Paletted)
//        return gif.Encode(out, subImg, &gif.Options{})
    case "bmp":
        img := origin.(*image.RGBA)
        subImg := img.SubImage(image.Rect(x0, y0, x1, y1)).(*image.RGBA)
        return bmp.Encode(out, subImg)
    default:
        return errors.New("ERROR FORMAT")
    }
    return nil
}

/*
*扩充人脸
* 入参:
* _divLeft 人脸位置Left
* _divTop 人脸位置Top
* _divWidth 人脸宽
* _divHeight 人脸高
* width 图片宽
* height 图片高
* ratio 缩放比例
* 返回:
* _divLeft 人脸位置Left
* _divTop 人脸位置Top
* _divWidth 人脸宽
* _divHeight 人脸高
 */
func ExpandingFace(_divLeft int, _divTop int, _divWidth int, _divHeight int, width int, height int, ratio float64) (int, int, int, int) {
	divWidth := int(float64(_divWidth) * ratio)
	divHeight := int(float64(_divHeight) * ratio)
	log.Println("divWidth=", divWidth, " divHeight=", divHeight)
	log.Println("_divLeft=", _divLeft, " _divLeft=", _divHeight)
	x0 := _divLeft - (divWidth - _divWidth)/2
	y0 := _divTop - (divHeight - _divHeight)/2
	log.Println("_divLeft=", x0, " _divLeft=", y0)
	x1 := x0 + divWidth
	y1 := y0 + divHeight
	if x0 < 0 {
		x0 = 0
	}
	if y0 < 0 {
		y0 = 0
	}
	if x1 > width {
		x1 = width
	}
	if y1 > height {
		y1 = height
	}
	divWidth = x1 - x0
	divHeight = y1 - y0
	return x0, y0, divWidth, divHeight
}

//Decode is image.Decode handling orientation in EXIF tags if exists.
//Requires io.ReadSeeker instead of io.Reader.
func Decode(reader io.ReadSeeker) (image.Image, string, error) {
	log.Println("Decode")
	img, fmt, err := image.Decode(reader)
	if err != nil {
		return img, fmt, err
	}
	reader.Seek(0, io.SeekStart)
	orientation := getOrientation(reader)
	switch orientation {
	case "1":
	case "2":
		img = imaging.FlipV(img)
	case "3":
		img = imaging.Rotate180(img)
	case "4":
		img = imaging.Rotate180(imaging.FlipV(img))
	case "5":
		img = imaging.Rotate270(imaging.FlipV(img))
	case "6":
		img = imaging.Rotate270(img)
	case "7":
		img = imaging.Rotate90(imaging.FlipV(img))
	case "8":
		img = imaging.Rotate90(img)
	}

	return img, fmt, err
}

func getOrientation(reader io.Reader) string {
	x, err := exif.Decode(reader)
	if err != nil {
		log.Println("err")
		return "-1"
	}
	if x != nil {
		orient, err := x.Get(exif.Orientation)
		if err != nil {
			log.Println("err")
			return "-1"
		}
		if orient != nil {
			log.Println("orient")
			return orient.String()
		}
	}
	log.Println("def")
	return "-1"
}

/**
* 保存base64图片到临时文件夹
*/
func SaveBase64ImageToTmp(imageType string, image string, fileAlias string) (bool, string){
	var save bool
	var msg string
	if imageType == "jpg" {
		save, msg = Base64toJpg(image, configs.TmpDir + fileAlias + "." + imageType)//test.jpg
	} else if imageType == "png" {
		save, msg = Base64toPng(image, configs.TmpDir + fileAlias + "." + imageType)//test.png
	} else if imageType == "jpeg" {
		save, msg = Base64toJpg(image, configs.TmpDir + fileAlias + "." + imageType)//test.jpeg
	} else if imageType == "bmp" {
		save, msg = Base64toBmp(image, configs.TmpDir + fileAlias + "." + imageType)//test.jpeg
	} else {
		save = false
		msg = "No specified image type or image type is not supported"
	}
	return save, msg
}
