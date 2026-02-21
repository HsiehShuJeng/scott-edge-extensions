const puppeteer = require('puppeteer');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(__dirname));

const server = app.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}`);
    
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox'] 
    });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

    const downloadPath = path.resolve(__dirname, 'test_downloads');
    if (!fs.existsSync(downloadPath)){
        fs.mkdirSync(downloadPath);
    }
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath,
    });
    
    try {
        await page.goto(`http://localhost:${port}/watermark.html`, { waitUntil: 'load' });
        
        await new Promise(r => setTimeout(r, 1000));
        
        // Expose a function so we can log from within the page
        await page.exposeFunction('logFromPage', msg => console.log('IN-PAGE LOG:', msg));
        
        await page.evaluate(() => {
            const radio = document.querySelector('input[name="processing-mode"][value="notebooklm"]');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        
        console.log("notebooklm mode selected. Uploading PDF...");
        
        const fileInput = await page.$('#file-input');
        await fileInput.uploadFile('/Users/scott.hsieh/Desktop/Claude_Code_Mastery.pdf');
        
        // Manually dispatch change event just to be absolutely sure
        await page.evaluate(() => {
            const fi = document.getElementById('file-input');
            window.logFromPage('Dispatching change event for input. Files length: ' + fi.files.length);
            fi.dispatchEvent(new Event('change', { bubbles: true }));
        });
        
        console.log("Waiting for processing to finish...");
        
        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 2000));
            const statusText = await page.evaluate(() => {
                const el = document.getElementById('status-message');
                return el ? el.textContent : '';
            });
            console.log('Status Loop', i, ':', statusText);
            if (statusText && statusText.includes('PDF completed in')) {
                break;
            }
        }
        
        console.log("Checking downloaded files...");
        const files = fs.readdirSync(downloadPath);
        console.log("Downloaded files:", files);
        
        if (files.length > 0) {
            console.log("SUCCESS: Output file generated.");
        } else {
            console.error("FAILURE: No output file generated.");
        }
        
    } catch (e) {
        console.error("Test failed:", e);
    } finally {
        await browser.close();
        server.close();
        process.exit(0);
    }
});
