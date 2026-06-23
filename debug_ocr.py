import easyocr
import numpy as np
from PIL import Image

try:
    reader = easyocr.Reader(['en'], gpu=False)
    
    img = Image.open("test_ocr_smooth.png")
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img_np = np.array(img)
    
    results = reader.readtext(img_np)
    
    print("OCR RAW RESULTS:")
    print(results)
    
    extracted_texts = [text.lower() for (_, text, _) in results]
    full_text = " ".join(extracted_texts)
    print("FULL TEXT EXTRACTED:", full_text)
    
    full_text_clean = full_text.replace('-', ' ').replace('_', ' ')
    print("CLEAN TEXT:", full_text_clean)

except Exception as e:
    print(f"Error: {e}")
