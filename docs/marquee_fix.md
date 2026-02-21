# Marquee Text Cutoff Resolution

## Problem

Users experienced an issue where the scrolling text "Programming Engineering" in the extension popup was being cut off, displaying as "Programming En" or skipping the end of the word ("gineering") during the marquee animation.

## Root Cause Analysis

Upon investigation, two primary CSS constraints were identified as the cause:

1.  **`max-width` Constraint**: The text element had a `max-width: 100%` on it. Since the parent container (the tab button) has a fixed or calculated width much smaller than the full text "Programming Engineering", this forced the text to truncate even before the animation could scroll it.
2.  **Whitespace Collapsing**: The marquee effect uses a duplicate string in a pseudo-element (`::after` with content `"   Programming Engineering"`) to create a seamless loop. However, the default `white-space` handling collapsed the leading spaces. This resulted in an incorrect total width calculation, causing the `-50%` translation to misalignment and visual "jumping" or clipping.

## Solution

The following CSS adjustments were applied to `asking-expert/styles/popup-tabs.css`:

```css
.tab-button[data-tab="programming"]:hover .tab-text-full,
.tab-button[data-tab="programming"].active .tab-text-full {
    display: inline-block;
    max-width: none;       /* 1. Unconstrain width to allow full text flow */
    white-space: pre;      /* 2. Preserve whitespace for correct width & spacing */
    animation: marquee-scroll 2.5s linear infinite;
}
```

### Key Changes
1.  **`max-width: none;`**: Overrides the default 100% constraint, allowing the element to expand to its full natural width (`~288px` vs `~100px` parent).
2.  **`white-space: pre;`**: Ensures the browser respects the spaces in the pseudo-element content, ensuring the total width matches exactly what the `-50%` translation expects for a smooth loop.
