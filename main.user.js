// ==UserScript==
// @name         Diyibanzhu Downloader
// @namespace    http://tampermonkey.net/
// @version      2.0.0
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
// @require      https://cdn.jsdelivr.net/npm/web-streams-polyfill@2.0.2/dist/ponyfill.min.js
// @require      https://cdn.jsdelivr.net/gh/jimmywarting/StreamSaver.js/StreamSaver.js
// @require      https://cdn.jsdelivr.net/gh/eligrey/Blob.js/Blob.js
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

    console.log(catalogueInfoList)

    // 下载内容
    for (let i = 0; i < catalogueInfoList.length; i++) {
        // 发送请求
        let download_url = catalogueInfoList[i].href
        GM_download({
            url: download_url,
            name: title + catalogueInfoList[i].text + ".txt",
            timeout: 10000,
            onerror: function (err) {
                console.log(download_url)
                console.log(err)
                console.log("下载失败")
            }
        })

    }
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

(function () {
    'use strict';
    //放置按钮
    if (exist()) {
        layButton();
    }
})()