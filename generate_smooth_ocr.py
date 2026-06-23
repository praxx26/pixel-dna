from PIL import Image, ImageDraw, ImageFont

print("Generating Test Image 2 (OCR) with Smooth Text...")
# Create a large high-res white image
img_ocr = Image.new('RGB', (800, 400), color=(255, 255, 255))
draw = ImageDraw.Draw(img_ocr)

# Use default font but draw it many times to make it slightly thicker,
# but to make it big and smooth, we will draw on a large canvas and NOT use nearest neighbor scaling
# Actually, since we don't have a guaranteed TTF font, let's just write code that scales with high quality
small_img = Image.new('RGB', (200, 50), color=(255, 255, 255))
small_draw = ImageDraw.Draw(small_img)
small_draw.text((10, 20), "AI-Generated", fill=(0, 0, 0))

# Scale it up using LANCZOS for smooth antialiasing instead of NEAREST
img_ocr = small_img.resize((800, 200), Image.LANCZOS)

img_ocr.save("test_ocr_smooth.png")
print("Saved 'test_ocr_smooth.png'")
