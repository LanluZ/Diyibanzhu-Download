// ==UserScript==
// @name         Diyibanzhu Downloader
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @supportURL   https://github.com/LanluZ/Diyibanzhu-Download
// @homepageURL  https://github.com/LanluZ/Diyibanzhu-Download
// @description  第一版主网下载器，因为网址随时在变，所以不做域名匹配
// @author       LanluZ
// @match        http://*/*
// @match        https://*/*
// @grant        unsafeWindow
// @grant        GM_download
// @license      GNU GPLv3
// @require      https://cdn.jsdelivr.net/npm/web-streams-polyfill@2.0.2/dist/ponyfill.min.js
// @require      https://cdn.jsdelivr.net/gh/jimmywarting/StreamSaver.js/StreamSaver.js
// @require      https://cdn.jsdelivr.net/gh/eligrey/Blob.js/Blob.js
// ==/UserScript==


//获取文章章节信息
let catalogueArr = [];

let url = window.location.href;

//判断网页是否为第一版主三级子页面
function exist() {
    return document.getElementsByClassName("read start")[0].innerHTML === "从头开始阅读";
}

//获取文章标题
function getTitle() {
    return (document.getElementsByTagName("h1")[0].innerHTML);
}

//获取文章相关信息
function getInfo() {
    return (
        document.getElementsByClassName("info")[0].innerHTML.replace(/<br>/g, "")
    );
}


function getList(page, first) {
    //获取页数
    function getNumOfPage() {
        // 判断是否多页
        let numOfPageOrigin = document.getElementsByClassName("pagelistbox")[0]
        if (numOfPageOrigin == null){
            return 1;
        }
        return numOfPageOrigin.match(/\d+/g)[1];
    }

    //翻页
    async function turnPage(page) {
        let uurl = url.substring(0, url.length - 1) + "_" + page + "/";
        let xhr = new XMLHttpRequest();
        xhr.open("GET", uurl);
        xhr.responseType = "document";
        xhr.send();
        xhr.onload = function () {
            if (xhr.status !== 200) {
                alert("下载错误");
            } else {
                let temp = xhr.response.getElementsByClassName("list")[1].getElementsByTagName("a");
                for (let i = 0; i < temp.length; i++) {
                    catalogueArr.push(temp[i]);
                }
            }
        }
    }

    //递减式翻页法
    if (first === 0) {
        for (let i = 1; i <= getNumOfPage(); i++) {
            turnPage(i, 1);
        }
        return;
    } else if (first === 1) {
        turnPage(page, 2);
    } else if (first === 2) {
        return;
    }

}

//获取文章章节标题和链接
function getCatalogueInfo(list) {
    let link = [];
    for (let i = 0; i < list.length; i++) {
        link.push(list[i].innerText);
        link.push(window.location.host + list[i].getAttribute("href"));
    }
    return (link);
}


//下载按钮点击事件
function buttonClicked() {
    getList(0, 0) //获取章节

    //延时等待目录请求完毕
    setTimeout(() => {
        //得到链接列表
        let link = getCatalogueInfo(catalogueArr);
        console.log(catalogueArr);
        console.log(link);

        //开始下载

    }, 1000);
}

//按钮创建
function layButton() {
    if (document.getElementsByClassName("ft")[0]) {

        let downloadBtn = document.createElement("div")
        downloadBtn.innerHTML = "<tr><td style='width: 50px'><a class='read start'>下载</a></td></tr>";
        downloadBtn.onclick = function () { // 点击处理事件
            buttonClicked();
        };

        let ftNode = document.getElementsByClassName("ft")[0].childNodes[1].childNodes[1];

        ftNode.appendChild(downloadBtn);

    }
}

(function () {
    'use strict';
    //放置按钮
    if (exist()) {
        layButton();
    }
})()