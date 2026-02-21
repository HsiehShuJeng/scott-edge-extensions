# NotebookLM Watermark Removal

Unlike the Google Gemini image watermark (which uses a transparent overlay that can be extracted via reverse alpha-blending), NotebookLM stamps a **fully opaque, solid-color rectangular watermark** on the bottom right corner of exported PDFs and synthesized images. 

Because the pixels underneath have been completely obliterated by this solid stamp, we cannot use mathematical blending formulas to recover the original background. Instead, the extension uses a technique called **Pixel Cloning and Feathering**.

## How the Algorithm Works

The algorithm is defined in `asking-expert/modules/watermark/notebookLmWatermarkEngine.js` within the `removeNotebookLmWatermark` function.

### 1. Coordinate Targeting
NotebookLM places its watermark consistently in the same relative position and size regardless of the overall page dimensions. The engine first calculates this exact bounding box using predefined, hardcoded ratio constants:

```javascript
const WM_CONFIG = {
    widthRatio: 0.0825,       // Watermark width is ~8.25% of page width
    heightRatio: 0.0375,      // Watermark height is ~3.75% of page height
    marginRightRatio: 0.0025, // Distance from right edge
    marginBottomRatio: 0.0027,// Distance from bottom edge
    featherSize: 12           // Number of pixels to smoothly blend borders
};
```

### 2. Sourcing Replacement Pixels (Cloning)
Because the background of most generated presentation slides or documents tends to be uniform (e.g., solid white, gray, or a smooth gradient), the pixels *immediately above* the watermark are almost identical to what the pixels *under* the watermark should look like.

The algorithm extracts a "source strip" (`src`) of pixels lying directly on top of the watermark's Y-axis, exactly matching the watermark's dimensions.

### 3. Edge Feathering (Interpolation)
If we were to simply paste the source strip directly over the watermark `dst`, it would create a harsh, visible seam where the cloned box meets the rest of the image. 

To hide this seam, the algorithm applies **Feathering**. It loops through every pixel in the rectangular patch:
- In the inner core of the patch, the alpha `a` is `1.0` (using 100% of the cloned pixels).
- Along the top and left edges (defined by `WM_CONFIG.featherSize`), it calculates a fractional alpha value sliding from `0.0` at the very edge to `1.0` inward.
- It then interpolates between the original watermark edge pixels and the cloned pixels: `dst * (1 - a) + src * a`.

This creates a seamless gradient transition, rendering the patched corner virtually undetectable to the naked eye.
