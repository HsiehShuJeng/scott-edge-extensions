// Watermark Remover UI Logic
import { WatermarkEngine } from './modules/watermark/watermarkEngine.js';

// Global state
let watermarkEngine;
let currentOriginalFile = null;
let currentProcessedCanvas = null;

// Debounce helper for real-time updates
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

// Initialize the engine
async function initEngine() {
    try {
        watermarkEngine = await WatermarkEngine.create();
        console.log('Watermark Engine initialized');
        updateStatus('Ready to process images.');

        // Ensure font is loaded
        document.fonts.load('16px "UKai"').then(() => {
            console.log('UKai font loaded');
        });
    } catch (error) {
        console.error('Failed to initialize engine:', error);
        updateStatus('Error initializing engine.');
    }
}

function updateStatus(msg) {
    const el = document.getElementById('status-message');
    if (el) el.textContent = msg;
}

// --- Theme Synchronization ---
// --- Theme Synchronization ---
function applyTheme() {
    chrome.storage.local.get('theme', (data) => {
        let theme = data.theme;
        if (!theme) {
            const hour = new Date().getHours();
            if (hour >= 18 || hour < 6) {
                theme = 'dark';
            } else {
                theme = 'light';
            }
        }
        const isDark = theme === 'dark';
        document.body.classList.toggle('dark-theme', isDark);
    });
}

// Listen for theme changes from popup
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.theme) {
        applyTheme();
    }
});

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

// Handle drag over
function handleDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    document.getElementById('drop-zone').classList.add('drag-over');
}

// Handle drag leave
function handleDragLeave(event) {
    event.stopPropagation();
    event.preventDefault();
    document.getElementById('drop-zone').classList.remove('drag-over');
}

// Handle drop
function handleDrop(event) {
    event.stopPropagation();
    event.preventDefault();
    document.getElementById('drop-zone').classList.remove('drag-over');

    const file = event.dataTransfer.files[0];
    if (file) {
        processFile(file);
    }
}

// Process the image file
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
            // Display original
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

// Main Pipeline: Remove -> Resize -> Add
async function applyPipeline(img) {
    if (!watermarkEngine) {
        await initEngine();
    }

    updateStatus('Processing...');

    // Get detection threshold from settings
    const detectionThreshold = parseFloat(document.getElementById('detection-threshold').value) || 0.10;

    try {
        const startTime = performance.now();
        // 1. Remove Watermark (Always process on full res first)
        // Now returns { canvas, detected }
        const result = await watermarkEngine.removeWatermarkFromImage(img, detectionThreshold);
        const fullCanvas = result.canvas;
        const isDetected = result.detected;

        // 2. Handle Resizing
        let finalCanvas = fullCanvas;
        const shouldResize = document.getElementById('resize-checkbox').checked;

        if (shouldResize) {
            const targetWidth = 1920;
            if (fullCanvas.width !== targetWidth) {
                const scaleFactor = targetWidth / fullCanvas.width;
                const targetHeight = Math.round(fullCanvas.height * scaleFactor);

                const resizeCanvas = document.createElement('canvas');
                resizeCanvas.width = targetWidth;
                resizeCanvas.height = targetHeight;
                const ctx = resizeCanvas.getContext('2d');

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(fullCanvas, 0, 0, targetWidth, targetHeight);

                finalCanvas = resizeCanvas;
            }
        }

        // 3. Add Custom Watermark (if enabled)
        const shouldAddWatermark = document.getElementById('add-watermark-checkbox').checked;
        if (shouldAddWatermark) {
            finalCanvas = await addWatermark(finalCanvas);
        }

        const endTime = performance.now();
        currentProcessedCanvas = finalCanvas;

        // Display processed image
        const processedContainer = document.getElementById('processed-preview');
        processedContainer.innerHTML = '';
        finalCanvas.style.maxWidth = '100%';
        processedContainer.appendChild(finalCanvas);

        // Update status with detection info
        if (isDetected) {
            updateStatus(`Watermark detected & removed in ${(endTime - startTime).toFixed(0)}ms.`);
        } else {
            updateStatus(`No Gemini watermark detected. (${(endTime - startTime).toFixed(0)}ms)`);
        }

        // Setup download button
        setupDownloadButton(finalCanvas);

    } catch (error) {
        console.error('Error processing image:', error);
        updateStatus('Error processing image.');
    }
}

// --- Watermark Addition Logic ---

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

function parseColor(colorStr, opacityStr) {
    // Basic parser for hex, named colors, or "r,g,b"
    // Returns CSS color string with alpha
    let r = 0, g = 0, b = 0;
    const str = colorStr.toLowerCase().trim();

    if (str === 'white' || str === 'w') { r = 255; g = 255; b = 255; }
    else if (str === 'black' || str === 'b') { r = 0; g = 0; b = 0; }
    else if (str.startsWith('#')) {
        let hex = str.substring(1);
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const bigint = parseInt(hex, 16);
        r = (bigint >> 16) & 255;
        g = (bigint >> 8) & 255;
        b = bigint & 255;
    } else if (str.includes(',')) {
        const parts = str.split(',').map(s => parseInt(s.trim()));
        r = parts[0] || 0; g = parts[1] || 0; b = parts[2] || 0;
    }

    // Parse opacity
    let alpha = 1.0;
    const op = opacityStr.toString().trim();
    if (op.endsWith('%')) {
        alpha = parseFloat(op) / 100;
    } else {
        alpha = parseFloat(op);
    }

    // Clamp
    alpha = Math.max(0, Math.min(1, alpha));

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

async function addWatermark(inputCanvas) {
    // Create a new canvas to avoid modifying the input directly if needed, 
    // but here we want to return a modified version.
    const canvas = document.createElement('canvas'); // Work on a copy/new layer
    canvas.width = inputCanvas.width;
    canvas.height = inputCanvas.height;
    const ctx = canvas.getContext('2d');

    // Draw the base image
    ctx.drawImage(inputCanvas, 0, 0);

    const settings = getWatermarkSettings();
    const width = canvas.width;
    const height = canvas.height;

    // 1. Build Text
    const now = new Date();
    const weekDays = ["日", "一", "二", "三", "四", "五", "六"]; // JS Date.day is 0=Sun
    const dayStr = weekDays[now.getDay()];
    // "考特製作於\n{dt.year} 年 {dt.month} 月 {dt.day} 日（{weekday}）"
    const line1 = "考特製作於";
    const line2 = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日（${dayStr}）`;

    // 2. Configure Font
    const fontSize = Math.max(12, Math.min(width, height) * settings.sizeRatio);
    // Use UKai font, fallback to sans-serif
    ctx.font = `${fontSize}px "UKai", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 3. Measure Text
    const metrics1 = ctx.measureText(line1);
    const metrics2 = ctx.measureText(line2);
    // Approximate height since metric.actualBoundingBoxAscent can be strict
    const textHeight = fontSize;
    const lineSpacing = fontSize * 0.35; // default ratio 0.35

    const blockWidth = Math.max(metrics1.width, metrics2.width);
    const blockHeight = (textHeight * 2) + lineSpacing;

    // 4. Create an offscreen canvas for the text block to handle rotation cleanly
    // Make it large enough to hold the rotated text
    const diagonal = Math.sqrt(blockWidth * blockWidth + blockHeight * blockHeight);
    const textCanvas = document.createElement('canvas');
    textCanvas.width = diagonal * 1.5; // padding
    textCanvas.height = diagonal * 1.5;
    const tCtx = textCanvas.getContext('2d');

    tCtx.translate(textCanvas.width / 2, textCanvas.height / 2);
    tCtx.rotate((settings.angle * Math.PI) / 180);

    tCtx.font = `${fontSize}px "UKai", sans-serif`;
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';

    // 5. Draw Stroke (if needed)
    // Canvas doesn't do "outside" stroke easily, it centers it.
    // We can simulate it or just use standard stroke.
    tCtx.lineWidth = fontSize * 0.06; // default ratio 0.06
    tCtx.lineJoin = 'round';
    tCtx.miterLimit = 2;
    tCtx.strokeStyle = parseColor(settings.strokeColor, settings.strokeOpacity);
    tCtx.strokeText(line1, 0, -(blockHeight / 2) + (textHeight / 2));
    tCtx.strokeText(line2, 0, (blockHeight / 2) - (textHeight / 2));

    // 6. Draw Fill
    tCtx.fillStyle = parseColor(settings.color, settings.opacity);
    tCtx.fillText(line1, 0, -(blockHeight / 2) + (textHeight / 2));
    tCtx.fillText(line2, 0, (blockHeight / 2) - (textHeight / 2));

    // 7. Paste onto main canvas (centered)
    // Draw the rotated text canvas onto the center of the main image
    ctx.drawImage(textCanvas,
        (width - textCanvas.width) / 2,
        (height - textCanvas.height) / 2
    );

    return canvas;
}


// Setup download button with dynamic format reading
function setupDownloadButton(canvas) {
    const oldBtn = document.getElementById('download-btn');
    const formatSelect = document.getElementById('format-select');

    // Clone button to remove old listeners
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);

    newBtn.disabled = false;

    // Add single click listener that reads current state
    newBtn.onclick = () => {
        const format = formatSelect.value;
        const quality = 0.92; // High quality for WebP/JPEG

        // Determine extension
        let ext = '.png';
        if (format === 'image/webp') ext = '.webp';
        if (format === 'image/jpeg') ext = '.jpg';

        // Generate filename
        let confirmName = `cleaned_image${ext}`;
        if (currentOriginalFile && currentOriginalFile.name) {
            const originalName = currentOriginalFile.name;
            const lastDotIndex = originalName.lastIndexOf('.');
            let name = originalName;

            if (lastDotIndex !== -1) {
                name = originalName.substring(0, lastDotIndex);
            }
            confirmName = `${name} (Unwatermarked)${ext}`;
        }

        const link = document.createElement('a');
        link.download = confirmName;
        link.href = canvas.toDataURL(format, quality);
        link.click();
    };
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(); // Apply theme on load
    initEngine();

    const dropZone = document.getElementById('drop-zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('dragleave', handleDragLeave, false);
    dropZone.addEventListener('drop', handleDrop, false);

    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', handleFileSelect, false);

    dropZone.addEventListener('click', () => fileInput.click());

    // Debounced reprocessing
    const reprocess = debounce(() => {
        if (currentOriginalFile) {
            // Need to reload the image because applyPipeline consumes it/needs fresh start
            // or just pass a cached Image object if implemented carefully. 
            // For now, re-reading file is safest to ensure original state.
            processFile(currentOriginalFile);
        }
    }, 500);

    // Watch all inputs for direct changes
    const inputs = [
        'resize-checkbox',
        'add-watermark-checkbox',
        'wm-opacity',
        'wm-color',
        'wm-angle',
        'wm-size-ratio',
        'wm-stroke-color',
        'wm-stroke-opacity'
    ];

    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', reprocess);
            el.addEventListener('change', reprocess);
        }
    });

    // Helper to sync Range <-> Text/Number
    function syncRange(rangeId, textId, transformToText, transformToRange) {
        const range = document.getElementById(rangeId);
        const text = document.getElementById(textId);
        if (!range || !text) return;

        range.addEventListener('input', () => {
            text.value = transformToText(range.value);
            reprocess();
        });

        text.addEventListener('input', () => {
            // simplified: only update range if valid
            // let val = transformToRange(text.value);
            // if (!isNaN(val)) range.value = val;
            // reprocess(); // handled by general input watcher
        });

        // Update range when text changes (e.g. user types)
        text.addEventListener('change', () => {
            const val = transformToRange(text.value);
            if (!isNaN(val)) {
                range.value = val;
            }
        });
    }

    // Helper to sync Color Picker <-> Text
    function syncColor(pickerId, textId) {
        const picker = document.getElementById(pickerId);
        const text = document.getElementById(textId);
        if (!picker || !text) return;

        picker.addEventListener('input', () => {
            text.value = picker.value;
            reprocess();
        });

        text.addEventListener('change', () => {
            // Check if valid hex
            if (/^#[0-9A-F]{6}$/i.test(text.value)) {
                picker.value = text.value;
            }
        });
    }

    // Setup Syncs
    // Setup Syncs
    syncRange('wm-opacity-range', 'wm-opacity', v => v, v => parseFloat(v));
    syncRange('wm-angle-range', 'wm-angle', v => v, v => parseFloat(v));
    syncRange('wm-size-range', 'wm-size-ratio', v => (v / 100).toFixed(2), v => parseFloat(v) * 100);
    syncRange('wm-stroke-opacity-range', 'wm-stroke-opacity', v => v, v => parseFloat(v));

    syncColor('wm-color-picker', 'wm-color');
    syncColor('wm-stroke-color-picker', 'wm-stroke-color');

    // Quick Angle Buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const val = e.target.getAttribute('data-value');
            if (val) {
                const angleInput = document.getElementById('wm-angle');
                const angleRange = document.getElementById('wm-angle-range');

                if (angleInput) angleInput.value = val;
                // Dispatch input event to trigger sync and reprocess
                if (angleInput) angleInput.dispatchEvent(new Event('change'));
            }
        });
    });


    // Toggle Watermark Group UI
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
    // Initial state
    toggleWmSettings();

    // --- Detection Threshold Settings ---
    // Load saved threshold from storage
    chrome.storage.local.get(['detectionThreshold'], (data) => {
        const threshold = data.detectionThreshold || 0.10;
        const thresholdInput = document.getElementById('detection-threshold');
        const thresholdRange = document.getElementById('detection-threshold-range');

        if (thresholdInput) thresholdInput.value = threshold.toFixed(2);
        if (thresholdRange) thresholdRange.value = Math.round(threshold * 100);
    });

    // Sync threshold slider and number input
    syncRange('detection-threshold-range', 'detection-threshold',
        v => (v / 100).toFixed(2),
        v => Math.round(parseFloat(v) * 100)
    );

    // Save threshold to storage when changed
    const thresholdInput = document.getElementById('detection-threshold');
    if (thresholdInput) {
        thresholdInput.addEventListener('change', () => {
            const threshold = parseFloat(thresholdInput.value) || 0.10;
            chrome.storage.local.set({ detectionThreshold: threshold }, () => {
                console.log('Detection threshold saved:', threshold);
            });
        });
    }

    // Add to reprocess triggers
    const thresholdRange = document.getElementById('detection-threshold-range');
    if (thresholdRange) {
        thresholdRange.addEventListener('input', reprocess);
    }
    if (thresholdInput) {
        thresholdInput.addEventListener('input', reprocess);
    }

});

