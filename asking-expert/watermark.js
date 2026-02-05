/**
 * @fileoverview Gemini Image Polisher - Watermark Removal and Addition UI
 * Handles image processing pipeline including watermark detection/removal,
 * resizing, and custom watermark addition with real-time preview.
 * @author Scott's Assistant Team
 */

import { WatermarkEngine } from './modules/watermark/watermarkEngine.js';

/* ============================================================================
 * Global State
 * ========================================================================== */

/** @type {WatermarkEngine|null} Watermark detection and removal engine */
let watermarkEngine = null;

/** @type {File|null} Currently loaded image file */
let currentOriginalFile = null;

/** @type {HTMLCanvasElement|null} Processed image canvas for download */
let currentProcessedCanvas = null;

/* ============================================================================
 * Utility Functions
 * ========================================================================== */

/**
 * Creates a debounced function that delays invoking func until after
 * wait milliseconds have elapsed since the last invocation.
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Updates the status message displayed to the user.
 * @param {string} message - Status message to display
 */
function updateStatus(message) {
    const statusEl = document.getElementById('status-message');
    if (statusEl) statusEl.textContent = message;
}

/* ============================================================================
 * Engine Initialization
 * ========================================================================== */

/**
 * Initializes the watermark detection/removal engine and preloads fonts.
 * @async
 * @throws {Error} If engine initialization fails
 */
async function initEngine() {
    try {
        watermarkEngine = await WatermarkEngine.create();
        console.log('Watermark Engine initialized');
        updateStatus('Ready to process images.');

        document.fonts.load('16px "UKai"').then(() => {
            console.log('UKai font loaded');
        });
    } catch (error) {
        console.error('Failed to initialize engine:', error);
        updateStatus('Error initializing engine.');
    }
}

/* ============================================================================
 * Theme Management
 * ========================================================================== */

/**
 * Applies theme (light/dark) based on stored preference or time of day.
 * Falls back to time-based theme if no preference is stored.
 */
function applyTheme() {
    chrome.storage.local.get('theme', (data) => {
        let theme = data.theme;
        if (!theme) {
            const hour = new Date().getHours();
            theme = (hour >= 18 || hour < 6) ? 'dark' : 'light';
        }
        document.body.classList.toggle('dark-theme', theme === 'dark');
    });
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.theme) {
        applyTheme();
    }
});

/* ============================================================================
 * File Handling & Drag/Drop
 * ========================================================================== */

/**
 * Handles file selection from input element.
 * @param {Event} event - Change event from file input
 */
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) processFile(file);
}

/**
 * Handles dragover event for drop zone.
 * @param {DragEvent} event - Drag event
 */
function handleDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    document.getElementById('drop-zone').classList.add('drag-over');
}

/**
 * Handles dragleave event for drop zone.
 * @param {DragEvent} event - Drag event
 */
function handleDragLeave(event) {
    event.stopPropagation();
    event.preventDefault();
    document.getElementById('drop-zone').classList.remove('drag-over');
}

/**
 * Handles drop event for file upload.
 * @param {DragEvent} event - Drop event
 */
function handleDrop(event) {
    event.stopPropagation();
    event.preventDefault();
    document.getElementById('drop-zone').classList.remove('drag-over');

    const file = event.dataTransfer.files[0];
    if (file) processFile(file);
}

/**
 * Validates and processes an image file.
 * @param {File} file - Image file to process
 */
function processFile(file) {
    if (!file.type.match('image.*')) {
        alert('Please drop an image file.');
        return;
    }

    currentOriginalFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const originalContainer = document.getElementById('original-preview');
            originalContainer.innerHTML = '';
            img.style.maxWidth = '100%';
            originalContainer.appendChild(img);

            applyPipeline(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/* ============================================================================
 * Image Processing Pipeline
 * ========================================================================== */

/**
 * Main image processing pipeline:
 * 1. Remove Gemini watermark (if detected)
 * 2. Resize image (if enabled)
 * 3. Add custom watermark (if enabled)
 * @async
 * @param {HTMLImageElement} img - Source image to process
 */
async function applyPipeline(img) {
    if (!watermarkEngine) {
        await initEngine();
    }

    updateStatus('Processing...');

    const detectionThreshold = parseFloat(document.getElementById('detection-threshold').value) || 0.10;

    try {
        const startTime = performance.now();

        const result = await watermarkEngine.removeWatermarkFromImage(img, detectionThreshold);
        let finalCanvas = result.canvas;
        const isDetected = result.detected;

        const shouldResize = document.getElementById('resize-checkbox').checked;
        if (shouldResize) {
            const targetWidth = 1920;
            if (finalCanvas.width !== targetWidth) {
                finalCanvas = resizeCanvas(finalCanvas, targetWidth);
            }
        }

        const shouldAddWatermark = document.getElementById('add-watermark-checkbox').checked;
        if (shouldAddWatermark) {
            finalCanvas = await addWatermark(finalCanvas);
        }

        const endTime = performance.now();
        currentProcessedCanvas = finalCanvas;

        displayProcessedImage(finalCanvas);

        const processingTime = (endTime - startTime).toFixed(0);
        updateStatus(isDetected
            ? `Watermark detected & removed in ${processingTime}ms.`
            : `No Gemini watermark detected. (${processingTime}ms)`
        );

        setupDownloadButton(finalCanvas);

    } catch (error) {
        console.error('Error processing image:', error);
        updateStatus('Error processing image.');
    }
}

/**
 * Resizes a canvas to the target width while maintaining aspect ratio.
 * @param {HTMLCanvasElement} sourceCanvas - Canvas to resize
 * @param {number} targetWidth - Target width in pixels
 * @returns {HTMLCanvasElement} Resized canvas
 */
function resizeCanvas(sourceCanvas, targetWidth) {
    const scaleFactor = targetWidth / sourceCanvas.width;
    const targetHeight = Math.round(sourceCanvas.height * scaleFactor);

    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = targetWidth;
    resizedCanvas.height = targetHeight;

    const ctx = resizedCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);

    return resizedCanvas;
}

/**
 * Displays the processed image in the preview area.
 * @param {HTMLCanvasElement} canvas - Processed image canvas
 */
function displayProcessedImage(canvas) {
    const container = document.getElementById('processed-preview');
    container.innerHTML = '';
    canvas.style.maxWidth = '100%';
    container.appendChild(canvas);
}

/* ============================================================================
 * Custom Watermark Addition
 * ========================================================================== */

/**
 * Retrieves current watermark settings from UI controls.
 * @returns {Object} Watermark configuration object
 */
function getWatermarkSettings() {
    return {
        opacity: document.getElementById('wm-opacity').value + '%',
        color: document.getElementById('wm-color').value,
        angle: parseFloat(document.getElementById('wm-angle').value) || 45,
        sizeRatio: parseFloat(document.getElementById('wm-size-ratio').value) || 0.06,
        strokeColor: document.getElementById('wm-stroke-color').value,
        strokeOpacity: document.getElementById('wm-stroke-opacity').value + '%',
    };
}

/**
 * Parses color string and opacity into RGBA format.
 * Supports hex (#RRGGBB), named colors (white, black), and RGB (r,g,b).
 * @param {string} colorStr - Color value (hex, name, or comma-separated RGB)
 * @param {string} opacityStr - Opacity value (percentage or decimal)
 * @returns {string} RGBA color string
 */
function parseColor(colorStr, opacityStr) {
    let r = 0, g = 0, b = 0;
    const str = colorStr.toLowerCase().trim();

    if (str === 'white' || str === 'w') {
        r = 255; g = 255; b = 255;
    } else if (str === 'black' || str === 'b') {
        r = 0; g = 0; b = 0;
    } else if (str.startsWith('#')) {
        let hex = str.substring(1);
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        const bigint = parseInt(hex, 16);
        r = (bigint >> 16) & 255;
        g = (bigint >> 8) & 255;
        b = bigint & 255;
    } else if (str.includes(',')) {
        const parts = str.split(',').map(s => parseInt(s.trim()));
        r = parts[0] || 0;
        g = parts[1] || 0;
        b = parts[2] || 0;
    }

    let alpha = 1.0;
    const op = opacityStr.toString().trim();
    if (op.endsWith('%')) {
        alpha = parseFloat(op) / 100;
    } else {
        alpha = parseFloat(op);
    }

    alpha = Math.max(0, Math.min(1, alpha));

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Adds custom Chinese watermark to the image with rotation and styling.
 * Watermark format: "考特製作於\nYYYY 年 MM 月 DD 日（weekday）"
 * @async
 * @param {HTMLCanvasElement} inputCanvas - Source canvas
 * @returns {Promise<HTMLCanvasElement>} Canvas with watermark added
 */
async function addWatermark(inputCanvas) {
    const canvas = document.createElement('canvas');
    canvas.width = inputCanvas.width;
    canvas.height = inputCanvas.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(inputCanvas, 0, 0);

    const settings = getWatermarkSettings();
    const { width, height } = canvas;

    const now = new Date();
    const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
    const dayStr = weekDays[now.getDay()];
    const line1 = "考特製作於";
    const line2 = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日（${dayStr}）`;

    const fontSize = Math.max(12, Math.min(width, height) * settings.sizeRatio);
    ctx.font = `${fontSize}px "UKai", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const metrics1 = ctx.measureText(line1);
    const metrics2 = ctx.measureText(line2);
    const textHeight = fontSize;
    const lineSpacing = fontSize * 0.35;

    const blockWidth = Math.max(metrics1.width, metrics2.width);
    const blockHeight = (textHeight * 2) + lineSpacing;

    const diagonal = Math.sqrt(blockWidth * blockWidth + blockHeight * blockHeight);
    const textCanvas = document.createElement('canvas');
    textCanvas.width = diagonal * 1.5;
    textCanvas.height = diagonal * 1.5;
    const tCtx = textCanvas.getContext('2d');

    tCtx.translate(textCanvas.width / 2, textCanvas.height / 2);
    tCtx.rotate((settings.angle * Math.PI) / 180);

    tCtx.font = `${fontSize}px "UKai", sans-serif`;
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';

    tCtx.lineWidth = fontSize * 0.06;
    tCtx.lineJoin = 'round';
    tCtx.miterLimit = 2;
    tCtx.strokeStyle = parseColor(settings.strokeColor, settings.strokeOpacity);
    tCtx.strokeText(line1, 0, -(blockHeight / 2) + (textHeight / 2));
    tCtx.strokeText(line2, 0, (blockHeight / 2) - (textHeight / 2));

    tCtx.fillStyle = parseColor(settings.color, settings.opacity);
    tCtx.fillText(line1, 0, -(blockHeight / 2) + (textHeight / 2));
    tCtx.fillText(line2, 0, (blockHeight / 2) - (textHeight / 2));

    ctx.drawImage(textCanvas,
        (width - textCanvas.width) / 2,
        (height - textCanvas.height) / 2
    );

    return canvas;
}

/* ============================================================================
 * Download Functionality
 * ========================================================================== */

/**
 * Configures the download button with current canvas and format settings.
 * @param {HTMLCanvasElement} canvas - Processed image to download
 */
function setupDownloadButton(canvas) {
    const oldBtn = document.getElementById('download-btn');
    const formatSelect = document.getElementById('format-select');

    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);

    newBtn.disabled = false;

    newBtn.onclick = () => {
        const format = formatSelect.value;
        const quality = 0.92;

        const extensions = {
            'image/webp': '.webp',
            'image/png': '.png',
            'image/jpeg': '.jpg'
        };
        const ext = extensions[format] || '.png';

        let filename = `cleaned_image${ext}`;
        if (currentOriginalFile?.name) {
            const originalName = currentOriginalFile.name;
            const lastDotIndex = originalName.lastIndexOf('.');
            const baseName = lastDotIndex !== -1
                ? originalName.substring(0, lastDotIndex)
                : originalName;
            filename = `${baseName} (Unwatermarked)${ext}`;
        }

        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL(format, quality);
        link.click();
    };
}

/* ============================================================================
 * Event Listeners & UI Initialization
 * ========================================================================== */

/**
 * Synchronizes a range slider with a text/number input bidirectionally.
 * @param {string} rangeId - ID of range input element
 * @param {string} textId - ID of text/number input element
 * @param {Function} transformToText - Converts range value to text value
 * @param {Function} transformToRange - Converts text value to range value
 */
function syncRange(rangeId, textId, transformToText, transformToRange) {
    const range = document.getElementById(rangeId);
    const text = document.getElementById(textId);
    if (!range || !text) return;

    const reprocess = debounce(() => {
        if (currentOriginalFile) {
            processFile(currentOriginalFile);
        }
    }, 500);

    range.addEventListener('input', () => {
        text.value = transformToText(range.value);
        reprocess();
    });

    text.addEventListener('change', () => {
        const val = transformToRange(text.value);
        if (!isNaN(val)) {
            range.value = val;
        }
    });
}

/**
 * Synchronizes a color picker with a text input bidirectionally.
 * @param {string} pickerId - ID of color picker element
 * @param {string} textId - ID of text input element
 */
function syncColor(pickerId, textId) {
    const picker = document.getElementById(pickerId);
    const text = document.getElementById(textId);
    if (!picker || !text) return;

    const reprocess = debounce(() => {
        if (currentOriginalFile) {
            processFile(currentOriginalFile);
        }
    }, 500);

    picker.addEventListener('input', () => {
        text.value = picker.value;
        reprocess();
    });

    text.addEventListener('change', () => {
        if (/^#[0-9A-F]{6}$/i.test(text.value)) {
            picker.value = text.value;
        }
    });
}

/**
 * Initializes event listeners and UI controls on page load.
 */
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    initEngine();

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('dragleave', handleDragLeave, false);
    dropZone.addEventListener('drop', handleDrop, false);
    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', handleFileSelect, false);

    const reprocess = debounce(() => {
        if (currentOriginalFile) {
            processFile(currentOriginalFile);
        }
    }, 500);

    const inputIds = [
        'resize-checkbox',
        'add-watermark-checkbox',
        'wm-opacity',
        'wm-color',
        'wm-angle',
        'wm-size-ratio',
        'wm-stroke-color',
        'wm-stroke-opacity'
    ];

    inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', reprocess);
            el.addEventListener('change', reprocess);
        }
    });

    syncRange('wm-opacity-range', 'wm-opacity', v => v, v => parseFloat(v));
    syncRange('wm-angle-range', 'wm-angle', v => v, v => parseFloat(v));
    syncRange('wm-size-range', 'wm-size-ratio', v => (v / 100).toFixed(2), v => parseFloat(v) * 100);
    syncRange('wm-stroke-opacity-range', 'wm-stroke-opacity', v => v, v => parseFloat(v));

    syncColor('wm-color-picker', 'wm-color');
    syncColor('wm-stroke-color-picker', 'wm-stroke-color');

    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const val = e.target.getAttribute('data-value');
            if (val) {
                const angleInput = document.getElementById('wm-angle');
                if (angleInput) {
                    angleInput.value = val;
                    angleInput.dispatchEvent(new Event('change'));
                }
            }
        });
    });

    const wmCheckbox = document.getElementById('add-watermark-checkbox');
    const wmSettings = document.getElementById('watermark-settings');

    const toggleWmSettings = () => {
        if (wmCheckbox.checked) {
            wmSettings.classList.remove('disabled');
        } else {
            wmSettings.classList.add('disabled');
        }
        reprocess();
    };

    wmCheckbox.addEventListener('change', toggleWmSettings);
    toggleWmSettings();

    chrome.storage.local.get(['detectionThreshold'], (data) => {
        const threshold = data.detectionThreshold || 0.10;
        const thresholdInput = document.getElementById('detection-threshold');
        const thresholdRange = document.getElementById('detection-threshold-range');

        if (thresholdInput) thresholdInput.value = threshold.toFixed(2);
        if (thresholdRange) thresholdRange.value = Math.round(threshold * 100);
    });

    syncRange('detection-threshold-range', 'detection-threshold',
        v => (v / 100).toFixed(2),
        v => Math.round(parseFloat(v) * 100)
    );

    const thresholdInput = document.getElementById('detection-threshold');
    if (thresholdInput) {
        thresholdInput.addEventListener('change', () => {
            const threshold = parseFloat(thresholdInput.value) || 0.10;
            chrome.storage.local.set({ detectionThreshold: threshold }, () => {
                console.log('Detection threshold saved:', threshold);
            });
        });
    }

    const thresholdRange = document.getElementById('detection-threshold-range');
    if (thresholdRange) {
        thresholdRange.addEventListener('input', reprocess);
    }
    if (thresholdInput) {
        thresholdInput.addEventListener('input', reprocess);
    }
});
