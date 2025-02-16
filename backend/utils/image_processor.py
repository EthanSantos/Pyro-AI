import numpy as np
from PIL import Image

def preprocess_image(image):
    # resizing to match model's expected input 
    image = image.resize((32, 32))
    
    # converting to array + normalizing
    img_array = np.array(image)
    img_array = np.expand_dims(img_array, 0)
    return img_array.astype(np.float32) / 255.0
