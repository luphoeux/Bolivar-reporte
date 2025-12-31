const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('base de datos temporal.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

// Save first 100 rows for testing
const testData = data.slice(0, 100);
fs.writeFileSync('src/assets/data/membershipData-test.json', JSON.stringify(testData, null, 2));
console.log(`Created test file with ${testData.length} rows.`);

// Save full data
fs.writeFileSync('src/assets/data/membershipData.json', JSON.stringify(data));
console.log(`Converted ${data.length} rows to JSON.`);
