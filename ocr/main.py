import os
import sys

from ocr.api.PPOCR_api import GetOcrApi

path = sys.argv[0]


def main():
    # 初始化
    exe_path = os.path.join(path, 'PaddleOCR-json', 'PaddleOCR-json.exe')  # 二进制程序路径
    print(os.path.exists(exe_path))
    print(exe_path)
    # orc = GetOcrApi(exe_path)


if __name__ == '__main__':
    main()
