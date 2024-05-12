import os
import sys

import matplotlib.pyplot as plt
import matplotlib.font_manager as fm

path = os.path.dirname(sys.argv[0])
font_path = os.path.join(path, 'data', 'font')


def main():
    ttf_path = os.path.join(font_path, 'font.ttf')

    # 载入字体并用改字体输出指定编码文字
    font = fm.FontProperties(fname=ttf_path)

    fig, ax = plt.subplots()

    text = ''
    ax.text(0.5, 0.5, text, fontproperties=font)

    plt.show()


if __name__ == '__main__':
    main()
