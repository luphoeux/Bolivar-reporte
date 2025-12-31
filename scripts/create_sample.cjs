const fs = require('fs');
const path = require('path');

const membershipDataPath = path.join(__dirname, 'src/data/membershipData.json');
const membershipSamplePath = path.join(__dirname, 'src/data/membershipSample.js');

try {
    const fullData = JSON.parse(fs.readFileSync(membershipDataPath, 'utf8'));
    const sample = fullData.slice(0, 100); // 100 rows is plenty for a demo

    const jsContent = `export const MEMBERSHIP_SAMPLE = ${JSON.stringify(sample, null, 2)};`;
    fs.writeFileSync(membershipSamplePath, jsContent);
    console.log("Sample saved to src/data/membershipSample.js");
} catch (error) {
    console.error("Error creating sample:", error);
}
