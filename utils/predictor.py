import os
import tensorflow as tf
from .preprocess import preprocess_image_for_model

# Global variable to hold the loaded model
_model = None

def load_ai_detector_model():
    """Loads the trained EfficientNetB0 model from disk."""
    global _model
    if _model is not None:
        return _model
        
    model_path = os.path.join('models', 'ai_detector.h5')
    if not os.path.exists(model_path):
        print(f"Model file not found at {model_path}. You need to run train.py first.")
        return None
        
    try:
        _model = tf.keras.models.load_model(model_path)
        return _model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

def predict_image(image):
    """
    Predicts whether an image is Real or AI Generated using the CNN model.
    
    Args:
        image: PIL Image object
        
    Returns:
        tuple: (bool is_ai, float confidence)
    """
    model = load_ai_detector_model()
    if model is None:
        return False, 0.0 # Fail gracefully if model isn't loaded
        
    try:
        # Preprocess
        processed_img = preprocess_image_for_model(image)
        
        # Predict
        prediction = model.predict(processed_img)
        
        # Since classes are: 0 = Real, 1 = Fake (AI)
        # prediction[0][0] is the probability of class 1 (AI)
        ai_prob = float(prediction[0][0])
        
        # Based on evaluation, threshold 0.80 yields the best balanced accuracy
        threshold = 0.80
        is_ai = ai_prob >= threshold
        
        # Calculate confidence score (how far it is from 0.5)
        if is_ai:
            confidence = ai_prob * 100
        else:
            confidence = (1.0 - ai_prob) * 100
            
        return is_ai, confidence
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return False, 0.0
