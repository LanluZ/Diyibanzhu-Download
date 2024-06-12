import os
import pdf2image


# 批量转化pdf到image
def convert_batch_pdf2image(data_pdf_path, data_image_path, poppler_path):
    # 读取pdf目录
    pdf_names = os.listdir(data_pdf_path)
    for pdf_name in pdf_names:
        # 解析pdf名字
        title = pdf_name.split(',')[0]  # 标题
        subtitle = pdf_name.split(',')[1]  # 子标题
        page = pdf_name.split(',')[2].split('.')[0]  # 页码

        # 创建子图片文件夹
        if not os.path.exists(os.path.join(data_image_path, f"{title},{subtitle}")):
            os.makedirs(os.path.join(data_image_path, f"{title},{subtitle}"))

        # 信息输出
        print(f'> 载入文件 {title},{subtitle},{page}')

        # 转化pdf
        pdf_file_path = os.path.join(data_pdf_path, pdf_name)

        # 转换pdf为image
        images = pdf2image.convert_from_path(
            pdf_path=pdf_file_path,
            output_file=os.path.join(data_image_path, f'{title},{subtitle},{page}.jpg'),
            poppler_path=poppler_path
        )

        # 保存图像
        i = 0  # 计数器
        for image in images:
            image.save(
                os.path.join(
                    data_image_path,
                    os.path.join(data_image_path, f"{title},{subtitle}", f'{page},{i}.png')
                )
            )
            i += 1
