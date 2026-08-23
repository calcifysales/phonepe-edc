from PIL import Image

def trim_transparent(image_path):
    img = Image.open(image_path).convert("RGBA")
    # Get bounding box of non-zero alpha pixels
    bbox = img.getbbox()
    if bbox:
        trimmed_img = img.crop(bbox)
        trimmed_img.save(image_path, "PNG")
        print(f"Image trimmed successfully! New size: {trimmed_img.size} (old size: {img.size})")
    else:
        print("No non-transparent pixels found.")

if __name__ == '__main__':
    trim_transparent("logo.png")
