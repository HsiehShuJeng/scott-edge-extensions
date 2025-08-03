---
inclusion: always
---

# CSS and HTML Standards

## CSS Property Ordering
- `appearance` should be listed after `-moz-appearance` for proper browser compatibility
- Example:
  ```css
  .element {
    -moz-appearance: none;
    appearance: none;
  }
  ```

## Browser Extension Specific Guidelines
- Follow Manifest V3 standards for all browser extension features
- Ensure cross-browser compatibility for supported browsers
- Use semantic HTML structure in popup and content scripts