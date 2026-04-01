import cv2
import os
from PIL import Image

def process():
    old_path = "equipe_luciana.jpg"
    new_path = "equipe_luciana_nova.jpg"
    out_path = "equipe_luciana_nova_cropped.jpg"

    with Image.open(old_path) as old_im:
        print("Old image size:", old_im.size)
        aspect_ratio = old_im.size[0] / old_im.size[1]
    
    img = cv2.imread(new_path)
    if img is None:
        print(f"Error reading {new_path}")
        return
        
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    
    H, W = img.shape[:2]
    
    if len(faces) > 0:
        faces = sorted(faces, key=lambda f: f[2]*f[3], reverse=True)
        x, y, w, h = faces[0]
        cx = x + w//2
        cy = y + h//2
        
        crop_h = int(h * 3.5)
        crop_w = int(crop_h * aspect_ratio)
        
        if crop_h > H: crop_h = H; crop_w = int(crop_h * aspect_ratio)
        if crop_w > W: crop_w = W; crop_h = int(crop_w / aspect_ratio)
        
        y1 = max(0, cy - int(crop_h * 0.35))
        y2 = y1 + crop_h
        if y2 > H:
            y2 = H
            y1 = H - crop_h
            
        x1 = max(0, cx - crop_w // 2)
        x2 = x1 + crop_w
        if x2 > W:
            x2 = W
            x1 = W - crop_w
            
    else:
        print("No face detected, using manual crop")
        crop_w = W
        crop_h = int(crop_w / aspect_ratio)
        if crop_h > H:
            crop_h = H
            crop_w = int(crop_h * aspect_ratio)
        x1 = (W - crop_w)//2
        val = int(H * 0.1)
        y1 = val if (val + crop_h <= H) else 0
        x2 = x1 + crop_w
        y2 = y1 + crop_h

    with Image.open(new_path) as im:
        cropped = im.crop((x1, y1, x2, y2))
        
        if cropped.width > 600:
            new_h = int(600 / aspect_ratio)
            cropped = cropped.resize((600, new_h), Image.Resampling.LANCZOS)
            
        cropped.save(out_path, "JPEG", quality=82)
        print("Saved to", out_path, "Size:", cropped.size)

if __name__ == "__main__":
    process()
