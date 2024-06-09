import cv2
import numpy as np

def apply_gaussian_blur(image_path, sigma, output_path):
    # Read the image
    image = cv2.imread(image_path)

    # Calculate the kernel size based on sigma
    # A common practice is to set kernel size to be 6*sigma + 1 to cover the effective range
    kernel_size = int(6 * sigma + 1)
    kernel_size = kernel_size if kernel_size % 2 == 1 else kernel_size + 1  # Ensure kernel size is odd

    # Apply Gaussian blur
    blurred_image = cv2.GaussianBlur(image, (kernel_size, kernel_size), sigma)

    # Save the blurred image to the specified path
    cv2.imwrite(output_path, blurred_image)

    # Optional: Display the original and blurred images
    # cv2.imshow('Original Image', image)
    # cv2.imshow('Blurred Image', blurred_image)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()
# Example usage
#apply_gaussian_blur('path/to/your/image.jpg', 2.5, 'path/to/save/blurred_image.jpg')