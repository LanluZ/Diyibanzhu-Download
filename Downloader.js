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

    //获取页数
    function getNumOfPage(){
        let numOfPageOrigin = document.getElementsByClassName("page")[1].childNodes[4].textContent;
        let numOfPage = numOfPageOrigin.match(/\d+/g)[1];
        return numOfPage;
    }

    //翻页(未实现)
    function turnPage(){
        var xhr = new XMLHttpRequest(); 
        var uurl = url.substring(0, url.length-2)
        for (let i = 1; i < 10; i++){
            xhr.open("GET",uurl);
            xhr.send();
        }
    }

    return(
        document.getElementsByClassName("list")[1].getElementsByTagName("a")
    );
}

//获取文章章节链接
function getLink(list){
    let link = new Array();
    for (let i = 0;i < list.length ; i++){
        link.push(url + list[i].getAttribute("href"));
    }return (link);
}

//获取文章章节子页面(未实现)
function getContain(){

}

//输出文件(未实现)
function outFile(){

}

//下载按钮事件(未实现)
function downloadDoc(){
    alert("1");
    if(exsit()){
        let link = getLink(getList());
    }
}

//按钮创建(实现一半)
function layButton(){
    if(document.getElementsByClassName("ft")[0]){
        document.getElementsByClassName("ft")[0].childNodes[1].childNodes[1].innerHTML += "\
        <tr>\
            <td width='50%'>\
                <a class='read start' href='javascript:downloadDoc()'>下载</a>\
            </td>\
        </tr>";
    }
}

(function() {
    'use strict';
    //按钮创建
    layButton();

    //debuger
    if(exsit()){
        let link = getLink(getList());
        console.log(link);
    }


})()