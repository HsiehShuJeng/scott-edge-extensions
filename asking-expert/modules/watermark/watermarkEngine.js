/**
 * Watermark engine main module
 * Coordinate watermark detection, alpha map calculation, and removal operations
 * Ported from gemini-watermark-remover
 */

import { calculateAlphaMap } from './alphaMap.js';
import { removeWatermark } from './blendModes.js';

// Paths adjusted for extension structure
const BG_48_PATH = '../../images/bg_48.png';
const BG_96_PATH = '../../images/bg_96.png';

/**
 * Detect watermark configuration based on image size
 * @param {number} imageWidth - Image width
 * @param {number} imageHeight - Image height
 * @returns {Object} Watermark configuration {logoSize, marginRight, marginBottom}
 */
export function detectWatermarkConfig(imageWidth, imageHeight) {
    // Gemini's watermark rules:
    // If both image width and height are greater than 1024, use 96×96 watermark
    // Otherwise, use 48×48 watermark
    if (imageWidth > 1024 && imageHeight > 1024) {
        return {
            logoSize: 96,
            marginRight: 64,
            marginBottom: 64
        };
    } else {
        return {
            logoSize: 48,
            marginRight: 32,
            marginBottom: 32
        };
    }
}

/**
 * Calculate watermark position in image based on image size and watermark configuration
 * @param {number} imageWidth - Image width
 * @param {number} imageHeight - Image height
 * @param {Object} config - Watermark configuration {logoSize, marginRight, marginBottom}
 * @returns {Object} Watermark position {x, y, width, height}
 */
export function calculateWatermarkPosition(imageWidth, imageHeight, config) {
    const { logoSize, marginRight, marginBottom } = config;

    return {
        x: imageWidth - marginRight - logoSize,
        y: imageHeight - marginBottom - logoSize,
        width: logoSize,
        height: logoSize
    };
}

/**
 * Watermark engine class
 * Coordinate watermark detection, alpha map calculation, and removal operations
 */
export class WatermarkEngine {
    constructor(bgCaptures) {
        this.bgCaptures = bgCaptures;
        this.alphaMaps = {};
    }

    static async create() {
        const bg48 = new Image();
        const bg96 = new Image();

        await Promise.all([
            new Promise((resolve, reject) => {
                bg48.onload = resolve;
                bg48.onerror = reject;
                bg48.src = chrome.runtime.getURL('images/bg_48.png');
            }),
            new Promise((resolve, reject) => {
                bg96.onload = resolve;
                bg96.onerror = reject;
                bg96.src = chrome.runtime.getURL('images/bg_96.png');
            })
        ]);

        return new WatermarkEngine({ bg48, bg96 });
    }

    /**
     * Get alpha map from background captured image based on watermark size
     * @param {number} size - Watermark size (48 or 96)
     * @returns {Promise<Float32Array>} Alpha map
     */
    async getAlphaMap(size) {
        // If cached, return directly
        if (this.alphaMaps[size]) {
            return this.alphaMaps[size];
        }

        // Select corresponding background capture based on watermark size
        const bgImage = size === 48 ? this.bgCaptures.bg48 : this.bgCaptures.bg96;

        // Create temporary canvas to extract ImageData
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bgImage, 0, 0);

        const imageData = ctx.getImageData(0, 0, size, size);

        // Calculate alpha map
        const alphaMap = calculateAlphaMap(imageData);

        // Cache result
        this.alphaMaps[size] = alphaMap;

        return alphaMap;
    }

    /**
     * Remove watermark from image based on watermark size
     * @param {HTMLImageElement|HTMLCanvasElement} image - Input image
     * @returns {Promise<HTMLCanvasElement>} Processed canvas
     */
    /**
     * Detect if a watermark is likely present in the image
     * @param {ImageData} imageData - Image data of the region where watermark would be
     * @param {Float32Array} alphaMap - Alpha map for the watermark
     * @returns {boolean} True if watermark is detected
     */
    /**
     * Detect if a watermark is likely present in the image using Pearson Correlation
     * This statistically verifies if the image pixel variations match the watermark alpha pattern.
     * @param {ImageData} imageData - Image data of the region where watermark would be
     * @param {Float32Array} alphaMap - Alpha map for the watermark
     * @returns {boolean} True if watermark is detected
     */
    detectWatermark(imageData, alphaMap) {
        const { data, width, height } = imageData;
        const totalPixels = width * height;

        // We only care about pixels where the watermark actually exists (alpha > 0)
        // to avoid diluting the stats with background.
        // However, we need enough data points.

        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
        let n = 0;

        for (let i = 0; i < totalPixels; i++) {
            const alpha = alphaMap[i];

            // Only consider significant watermark pixels for correlation
            if (alpha > 0.05) {
                // Y (Watermark Signal) = alpha
                // X (Image Signal) = Luminance of pixel

                const r = data[i * 4];
                const g = data[i * 4 + 1];
                const b = data[i * 4 + 2];

                // Simple luminance approximation
                const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

                sumX += luminance;
                sumY += alpha;
                sumXY += luminance * alpha;
                sumX2 += luminance * luminance;
                sumY2 += alpha * alpha;
                n++;
            }
        }

        if (n < 100) return false; // Not enough data

        // Calculate Pearson Correlation Coefficient (r)
        // r = (n*sumXY - sumX*sumY) / sqrt((n*sumX2 - sumX^2) * (n*sumY2 - sumY^2))

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        if (denominator === 0) return false; // Zero variance

        const correlation = numerator / denominator;

        // console.log(`Watermark Correlation: ${correlation.toFixed(4)}`);

        // Threshold: A visible watermark should have a clear positive correlation.
        // 0.3 is a conservative threshold (weak but matching). 
        // 0.5 is moderate.
        // Gemini watermark is quite strong, usually > 0.6.
        return correlation > 0.35;
    }

    /**
     * Remove watermark from image based on watermark size
     * @param {HTMLImageElement|HTMLCanvasElement} image - Input image
     * @returns {Promise<{canvas: HTMLCanvasElement, detected: boolean}>} Processed canvas and detection result
     */
    async removeWatermarkFromImage(image) {
        // Create canvas to process image
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;
        const ctx = canvas.getContext('2d');

        // Draw original image onto canvas
        ctx.drawImage(image, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Detect watermark configuration
        const config = detectWatermarkConfig(canvas.width, canvas.height);
        const position = calculateWatermarkPosition(canvas.width, canvas.height, config);

        // Get alpha map for watermark size
        const alphaMap = await this.getAlphaMap(config.logoSize);

        // Extract watermark region for detection
        const watermarkCtx = document.createElement('canvas').getContext('2d');
        watermarkCtx.canvas.width = config.logoSize;
        watermarkCtx.canvas.height = config.logoSize;
        watermarkCtx.drawImage(
            canvas,
            position.x, position.y, position.width, position.height,
            0, 0, config.logoSize, config.logoSize
        );
        const watermarkRegionData = watermarkCtx.getImageData(0, 0, config.logoSize, config.logoSize);

        // Perform smart detection
        const isDetected = this.detectWatermark(watermarkRegionData, alphaMap);

        if (isDetected) {
            // Remove watermark from image data only if detected
            removeWatermark(imageData, alphaMap, position);
            // Write processed image data back to canvas
            ctx.putImageData(imageData, 0, 0);
        } else {
            // Optimization: If not detected, we don't strictly need to do putImageData since canvas has original,
            // but keeping it consistent is fine. The canvas already contains the original image.
            // We can just return the canvas as is.
        }

        return { canvas, detected: isDetected };
    }

    /**
     * Get watermark information (for display)
     * @param {number} imageWidth - Image width
     * @param {number} imageHeight - Image height
     * @returns {Object} Watermark information {size, position, config}
     */
    getWatermarkInfo(imageWidth, imageHeight) {
        const config = detectWatermarkConfig(imageWidth, imageHeight);
        const position = calculateWatermarkPosition(imageWidth, imageHeight, config);

        return {
            size: config.logoSize,
            position: position,
            config: config
        };
    }
}
