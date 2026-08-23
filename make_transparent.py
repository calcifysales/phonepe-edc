from PIL import Image

def make_transparent(input_path, output_path, tolerance=30):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    # Sample top-left corner color as background
    bg_color = datas[0]
    bg_r, bg_g, bg_b = bg_color[0], bg_color[1], bg_color[2]
    
    new_data = []
    for item in datas:
        r, g, b, a = item
        # If color is close to white/light background, make transparent
        if abs(r - bg_r) <= tolerance and abs(g - bg_g) <= tolerance and abs(b - bg_b) <= tolerance:
            new_data.append((255, 255, 255, 0))
        elif r > 240 and g > 240 and b > 240:
            # Smooth anti-aliased edge fading
            alpha = int(255 - ((min(r, g, b) - 240) / 15) * 255)
            new_data.append((r, g, b, max(0, min(255, alpha))))
        else:
            new_data.append((r, g, b, a))
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print("New transparent horizontal logo saved to:", output_path)

if __name__ == '__main__':
    make_transparent("logo_raw.png", "logo.png")
