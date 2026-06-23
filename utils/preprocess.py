import numpy as np
from PIL import Image
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.preprocessing.image import img_to_array

def preprocess_image_for_model(image: Image.Image) -> np.ndarray:
    """
    Preprocesses a PIL image for the EfficientNetB0 model.
    1. Resize to 224x224
    2. Convert to RGB
    3. Normalize/preprocess using EfficientNet's built-in preprocess_input
    
    Returns:
        numpy array of shape (1, 224, 224, 3) ready for model.predict
    """
    # 1. Convert to RGB (in case it's RGBA or Grayscale)
    if image.mode != 'RGB':
        image = image.convert('RGB')
        
    # 2. Resize to 224x224
    image = image.resize((224, 224))
    
    # 3. Convert to array
    img_array = img_to_array(image)
    
    # 4. Expand dimensions to create a batch of 1
    img_batch = np.expand_dims(img_array, axis=0)
    
    # 5. Apply EfficientNet preprocessing
    processed_batch = preprocess_input(img_batch)
    
    return processed_batch
