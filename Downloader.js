// ==UserScript==
// @name         Diyibanzhu Downloader
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @supportURL   
// @homepageURL  
// @description  第一版主网下载器，因为网址随时在变，所以暂时不做域名匹配
// @author       LanluZ
// @match        http://*/*
// @match        https://*/*
// @grant        unsafeWindow
// @license      GNU GPLv3
// ==/UserScript==

var url = window.location.href;

//判断网页是否为第一版主网三级子页面
function exsit(){
    if(url.match(/\//g).length-2 == 3 && document.title.match(/第一版主网/).length == 1){
        return true;
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
function getList(){
    return(
        document.getElementsByClassName("list")[1].getElementsByTagName("a")
    );
}

//获取文章章节链接
function getLink(list){
    var link = new Array();
    for (var i = 0;i < list.length ; i++){
        link.push(list[i].getAttribute("href"));
    }return link;
}

//获取文章章节子页面数

//输出文件

(function() {
    'use strict';

    if(exsit()){
        var link = getLink(getList());
        console.log(link);
    }

})()