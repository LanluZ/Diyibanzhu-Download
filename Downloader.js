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

//输出文件(未实现)
function outFile(){

}

//下载按钮事件(实现中)

var downloadStatus = 0

function downloadDoc(){

    if (downloadStatus != 0){
        alert("请勿重复点击！");
    }else{
        downloadStatus++;
        getList(0,0);

        //延时等待请求完毕(尚未实现自定义准备时间)
        setTimeout(() => {
            var link = getLink(catalogueArr);
            console.log(link);
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