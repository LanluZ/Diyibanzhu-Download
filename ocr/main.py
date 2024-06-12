import os
import sys

import ocr.api.tbpu as tbpu

from ocr.api.PPOCR_api import GetOcrApi
from ocr.api.PPOCR_visualize import visualize
from pdf import convert_batch_pdf2image

path = os.path.dirname(sys.argv[0])
pdf_dir_path = os.path.join(path, 'data', 'pdf')  # pdf文件夹路径
image_dir_path = os.path.join(path, 'data', 'image')  # 输出图片文件夹路径
text_dir_path = os.path.join(path, 'data', 'text')  # 输出文本文件夹路径
poppler_path = os.path.join(path, 'poppler', 'Library', 'bin')  # poppler路径


def main():
    # pdf预处理
    # convert_batch_pdf2image(pdf_dir_path, image_dir_path, poppler_path)

    # 初始化
    exe_path = os.path.join(path, 'PaddleOCR-json', 'PaddleOCR-json.exe')  # 二进制程序路径
    # 存在性判断
    if os.path.exists(exe_path) is False:
        print('> PaddleOCR-json 不存在 程序关闭!!!')
        return
    else:
        print('> PaddleOCR-json 初始化进程开始')
    ocr = Ocr(exe_path)

    # 图片载入
    for image_dir_son_name in os.listdir(image_dir_path):

        # 文本保存
        text_output_file = open(os.path.join(text_dir_path, image_dir_son_name + '.txt'), 'w', encoding='utf-8')

        print(f'> 子组：{image_dir_son_name} 开始识别')

        # 子图识别
        for image_name in os.listdir(os.path.join(image_dir_path, image_dir_son_name)):
            image_path = os.path.join(image_dir_path, image_dir_son_name, image_name)

            # 图片识别
            res = ocr.run(image_path)
            text_blocks = res['data']
            # 合并自然段
            try:
                text_blocks_new = tbpu.MergePara(text_blocks)
            except AttributeError:
                continue

            # 文本保存
            for text_line in text_blocks_new:
                text_output_file.write(text_line['text'] + '\n')

            print(f'> 子图：{image_name} 识别完成')


class Ocr:
    # 初始化ocr
    def __init__(self, exe_path):
        self.ocr = GetOcrApi(exe_path)
        self.res = None

    # 图片识别
    def run(self, image_path):
        self.res = self.ocr.run(image_path)
        return self.res


if __name__ == '__main__':
    main()
