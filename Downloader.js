// ==UserScript==
// @name         Diyibanzhu Downloader
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @supportURL   
// @homepageURL  
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
    if(url.match(/\//g).length-2 == 3 && document.title.match(/第一版主网/).length == 1){
        if(url.indexOf("_") == -1){
            return true;
        }
    }   return false;
    
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
function getLink(list){
    let link = new Array();
    for (let i = 0;i < list.length; i++){
        link.push(url + list[i].getAttribute("href"));
    }return (link);
}

//获取文章章节子页面(未实现)
function getContain(){

}

//输出文件
function outFile(text){
    //StreamSaver库运用
    const blob = new Blob([text])
    const fileStream = streamSaver.createWriteStream(getTitle() + '.txt', {
    size: blob.size
    })
    const readableStream = blob.stream()
    if (window.WritableStream && readableStream.pipeTo) {
    return readableStream.pipeTo(fileStream)
        .then(() => console.log('done writing'))
    }
    window.writer = fileStream.getWriter()
    const reader = readableStream.getReader()
    const pump = () => reader.read()
    .then(res => res.done
        ? writer.close()
        : writer.write(res.value).then(pump))
    pump()
}

//下载按钮事件

var downloadStatus = 0

function downloadDoc(){

    if (downloadStatus != 0){
        alert("请勿重复点击！");
    }else{
        downloadStatus++;
        getList(0,0);

        //延时等待目录请求完毕(尚未实现自定义准备时间)
        setTimeout(() => {
            var link = getLink(catalogueArr);
            console.log(link);
            //延时等待内容请求完毕
            setTimeout(() => {
                //添加书籍信息
                let text = getInfo();
                //添加书籍内容
                text += getContain();
                outFile(text);
            }, catalogueArr.length * 200);
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

(function() {
    'use strict';

    //放置按钮
    if(exsit()){
        layButton();
    }

})()