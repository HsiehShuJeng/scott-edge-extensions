/**
 * Watermark Remover UI Logic
 */
import { WatermarkEngine } from './modules/watermark/watermarkEngine.js';

let watermarkEngine;

// Initialize the engine
async function initEngine() {
    try {
        watermarkEngine = await WatermarkEngine.create();
        console.log('Watermark Engine initialized');
        document.getElementById('status-message').textContent = 'Ready to process images.';
    } catch (error) {
        console.error('Failed to initialize engine:', error);
        document.getElementById('status-message').textContent = 'Error initializing engine.';
    }
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

    document.getElementById('status-message').textContent = 'Processing...';

    try {
        const startTime = performance.now();
        const processedCanvas = await watermarkEngine.removeWatermarkFromImage(img);
        const endTime = performance.now();

        // Display processed image
        const processedContainer = document.getElementById('processed-preview');
        processedContainer.innerHTML = '';
        processedCanvas.style.maxWidth = '100%';
        processedContainer.appendChild(processedCanvas);

        document.getElementById('status-message').textContent = `Processed in ${(endTime - startTime).toFixed(0)}ms.`;

        // Setup download button
        const downloadBtn = document.getElementById('download-btn');
        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.download = 'clean_image.png';
            link.href = processedCanvas.toDataURL();
            link.click();
        };
        downloadBtn.disabled = false;

    } catch (error) {
        console.error('Error removing watermark:', error);
        document.getElementById('status-message').textContent = 'Error processing image.';
    }
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
});
