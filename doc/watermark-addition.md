# Watermark Addition Feature

## Table of Contents
- [Overview](#overview)
- [Technical Implementation](#technical-implementation)
  - [Core Technology: Canvas API](#core-technology-canvas-api)
  - [1. Font Handling (The "OTS Parsing Error" Fix)](#1-font-handling-the-ots-parsing-error-fix)
  - [2. Rendering Pipeline](#2-rendering-pipeline)
  - [3. Bidirectional UI Sync](#3-bidirectional-ui-sync)
- [Configuration Options](#configuration-options)
- [References](#references)

## Overview
The **Watermark Addition** feature allows users to overlay a custom "signature" watermark onto images *after* the watermark removal process. This ensures that the final output image carries the user's personal branding.

## Technical Implementation

### Core Technology: Canvas API
The entire feature is implemented using the native browser **Canvas 2D API**. No external image processing libraries (like `Pillow` in Python or `sharp` in Node.js) are used, ensuring the extension remains lightweight and runs entirely client-side.

### 1. Font Handling (The "OTS Parsing Error" Fix)
We use the **UKai (AR PL UKai)** font to render Traditional Chinese characters with a calligraphy style.

- **Initial Issue**:
  The original font file was in `.ttc` (TrueType Collection) format.
  Chrome's **OpenType Sanitizer (OTS)** is extremely strict and rejected the file structure, causing a `OTS parsing error: GPOS misaligned table`.

- **Solution**:
  We converted the `.ttc` file to a standard `.ttf` (TrueType Font) format using `fonttools`.
  This simplified the internal table structure, allowing Chrome to load it correctly via standard CSS `@font-face`.

### 2. Rendering Pipeline
The watermark is applied as the final step in the image processing pipeline:
1.  **Remove Watermark**: `watermarkEngine.js` removes the original Gemini watermark.
2.  **Resize**: The image is optionally scaled to 1920px width.
3.  **Add Custom Watermark**:
    - A temporary "offscreen" canvas is created for the text block.
    - Text is drawn with the specified **Font (UKai)**, **Color**, **Opacity**, and **Stroke**.
    - The date is dynamically generated in Traditional Chinese format (e.g., `2023 年 10 月 27 日（五）`).
    - The text canvas is **Rotated** by the specified angle.
    - The rotated text is drawn onto the center of the main image canvas.

### 3. Bidirectional UI Sync
To provide a premium user experience, we implemented "Dual Inputs" for all numerical settings:
- **Range Slider**: For quick, intuitive adjustments.
- **Text/Number Input**: For precise value entry.
- **Sync Logic**: Event listeners ensure that changing one input immediately updates the other and triggers a real-time preview update (debounced by 300ms).

## Configuration Options

| Parameter | Default | Description |
| :--- | :--- | :--- |
| **Opacity** | 7% | Transparency of the watermark text. |
| **Color** | White | Fill color of the text. Supports Hex and Color Picker. |
| **Angle** | 45° | Rotation angle. Supports typical diagonal (45) or inverse diagonal (-45). |
| **Size Ratio** | 0.06 | Size of the text relative to the image dimensions. |
| **Stroke** | Black (20%) | Outline color and opacity for better visibility against varying backgrounds. |

## References

FontTools (no date) *fontTools Documentation*. Available at: https://fonttools.readthedocs.io/en/latest/ (Accessed: 1 February 2026).

Hosny, K. (no date) *OTS (OpenType Sanitizer)*. GitHub. Available at: https://github.com/khaledhosny/ots (Accessed: 1 February 2026).

Stack Overflow (2015) *OTS parsing error: GPOS misaligned table*. Available at: https://stackoverflow.com/questions/27643555/ots-parsing-error-gpos-misaligned-table (Accessed: 1 February 2026).
