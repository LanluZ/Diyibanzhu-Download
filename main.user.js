// ==UserScript==
// @name         Diyibanzhu Downloader
// @namespace    http://tampermonkey.net/
// @version      3.1.0
// @supportURL   https://github.com/LanluZ/Diyibanzhu-Download
// @homepageURL  https://github.com/LanluZ/Diyibanzhu-Download
// @description  第一版主网下载器，因为网址并不固定，所以不做域名匹配
// @author       LanluZ
// @match        http://*/*
// @match        https://*/*
// @grant        unsafeWindow
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @license      GNU GPLv3
// @require      https://cdn.jsdelivr.net/gh/jimmywarting/StreamSaver.js/StreamSaver.js
// @require      https://cdn.jsdelivr.net/gh/eligrey/Blob.js/Blob.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js
// @require
// ==/UserScript==

let hostname = window.location.hostname


//下载按钮点击事件
function buttonClicked() {
    // 获取文章基础信息
    let title = getTitle()
    let info = getInfo()

    // 获取目录最终页码
    let catalogueFinalPage = getCatalogueFinalPage()
    // 获取文章章节信息
    let catalogueInfoList = getCatalogueInfo(document)

    // 读取勾选框信息
    let checkboxList = document.getElementsByClassName("downloadCheckbox")


    // 下载内容
    for (let i = 0; i < catalogueInfoList.length; i++) {
        // 判断是否选中
        if (!checkboxList[i].checked) {
            continue
        }

        // 发送请求
        let download_url = catalogueInfoList[i].href

        // 发送请求
        let xhr = sendRequest(download_url)
        xhr.onload = function () {
            if (xhr.status !== 200) {
                console.log("目录页下载错误 " + "status:" + xhr.status);
            } else {
                // 获取内容页目录链接
                let contentInfoList = getContentInfo(xhr.response)

                // 向内容页发送请求
                for (let j = 0; j < contentInfoList.length; j++) {
                    let content_xhr = sendRequest(contentInfoList[j].href)
                    content_xhr.onload = function () {
                        if (content_xhr.status !== 200) {
                            console.log("内容页下载错误 " + "status:" + content_xhr.status);
                        } else {
                            console.log("下载开始 " + catalogueInfoList[i].text + '-' + contentInfoList[j].text)

                            // 保存设置
                            let opt = {
                                margin: 1,
                                filename: catalogueInfoList[i].text + '-' + contentInfoList[j].text + '.pdf',
                                image: {
                                    type: 'png',
                                }
                            }

                            // 保存但网页页面为pdf
                            let pdf_obj = html2pdf().set(opt).from(content_xhr.response.body)

                            console.log(pdf_obj)

                            pdf_obj.save()
                        }
                    }

                }
            }
        }
    }
}


// 发送xmlHttp请求
function sendRequest(url) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "document";
    xhr.send();
    return xhr
}

// 获取指定内容页章节标题链接
function getContentInfo(contentDocument) {
    // 结果保存
    let result = []
    // 大目录元素
    let catalogueList = contentDocument.getElementsByClassName("chapterPages")[0]
    // 获取子节点a
    let aList = catalogueList.getElementsByTagName("a")
    // 获取节点a内href与innerText
    for (let i = 0; i < aList.length; i++) {
        let href = aList[i].href
        let text = aList[i].innerText
        // 保存结果
        result.push({
            href: href, text: text
        })
    }
    // 返回结果
    return result
}

// 获取目录多页面
function getCatalogueFinalPage() {
    // 判断是否多页
    let endPage = document.getElementsByClassName("endPage")[0]
    if (endPage == null) {
        return 1; // 只有一页
    } else {
        // href内末尾数字为最终页码
        let endPageNum = endPage.href.match(/-?[1-9]\d*/g)
        return endPageNum[endPageNum.length - 1]
    }
}


//获取指定目录页章节标题链接
function getCatalogueInfo(catalogueDocument) {
    // 结果保存
    let result = []
    // 大目录元素
    let catalogueList = catalogueDocument.getElementsByClassName("list")[1]
    // 获取子节点li
    let liList = catalogueList.getElementsByTagName("li")
    // 获取节点li内href与innerText
    for (let i = 0; i < liList.length; i++) {
        let href = liList[i].getElementsByTagName("a")[0].href
        let text = liList[i].getElementsByTagName("a")[0].innerText
        // 保存结果
        result.push({
            href: href, text: text
        })
    }

    return result
}

//判断网页是否为第一版主三级子页面
function exist() {
    return document.getElementsByClassName("read start")[0].innerHTML === "从头开始阅读"
}

//获取文章标题
function getTitle() {
    return (document.getElementsByTagName("h1")[0].innerHTML)
}

//获取文章相关信息
function getInfo() {
    return (document.getElementsByClassName("info")[0].innerHTML.replace(/<br>/g, ""));
}

//按钮创建
function layButton() {
    if (document.getElementsByClassName("ft")[0]) {

        let downloadBtn = document.createElement("div")
        downloadBtn.innerHTML = "<tr><td style='width: 50px'><a class='read start'>下载</a></td></tr>"
        downloadBtn.onclick = function () { // 点击处理事件
            buttonClicked();
        };

        let ftNode = document.getElementsByClassName("ft")[0].childNodes[1].childNodes[1]

        ftNode.appendChild(downloadBtn)

    }
}

//勾选框创建
function layCheckbox() {
    let catalogueList = document.getElementsByClassName("list")[1]
    // 获取子节点li
    let liList = catalogueList.getElementsByTagName("li")
    // 每个li前面添加勾选框
    for (let i = 0; i < liList.length; i++) {
        let checkbox = document.createElement("input")
        checkbox.className = "downloadCheckbox"
        checkbox.type = "checkbox"
        liList[i].insertBefore(checkbox, liList[i].firstChild)
    }
}

(function () {
    'use strict';
    //放置按钮
    if (exist()) {
        layButton()
        layCheckbox()
    }
})()