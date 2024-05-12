import os
import sys
from bs4 import BeautifulSoup

path = os.path.dirname(sys.argv[0])
data_path = os.path.join(path, 'data')


def main():
    for filename in os.listdir(data_path):
        # html页面判断
        if filename.endswith('.html'):
            soup = None
            # 解析html
            with open(os.path.join(data_path, filename), 'r') as f:
                html = f.read()
            try:
                soup = BeautifulSoup(html, 'html.parser')
                # 目标节点
                aim_tag = soup.find(id='chapterinfo')
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

            # 保存html
            with open(os.path.join(data_path, filename + ".html"), 'w') as f:
                f.write(soup.prettify())

            print(1)


if __name__ == '__main__':
    main()
