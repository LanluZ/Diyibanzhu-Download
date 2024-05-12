import shutil

from bs4 import BeautifulSoup


# 解析删除多余标签
def analysis_delete_tags(soup: BeautifulSoup):
    try:
        # 目标节点
        aim_tag = soup.find(class_='neirong')
        # 父节点
        parent_tags = aim_tag.find_parents()
        # 子节点
        child_tags = aim_tag.find_all()
        # 删除多余前节点
        tags = aim_tag.find_all_previous()
        for tag in tags:
            if tag not in parent_tags:
                tag.extract()
        # 删除多余后节点
        tags = aim_tag.find_all_next()
        for tag in tags:
            if tag not in child_tags:
                tag.extract()
    except AttributeError as e:
        print("解析错误:", e)

    return soup


# 解析添加字体文件
def analysis_add_font(soup: BeautifulSoup, font_origin_path: str, font_aim_path: str):
    # css文件复制
    shutil.copy(font_origin_path, font_aim_path)

    # 创建head标签
    head_tag = soup.new_tag("head")
    # 创建字体样式
    style_tag = soup.new_tag("style")
    style_tag.string = """
    @font-face {
       font-family: 'font';
       src: url(font.ttf); 
    }
    """

    # 设置i标签字体
    for i in soup.find_all('i'):
        i['style'] = "font-family: 'font';"

    soup.insert(0, head_tag)
    soup.head.append(style_tag)

    return soup


# 解析下载文字图片
def analysis_download_img(soup: BeautifulSoup, source_url: str):
    """
    解析下载文字图片
    :param soup: 下载得到的原始网页文件
    :param source_url: 可供下载图片的网址,通常使用爬取该网页的地址
    :return: 处理后的网页文件
    """
