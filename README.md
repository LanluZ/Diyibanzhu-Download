# Diyibanzhu-Download

## 第一版主网小说下载器

---

### 运行

#### 脚本

1. 浏览器安装 [Tampermonkey](https://github.com/Tampermonkey/tampermonkey) 拓展插件
2. 安装脚本

#### 后处理程序

1. 下载 Release 中的源码
2. 安装程序依赖

### 方案

1. 通过Tampermonkey爬取网页,并渲染成PDF文件
2. 在本地使用OCR推理模型对PDF文字识别,并汇总成TXT文件

### 感谢

1. [Tampermonkey](https://github.com/Tampermonkey/tampermonkey): 用户脚本管理器
2. [PaddleOCR-json](https://github.com/hiroi-sora/PaddleOCR-json): OCR离线图片文字识别命令行windows程序
3. [pdf2image](https://github.com/Belval/pdf2image/tree/master): 将pdf转化为PIL图像的模块

---

该脚本仅供学习使用

目前仅js脚本可使用,OCR等待部署中,README等待完善中

### 警告：这是一个比较早期的版本，有许多功能未实现

#### 预览

网站页面

![001](./img/001.png)

下载结果

![002](./img/002.png)

