import os
import sys

from ocr.api.PPOCR_api import GetOcrApi
from ocr.api.PPOCR_visualize import visualize
from pdf import convert_batch_pdf2image

path = os.path.dirname(sys.argv[0])
pdf_dir_path = os.path.join(path, 'data', 'pdf')  # pdf文件夹路径
image_dir_path = os.path.join(path, 'data', 'image')  # 输出图片文件夹路径
poppler_path = os.path.join(path, 'poppler', 'Library', 'bin')  # poppler路径


def main():
    # 初始化
    exe_path = os.path.join(path, 'PaddleOCR-json', 'PaddleOCR-json.exe')  # 二进制程序路径

    # 存在性判断
    if os.path.exists(exe_path) is False:
        print('> PaddleOCR-json 不存在 程序关闭!!!')
        return
    else:
        print('> PaddleOCR-json 初始化进程开始')

    ocr = GetOcrApi(exe_path)

    # 图片识别
    img_path = os.path.join(path, 'test.png')
    res = ocr.run(img_path)
    text_blocks = res['data']

    # 识别结果
    ocr.printResult(res)

    # 识别结果可视化
    visualize(text_blocks, img_path).save("保存.png")


if __name__ == '__main__':
    main()
    # convert_batch_pdf2image(pdf_dir_path, image_dir_path, poppler_path)
