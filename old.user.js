42
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
// @license      GNU GPLv3
// @require      https://cdn.jsdelivr.net/npm/web-streams-polyfill@2.0.2/dist/ponyfill.min.js
// @require      https://cdn.jsdelivr.net/gh/jimmywarting/StreamSaver.js/StreamSaver.js
// @require      https://cdn.jsdelivr.net/gh/eligrey/Blob.js/Blob.js
// ==/UserScript==

var url = window.location.href;

//判断网页是否为第一版主三级子页面
function exsit(){
    if(document.getElementsByClassName("read start")[0].innerHTML == "从头开始阅读"){
        return true;
    }return false;
    
    // 已废弃的匹配规则
    // if(url.match(/\//g).length-2 == 3 && document.title.match(/第一版主网/).length == 1){
    //     if(url.indexOf("_") == -1){
    //         return true;
    //     }
    // }   return false;
    
}

//获取文章标题
function getTitle(){
    return (document.getElementsByTagName("h1")[0].innerHTML);
}

//获取文章相关信息
function getInfo(){
    return (
        document.getElementsByClassName("info")[0].innerHTML.replace(/<br>/g,"")
    );
}

//获取文章章节信息

var catalogueArr = new Array();

function getList(page,first){

    //获取页数
    function getNumOfPage(){
        let numOfPageOrigin = document.getElementsByClassName("page")[1].childNodes[4].textContent;
        let numOfPage = numOfPageOrigin.match(/\d+/g)[1];
        return numOfPage;
    }

    //翻页
    async function turnPage(page){
        let uurl = url.substring(0, url.length-1) + "_" + page + "/";    
        let xhr =new XMLHttpRequest();
        xhr.open("GET", uurl);
        xhr.responseType = "document";
        xhr.send();
        xhr.onload = function(){
            if (xhr.status != 200){
                alert("下载错误");
            }else{
                let temp = xhr.response.getElementsByClassName("list")[1].getElementsByTagName("a");
                for (let i = 0;i < temp.length; i++ ){
                    catalogueArr.push(temp[i]);
                }
            }
        }
    }

    //递减式翻页法
    if(first == 0){
        for (let i = 1 ;i <= getNumOfPage(); i++){
            turnPage(i, 1);
        }return;
    }else if (first == 1){
        turnPage(page, 2);
    }else if (first == 2){
        return;
    }

}

//获取文章章节链接
function getCataInfo(list){
    let link = new Array();
    for (let i = 0;i < list.length; i++){
        link.push(window.location.host + list[i].getAttribute("href"));
    }return (link);
}

//文本信息
var conText = "";

//获取文章内容
function getContain(link){

    //单页子页面爬取
    async function getText(page){
        //初始化
        let linkCo ="http://" + link.substring(0, link.length-5) + "_" + page + ".html";  
        let xhr =new XMLHttpRequest();
        xhr.open("GET", linkCo);
        xhr.responseType = "document";
        xhr.send();
        xhr.onload = function(){
            if (xhr.status != 200){
                alert("下载错误");
            }else{
                //存在性判断
                if(xhr.response.getElementsByClassName("chapterinfo")[0]||xhr.response.getElementsByClassName("chapter-text")[0]){
                    let tempText = "";

                    //第一页
                    if(page == 1){
                        let tempFather = xhr.response.getElementsByClassName("chapterinfo")[0].childNodes;
                        for(let i = 0; i < tempFather.length; i++){
                            if(tempFather[i].nodeName == "BR")
                                tempText += "\n"
                            else
                                tempText += tempFather[i].textContent;
                        }//添加信息
                    }//其他页
                    else if(page != 1){
                        let tempText = xhr.response.getElementsByClassName("chapter-text")[0].outerText;
                        conText += tempText;
                    }
                    conText += tempText;
                }
            }
        }
    }


    //懒得获取子页面页面数，暴力20页抓取
    for(let i = 1; i <= 20; i++){
        getText(i);
    }


}

//文章排序(未实现|等待有缘人)
function sortContain(){

}

//图片识别(未实现|等待有缘人)
function ocrImg(){
    
}

//输出文件
function outFile(text){
    //StreamSaver库
    const blob = new Blob([text])
    const fileStream = streamSaver.createWriteStream(getTitle() + '.txt', {
    size: blob.size
    })
    const readableStream = blob.stream()
    if (window.WritableStream && readableStream.pipeTo) {
    return readableStream.pipeTo(fileStream)
        .then(() => console.log('下载完成'))
    }
    window.writer = fileStream.getWriter()
    const reader = readableStream.getReader()
    const pump = () => reader.read()
    .then(res => res.done
        ? writer.close()
        : writer.write(res.value).then(pump))
    pump()
}

//标题倒计时事件
function setTitle(remain){
    let sourceTitle = document.title;
    function setTitleTime(){
        document.title = "[" + remain + "s]" + sourceTitle;
        remain--;
        if (remain <= 0){
            clearInterval(timeID);
            document.title = "[完毕]" + sourceTitle;
        }
    }
    var timeID = setInterval(setTitleTime,1000);
}

//下载按钮事件

//已下载状态标识
var downloadStatus = 0

function downloadDoc(){

    if (downloadStatus != 0){
        alert("请勿重复点击！");
    }else{
        downloadStatus++;
        getList(0,0);
        alert("准备中，4秒后开始\n如果浏览器标题显示完成仍未开始下载请检查浏览器是否拦截弹窗");

        //延时等待目录请求完毕(尚未实现自定义准备时间)
        setTimeout(() => {
            //得到链接列表
            var link = getCataInfo(catalogueArr);
            console.log(catalogueArr);
            console.log(link);
            //显示倒计时
            setTitle(Math.ceil((catalogueArr.length * 200 + 1000)/1000))

            //延时等待内容请求完毕
            setTimeout(() => {
                //添加书籍信息
                conText = getInfo();
                
                //添加书籍内容
                for(let i = 0; i < link.length; i++){
                    getContain(link[i]);
                } 
                //输出文件
                setTimeout(() => {
                    outFile(conText);
                }, catalogueArr.length * 200 + 1000);
            }, 1000);//评估下载时长
        }, 4000);
    }
}

//按钮创建
function layButton(){
    if(document.getElementsByClassName("ft")[0]){

        let downloadBtn = document.createElement("div")
        downloadBtn.innerHTML = "<tr><td width='50%'><a class='read start'>下载</a></td></tr>";
        downloadBtn.onclick = function(){
            downloadDoc();
        };

        let ftNode = document.getElementsByClassName("ft")[0].childNodes[1].childNodes[1];

        ftNode.appendChild(downloadBtn);
        
    }
}

// 入口
(function() {
    'use strict';   

    //放置按钮
    if(exsit()){
        layButton();
    }

})()