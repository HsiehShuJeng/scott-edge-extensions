const fs = require('fs');
const path = require('path');

// Read package.json version
const packageJsonPath = path.join(__dirname, '../package.json');
const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageData.version;

// Update manifest.json version
const manifestPath = path.join(__dirname, '../english-helper/manifest.json');
const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifestData.version = version;

// Write updated manifest
fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));
console.log(`Updated manifest.json to version ${version}`);
