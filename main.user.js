// ==UserScript==
// @name         Diyibanzhu Downloader
// @namespace    http://tampermonkey.net/
// @version      3.3.0
// @supportURL   https://github.com/LanluZ/Diyibanzhu-Download
// @homepageURL  https://github.com/LanluZ/Diyibanzhu-Download
// @description  纯小白请勿下载，第一版主网下载器，因为网址并不固定，所以不做域名匹配
// @author       LanluZ
// @match        http://*/*
// @match        https://*/*
// @grant        unsafeWindow
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @license      MIT
// @require      https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js
// @require
// ==/UserScript==


//下载按钮点击事件
function downloadButtonClicked() {
    // 获取文章基础信息
    let title = getTitle()
    let info = getInfo()

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
                            console.log("> 下载开始 " + catalogueInfoList[i].text + '-' + contentInfoList[j].text)

                            // 删除多余标签
                            content_xhr.response = removeElement(content_xhr.response, "neirong")
                            console.log(">> 解析完成 " + catalogueInfoList[i].text + '-' + contentInfoList[j].text)

                            // 保存设置
                            let opt = {
                                margin: 1,
                                filename: title + "," + catalogueInfoList[i].text + ',' + contentInfoList[j].text + '.pdf',
                                image: {
                                    type: 'png',
                                }
                            }

                            // 保存网页页面为pdf
                            let pdf_obj = html2pdf().set(opt).from(content_xhr.response.body)
                            pdf_obj.save()
                        }
                    }

                }
            }
        }
    }
}

//快速搜索按钮点击事件
function searchButtonClicked() {
    let title = getTitle()
    let info = getInfo()
    // 信息输出
    console.log(title)
    console.log(info)

    // title字符串转UFT-8
    title = encodeURIComponent(title)

    // 打开新标签页通过谷歌搜索title内容
    window.open("https://www.google.com/search?q=" + title)

}

//快速复制按钮事件
function copyContentButtonClicked() {
    let div = document.getElementById('nr1');
    let text = div.innerText || div.textContent;
    navigator.clipboard.writeText(text).then(function () {
        console.log('文本已复制');
    });
}

//删除指定document多余元素
function removeElement(document, className) {
    try {
        // 寻找目标标签
        let aimTag = document.querySelector('.' + className);
        if (!aimTag) {
            console.log("未找到目标标签");
            return document;
        }

        // 寻找目标标签之前标签
        let prevTags = []
        let currentNode = aimTag
        while (currentNode.previousElementSibling || currentNode.parentElement) {
            if (currentNode.previousElementSibling) {
                currentNode = currentNode.previousElementSibling;
                prevTags.unshift(currentNode);
            } else if (currentNode.parentElement) {
                currentNode = currentNode.parentElement;
            }
        }

        // 寻找目标标签之后标签
        let nextTags = []
        currentNode = aimTag
        while (currentNode.nextElementSibling || currentNode.parentElement) {
            if (currentNode.nextElementSibling) {
                currentNode = currentNode.nextElementSibling;
                nextTags.push(currentNode);
            } else if (currentNode.parentElement) {
                currentNode = currentNode.parentElement;
            }
        }

        // 寻找目标标签父标签
        let parentTags = [];
        currentNode = aimTag;
        while (currentNode.parentElement) {
            parentTags.push(currentNode.parentElement);
            currentNode = currentNode.parentElement;
        }

        // 删除前标签中非父标签和非head标签
        for (let i = 0; i < prevTags.length; i++) {
            if (!parentTags.includes(prevTags[i]) && !prevTags[i].classList.contains('head')) {
                prevTags[i].remove();
            }
        }

        // 删除后标签
        for (let i = 0; i < nextTags.length; i++) {
            nextTags[i].remove();
        }


    } catch (e) {
        console.log("解析错误:", e);
    }

    return document;
}

//发送xmlHttp请求
function sendRequest(url) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "document";
    xhr.send();
    return xhr
}

//获取指定内容页章节标题链接
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
function existHome() {
    try {
        if (document.getElementsByClassName("read start")[0].innerHTML === "从头开始阅读") {
            return true
        }
    } catch (e) {
        return false
    }
}

//判断网页是否为内容页
function existContent() {
    //检查nr1是否存在
    try {
        if (document.getElementById("nr1")) {
            return true
        }
    } catch (e) {
        return false
    }
}

//获取文章标题
function getTitle() {
    return (document.getElementsByTagName("h1")[0].innerHTML)
}

//获取文章相关信息
function getInfo() {
    return (document.getElementsByClassName("info")[0].innerHTML.replace(/<br>/g, ""));
}

//下载按钮创建
function layDownloadButton() {
    if (document.getElementsByClassName("ft")[0]) {

        let downloadBtn = document.createElement("div")
        downloadBtn.innerHTML = "<tr><td style='width: 50px'><a class='read start'>下载</a></td></tr>"
        downloadBtn.onclick = function () { // 点击处理事件
            downloadButtonClicked();
        };

        let ftNode = document.getElementsByClassName("ft")[0].childNodes[1].childNodes[1]

        ftNode.appendChild(downloadBtn)

    }
}

//搜索按钮创建
function laySearchButton() {
    if (document.getElementsByClassName("ft")[0]) {
        let searchBtn = document.createElement("div")
        searchBtn.innerHTML = "<tr><td style='width: 50px'><a class='read start'>搜索</a></td></tr>"
        searchBtn.onclick = function () { // 点击处理事件
            searchButtonClicked();
        };
        let ftNode = document.getElementsByClassName("ft")[0].childNodes[1].childNodes[1]

        ftNode.appendChild(searchBtn)
    }
}

//勾选框创建
function layCheckbox() {
    let catalogueList = document.getElementsByClassName("list")

    // 匹配父元素检查是否为匹配目录
    for (let i = 0; i < catalogueList.length; i++) {
        let catalogue = catalogueList[i]
        let catalogueListFather = catalogueList[i].parentElement
        let childrenNum = catalogueListFather.children.length
        // 非目录
        if (childrenNum > 1) {
            continue
        }
        // 获取子节点li
        let liList = catalogue.getElementsByTagName("li")
        // 每个li前面添加勾选框
        for (let i = 0; i < liList.length; i++) {
            let checkbox = document.createElement("input")
            checkbox.className = "downloadCheckbox"
            checkbox.type = "checkbox"
            liList[i].insertBefore(checkbox, liList[i].firstChild)
        }
    }
}

//内容页复制按钮创建(针对于无反爬内容页)
function layCopyContentButton() {
    let ftNode = document.getElementsByClassName("page-title")[0]
    let copyContentButton = document.createElement("div")
    copyContentButton.innerHTML = "<tr><td style='width: 50px'><button>复制内容</button></td></tr>"
    copyContentButton.onclick = function () { // 点击处理事件
        copyContentButtonClicked();
    };
    ftNode.appendChild(copyContentButton)
    //修改nr1样式允许选中
    let nr1 = document.getElementById("nr1")
    nr1.style.userSelect = "text"
}


(function () {
    'use strict';
    //放置按钮
    if (existHome()) {
        layDownloadButton()
        laySearchButton()
        layCheckbox()
    }
    //内容页
    if (existContent()) {
        layCopyContentButton()
    }
})()