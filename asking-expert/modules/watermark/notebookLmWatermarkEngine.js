/**
 * NotebookLM Watermark Engine
 * Implements local watermark removal for NotebookLM generated PDFs and images.
 * Uses a pixel cloning algorithm targeting the bottom-right watermark.
 */

const WM_CONFIG = {
    widthRatio: 0.0825,
    heightRatio: 0.0375,
    marginRightRatio: 0.0025,
    marginBottomRatio: 0.0027,
    featherSize: 12
};

/**
 * Removes the NotebookLM watermark from a provided canvas context.
 * Patches the bottom-right corner using pixel interpolation.
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} w - Canvas width
 * @param {number} h - Canvas height
 */
export function removeNotebookLmWatermark(ctx, w, h) {
    const wmW = Math.round(w * WM_CONFIG.widthRatio);
    const wmH = Math.round(h * WM_CONFIG.heightRatio);
    const mr = Math.round(w * WM_CONFIG.marginRightRatio);
    const mb = Math.round(h * WM_CONFIG.marginBottomRatio);

    const x = w - wmW - mr;
    const y = h - wmH - mb;
    const srcY = Math.max(0, y - wmH);

    if (srcY < 0) return;

    const src = ctx.getImageData(x, srcY, wmW, wmH);
    const dst = ctx.getImageData(x, y, wmW, wmH);
    const res = ctx.createImageData(wmW, wmH);

    for (let i = 0; i < wmH; i++) {
        for (let j = 0; j < wmW; j++) {
            const idx = (i * wmW + j) * 4;
            let a = 1.0;
            // Feather edges
            if (i < WM_CONFIG.featherSize) a = Math.min(a, i / WM_CONFIG.featherSize);
            if (j < WM_CONFIG.featherSize) a = Math.min(a, j / WM_CONFIG.featherSize);

            // Interpolate pixels
            for (let c = 0; c < 4; c++) {
                res.data[idx + c] = Math.round(dst.data[idx + c] * (1 - a) + src.data[idx + c] * a);
            }
        }
    }
    ctx.putImageData(res, x, y);
}

/**
 * Processes a single image to remove the NotebookLM watermark.
 * @param {HTMLImageElement|HTMLCanvasElement} image - Source image
 * @returns {Promise<{canvas: HTMLCanvasElement, detected: boolean}>}
 */
export async function processNotebookLmImage(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    ctx.drawImage(image, 0, 0);
    removeNotebookLmWatermark(ctx, canvas.width, canvas.height);

    // NotebookLM removal applies unconditionally based on coordinates, 
    // so we assume true if the image is large enough.
    return { canvas, detected: canvas.width > 200 && canvas.height > 200 };
}

/**
 * Processes a PDF file to remove the NotebookLM watermark from all pages.
 * @param {File} file - PDF File object
 * @param {Function} progressCallback - Callback(currentPage, totalPages)
 * @param {Function} onPageProcessed - Callback(canvas, pageIndex) for preview grid
 * @returns {Promise<Blob>} The processed PDF blob
 */
export async function processNotebookLmPdf(file, progressCallback = null, onPageProcessed = null) {
    if (!window.pdfjsLib || !window.jspdf) {
        throw new Error("PDF processing libraries not loaded");
    }

    // Ensure worker is configured
    if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) ? chrome.runtime.getURL('lib/pdf.worker.min.js') : 'lib/pdf.worker.min.js';
    }

    const data = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument(data).promise;
    const total = pdf.numPages;

    const { jsPDF } = window.jspdf;
    let doc = null;

    for (let i = 1; i <= total; i++) {
        if (progressCallback) progressCallback(i, total);

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        // Apply the watermark removal patch
        removeNotebookLmWatermark(ctx, canvas.width, canvas.height);

        if (onPageProcessed) onPageProcessed(canvas, i);

        const imgData = canvas.toDataURL('image/jpeg', 0.9);

        const orientation = viewport.width > viewport.height ? 'l' : 'p';
        if (i === 1) {
            doc = new jsPDF({
                orientation: orientation,
                unit: 'px',
                format: [viewport.width, viewport.height]
            });
        } else {
            doc.addPage([viewport.width, viewport.height], orientation);
        }
        doc.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
    }

    return doc.output('blob');
}
