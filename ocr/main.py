import os
import sys

from bs4 import BeautifulSoup

import scr.analysis

path = os.path.dirname(sys.argv[0])
data_html_path = os.path.join(path, 'data', 'html')
data_pdf_path = os.path.join(path, 'data', 'pdf')
data_font_path = os.path.join(path, 'data', 'font')

source_url = 'https://www.33yydstxt226.com'


def main():
    for filename in os.listdir(data_html_path):
        # html页面判断
        if filename.endswith('.html'):
            with open(os.path.join(data_html_path, filename), 'r', encoding='utf-8') as f:
                html = f.read()

            # 解析html删除节点
            soup = BeautifulSoup(html, 'html.parser')
            soup = scr.analysis.analysis_delete_tags(soup)

            # 解析html添加字体外部引用
            soup = scr.analysis.analysis_add_font(soup, os.path.join(data_font_path, 'font.ttf'),
                                                  os.path.join(data_pdf_path, 'font.ttf'))

            # 解析html下载图片
            soup = scr.analysis.analysis_download_img(soup, source_url, data_pdf_path)

            # 保存html
            with open(os.path.join(data_pdf_path, filename + ".html"), 'w') as f:
                f.write(soup.prettify())

            print(filename, "解析完成!")


if __name__ == '__main__':
    main()
