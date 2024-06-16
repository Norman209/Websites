import cv2
import numpy as np
from PIL import Image, ImageFilter
def apply_gaussian_blur(image_path, base_sigma, output_path):
    image = Image.open(image_path)

    # Apply blur
    blurred_image = image.filter(ImageFilter.GaussianBlur(radius=base_sigma*2.5))

    # Save the modified image
    blurred_image.save(output_path)


