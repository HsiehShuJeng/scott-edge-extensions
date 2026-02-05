#!/usr/bin/env python3
"""
Visual comparison of watermark regions
Extract the watermark region from both images and save them for visual inspection
"""

from PIL import Image
import os

def detect_watermark_config(width, height):
    """Detect watermark configuration based on image size"""
    if width > 1024 and height > 1024:
        return {
            'logo_size': 96,
            'margin_right': 64,
            'margin_bottom': 64
        }
    else:
        return {
            'logo_size': 48,
            'margin_right': 32,
            'margin_bottom': 32
        }

def calculate_watermark_position(width, height, config):
    """Calculate watermark position in image"""
    return {
        'x': width - config['margin_right'] - config['logo_size'],
        'y': height - config['margin_bottom'] - config['logo_size'],
        'width': config['logo_size'],
        'height': config['logo_size']
    }

def extract_watermark_region(image_path, output_path):
    """Extract and save watermark region from image"""
    img = Image.open(image_path).convert('RGB')
    width, height = img.size
    
    config = detect_watermark_config(width, height)
    position = calculate_watermark_position(width, height, config)
    
    # Extract watermark region
    watermark_region = img.crop((
        position['x'],
        position['y'],
        position['x'] + position['width'],
        position['y'] + position['height']
    ))
    
    # Scale up 4x for easier viewing
    scaled_size = (config['logo_size'] * 4, config['logo_size'] * 4)
    watermark_region = watermark_region.resize(scaled_size, Image.NEAREST)
    
    watermark_region.save(output_path)
    print(f"Saved watermark region from {os.path.basename(image_path)} to {output_path}")

if __name__ == '__main__':
    output_dir = '/tmp/watermark_analysis'
    os.makedirs(output_dir, exist_ok=True)
    
    working_image = '/Users/shu-jenghsieh/Downloads/Gemini_Generated_Image_6fw0qq6fw0qq6fw0.png'
    failing_image = '/Users/shu-jenghsieh/Downloads/Gemini_Generated_Image_uh3t3iuh3t3iuh3t.png'
    
    extract_watermark_region(working_image, f'{output_dir}/working_watermark_region.png')
    extract_watermark_region(failing_image, f'{output_dir}/failing_watermark_region.png')
    
    print(f"\nWatermark regions extracted to: {output_dir}")
