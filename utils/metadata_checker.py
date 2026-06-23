from PIL import Image
from PIL.ExifTags import TAGS

def check_metadata(image_file):
    """
    Analyzes the metadata (Exif and text chunks) of an uploaded image for AI signatures.
    
    Args:
        image_file: file-like object or path
        
    Returns:
        tuple: (bool is_ai, str reason)
    """
    ai_keywords = [
        'stable diffusion', 'midjourney', 'dall-e', 'dall e', 'openai', 
        'adobe firefly', 'generated', 'ai generated', 'creator tool', 
        'prompt', 'seed', 'gemini'
    ]
    
    try:
        # Open image
        img = Image.open(image_file)
        
        metadata_text = []
        
        # 1. Check basic info
        info = img.info
        if info:
            for key, value in info.items():
                if isinstance(value, str) or isinstance(value, bytes):
                    try:
                        decoded_val = str(value)
                        metadata_text.append(f"{key}: {decoded_val}")
                    except Exception:
                        pass
        
        # 2. Check Exif Data
        exif_data = img.getexif()
        if exif_data:
            for tag_id in exif_data:
                tag = TAGS.get(tag_id, tag_id)
                data = exif_data.get(tag_id)
                if isinstance(data, bytes):
                    try:
                        data = data.decode()
                    except Exception:
                        pass
                metadata_text.append(f"{tag}: {str(data)}")
                
        # Combine all found text
        full_text = " ".join(metadata_text).lower()
        
        # Check against keywords
        for keyword in ai_keywords:
            if keyword in full_text:
                # Find a snippet to show as reason
                snippet = ""
                for line in metadata_text:
                    if keyword in line.lower():
                        snippet = line[:100] # take up to 100 chars
                        break
                return True, f"AI metadata detected (Keyword: '{keyword}', Details: {snippet})"
                
        return False, "No AI-related metadata found."
        
    except Exception as e:
        return False, f"Error reading metadata: {str(e)}"
