/**
 * Watermark Remover UI Logic
 */
import { WatermarkEngine } from './modules/watermark/watermarkEngine.js';

// Global state
let watermarkEngine;
let currentOriginalFile = null;
let currentProcessedCanvas = null;

// Initialize the engine
async function initEngine() {
    try {
        watermarkEngine = await WatermarkEngine.create();
        console.log('Watermark Engine initialized');
        updateStatus('Ready to process images.');
    } catch (error) {
        console.error('Failed to initialize engine:', error);
        updateStatus('Error initializing engine.');
    }
}

function updateStatus(msg) {
    const el = document.getElementById('status-message');
    if (el) el.textContent = msg;
}

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

            removeWatermark(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Remove watermark
async function removeWatermark(img) {
    if (!watermarkEngine) {
        await initEngine();
    }

    updateStatus('Processing...');

    try {
        const startTime = performance.now();
        // Always process the full resolution image first
        const fullCanvas = await watermarkEngine.removeWatermarkFromImage(img);

        // Handle Resizing
        let finalCanvas = fullCanvas;
        const shouldResize = document.getElementById('resize-checkbox').checked;

        if (shouldResize) {
            const targetWidth = 1920;
            // Scale if width is different (usually only if larger or specific requirement, user said "scale to")
            if (fullCanvas.width !== targetWidth) {
                const scaleFactor = targetWidth / fullCanvas.width;
                const targetHeight = Math.round(fullCanvas.height * scaleFactor);

                const resizeCanvas = document.createElement('canvas');
                resizeCanvas.width = targetWidth;
                resizeCanvas.height = targetHeight;
                const ctx = resizeCanvas.getContext('2d');

                // Use better interpolation if scaling down
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(fullCanvas, 0, 0, targetWidth, targetHeight);

                finalCanvas = resizeCanvas;
            }
        }

        const endTime = performance.now();
        currentProcessedCanvas = finalCanvas;

        // Display processed image
        const processedContainer = document.getElementById('processed-preview');
        processedContainer.innerHTML = '';
        finalCanvas.style.maxWidth = '100%';
        processedContainer.appendChild(finalCanvas);

        updateStatus(`Processed in ${(endTime - startTime).toFixed(0)}ms.`);

        // Setup download button
        setupDownloadButton(finalCanvas);

    } catch (error) {
        console.error('Error removing watermark:', error);
        updateStatus('Error processing image.');
    }
}

function setupDownloadButton(canvas) {
    const downloadBtn = document.getElementById('download-btn');

    // Generate filename: original_name (Unwatermarked).ext
    let confirmName = 'cleaned_image.png';
    if (currentOriginalFile && currentOriginalFile.name) {
        const originalName = currentOriginalFile.name;
        const lastDotIndex = originalName.lastIndexOf('.');
        if (lastDotIndex !== -1) {
            const name = originalName.substring(0, lastDotIndex);
            const ext = originalName.substring(lastDotIndex); // includes dot
            confirmName = `${name} (Unwatermarked)${ext}`;
        } else {
            confirmName = `${originalName} (Unwatermarked).png`;
        }
    }

    downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.download = confirmName;
        link.href = canvas.toDataURL(); // Defaults to PNG
        link.click();
    };
    downloadBtn.disabled = false;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initEngine();

    const dropZone = document.getElementById('drop-zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('dragleave', handleDragLeave, false);
    dropZone.addEventListener('drop', handleDrop, false);

    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', handleFileSelect, false);

    // Allow clicking drop zone to select file
    dropZone.addEventListener('click', () => fileInput.click());

    // Checkbox change listener
    const resizeCheckbox = document.getElementById('resize-checkbox');
    if (resizeCheckbox) {
        resizeCheckbox.addEventListener('change', () => {
            // If we have an original file loaded, re-process it
            // We need to re-read the file or keep the img object. 
            // processFile creates a new img object. 
            // Let's store the last img object to avoid re-reading file? 
            // Or just trigger processFile(currentOriginalFile) if exists.
            if (currentOriginalFile) {
                processFile(currentOriginalFile);
            }
        });
    }
});
