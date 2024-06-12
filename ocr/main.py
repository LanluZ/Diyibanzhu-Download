import sys
import onnxruntime
import cv2

import numpy as np

from scr.pdf import *

path = os.path.dirname(sys.argv[0])
poppler_path = os.path.join(path, 'scr', 'poppler', 'Library', 'bin')
data_pdf_path = os.path.join(path, 'data', 'pdf')
data_image_path = os.path.join(path, 'data', 'image')
data_model_path = os.path.join(path, 'model')


def main():



if __name__ == '__main__':
    main()
