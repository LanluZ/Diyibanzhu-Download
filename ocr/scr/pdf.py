import copy
import os
import pdf2image

from PIL import Image


# 批量转化pdf到image
def convert_batch_pdf2image(data_pdf_path, data_image_path, poppler_path):
    # 读取pdf目录
    pdf_names = os.listdir(data_pdf_path)
    for pdf_name in pdf_names:
        # 解析pdf名字
        title = pdf_name.split(',')[0]  # 标题
        subtitle = pdf_name.split(',')[1]  # 子标题
        page = pdf_name.split(',')[2].split('.')[0]  # 页码

        # 信息输出
        print(f'> 载入文件 {title},{subtitle},{page}')

        # 拼接pdf页面为长图
        pdf_file_path = os.path.join(data_pdf_path, pdf_name)

        # 转换pdf为image
        images = pdf2image.convert_from_path(
            pdf_path=pdf_file_path,
            output_file=os.path.join(data_image_path, f'{title},{subtitle},{page}.jpg'),
            poppler_path=poppler_path
        )

        # 纵向拼接image
        # 创建空白画布
        x_size, y_size = images[0].size[0], 0
        for image in images:
            y_size += image.size[1]
        result_image = Image.new('RGB', (x_size, y_size), 'white')
        # 指定位置粘贴图片
        y_size = 0
        for image in images:
            result_image.paste(image, (0, y_size))
            y_size += image.size[1]

        # 保存图像
        result_image.save(os.path.join(data_image_path, f'{title},{subtitle},{page}.jpg'))
