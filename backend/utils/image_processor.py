import tensorflow as tf

def preprocess_image(image):
    # resizing to match model's expected input 
    image = image.resize((32, 32))
    
    # converting to array + normalizing
    img_array = tf.keras.utils.img_to_array(image)
    img_array = tf.expand_dims(img_array, 0)
    return img_array / 255.0
