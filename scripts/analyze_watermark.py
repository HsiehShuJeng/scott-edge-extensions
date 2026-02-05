#!/usr/bin/env python3
"""
Analyze Gemini watermark detection on images
This script calculates the Pearson correlation to understand why detection fails
"""

import sys
from PIL import Image
import numpy as np

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

def calculate_alpha_map(bg_image_path, size):
    """Calculate alpha map from background image"""
    bg = Image.open(bg_image_path).convert('RGBA')
    bg_data = np.array(bg)
    
    alpha_map = np.zeros(size * size, dtype=np.float32)
    
    # Known background color (from original background)
    bg_color = np.array([47, 47, 47], dtype=np.float32)
    logo_color = 255.0
    
    for i in range(size):
        for j in range(size):
            r, g, b = bg_data[i, j, :3].astype(np.float32)
            
            # Using red channel (all channels should give similar results)
            alpha = (r - bg_color[0]) / (logo_color - bg_color[0])
            alpha = np.clip(alpha, 0.0, 1.0)
            
            alpha_map[i * size + j] = alpha
    
    return alpha_map

def detect_watermark(image_data, alpha_map, width, height):
    """Detect watermark using Pearson correlation"""
    total_pixels = width * height
    
    sum_x = 0.0
    sum_y = 0.0
    sum_xy = 0.0
    sum_x2 = 0.0
    sum_y2 = 0.0
    n = 0
    
    for i in range(total_pixels):
        alpha = alpha_map[i]
        
        if alpha > 0.05:
            # Get pixel luminance
            pixel_y = i // width
            pixel_x = i % width
            r, g, b = image_data[pixel_y, pixel_x, :3]
            
            # Calculate luminance
            luminance = 0.299 * r + 0.587 * g + 0.114 * b
            
            sum_x += luminance
            sum_y += alpha
            sum_xy += luminance * alpha
            sum_x2 += luminance * luminance
            sum_y2 += alpha * alpha
            n += 1
    
    if n < 100:
        return False, 0.0
    
    # Calculate Pearson correlation coefficient
    numerator = n * sum_xy - sum_x * sum_y
    denominator = np.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y))
    
    if denominator == 0:
        return False, 0.0
    
    correlation = numerator / denominator
    
    return correlation > 0.20, correlation

def analyze_image(image_path, bg_48_path, bg_96_path):
    """Analyze an image for Gemini watermark"""
    print(f"\nAnalyzing: {image_path}")
    
    # Load image
    img = Image.open(image_path).convert('RGB')
    width, height = img.size
    print(f"Image size: {width}x{height}")
    
    # Detect config
    config = detect_watermark_config(width, height)
    position = calculate_watermark_position(width, height, config)
    
    print(f"Watermark config: {config['logo_size']}x{config['logo_size']} at ({position['x']}, {position['y']})")
    
    # Get alpha map
    bg_path = bg_96_path if config['logo_size'] == 96 else bg_48_path
    alpha_map = calculate_alpha_map(bg_path, config['logo_size'])
    
    # Extract watermark region
    watermark_region = img.crop((
        position['x'],
        position['y'],
        position['x'] + position['width'],
        position['y'] + position['height']
    ))
    
    watermark_data = np.array(watermark_region)
    
    # Detect watermark
    detected, correlation = detect_watermark(
        watermark_data,
        alpha_map,
        config['logo_size'],
        config['logo_size']
    )
    
    print(f"Pearson Correlation: {correlation:.4f}")
    print(f"Detection threshold: 0.20")
    print(f"Watermark detected: {detected}")
    
    # Calculate average brightness in watermark region
    avg_brightness = np.mean(watermark_data[:, :, :3])
    print(f"Average brightness in watermark region: {avg_brightness:.2f}")
    
    return detected, correlation

if __name__ == '__main__':
    # Paths to background images
    bg_48 = '/Users/shu-jenghsieh/Development/gemini-watermark-removal/asking-expert/images/bg_48.png'
    bg_96 = '/Users/shu-jenghsieh/Development/gemini-watermark-removal/asking-expert/images/bg_96.png'
    
    # Analyze both images
    working_image = '/Users/shu-jenghsieh/Downloads/Gemini_Generated_Image_6fw0qq6fw0qq6fw0.png'
    failing_image = '/Users/shu-jenghsieh/Downloads/Gemini_Generated_Image_uh3t3iuh3t3iuh3t.png'
    
    print("=" * 60)
    print("GEMINI WATERMARK DETECTION ANALYSIS")
    print("=" * 60)
    
    detected1, corr1 = analyze_image(working_image, bg_48, bg_96)
    detected2, corr2 = analyze_image(failing_image, bg_48, bg_96)
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Working image correlation: {corr1:.4f}")
    print(f"Failing image correlation: {corr2:.4f}")
    print(f"Difference: {abs(corr1 - corr2):.4f}")
    
    if corr2 < 0.20:
        print(f"\nRECOMMENDATION: Lower threshold to {corr2 - 0.01:.2f} to detect this image")
