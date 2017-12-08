#!/usr/bin/env python
# -*- coding: UTF-8 -*-

import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

try:
    import cStringIO as StringIO
except ImportError:
    import StringIO

_numbers = "1234567890"                                         # 数字
init_chars = ''.join(( _numbers))   # 生成允许的字符集合
default_font = "./Arial.ttf"                               # 验证码字体



def generate_verify_image(size=(120, 120),
                          img_type="GIF",
                          mode="RGB",
                          bg_color=(255, 255, 255),
                          fg_color=(0, 0, 255),
                          font_size=100,
                          font_type=default_font,
                          save_img=True,
                          cust_str=''):

    """
    生成图片
    :param size: 图片的大小，格式（宽，高），默认为(120, 30)
    :param chars: 允许的字符集合，格式字符串
    :param img_type: 图片保存的格式，默认为GIF，可选的为GIF，JPEG，TIFF，PNG
    :param mode: 图片模式，默认为RGB
    :param bg_color: 背景颜色，默认为白色
    :param fg_color: 前景色，验证码字符颜色，默认为蓝色#0000FF
    :param font_size: 验证码字体大小
    :param font_type: 验证码字体，默认为 DejaVuSans.ttf
    :param save_img: 是否保存为图片
    :return: [0]: 验证码字节流, [1]: 验证码图片中的字符串
    """

    width, height = size  # 宽， 高
    img = Image.new(mode, size, bg_color)  # 创建图形
    # img = Image.new(mode, size)  # 创建图形
    draw = ImageDraw.Draw(img)  # 创建画笔


    def create_strs(cust_str=""):
        """绘制字符"""
        c_chars = cust_str
        strs = ' %s ' % ' '.join(c_chars)  # 每个字符前后以空格隔开

        font = ImageFont.truetype(font_type, font_size)
        font_width, font_height = font.getsize(strs)

        draw.text(((width - font_width) / 3, (height - font_height) / 3),
                  strs, font=font, fill=fg_color)

        return ''.join(c_chars)


    create_strs(cust_str)

    mstream = StringIO.StringIO()
    img.save(mstream, img_type)

    if save_img:
        img_name = cust_str + ".gif"
        img.save(img_name, img_type)



if __name__ == "__main__":
    for i in range(10):
        generate_verify_image(cust_str=str(i))
    command = 'convert -dispose previous -delay 5 \
-page +0+0  0.gif \
-page +0+0 1.gif \
-page +0+0 2.gif \
-page +0+0 3.gif \
-page +0+0 4.gif \
-page +0+0 5.gif \
-page +0+0 6.gif \
-page +0+0 7.gif \
-page +0+0 8.gif \
-page +0+0 9.gif \
-loop 0 final.gif'
    # 需要安装imagemagick
    os.system(command)

