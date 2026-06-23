from PIL import Image, ImageDraw, PngImagePlugin

print("Generating Test Image 1 (Metadata)...")
# Create a simple solid color image
img_meta = Image.new('RGB', (500, 500), color=(100, 150, 200))
# Add hidden metadata tags
metadata = PngImagePlugin.PngInfo()
metadata.add_text("Software", "Midjourney v5.2")
metadata.add_text("Parameters", "prompt: a beautiful landscape")
# Save with metadata
img_meta.save("test_metadata.png", "png", pnginfo=metadata)
print("Saved 'test_metadata.png'")

print("Generating Test Image 2 (OCR)...")
# Create a white image
img_ocr = Image.new('RGB', (600, 300), color=(255, 255, 255))
draw = ImageDraw.Draw(img_ocr)

# To ensure the text is big enough without needing a TTF font file, 
# we'll draw it on a small image and scale it up.
small_img = Image.new('RGB', (150, 50), color=(255, 255, 255))
small_draw = ImageDraw.Draw(small_img)
small_draw.text((10, 20), "AI-Generated", fill=(0, 0, 0))
# Scale it up 4x so it's massive and easy for OCR to read
img_ocr = small_img.resize((600, 200), Image.NEAREST)

img_ocr.save("test_ocr.png")
print("Saved 'test_ocr.png'")
