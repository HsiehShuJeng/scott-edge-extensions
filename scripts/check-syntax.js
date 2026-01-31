const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SEARCH_DIR = 'asking-expert';
let hasError = false;

function scanDirectory(directory) {
    const files = fs.readdirSync(directory);

    files.forEach(file => {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDirectory(fullPath);
        } else if (fullPath.endsWith('.js')) {
            try {
                // Run node --check
                execSync(`node --check "${fullPath}"`, { stdio: 'ignore' });
                // console.log(`✓ ${fullPath}`);
            } catch (error) {
                console.error(`✗ Syntax Error in: ${fullPath}`);
                console.error(error.message);
                hasError = true;
            }
        }
    });
}

console.log(`Checking syntax for .js files in ${SEARCH_DIR}...`);
if (fs.existsSync(SEARCH_DIR)) {
    scanDirectory(SEARCH_DIR);
} else {
    console.warn(`Directory ${SEARCH_DIR} not found.`);
}

if (hasError) {
    console.error('Syntax check failed.');
    process.exit(1);
} else {
    console.log('All JS files passed syntax check.');
    process.exit(0);
}
