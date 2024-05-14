import os
import sys

from scr.pdf import *

path = os.path.dirname(sys.argv[0])
poppler_path = os.path.join(path, 'scr', 'poppler', 'Library', 'bin')
data_pdf_path = os.path.join(path, 'data', 'pdf')
data_image_path = os.path.join(path, 'data', 'image')


def main():
    # 批量转化pdf文件夹内所有pdf到image
    convert_batch_pdf2image(data_pdf_path, data_image_path, poppler_path)
    # 载入OCR模型


if __name__ == '__main__':
    main()
