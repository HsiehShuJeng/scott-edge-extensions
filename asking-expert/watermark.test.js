/**
 * Unit tests for Watermark HTML content verification
 * Tests UI elements existence and attributes
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Watermark HTML Content Verification', () => {
    let dom;
    let document;

    beforeEach(() => {
        // Load the actual HTML file
        const htmlPath = path.join(__dirname, 'watermark.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

        // Create JSDOM instance
        dom = new JSDOM(htmlContent, {
            url: 'http://localhost',
            pretendToBeVisual: true,
            resources: 'usable'
        });

        document = dom.window.document;
    });

    it('should have correct drag and drop text', () => {
        const dropZone = document.getElementById('drop-zone');
        const p = dropZone.querySelector('p');
        expect(p.textContent.trim()).toBe('Drag and drop image to polish');
    });

    it('should have rotation buttons', () => {
        const btn45 = document.getElementById('wm-angle-45');
        const btnNeg45 = document.getElementById('wm-angle-neg-45');

        expect(btn45).toBeTruthy();
        expect(btn45.textContent).toContain('45°');
        expect(btnNeg45).toBeTruthy();
        expect(btnNeg45.textContent).toContain('-45°');
    });

    it('should have number inputs for opacity', () => {
        const wmOpacity = document.getElementById('wm-opacity');
        const wmStrokeOpacity = document.getElementById('wm-stroke-opacity');

        expect(wmOpacity.type).toBe('number');
        expect(wmOpacity.getAttribute('min')).toBe('0');
        expect(wmOpacity.getAttribute('max')).toBe('100');
        expect(wmStrokeOpacity.type).toBe('number');
    });

    it('should have tooltip for stroke opacity', () => {
        const label = document.querySelector('label[for="wm-stroke-opacity"]');
        expect(label).toBeTruthy();
        expect(label.getAttribute('data-tooltip')).toBe('fading in and fading out');
    });
});
