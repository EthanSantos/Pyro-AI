import numpy as np

def preprocess_image(image):
    # Resize the image to match the model's expected input
    image = image.resize((32, 32))
    
    # Convert the image to a NumPy array
    img_array = np.array(image, dtype=np.float32)
    
    # If the image has no channel dimension (e.g., grayscale), expand it to 3 channels
    if img_array.ndim == 2:
        img_array = np.stack((img_array,) * 3, axis=-1)
    
    # If the image has an alpha channel, discard it (keep only first three channels)
    if img_array.shape[-1] == 4:
        img_array = img_array[..., :3]
    
    # Normalize the array to the range [0, 1]
    # Optionally, add a batch dimension if needed later on
    img_array = img_array / 255.0
    return img_array
