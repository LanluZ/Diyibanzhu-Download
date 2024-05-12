import os
import sys
import requests


def main():
    img_url = 'https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png'

    img_data = requests.get(img_url).content

    with open("temp.png", 'wb') as f:
        f.write(img_data)


if __name__ == '__main__':
    main()
