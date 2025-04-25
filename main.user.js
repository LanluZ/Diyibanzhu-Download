// ==UserScript==
// @name         Diyibanzhu Downloader
// @namespace    http://tampermonkey.net/
// @version      4.0.0
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

class DiyibanzhuDownloader {
    constructor() {
        this.title = '';
        this.info = '';
        this.pdfOptions = {
            margin: 1,
            image: { type: 'jpeg', quality: 0.95 }, // 使用JPEG格式，稍微降低质量以提高速度
            enableLinks: false, // 禁用链接以提高速度
            html2canvas: {
                scale: 2, // 提高清晰度
                useCORS: true, // 允许跨域图片
                logging: false, // 禁用日志以提高性能
                letterRendering: true
            },
            jsPDF: {
                unit: 'pt',
                format: 'a4',
                compress: true // 启用压缩以减小文件大小
            }
        };
    }

    // 初始化页面
    init() {
        this.title = this.getTitle();
        this.info = this.getInfo();
        
        if (this.existHome()) {
            this.layDownloadButton();
            this.laySearchButton();
            this.layCheckbox();
        }
        
        if (this.existContent()) {
            this.layCopyContentButton();
        }
    }

    // 发送HTTP请求
    sendRequest(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.responseType = "document";
            xhr.onload = () => xhr.status === 200 ? resolve(xhr.response) : reject(new Error(`HTTP ${xhr.status}`));
            xhr.onerror = () => reject(new Error('Network Error'));
            xhr.send();
        });
    }

    // 下载处理
    async downloadButtonClicked() {
        try {
            const catalogueInfoList = this.getCatalogueInfo(document);
            const checkboxList = document.getElementsByClassName("downloadCheckbox");
            
            for (let i = 0; i < catalogueInfoList.length; i++) {
                if (!checkboxList[i].checked) continue;
                
                console.log(`开始处理章节: ${catalogueInfoList[i].text}`);
                
                try {
                    const catalogPage = await this.sendRequest(catalogueInfoList[i].href);
                    const contentInfoList = this.getContentInfo(catalogPage);
                    
                    for (const contentInfo of contentInfoList) {
                        try {
                            console.log(`> 开始下载: ${catalogueInfoList[i].text}-${contentInfo.text}`);
                            const contentPage = await this.sendRequest(contentInfo.href);
                            
                            // 预处理文档
                            const cleanedDoc = this.removeElement(contentPage, "neirong");
                            console.log(`>> 解析完成: ${catalogueInfoList[i].text}-${contentInfo.text}`);
                            
                            // 配置PDF选项
                            const options = {
                                ...this.pdfOptions,
                                filename: `${this.title},${catalogueInfoList[i].text},${contentInfo.text}.pdf`
                            };
                            
                            // 异步生成PDF
                            await this.generatePDF(cleanedDoc.body, options);
                            console.log(`>>> PDF生成完成: ${options.filename}`);
                        } catch (error) {
                            console.error(`下载内容页失败: ${contentInfo.text}`, error);
                        }
                    }
                } catch (error) {
                    console.error(`下载目录页失败: ${catalogueInfoList[i].text}`, error);
                }
            }
        } catch (error) {
            console.error('下载过程出错:', error);
        }
    }

    // 生成PDF
    async generatePDF(element, options) {
        return html2pdf().set(options).from(element).save();
    }

    // 搜索功能
    searchButtonClicked() {
        const encodedTitle = encodeURIComponent(this.title);
        window.open(`https://www.google.com/search?q=${encodedTitle}`);
    }

    // 复制内容
    copyContentButtonClicked() {
        const div = document.getElementById('nr1');
        const text = div.innerText || div.textContent;
        navigator.clipboard.writeText(text)
            .then(() => console.log('文本已复制'))
            .catch(err => console.error('复制失败:', err));
    }

    // 清理文档元素
    removeElement(document, className) {
        try {
            const aimTag = document.querySelector(`.${className}`);
            if (!aimTag) {
                console.log("未找到目标标签");
                return document;
            }

            // 获取所有相关元素
            const elements = {
                prev: this.getPreviousElements(aimTag),
                next: this.getNextElements(aimTag),
                parent: this.getParentElements(aimTag)
            };

            // 删除不需要的元素
            this.removeUnwantedElements(elements);
        } catch (e) {
            console.error("解析错误:", e);
        }
        return document;
    }

    // 获取前置元素
    getPreviousElements(element) {
        const elements = [];
        let current = element;
        while (current.previousElementSibling || current.parentElement) {
            if (current.previousElementSibling) {
                current = current.previousElementSibling;
                elements.unshift(current);
            } else if (current.parentElement) {
                current = current.parentElement;
            }
        }
        return elements;
    }

    // 获取后续元素
    getNextElements(element) {
        const elements = [];
        let current = element;
        while (current.nextElementSibling || current.parentElement) {
            if (current.nextElementSibling) {
                current = current.nextElementSibling;
                elements.push(current);
            } else if (current.parentElement) {
                current = current.parentElement;
            }
        }
        return elements;
    }

    // 获取父元素
    getParentElements(element) {
        const elements = [];
        let current = element;
        while (current.parentElement) {
            elements.push(current.parentElement);
            current = current.parentElement;
        }
        return elements;
    }

    // 删除不需要的元素
    removeUnwantedElements({prev, next, parent}) {
        prev.forEach(element => {
            if (!parent.includes(element) && !element.classList.contains('head')) {
                element.remove();
            }
        });

        next.forEach(element => element.remove());
    }

    // 获取内容信息
    getContentInfo(contentDocument) {
        const catalogueList = contentDocument.getElementsByClassName("chapterPages")[0];
        return Array.from(catalogueList.getElementsByTagName("a")).map(a => ({
            href: a.href,
            text: a.innerText
        }));
    }

    // 获取目录信息
    getCatalogueInfo(catalogueDocument) {
        const catalogueList = catalogueDocument.getElementsByClassName("list")[1];
        return Array.from(catalogueList.getElementsByTagName("li")).map(li => {
            const a = li.getElementsByTagName("a")[0];
            return {
                href: a.href,
                text: a.innerText
            };
        });
    }

    // 检查是否为主页
    existHome() {
        try {
            return document.getElementsByClassName("read start")[0].innerHTML === "从头开始阅读";
        } catch (e) {
            return false;
        }
    }

    // 检查是否为内容页
    existContent() {
        return !!document.getElementById("nr1");
    }

    // 获取标题
    getTitle() {
        return document.getElementsByTagName("h1")[0].innerHTML;
    }

    // 获取信息
    getInfo() {
        return document.getElementsByClassName("info")[0].innerHTML.replace(/<br>/g, "");
    }

    // UI相关方法
    layDownloadButton() {
        this.createButton("下载", () => this.downloadButtonClicked());
    }

    laySearchButton() {
        this.createButton("搜索", () => this.searchButtonClicked());
    }

    layCopyContentButton() {
        const ftNode = document.getElementsByClassName("page-title")[0];
        const button = document.createElement("div");
        button.innerHTML = "<tr><td style='width: 50px'><button>复制内容</button></td></tr>";
        button.onclick = () => this.copyContentButtonClicked();
        ftNode.appendChild(button);

        const nr1 = document.getElementById("nr1");
        if (nr1) nr1.style.userSelect = "text";
    }

    createButton(text, onClick) {
        const ft = document.getElementsByClassName("ft")[0];
        if (!ft) return;

        const button = document.createElement("div");
        button.innerHTML = `<tr><td style='width: 50px'><a class='read start'>${text}</a></td></tr>`;
        button.onclick = onClick;
        ft.childNodes[1].childNodes[1].appendChild(button);
    }

    layCheckbox() {
        const catalogueLists = document.getElementsByClassName("list");
        Array.from(catalogueLists).forEach(list => {
            const parent = list.parentElement;
            if (parent.children.length > 1) return;

            const items = list.getElementsByTagName("li");
            Array.from(items).forEach(item => {
                const checkbox = document.createElement("input");
                checkbox.className = "downloadCheckbox";
                checkbox.type = "checkbox";
                item.insertBefore(checkbox, item.firstChild);
            });
        });
    }
}

// 初始化脚本
(function() {
    'use strict';
    const downloader = new DiyibanzhuDownloader();
    downloader.init();
})();